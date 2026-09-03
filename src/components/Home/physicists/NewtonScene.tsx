import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroStore } from '@/store/heroStore'

/**
 * 牛顿 · 苹果落地 + 斜面实验
 * 关键：万有引力导致苹果下落；力分解让球在斜面加速
 */
export default function NewtonScene() {
  const phase = useHeroStore((s) => s.phase)
  const appleRef = useRef<THREE.Mesh>(null!)
  const ballRef = useRef<THREE.Mesh>(null!)

  // 苹果位置
  const appleY = useMemo(() => {
    if (phase < 0.1) return 5
    if (phase < 0.5) {
      const t = (phase - 0.1) / 0.4
      return 5 - 4.8 * t * t // 落到 0.2
    }
    return 0.2
  }, [phase])

  // 斜面上球的位置（沿斜面方向位移）
  const ballProgress = useMemo(() => {
    if (phase < 0.4) return 0
    if (phase < 0.95) {
      return Math.min(1, ((phase - 0.4) / 0.55) ** 0.5) // sqrt 让它加速
    }
    return 1
  }, [phase])

  // 整体淡入淡出
  const opacity = useMemo(() => {
    if (phase < 0.05) return phase / 0.05
    if (phase > 0.9) return (1 - phase) / 0.1
    return 1
  }, [phase])

  // 摄像机缓慢旋转
  useFrame(({ camera }, dt) => {
    const angle = phase * Math.PI * 0.3
    camera.position.x = Math.sin(angle) * 9
    camera.position.z = Math.cos(angle) * 9
    camera.position.y = 3
    camera.lookAt(0, 1.5, 0)
  })

  // 斜面参数
  const inclineAngle = 0.4 // 弧度 ≈ 23°
  const inclineLength = 4

  return (
    <group>
      {/* 地面 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} />
      </mesh>

      {/* 苹果树（圆柱 + 球状树冠） */}
      <group position={[-3, 0, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 3, 12]} />
          <meshStandardMaterial color="#3a2818" roughness={0.9} />
        </mesh>
        {/* 树冠 */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial color="#1a3a1a" roughness={0.9} />
        </mesh>
        <mesh position={[0.8, 3, 0.5]} castShadow>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#1a3a1a" roughness={0.9} />
        </mesh>
      </group>

      {/* 苹果 */}
      <mesh ref={appleRef} position={[-3, appleY, 0.5]} castShadow>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial color="#dc2626" metalness={0.1} roughness={0.5} transparent opacity={opacity} />
      </mesh>
      {/* 苹果把 */}
      <mesh position={[-3, appleY + 0.25, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
        <meshStandardMaterial color="#3a2818" transparent opacity={opacity} />
      </mesh>

      {/* 斜面 */}
      <group position={[1.5, 0.5, 0]} rotation={[0, 0, -inclineAngle]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[inclineLength, 0.1, 1.2]} />
          <meshStandardMaterial color="#6b5a3a" roughness={0.8} />
        </mesh>
        {/* 斜面上的球（沿斜面 X 方向位移） */}
        <mesh
          ref={ballRef}
          position={[-inclineLength / 2 + 0.3 + ballProgress * (inclineLength - 0.6), 0.2, 0]}
          castShadow
        >
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} transparent opacity={opacity} />
        </mesh>
      </group>

      {/* 重力箭头（提示性） */}
      <mesh position={[2, 3, 3]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={opacity * 0.7} />
      </mesh>
    </group>
  )
}
