// MikuCat: rigged lab-cat muse (Hatsune Miku cat). She rests on one parked
// frame of the shipped action clip — eyes + head track the cursor, body
// breathes gently. Click her and the action plays once as a dance while a
// terminal-chip bubble cycles her lines, then she re-parks. Rig keeps its
// original graph: flattening would break the skinned skeleton.
//
// The shipped `idle` is an 83ms two-frame stub that vibrates when looped,
// so it is never played. Driven bones reset to the parked rest every frame
// before offsets compose, so nothing can accumulate frame-over-frame.
'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode, type MutableRefObject } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';
import { useDict } from '@/i18n/LanguageProvider';
import { disposeScene } from './modelUtils';

const MODEL_URL = '/models/cat_hatsune_miku.glb';

// Clamped look angles (radians). Eyes dart, head drifts.
const EYE_YAW = 0.38;
const EYE_PITCH = 0.28;
const HEAD_YAW = 0.14;
const HEAD_PITCH = 0.1;
// Dance crossfade pacing (see frame loop). PARK_T is the frozen resting
// pose sampled from the action clip — the shipped `idle` is an 83ms
// two-frame loop that visibly vibrates when looped, so it is never played.
const PARK_T = 0;

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.setState({ failed: true });
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="poster-fallback" role="img" aria-label="Muse placeholder">
          miku.exe failed to boot — imagine being waved at here.
          <br />
          (3D unavailable on this device)
        </div>
      );
    }
    return this.props.children;
  }
}

interface DanceState {
  envelope: MutableRefObject<number>;
  talking: MutableRefObject<boolean>;
}

