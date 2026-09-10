import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls } from '@react-three/drei'
import type { SceneState } from '../types'

/**
 * 法拉第电磁感应 · 3D 场景
 * 线圈（环堆）+ 由 state.t 驱动旋转的磁体
 */
export default function FaradayInductionScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const magnetRef = useRef<THREE.Group>(null!)
  const N = Math.round(params.N_turns ?? 10)
  const area = params.area ?? 0.05
  const omega = params.omega ?? 2
  const B = params.B ?? 0.5

  const radius = Math.sqrt(Math.max(area, 0.01) / Math.PI) * 2.2
  const turnCount = Math.min(12, Math.max(3, Math.round(N / 4)))

  useFrame(() => {
    if (magnetRef.current) {
      magnetRef.current.rotation.y = omega * state.t
      magnetRef.current.position.y = 0.15 * Math.sin(omega * state.t * 0.5)
    }
  })

  const rings = Array.from({ length: turnCount }, (_, i) => {
    const z = (i - (turnCount - 1) / 2) * 0.14
    return z
  })

  const glow = Math.min(1, Math.abs(state.derived.epsilon ?? 0) / (N * B * area * omega + 1e-6))

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 7, 4]} intensity={1.15} />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} color="#fbbf24" />

      <Grid
        position={[0, -1.6, 0]}
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

      {/* 线圈支架 */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.8, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* 线圈环堆 */}
      <group position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {rings.map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <torusGeometry args={[radius, 0.045, 12, 48]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.7}
              roughness={0.25}
              emissive="#f59e0b"
              emissiveIntensity={0.15 + glow * 0.55}
            />
          </mesh>
        ))}
      </group>

      {/* 旋转磁体 */}
      <group ref={magnetRef} position={[radius + 1.1, 0.4, 0]}>
        <mesh>
          <boxGeometry args={[0.35, 0.9, 0.35]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.36, 0.28, 0.36]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={0.35 + B * 0.2}
          />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[0.36, 0.28, 0.36]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#2563eb"
            emissiveIntensity={0.35 + B * 0.2}
          />
        </mesh>
      </group>

      <OrbitControls maxDistance={18} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
