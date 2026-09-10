import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls } from '@react-three/drei'
import type { SceneState } from '../types'

const SEGMENTS = 48

/**
 * 弦上驻波 · 3D 场景
 * 水平弦：y(x)=A·sin(nπx/L)·sin(ωt)；两端支座固定
 */
export default function StandingWaveScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const beadsRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const L = Math.max(params.L ?? 1, 1e-6)
  const mu = Math.max(params.mu ?? 0.01, 1e-9)
  const tension = Math.max(params.tension ?? 40, 1e-9)
  const n_mode = Math.max(1, Math.round(params.n_mode ?? 2))
  const amp = params.amp ?? 0.15

  const c = Math.sqrt(tension / mu)
  const f = (n_mode / (2 * L)) * c
  const omega = 2 * Math.PI * f

  // 将物理弦长映射到约 4 个单位的可视宽度
  const visualSpan = 4
  const scaleX = visualSpan / L

  useFrame(() => {
    const mesh = beadsRef.current
    if (!mesh) return
    const t = state.t
    for (let i = 0; i <= SEGMENTS; i++) {
      const frac = i / SEGMENTS
      const xPhys = frac * L
      const y =
        amp * Math.sin((n_mode * Math.PI * xPhys) / L) * Math.sin(omega * t)
      dummy.position.set((frac - 0.5) * visualSpan, y * scaleX * 1.2, 0)
      const r = 0.04 + 0.02 * Math.abs(Math.sin((n_mode * Math.PI * frac)))
      dummy.scale.setScalar(r / 0.05)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  const supportY = -0.02

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#38bdf8" />

      <Grid
        position={[0, -1.4, 0]}
        args={[16, 16]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#3b4a5a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#5a6a7a"
        fadeDistance={16}
        fadeStrength={1.2}
        infiniteGrid
      />

      {/* 两端支座 */}
      <mesh position={[-visualSpan / 2, supportY - 0.25, 0]}>
        <boxGeometry args={[0.18, 0.5, 0.35]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[visualSpan / 2, supportY - 0.25, 0]}>
        <boxGeometry args={[0.18, 0.5, 0.35]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* 支座顶钉 */}
      <mesh position={[-visualSpan / 2, supportY, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[visualSpan / 2, supportY, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 弦上质点 */}
      <instancedMesh ref={beadsRef} args={[undefined, undefined, SEGMENTS + 1]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.45}
          metalness={0.2}
          roughness={0.35}
        />
      </instancedMesh>

      <OrbitControls maxDistance={16} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