function MikuCatModel({ dance, frozen }: { dance: DanceState; frozen: boolean }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);

  const rig = useMemo((): {
    eyes: THREE.Object3D[];
    head: THREE.Object3D | null;
    neck: THREE.Object3D | null;
    ears: THREE.Object3D[];
  } => {
    const eyes: THREE.Object3D[] = [];
    const ears: THREE.Object3D[] = [];
    let head: THREE.Object3D | null = null;
    let neck: THREE.Object3D | null = null;
    const meshes: THREE.Mesh[] = [];
    // Bone names use underscore/dot+index suffixes (eye.L_0, head_49) —
    // match the stem with any separator, not a literal dot.
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) meshes.push(mesh);
      if (!(obj as THREE.Bone).isBone) return;
      const n = obj.name;
      if (/^eye[._-]?[LR]/i.test(n)) eyes.push(obj);
      else if (/^head/i.test(n) && !head) head = obj;
      else if (/^neck/i.test(n) && !neck) neck = obj;
      else if (/^ear\.001[._-]?[LR]/i.test(n)) ears.push(obj);
    });
    // No outlier-shell culling here (unlike Nanachi): this model's twin-
    // tails and sleeves are legitimately wide meshes — a median-size filter
    // hides hair and limbs and leaves her visibly disassembled.
    // Unlit mapless dark surfaces vanish on a dark page: give them a real
    // lit material so the directionals can sculpt folds.
    for (const m of meshes) {
      if (!m.visible) continue;
      const mat = m.material as THREE.MeshBasicMaterial | null;
      if (!mat || mat.type !== 'MeshBasicMaterial' || mat.map) continue;
      if (/edge|line|outline/i.test(mat.name)) continue;
      const lum =
        0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b;
      m.material = new THREE.MeshStandardMaterial({
        color: lum < 0.05 ? new THREE.Color('#26262c') : mat.color.clone(),
        roughness: 0.85,
        metalness: 0,
      });
    }
    return { eyes, head, neck, ears };
  }, [gltf]);

  const fit = useMemo(() => {
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    gltf.scene.updateWorldMatrix(true, true);
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
      tmp.setFromObject(mesh);
      if (!tmp.isEmpty()) box.union(tmp);
    });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2.4 / Math.max(size.x, size.y, size.z);
    return { s, center };
  }, [gltf]);

  // Single action, single pose authority: the `idle` clip is an 83ms
  // two-frame stub that jitters when looped, so the body is parked on one
  // good frame of the full 2.5s action and frozen — gaze/ears/breath are
  // procedural offsets composed onto the parked pose. Click releases the
  // freeze and plays the action once, then re-parks.
  const mixer = useMemo(() => new THREE.AnimationMixer(gltf.scene), [gltf]);
  const actionClip = useMemo(() => {
    const clips = gltf.animations.filter((a) => (a.duration || 0) > 0.5);
    return (
      clips.find((a) => /armature|dance|action|wave|talk/i.test(a.name)) ??
      clips[0] ??
      gltf.animations[0] ??
      null
    );
  }, [gltf]);
  // Parked rest pose per driven bone, captured right after posing — the
  // frame loop composes procedural offsets onto these (absolute set, so
  // nothing ever accumulates frame-over-frame).
  const rest = useMemo(() => new Map<THREE.Object3D, THREE.Quaternion>(), []);
  const mode = useRef<'park' | 'dance'>('park');

  const park = () => {
    if (!actionClip) return;
    const action = mixer.clipAction(actionClip);
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    mixer.setTime(PARK_T);
    mixer.update(0);
    mixer.timeScale = 0;
    rest.clear();
    for (const b of [...rig.eyes, ...rig.ears]) rest.set(b, b.quaternion.clone());
    if (rig.head) rest.set(rig.head, rig.head.quaternion.clone());
    if (rig.neck) rest.set(rig.neck, rig.neck.quaternion.clone());
    mode.current = 'park';
  };

  useEffect(() => {
    park();
    return () => {
      mixer.stopAllAction();
      if (actionClip) mixer.uncacheClip(actionClip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer, actionClip]);

  useEffect(() => {
    return () => {
      disposeScene(gltf.scene);
    };
  }, [gltf]);

  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  const tmpE = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const baseY = useRef<number | null>(null);

  useFrame((state, rawDelta) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    if (baseY.current === null) baseY.current = group.current.position.y;

    // Reduced motion: hold the parked still frame, ignore gaze and breath.
    if (frozen) {
      for (const [bone, q] of rest) bone.quaternion.copy(q);
      return;
    }

    // Mode transitions on the talk flag.
    const wantDance = dance.talking.current && actionClip;
    if (wantDance && mode.current !== 'dance') {
      const action = mixer.clipAction(actionClip);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      mixer.setTime(0);
      mixer.timeScale = 1;
      mode.current = 'dance';
    } else if (!wantDance && mode.current !== 'park') {
      park();
    }

    // Nod/ear envelope follows the mode (fast attack, gentle release).
    const target = mode.current === 'dance' ? 1 : 0;
    const rate = target > dance.envelope.current ? 6 : 2.5;
    dance.envelope.current +=
      (target - dance.envelope.current) * Math.min(1, Math.min(rawDelta, 0.05) * rate);
    const dv = dance.envelope.current;

    // Reset driven bones to the parked rest FIRST, then let the mixer
    // overwrite tracked bones. Offsets below therefore compose onto a
    // known base every frame — nothing can accumulate, tracked or not.
    for (const [bone, q] of rest) bone.quaternion.copy(q);
    if (mode.current === 'dance') mixer.update(Math.min(rawDelta, 0.05));

    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    const gaze = (bone: THREE.Object3D, ex: number, ey: number) => {
      tmpE.set(ex, ey, 0);
      tmpQ.setFromEuler(tmpE);
      bone.quaternion.multiply(tmpQ);
    };
    for (const eye of rig.eyes) gaze(eye, -py * EYE_PITCH, px * EYE_YAW);
    if (rig.head) {
      gaze(rig.head, -py * HEAD_PITCH + Math.sin(t * 9) * 0.06 * dv, px * HEAD_YAW);
    }
    if (rig.neck) gaze(rig.neck, -py * HEAD_PITCH * 0.6, px * HEAD_YAW * 0.6);
    for (const ear of rig.ears) {
      tmpE.set(Math.sin(t * 7 + ear.id) * 0.09 * dv, 0, 0);
      tmpQ.setFromEuler(tmpE);
      ear.quaternion.multiply(tmpQ);
    }

    // Gentle breath while parked; the dance carries its own motion.
    group.current.position.y =
      (baseY.current ?? 0) + (mode.current === 'park' ? Math.sin(t * 1.4) * 0.02 : 0);
  });

  return (
    <group
      ref={group}
      scale={fit.s}
      position={[-fit.center.x * fit.s, -fit.center.y * fit.s, -fit.center.z * fit.s]}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

export default function MikuCat() {
  const t = useDict();
  const lines = t.miku.lines;
  // Starts at -1 so the first tap speaks lines[0], then cycles.
  const [lineIdx, setLineIdx] = useState(-1);
  const [talking, setTalking] = useState(false);
  const [hasTalked, setHasTalked] = useState(false);
  const [inView, setInView] = useState(true);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // Mobile now renders the real 3D (was poster-only for perf). Keep a
  // lightweight DPR cap and let the existing `frozen`/`inView` gates handle
  // the rest — same tier as BlenderChan/Umaru on phones.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dance = useMemo<DanceState>(
    () => ({
      envelope: { current: 0 } as MutableRefObject<number>,
      talking: { current: false } as MutableRefObject<boolean>,
    }),
    [],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const speak = () => {
    setLineIdx((i) => (i + 1) % Math.max(1, lines.length));
    setTalking(true);
    setHasTalked(true);
    dance.talking.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTalking(false);
      dance.talking.current = false;
    }, 3000);
  };

  const bubbleText = talking && lineIdx >= 0 ? lines[lineIdx % lines.length] : hasTalked ? null : t.miku.hint;

  return (
    <div
      ref={wrapRef}
      className="miku-stage"
      role="button"
      tabIndex={0}
      aria-label={t.miku.hint}
      onClick={speak}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          speak();
        }
      }}
    >
      <ErrorBoundary>
        <Canvas
          dpr={isMobile ? [1, 1.5] : [1, 1.75]}
          camera={{ position: [0, 0.4, 5.2], fov: 36 }}
          // The loop runs whenever visible — even under reduced motion, so
          // the posed still frame always paints (motion itself is gated in
          // useFrame via `frozen`). `always` is fine at DPR 1.5 on phones.
          frameloop={inView ? 'always' : 'never'}
          gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
          aria-label="Miku the cat watching the cursor — click to talk"
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 3, 2]} intensity={0.85} color="#fff4e0" />
          <directionalLight position={[-3, 2, -3]} intensity={0.45} color="#b9c8ff" />
          <Suspense fallback={null}>
            <MikuCatModel dance={dance} frozen={reduced} />
          </Suspense>
          <AdaptiveDpr pixelated={isMobile} />
        </Canvas>
      </ErrorBoundary>
      <div className="miku-bubble" data-visible={bubbleText !== null} aria-live="polite">
        {bubbleText !== null && (
          <>
            <span className="miku-bubble__prompt">▸</span>
            <span key={lineIdx + String(talking)}>{bubbleText}</span>
          </>
        )}
      </div>
    </div>
  );
}
