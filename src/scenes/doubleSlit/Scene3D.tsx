import { useMemo } from 'react'
import { Grid, OrbitControls } from '@react-three/drei'
import type { SceneState } from '../types'

const BAR_COUNT = 9
const SCREEN_X = 3.2
const SLIT_X = -1.5

/**
 * 杨氏双缝干涉 · 3D 场景
 * 双缝挡板 + 屏上强度条（高度/透明度随 cos² 干涉图样）
 * 相位由 state.t 驱动，产生缓慢漂移
 */
export default function DoubleSlitScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const lambda_nm = params.lambda_nm ?? 550
  const d_mm = params.d_mm ?? 0.2
  const L = params.L_m ?? 2
  const amp = params.amp ?? 1

  const lambda = lambda_nm * 1e-9
  const d = d_mm * 1e-3
  const phase = state.t

  const bars = useMemo(() => {
    const result: { y: number; I: number; key: number }[] = []
    const halfSpan = 1.6
    for (let i = 0; i < BAR_COUNT; i++) {
      const frac = i / (BAR_COUNT - 1)
      const y = -halfSpan + frac * 2 * halfSpan
      // 物理屏坐标：映射 y → 数厘米量级的 x_screen
      const x_screen = y * 0.008
      const arg = (Math.PI * d * x_screen) / (lambda * L) + phase * 0.35
      const I = amp * Math.pow(Math.cos(arg), 2)
      result.push({ y, I, key: i })
    }
    return result
  }, [lambda, d, L, amp, phase])

  const slitHalf = Math.max(0.08, Math.min(0.6, d_mm * 0.8))

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#a78bfa" />

      <Grid
        position={[0, -2.2, 0]}
        args={[20, 20]}
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

      {/* 光源侧指示 */}
      <mesh position={[-3.2, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#facc15"
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* 双缝挡板 */}
      <group position={[SLIT_X, 0, 0]}>
        <mesh position={[0, slitHalf + 0.55, 0]}>
          <boxGeometry args={[0.12, 1.1, 1.4]} />
          <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0, -(slitHalf + 0.55), 0]}>
          <boxGeometry args={[0.12, 1.1, 1.4]} />
          <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.55]}>
          <boxGeometry args={[0.12, slitHalf * 2, 0.3]} />
          <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, -0.55]}>
          <boxGeometry args={[0.12, slitHalf * 2, 0.3]} />
          <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
        </mesh>
      </group>

      {/* 干涉屏 */}
      <mesh position={[SCREEN_X, 0, 0]}>
        <boxGeometry args={[0.06, 3.6, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* 强度条 */}
      {bars.map((bar) => {
        const h = 0.15 + bar.I * 1.4
        return (
          <mesh
            key={bar.key}
            position={[SCREEN_X + h / 2 + 0.05, bar.y, 0]}
          >
            <boxGeometry args={[h, 0.28, 0.22]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#7c3aed"
              emissiveIntensity={0.2 + bar.I * 0.8}
              transparent
              opacity={0.25 + bar.I * 0.7}
            />
          </mesh>
        )
      })}

      <OrbitControls maxDistance={20} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
