// SkillNeuron: the CV skill matrix as a living 3D neuron cloud. Four hub
// bodies (the CV groups) anchor 25 skill satellites on springs; everything
// else is pairwise repulsion + damping, pre-settled so frame one already
// reads. Drag any node to throw it (fling on release), hover to light its
// links, click to open the level-meter panel. Lights + IO-gating follow the
// Nanachi pattern; the loop still paints under reduced motion but the sim
// stays frozen.
'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import { useDict } from '@/i18n/LanguageProvider';
import { useTheme } from '@/components/theme/ThemeToggle';
import {
  SKILLS,
  SKILL_HUBS,
  hubLevel,
  linkedSkills,
  type SkillHubId,
} from '@/data/skills';
import './SkillNeuron.css';

// Exact user preset: one hue per family, shared by both themes.
const HUB_JEWEL: Record<SkillHubId, string> = {
  frontend: '#3B82F6',
  backend: '#6366F1',
  tools: '#22C55E',
  infrastructure: '#06B6D4',
  devops: '#F97316',
  observability: '#A855F7',
  soft: '#8fa3b8',
  core: '#F5C542',
};

/** Small skill nodes render a touch lighter than their hub hue — same
    family, visibly stepped down. */
const SKILL_TINT = 0.16;
const _white = new THREE.Color('#ffffff');

/** Body key of the Tristan root node — every node links to it. */
const CORE_KEY = 'hub:core';

interface Palette extends Record<SkillHubId, THREE.Color> {
  dim: THREE.Color;
  /** Raw CSS for canvas 2D (fillStyle understands any CSS color). */
  inkCss: string;
}

function readPalette(): Palette {
  const cssString = (name: string, fallback: string) => {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  };
  const jewel = (hub: SkillHubId) => new THREE.Color(HUB_JEWEL[hub]);
  return {
    frontend: jewel('frontend'),
    backend: jewel('backend'),
    tools: jewel('tools'),
    infrastructure: jewel('infrastructure'),
    devops: jewel('devops'),
    observability: jewel('observability'),
    soft: jewel('soft'),
    core: jewel('core'),
    dim: new THREE.Color('#3a3f4a'),
    inkCss: cssString('--color-foreground', '#f2efe6'),
  };
}

interface Body {
  key: string;
  name: string;
  hub: SkillHubId;
  level: number;
  isHub: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  radius: number;
  phase: number;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Wide stance: hubs pull toward the left/right horizon (not a tall diamond)
// so the cloud owns landscape frames instead of floating mid-screen. The
// Tristan root sits at the origin; only hubs link to it.
const HUB_ANCHORS: THREE.Vector3[] = [
  new THREE.Vector3(-4.2, 0.7, 0.8).normalize().multiplyScalar(3.4), // frontend
  new THREE.Vector3(-2.1, -0.7, 1.6).normalize().multiplyScalar(3.4), // backend
  new THREE.Vector3(2.1, 0.7, 1.6).normalize().multiplyScalar(3.4), // tools
  new THREE.Vector3(4.2, -0.7, 0.2).normalize().multiplyScalar(3.4), // infrastructure
  new THREE.Vector3(2.1, 0.7, -1.6).normalize().multiplyScalar(3.4), // devops
  new THREE.Vector3(-2.1, -0.7, -1.6).normalize().multiplyScalar(3.4), // observability
  new THREE.Vector3(0.2, 1.6, -0.6).normalize().multiplyScalar(3.0), // soft
  new THREE.Vector3(0, 0.1, 0), // core
];

function buildBodies(): Body[] {
  const rand = mulberry(7);
  const bodies: Body[] = SKILL_HUBS.map((hub, h) => ({
    key: `hub:${hub}`,
    name: hub,
    hub,
    level: hub === 'core' ? 5 : hubLevel(hub),
    isHub: true,
    pos: HUB_ANCHORS[h].clone(),
    vel: new THREE.Vector3(),
    radius: hub === 'core' ? 0.55 : 0.3 + hubLevel(hub) * 0.03,
    phase: rand() * Math.PI * 2,
  }));
  for (const s of SKILLS) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 3.6 + rand() * 1.2;
    bodies.push({
      key: s.id,
      name: s.name,
      hub: s.hub,
      level: s.level,
      isHub: false,
      pos: new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.62,
        r * Math.sin(phi) * Math.sin(theta),
      ),
      vel: new THREE.Vector3(),
      radius: 0.1 + s.level * 0.034,
      phase: rand() * Math.PI * 2,
    });
  }
  return bodies;
}

