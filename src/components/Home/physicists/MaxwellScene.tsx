import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroStore } from '@/store/heroStore'

/**
 * 麦克斯韦 · 电磁波传播
 * 关键：变化的电场激发磁场，电磁波在空间传播
 */
export default function MaxwellScene() {
  const phase = useHeroStore((s) => s.phase)
  const groupRef = useRef<THREE.Group>(null!)

  // 电磁波环的扩散
  const wavePhase = useMemo(() => phase * 2, [phase])

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.3
    }
  })

  const opacity = useMemo(() => {
    if (phase < 0.05) return phase / 0.05
    if (phase > 0.9) return (1 - phase) / 0.1
    return 1
  }, [phase])

  useFrame(({ camera }) => {
    camera.position.set(0, 2, 8)
    camera.lookAt(0, 0, 0)
  })

  // 振荡电偶极子
  const dipoleAmplitude = Math.sin(phase * Math.PI * 4) * 0.5

  return (
    <group ref={groupRef}>
      {/* 地面 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1530" roughness={0.95} />
      </mesh>

      {/* 中心源（电偶极子） */}
      <group position={[0, 0, 0]}>
        {/* 中心 sphere */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1.5}
            transparent
            opacity={opacity}
          />
        </mesh>
        {/* 点光源 */}
        <pointLight color="#a855f7" intensity={3} distance={10} />
      </group>

      {/* 电磁波波前 - 同心环扩散 */}
      {Array.from({ length: 5 }).map((_, i) => {
        const baseRadius = 0.8 + i * 1.0
        const radius = baseRadius + ((wavePhase + i * 0.2) % 1) * 2
        const ringOpacity = (1 - ((wavePhase + i * 0.2) % 1)) * 0.6 * opacity
        if (ringOpacity < 0.01) return null
        return (
          <group key={i}>
            {/* 电场环（垂直） */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={ringOpacity} side={THREE.DoubleSide} />
            </mesh>
            {/* 磁场环（水平） */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={ringOpacity * 0.8} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )
      })}

      {/* 振荡电场（垂直分量） */}
      <mesh position={[0, dipoleAmplitude, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, -dipoleAmplitude, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} transparent opacity={opacity} />
      </mesh>

      {/* 远处的电磁场指示器（小立方体阵列） */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 4
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r
        const y = Math.sin(phase * Math.PI * 4 + i) * 0.3
        return (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} transparent opacity={opacity * 0.8} />
          </mesh>
        )
      })}

      {/* 远景：抽象电场网格 */}
      <gridHelper args={[20, 20, '#1a1530', '#1a1530']} position={[0, -2, 0]} />
    </group>
  )
}
