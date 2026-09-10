import { useMemo } from 'react'
import { Grid, OrbitControls, Text } from '@react-three/drei'
import type { SceneState } from '../types'

/**
 * RLC 振荡电路 · 3D 场景
 * R / L / C 三色元件围成回路；竖条高度表示 |Q|；箭头透明度表示 |I|
 */
export default function RlcCircuitScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const R = params.R ?? 5
  const L = params.L ?? 1
  const C = params.C ?? 0.1
  const Q = state.derived.Q ?? state.x
  const I = state.derived.I ?? state.v

  const qHeight = Math.min(2.2, 0.15 + Math.abs(Q) * 1.2)
  const qSign = Math.sign(Q) || 1
  const iOpacity = Math.min(1, 0.15 + Math.abs(I) * 0.8)
  const iDir = I >= 0 ? 1 : -1

  const wirePoints = useMemo(
    () => [
      [-1.4, 0.6, 0],
      [1.4, 0.6, 0],
      [1.4, -0.6, 0],
      [-1.4, -0.6, 0],
      [-1.4, 0.6, 0],
    ] as [number, number, number][],
    []
  )

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 7, 4]} intensity={1.15} />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} color="#fb923c" />

      <Grid
        position={[0, -1.8, 0]}
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

      {/* 回路导线 */}
      {wirePoints.slice(0, -1).map((p, i) => {
        const next = wirePoints[i + 1]
        const mx = (p[0] + next[0]) / 2
        const my = (p[1] + next[1]) / 2
        const mz = (p[2] + next[2]) / 2
        const dx = next[0] - p[0]
        const dy = next[1] - p[1]
        const len = Math.hypot(dx, dy)
        const angle = Math.atan2(dy, dx)
        return (
          <mesh key={i} position={[mx, my, mz]} rotation={[0, 0, angle]}>
            <boxGeometry args={[len, 0.04, 0.04]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.35} />
          </mesh>
        )
      })}

      {/* R — 上边 */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.7, 0.35, 0.35]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.25 + Math.min(0.5, R / 100)}
          metalness={0.3}
          roughness={0.45}
        />
      </mesh>
      <Text position={[0, 1.05, 0]} fontSize={0.22} color="#fca5a5" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        {`R = ${R.toFixed(1)} Ω`}
      </Text>

      {/* L — 右边 */}
      <mesh position={[1.4, 0, 0]}>
        <boxGeometry args={[0.35, 0.7, 0.35]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#2563eb"
          emissiveIntensity={0.25 + Math.min(0.5, L / 10)}
          metalness={0.45}
          roughness={0.35}
        />
      </mesh>
      <Text position={[1.95, 0, 0]} fontSize={0.22} color="#93c5fd" anchorX="left" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        {`L = ${L.toFixed(2)} H`}
      </Text>

      {/* C — 下边 */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[0.7, 0.35, 0.35]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#16a34a"
          emissiveIntensity={0.25 + Math.min(0.5, C)}
          metalness={0.3}
          roughness={0.45}
        />
      </mesh>
      <Text position={[0, -1.1, 0]} fontSize={0.22} color="#86efac" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        {`C = ${C.toFixed(2)} F`}
      </Text>

      {/* 电荷竖条 / 球体 */}
      <mesh position={[-1.4, -0.9 + (qHeight / 2) * qSign, 0]}>
        <boxGeometry args={[0.22, qHeight, 0.22]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#ea580c"
          emissiveIntensity={0.35 + Math.min(0.6, Math.abs(Q))}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[-1.4, -0.9 + qHeight * qSign + 0.15 * qSign, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color="#fdba74"
          emissive="#f97316"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[-1.4, 1.4, 0]} fontSize={0.2} color="#fb923c" anchorX="center" outlineWidth={0.02} outlineColor="#000">
        {`Q = ${Q.toFixed(3)} C`}
      </Text>

      {/* 电流箭头（沿顶边） */}
      <mesh
        position={[0.55 * iDir, 0.85, 0]}
        rotation={[0, 0, iDir > 0 ? -Math.PI / 2 : Math.PI / 2]}
      >
        <coneGeometry args={[0.12, 0.35, 10]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.4}
          transparent
          opacity={iOpacity}
        />
      </mesh>
      <Text position={[0, 1.35, 0]} fontSize={0.18} color="#fbbf24" anchorX="center" outlineWidth={0.02} outlineColor="#000">
        {`I = ${I.toFixed(3)} A`}
      </Text>

      <OrbitControls maxDistance={18} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