const _dir = new THREE.Vector3();
const _f = new THREE.Vector3();
const _v = new THREE.Vector3();

function stepPhysics(
  bodies: Body[],
  dt: number,
  t: number,
  pinned: Set<string>,
  spread: number,
) {
  for (let i = 0; i < bodies.length; i++) {
    const a = bodies[i];
    for (let j = i + 1; j < bodies.length; j++) {
      const b = bodies[j];
      _dir.subVectors(a.pos, b.pos);
      const d = Math.max(_dir.length(), 0.45);
      _dir.normalize();
      const f = Math.min(2.2 / (d * d), 3.0);
      _f.copy(_dir).multiplyScalar(f * dt);
      if (!pinned.has(a.key)) a.vel.add(_f);
      if (!pinned.has(b.key)) b.vel.sub(_f);
    }
  }
  const coreBody = bodies.find((h) => h.key === CORE_KEY);
  for (const b of bodies) {
    if (pinned.has(b.key)) continue;
    if (b.isHub) {
      const anchor = HUB_ANCHORS[SKILL_HUBS.indexOf(b.hub)];
      _f.subVectors(_v.copy(anchor).multiplyScalar(spread), b.pos).multiplyScalar(2.0 * dt);
      b.vel.add(_f);
      _f.copy(b.pos).multiplyScalar(-0.15 * dt);
      b.vel.add(_f);
      b.vel.y += -b.pos.y * 0.4 * dt;
      // Hub→root tether (matches the anchor radius so it never fights it).
      if (coreBody && b.key !== CORE_KEY) {
        _dir.subVectors(b.pos, coreBody.pos);
        const dc = _dir.length() || 1;
        _dir.normalize();
        _f.copy(_dir).multiplyScalar((dc - 3.4 * spread) * 1.5 * dt);
        b.vel.sub(_f);
      }
    } else {
      const hub = bodies.find((h) => h.isHub && h.hub === b.hub);
      if (hub) {
        _dir.subVectors(b.pos, hub.pos);
        const d = _dir.length() || 1;
        _dir.normalize();
        _f.copy(_dir).multiplyScalar((d - 2.9 * spread) * 5.0 * dt);
        b.vel.sub(_f);
      }
      // Anisotropic centering: weak on x/z (spread wide) but strong on y
      // (press into a flat disc that fits landscape frames edge to edge).
      b.vel.x += -b.pos.x * 0.12 * dt;
      b.vel.y += -b.pos.y * 1.1 * dt;
      b.vel.z += -b.pos.z * 0.12 * dt;
      // Ellipsoidal soft cage (scaled): guarantees containment no matter how
      // the drift + flings push — nothing ever leaves the framed volume.
      _v.set(b.pos.x / (8.0 * spread), b.pos.y / (2.8 * spread), b.pos.z / (4.0 * spread));
      const over = _v.length();
      if (over > 1) {
        _f.copy(b.pos).multiplyScalar(-(over - 1) * 6.0 * dt);
        b.vel.add(_f);
      }
      _f.set(
        Math.sin(t * 0.6 + b.phase) * 0.22 * dt,
        Math.sin(t * 0.45 + b.phase * 1.7) * 0.22 * dt,
        Math.cos(t * 0.5 + b.phase) * 0.22 * dt,
      );
      b.vel.add(_f);
    }
  }
  const damp = Math.exp(-2.6 * dt);
  for (const b of bodies) {
    if (pinned.has(b.key)) continue;
    b.vel.multiplyScalar(damp);
    if (b.vel.lengthSq() > 25) b.vel.setLength(5);
    b.pos.addScaledVector(b.vel, dt);
  }
}

