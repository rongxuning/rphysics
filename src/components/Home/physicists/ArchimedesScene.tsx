import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroStore } from '@/store/heroStore'

/**
 * 阿基米德 · 浴缸浮力实验
 * 关键：王冠浸入水中，排开等体积的水
 */
export default function ArchimedesScene() {
  const phase = useHeroStore((s) => s.phase)

  // 王冠位置（从空中掉入浴缸）
  const crownY = useMemo(() => {
    if (phase < 0.15) return 4
    if (phase < 0.5) {
      const t = (phase - 0.15) / 0.35
      return 4 - 3 * t * t
    }
    return 1.0 // 浮在水中
  }, [phase])

  // 水位（王冠入水时上升）
  const waterLevel = useMemo(() => {
    if (phase < 0.45) return 0.6
    if (phase < 0.6) {
      const t = (phase - 0.45) / 0.15
      return 0.6 + 0.2 * t
    }
    if (phase > 0.9) return 0.6 + 0.2 * (1 - (phase - 0.9) / 0.1)
    return 0.8
  }, [phase])

  // 水波纹动画
  const ripplePhase = useMemo(() => phase * Math.PI * 4, [phase])

  const opacity = useMemo(() => {
    if (phase < 0.05) return phase / 0.05
    if (phase > 0.9) return (1 - phase) / 0.1
    return 1
  }, [phase])

  useFrame(({ camera }) => {
    const angle = phase * Math.PI * 0.2
    camera.position.set(Math.sin(angle) * 8, 3, Math.cos(angle) * 8)
    camera.lookAt(0, 1, 0)
  })

  return (
    <group>
      {/* 地面 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3a3530" roughness={0.95} />
      </mesh>

      {/* 浴缸外壁（前/后/左/右/底） */}
      <group position={[0, 0, 0]}>
        {/* 底 */}
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[3, 0.1, 2]} />
          <meshStandardMaterial color="#d4c4a0" roughness={0.7} />
        </mesh>
        {/* 前壁（薄） */}
        <mesh castShadow position={[0, 0.5, 1]}>
          <boxGeometry args={[3, 1, 0.1]} />
          <meshStandardMaterial color="#e8d9b8" roughness={0.7} />
        </mesh>
        {/* 后壁 */}
        <mesh castShadow position={[0, 0.5, -1]}>
          <boxGeometry args={[3, 1, 0.1]} />
          <meshStandardMaterial color="#e8d9b8" roughness={0.7} />
        </mesh>
        {/* 左壁 */}
        <mesh castShadow position={[-1.5, 0.5, 0]}>
          <boxGeometry args={[0.1, 1, 2]} />
          <meshStandardMaterial color="#e8d9b8" roughness={0.7} />
        </mesh>
        {/* 右壁 */}
        <mesh castShadow position={[1.5, 0.5, 0]}>
          <boxGeometry args={[0.1, 1, 2]} />
          <meshStandardMaterial color="#e8d9b8" roughness={0.7} />
        </mesh>

        {/* 水 */}
        <mesh position={[0, waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.9, 1.9]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.7}
            metalness={0.3}
            roughness={0.2}
            emissive="#1e40af"
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* 水波纹（同心圆） */}
        {[0.5, 1.0, 1.5].map((r, i) => (
          <mesh
            key={i}
            position={[0, waterLevel + 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[r - 0.05, r, 32]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.3 * Math.sin(ripplePhase + i) ** 2} />
          </mesh>
        ))}
      </group>

      {/* 王冠（从空中掉入） */}
      <group position={[0, crownY, 0]} scale={0.6}>
        <mesh castShadow>
          <torusGeometry args={[0.4, 0.15, 8, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.95}
            roughness={0.15}
            transparent
            opacity={opacity}
          />
        </mesh>
        {/* 王冠顶部尖刺 */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.4, 0.35, Math.sin(angle) * 0.4]}
              castShadow
            >
              <coneGeometry args={[0.08, 0.3, 6]} />
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.95}
                roughness={0.15}
                transparent
                opacity={opacity}
              />
            </mesh>
          )
        })}
      </group>

      {/* 远景立柱（古希腊神庙感） */}
      {[-6, -4, 4, 6].map((x, i) => (
        <mesh key={i} position={[x, 2, -8]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 4, 12]} />
          <meshStandardMaterial color="#c8b896" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
