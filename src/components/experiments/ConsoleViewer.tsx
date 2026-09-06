// Client wrapper: console 3D viewer (dynamic ssr:false must live in a Client Component).
'use client';

import dynamic from 'next/dynamic';

const ConsoleModel = dynamic(() => import('@/components/three/ConsoleModel'), { ssr: false });

export default function ConsoleViewer() {
  return <ConsoleModel />;
}
