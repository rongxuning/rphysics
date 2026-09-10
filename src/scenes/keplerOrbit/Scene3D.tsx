import { useMemo } from 'react'
import { Grid, OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { SceneState } from '../types'

const SCALE = 1.6
const ELLIPSE_SEGMENTS = 96

/**
 * 开普勒轨道 · 3D 场景
 * 中心黄日 + 行星 (r cosθ, 0, r sinθ) + 淡椭圆轨迹；OrbitControls 对准原点
 */
export default function KeplerOrbitScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const a_AU = params.a_AU ?? 1
  const e = params.e ?? 0.2
  const M_solar = params.M_solar ?? 1

  const theta = state.derived.true_anomaly ?? state.x
  const r = state.derived.r ?? a_AU
  const speed = state.derived.speed ?? state.v

  const px = r * Math.cos(theta) * SCALE
  const pz = r * Math.sin(theta) * SCALE

  const ellipseGeom = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= ELLIPSE_SEGMENTS; i++) {
      const th = (i / ELLIPSE_SEGMENTS) * Math.PI * 2
      const ri = (a_AU * (1 - e * e)) / (1 + e * Math.cos(th))
      points.push(new THREE.Vector3(ri * Math.cos(th) * SCALE, 0, ri * Math.sin(th) * SCALE))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [a_AU, e])

  const sunSize = 0.22 + Math.min(0.25, M_solar * 0.06)
  const planetSize = 0.1

  return (
    <group>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 3]} intensity={0.9} />
      <pointLight position={[0, 0.2, 0]} intensity={2.2} distance={12} color="#fde68a" />

      <Grid
        position={[0, -0.02, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.35}
        cellColor="#3b4a5a"
        sectionSize={2}
        sectionThickness={0.9}
        sectionColor="#5a6a7a"
        fadeDistance={16}
        fadeStrength={1.2}
        infiniteGrid
      />

      {/* 太阳 */}
      <mesh>
        <sphereGeometry args={[sunSize, 32, 32]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#eab308"
          emissiveIntensity={0.85 + Math.min(0.4, M_solar * 0.1)}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
      <Text position={[0, sunSize + 0.35, 0]} fontSize={0.2} color="#fde68a" anchorX="center" outlineWidth={0.02} outlineColor="#000">
        {`☉ M=${M_solar.toFixed(1)}`}
      </Text>

      {/* 椭圆轨道 */}
      <line>
        <primitive object={ellipseGeom} attach="geometry" />
        <lineBasicMaterial color="#818cf8" transparent opacity={0.45} />
      </line>

      {/* 行星 */}
      <mesh position={[px, 0, pz]}>
        <sphereGeometry args={[planetSize, 24, 24]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.45}
          metalness={0.35}
          roughness={0.4}
        />
      </mesh>
      <Text position={[px, 0.45, pz]} fontSize={0.18} color="#a5b4fc" anchorX="center" outlineWidth={0.02} outlineColor="#000">
        {`r=${r.toFixed(2)} AU · v=${speed.toFixed(2)}`}
      </Text>

      {/* 近日点方向指示 */}
      <mesh position={[(a_AU * (1 - e)) * SCALE * 0.5, 0, 0]}>
        <boxGeometry args={[(a_AU * (1 - e)) * SCALE, 0.015, 0.015]} />
        <meshStandardMaterial color="#64748b" transparent opacity={0.35} />
      </mesh>

      <OrbitControls
        target={[0, 0, 0]}
        maxDistance={22}
        minDistance={2}
        maxPolarAngle={Math.PI / 2.05}
      />
    </group>
  )
}
