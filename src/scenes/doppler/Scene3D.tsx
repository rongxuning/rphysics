import { useMemo } from 'react'
import { Grid, OrbitControls, Text } from '@react-three/drei'
import type { SceneState } from '../types'

const RING_COUNT = 6

/**
 * 多普勒效应 · 3D 场景
 * 声源缓慢平移；观察者固定；若干环面波前随 t 扩张
 */
export default function DopplerScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const vs = params.vs ?? 20
  const f0 = params.f0 ?? 440
  const f_obs = state.derived.f_obs ?? state.v
  const wavelength = state.derived.wavelength ?? 0.77

  const sourceX = state.x
  const observerX = 3.2

  const rings = useMemo(() => {
    const list: { scale: number; opacity: number; key: number }[] = []
    const period = Math.max(0.15, wavelength * 0.35)
    for (let i = 0; i < RING_COUNT; i++) {
      const phase = (state.t / period + i / RING_COUNT) % 1
      const scale = 0.25 + phase * 3.2
      const opacity = Math.max(0.05, 0.55 * (1 - phase))
      list.push({ scale, opacity, key: i })
    }
    return list
  }, [state.t, wavelength])

  const pitchColor = f_obs > f0 ? '#f472b6' : f_obs < f0 ? '#67e8f9' : '#e2e8f0'

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 7, 4]} intensity={1.15} />
      <directionalLight position={[-3, 3, -2]} intensity={0.4} color="#f472b6" />

      <Grid
        position={[0, -1.6, 0]}
        args={[20, 16]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#3b4a5a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#5a6a7a"
        fadeDistance={18}
        fadeStrength={1.2}
        infiniteGrid
      />

      {/* 声源 */}
      <group position={[sourceX, 0.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#db2777"
            emissiveIntensity={0.55}
            metalness={0.2}
            roughness={0.35}
          />
        </mesh>
        <Text position={[0, 0.55, 0]} fontSize={0.2} color="#f9a8d4" anchorX="center" outlineWidth={0.02} outlineColor="#000">
          {`源 · vs=${vs.toFixed(0)}`}
        </Text>

        {/* 波前圆环（水平面内扩张） */}
        {rings.map((ring) => (
          <mesh key={ring.key} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.scale, 0.035, 8, 48]} />
            <meshStandardMaterial
              color={pitchColor}
              emissive={pitchColor}
              emissiveIntensity={0.35}
              transparent
              opacity={ring.opacity}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* 观察者 */}
      <group position={[observerX, 0.15, 0]}>
        <mesh>
          <capsuleGeometry args={[0.18, 0.45, 6, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.25} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.15} roughness={0.45} />
        </mesh>
        <Text position={[0, 1.0, 0]} fontSize={0.2} color="#cbd5e1" anchorX="center" outlineWidth={0.02} outlineColor="#000">
          {`观察者 · f′=${f_obs.toFixed(0)} Hz`}
        </Text>
      </group>

      {/* 连线示意 */}
      <mesh position={[(sourceX + observerX) / 2, -0.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[Math.abs(observerX - sourceX), 0.02, 0.02]} />
        <meshStandardMaterial color="#64748b" transparent opacity={0.5} />
      </mesh>

      <OrbitControls maxDistance={20} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