function makeLabelTexture(
  text: string,
  opts: { size: number; color: string; weight: number },
): { tex: THREE.CanvasTexture; aspect: number } {
  const pad = 26;
  const font = `${opts.weight} ${opts.size}px "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace`;
  const c = document.createElement('canvas');
  const measure = c.getContext('2d')!;
  measure.font = font;
  c.width = Math.ceil(measure.measureText(text).width) + pad * 2;
  c.height = opts.size + pad * 2;
  const ctx = c.getContext('2d')!;
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = opts.color;
  ctx.fillText(text, pad, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: c.width / c.height };
}

function makeHaloTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
}

class ErrorBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.setState({ failed: true });
    this.props.onError?.();
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="poster-fallback" role="img" aria-label="Skill graph placeholder">
          skill graph failed to boot — imagine a neuron cloud here.
          <br />
          (3D unavailable on this device)
        </div>
      );
    }
    return this.props.children;
  }
}

function Graph({
  frozen,
  selected,
  hovered,
  onSelect,
  onHover,
  hubNames,
  onReady,
}: {
  frozen: boolean;
  selected: string | null;
  hovered: string | null;
  onSelect: (key: string | null) => void;
  onHover: (key: string | null) => void;
  hubNames: Record<SkillHubId, string>;
  onReady?: () => void;
}) {
  // Procedural scene builds synchronously in the memos below: mount means
  // the cloud is ready — signal the stage overlay off.
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const theme = useTheme();

  // Frame the disc on any aspect (fov 42 mirrors the Canvas). The whole
  // layout — anchors, rests, cage — scales by `spread` so phones get a
  // compact cloud instead of cropped edges; the camera fit uses the same
  // factor so the disc always fills the frame. Vertical room fits nodes
  // plus their labels — nothing clips at the stage edges.
  const spreadRef = useRef(1);
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const spread = THREE.MathUtils.clamp(aspect / 2.0, 0.55, 1);
    spreadRef.current = spread;
    const t = Math.tan(THREE.MathUtils.degToRad(42 / 2));
    camera.position.z = THREE.MathUtils.clamp(
      (Math.max(4.1, 8.2 / aspect) * spread) / t,
      7,
      30,
    );
  }, [camera, size]);

  const bodies = useMemo(() => {
    const list = buildBodies();
    for (let i = 0; i < 200; i++) stepPhysics(list, 1 / 60, i / 60, new Set<string>(), 1);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const links = useMemo(() => {
    const hubIdx = new Map<SkillHubId, number>();
    bodies.forEach((b, i) => {
      if (b.isHub) hubIdx.set(b.hub, i);
    });
    const arr: Array<[number, number, SkillHubId]> = [];
    bodies.forEach((b, i) => {
      if (b.isHub) return;
      arr.push([hubIdx.get(b.hub) ?? 0, i, b.hub]);
    });
    // Strict hierarchy: root → hubs → skills. Only hub bodies tether to
    // Tristan; small nodes reach the root exclusively through their hub.
    const coreIdx = bodies.findIndex((b) => b.key === CORE_KEY);
    bodies.forEach((b, i) => {
      if (!b.isHub || b.key === CORE_KEY) return;
      arr.push([coreIdx, i, 'core']);
    });
    return arr;
  }, [bodies]);

  // Label ink follows the theme foreground (cream on abyss, ink on paper).
  // Rebuilt with the scene when the theme flips.
  const labelInk = useMemo(() => {
    if (typeof document === 'undefined') return '#f2efe6';
    return (
      getComputedStyle(document.documentElement).getPropertyValue('--color-foreground').trim() ||
      '#f2efe6'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const scene = useMemo(() => {
    const sphere = new THREE.SphereGeometry(1, 24, 24);
    const haloTex = makeHaloTexture();
    const mats: THREE.MeshStandardMaterial[] = [];
    const haloSprites: THREE.Sprite[] = [];
    const labelSprites: THREE.Sprite[] = [];
    const labelTexs: THREE.CanvasTexture[] = [];
    bodies.forEach((b) => {
      mats.push(
        // Matte jewel orbs: high roughness kills the chrome-like specular
        // hotspot that was bleaching small nodes white; hue comes through.
        new THREE.MeshStandardMaterial({
          roughness: 0.78,
          metalness: 0,
          emissiveIntensity: 0.45,
        }),
      );
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: haloTex,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      const hs = b.radius * 5.5;
      halo.scale.set(hs, hs, 1);
      haloSprites.push(halo);
      const { tex, aspect } = makeLabelTexture(b.key === CORE_KEY ? 'Tristan' : b.isHub ? hubNames[b.hub] : b.name, {
        size: b.isHub ? 54 : 40,
        color: labelInk,
        weight: b.isHub ? 700 : 500,
      });
      labelTexs.push(tex);
      const label = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
      );
      const h = b.isHub ? 0.34 : 0.22;
      label.scale.set(h * aspect, h, 1);
      label.position.set(0, b.radius + (b.isHub ? 0.3 : 0.24), 0);
      labelSprites.push(label);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(links.length * 6), 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(links.length * 6), 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    return {
      sphere,
      mats,
      haloSprites,
      labelSprites,
      lineGeo,
      lineMat,
      dispose() {
        sphere.dispose();
        haloTex.dispose();
        mats.forEach((m) => m.dispose());
        haloSprites.forEach((s) => s.material.dispose());
        labelTexs.forEach((t) => t.dispose());
        labelSprites.forEach((s) => s.material.dispose());
        lineGeo.dispose();
        lineMat.dispose();
      },
    };
  }, [bodies, links, hubNames, labelInk]);

  useEffect(() => () => scene.dispose(), [scene]);

  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const drag = useRef<{
    idx: number;
    plane: THREE.Plane;
    target: THREE.Vector3;
    downX: number;
    downY: number;
  } | null>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const selRef = useRef(selected);
  selRef.current = selected;
  const hovRef = useRef(hovered);
  hovRef.current = hovered;
  const paletteRef = useRef(readPalette());
  paletteRef.current = readPalette();
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  useEffect(() => {
    if (frozen) return;
    const toNDC = (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      toNDC(e.clientX, e.clientY);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(d.plane, hit)) d.target.copy(hit);
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      const dist = Math.hypot(e.clientX - d.downX, e.clientY - d.downY);
      if (dist < 6) onSelectRef.current(bodies[d.idx].key);
      document.body.style.cursor = 'auto';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [frozen, gl, camera, raycaster, ndc, bodies]);

  const onNodeDown = (idx: number) => (e: ThreeEvent<PointerEvent>) => {
    if (frozen) return;
    e.stopPropagation();
    const rect = gl.domElement.getBoundingClientRect();
    ndc.set(
      ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    drag.current = {
      idx,
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(normal, bodies[idx].pos),
      target: bodies[idx].pos.clone(),
      downX: e.nativeEvent.clientX,
      downY: e.nativeEvent.clientY,
    };
    bodies[idx].vel.set(0, 0, 0);
    document.body.style.cursor = 'grabbing';
  };

  useEffect(
    () => () => {
      document.body.style.cursor = 'auto';
    },
    [],
  );

  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, rawDelta) => {
    const t = state.clock.elapsedTime;
    const pal = paletteRef.current;
    if (!frozen) {
      const dt = Math.min(rawDelta, 0.033);
      const pinned = new Set<string>();
      const d = drag.current;
      if (d) {
        const b = bodies[d.idx];
        _dir.subVectors(d.target, b.pos);
        b.vel.copy(_dir.multiplyScalar(1 / Math.max(dt, 0.001)));
        if (b.vel.lengthSq() > 64) b.vel.setLength(8);
        const k = 1 - Math.exp(-20 * dt);
        b.pos.lerp(d.target, k);
        pinned.add(b.key);
      }
      stepPhysics(bodies, dt, t, pinned, spreadRef.current);
    }
    const active = hovRef.current ?? selRef.current;
    const activeBody = active ? (bodies.find((b) => b.key === active) ?? null) : null;
    const posAttr = scene.lineGeo.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = scene.lineGeo.getAttribute('color') as THREE.BufferAttribute;
    links.forEach(([hi, si, hub], li) => {
      const a = bodies[hi].pos;
      const b = bodies[si].pos;
      posAttr.setXYZ(li * 2, a.x, a.y, a.z);
      posAttr.setXYZ(li * 2 + 1, b.x, b.y, b.z);
      const hot =
        activeBody !== null &&
        (bodies[hi].key === activeBody.key || bodies[si].key === activeBody.key);
      tmpColor.copy(pal[hub]);
      if (!hot) tmpColor.lerp(pal.dim, 0.72);
      colAttr.setXYZ(li * 2, tmpColor.r, tmpColor.g, tmpColor.b);
      colAttr.setXYZ(li * 2 + 1, tmpColor.r, tmpColor.g, tmpColor.b);
    });
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    bodies.forEach((b, i) => {
      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.copy(b.pos);
        const pulse = b.key === selRef.current ? 1 + 0.1 * Math.sin(t * 5) : 1;
        mesh.scale.setScalar(b.radius * pulse);
      }
      const mat = scene.mats[i];
      // Small nodes wear a lightened wash of the hub hue; hubs stay full.
      tmpColor.copy(pal[b.hub]);
      if (!b.isHub) tmpColor.lerp(_white, SKILL_TINT);
      mat.color.copy(tmpColor);
      // Hierarchy-aware highlight: a skill lights its hub; a hub lights its
      // skills plus the root; the root lights everything.
      const linked =
        activeBody !== null &&
        (b.key === activeBody.key ||
          activeBody.key === CORE_KEY ||
          (!activeBody.isHub && b.isHub && b.hub === activeBody.hub) ||
          (activeBody.isHub &&
            activeBody.key !== CORE_KEY &&
            ((b.key === CORE_KEY) || (!b.isHub && b.hub === activeBody.hub))));
      mat.emissive.copy(tmpColor);
      mat.emissiveIntensity = b.key === active ? 1.4 : linked ? 0.9 : 0.35;
      const haloMat = scene.haloSprites[i].material as THREE.SpriteMaterial;
      // Halos stay full hub hue (never the washed tint) so each family keeps
      // a saturated aura even though the orb itself steps lighter.
      haloMat.color.copy(pal[b.hub]);
      haloMat.opacity = b.key === active || linked ? 0.95 : 0.45;
      scene.haloSprites[i].position.copy(b.pos);
      const label = scene.labelSprites[i];
      label.position.set(b.pos.x, b.pos.y + b.radius + (b.isHub ? 0.3 : 0.24), b.pos.z);
    });
  });

  return (
    <group>
      {bodies.map((b, i) => (
        <mesh
          key={b.key}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          geometry={scene.sphere}
          material={scene.mats[i]}
          onPointerDown={onNodeDown(i)}
          onPointerOver={(e) => {
            if (frozen) return;
            e.stopPropagation();
            onHoverRef.current(b.key);
            if (!drag.current) document.body.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            onHoverRef.current(null);
            if (!drag.current) document.body.style.cursor = 'auto';
          }}
        />
      ))}
      {/* World-space siblings, NOT mesh children: mesh scale (node radius)
          would shrink child sprites into invisibility. */}
      {scene.haloSprites.map((s, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <primitive key={`halo-${i}`} object={s} />
      ))}
      {scene.labelSprites.map((s, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <primitive key={`label-${i}`} object={s} />
      ))}
      <lineSegments geometry={scene.lineGeo} material={scene.lineMat} />
    </group>
  );
}

export default function SkillNeuron() {
  const t = useDict();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [inView, setInView] = useState(true);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // Mobile still boots the real 3D cloud (per user: it doesn't lag).
  // isMobile only tiers down GPU cost: DPR 1, no MSAA, low-power.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Re-render (and re-tint the sim) whenever the theme flips.
  useTheme();
  // Dismisses the stage overlay the moment the graph mounts (post-suspense).
  const [modelReady, setModelReady] = useState(false);
  const handleModelReady = useCallback(() => setModelReady(true), []);

  const lookup = useMemo(() => {
    const m = new Map<string, { name: string; hub: SkillHubId; level: number; isHub: boolean }>();
    for (const hub of SKILL_HUBS) {
      const isCore = hub === 'core';
      m.set(`hub:${hub}`, {
        name: isCore ? 'Tristan' : t.about.skillGraph.hubs[hub],
        hub,
        level: isCore ? 5 : hubLevel(hub),
        isHub: true,
      });
    }
    for (const s of SKILLS) {
      m.set(s.id, { name: s.name, hub: s.hub, level: s.level, isHub: false });
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const selected = selectedId ? (lookup.get(selectedId) ?? null) : null;  const links =
    selected && selectedId
      ? selectedId === CORE_KEY
        ? [...SKILLS].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
        : selected.isHub
          ? SKILLS.filter((s) => s.hub === selected.hub)
          : linkedSkills(selectedId)
      : [];

  return (
    <div ref={wrapRef} className="neuron-stage">
      <ErrorBoundary onError={handleModelReady}>
        <Canvas
          dpr={isMobile ? [1, 1.5] : [1, 1.75]}
          camera={{ position: [0, 0.5, 9.5], fov: 42 }}
          frameloop={inView ? 'always' : 'never'}
          onPointerMissed={() => setSelectedId(null)}
          aria-label="Interactive 3D skill graph — drag nodes, click for details"
          gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
        >
          {/* Dimmer than Nanachi's rig on purpose: flat jewel colors blow
              out toward white past ~1.5x total illumination under ACES. */}
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 3, 2]} intensity={0.85} color="#fff4e0" />
          <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#b9c8ff" />
          <Suspense fallback={null}>
            <Graph
              frozen={reduced}
              selected={selectedId}
              hovered={hoveredId}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              hubNames={t.about.skillGraph.hubs}
              onReady={handleModelReady}
            />
          </Suspense>
          <AdaptiveDpr />
        </Canvas>
      </ErrorBoundary>
      {!modelReady && (
        <div className="stage-loader" aria-hidden="true">
          <div className="loader" />
        </div>
      )}
      <p className="neuron-hint" aria-hidden="true">
        {t.about.skillGraph.hint}
      </p>
      {selected && (
        <div className="neuron-panel" aria-live="polite">
          <div className="neuron-panel__head">
            <div>
              <p className="neuron-panel__hub">{t.about.skillGraph.hubs[selected.hub]}</p>
              <p className="neuron-panel__name">{selected.name}</p>
            </div>
            <button
              type="button"
              className="neuron-panel__close"
              onClick={() => setSelectedId(null)}
              aria-label={t.about.skillGraph.close}
            >
              ✕
            </button>
          </div>
          <p className="neuron-panel__label">
            {t.about.skillGraph.level} · {selected.level.toFixed(selected.isHub ? 1 : 0)}/5
          </p>
          <div className="neuron-meter" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <i key={i} data-on={i <= Math.round(selected.level)} />
            ))}
          </div>
          {links.length > 0 && (
            <>
              <p className="neuron-panel__label">{t.about.skillGraph.linked}</p>
              <div className="neuron-chips">
                {links.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="neuron-chip"
                    data-active={s.id === selectedId}
                    onClick={() => setSelectedId(s.id)}
                  >
                    {s.name} · {s.level}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
