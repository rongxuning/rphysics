import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroStore } from '@/store/heroStore'

/**
 * 爱因斯坦 · 火车光束思想实验
 * 关键：光速不变原理，狭义相对论基础
 */
export default function EinsteinScene() {
  const phase = useHeroStore((s) => s.phase)
  const trainRef = useRef<THREE.Group>(null!)

  // 火车位置（从左向右）
  const trainX = useMemo(() => {
    return -2 + phase * 4 // 0..1 phase 对应 -2..2
  }, [phase])

  // 光束：火车上的光源发出，向下打
  // 火车运动时光束呈现倾斜（相对论视角）
  const lightBeamRotation = useMemo(() => {
    // 当火车快速移动时，光束在地面参考系下倾斜
    if (phase < 0.2) return 0
    if (phase > 0.8) return -0.3
    return -0.3 * ((phase - 0.2) / 0.6)
  }, [phase])

  // 时空网格（表示弯曲时空）
  const gridRef = useRef<THREE.Mesh>(null!)

  useFrame((_, dt) => {
    if (gridRef.current) {
      // 网格的"重力井"在中心（用 scale 模拟）
      const t = phase
      const scale = 1 + Math.sin(t * Math.PI) * 0.1
      gridRef.current.scale.set(scale, scale, scale)
    }
  })

  const opacity = useMemo(() => {
    if (phase < 0.05) return phase / 0.05
    if (phase > 0.9) return (1 - phase) / 0.1
    return 1
  }, [phase])

  useFrame(({ camera }) => {
    const angle = phase * Math.PI * 0.25
    camera.position.set(Math.sin(angle) * 9, 3, Math.cos(angle) * 9)
    camera.lookAt(0, 1, 0)
  })

  return (
    <group>
      {/* 时空网格（深色 + 弯曲感） */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshStandardMaterial
          color="#0a1530"
          roughness={0.9}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* 火车（简化：长方体 + 车轮） */}
      <group ref={trainRef} position={[trainX, 0.6, 0]}>
        {/* 车身 */}
        <mesh castShadow>
          <boxGeometry args={[2, 0.8, 0.8]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.4} transparent opacity={opacity} />
        </mesh>
        {/* 车窗（发光） */}
        <mesh position={[0, 0.1, 0.41]}>
          <planeGeometry args={[1.6, 0.3]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
            transparent
            opacity={opacity}
          />
        </mesh>
        <mesh position={[0, 0.1, -0.41]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.6, 0.3]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
            transparent
            opacity={opacity}
          />
        </mesh>
        {/* 车轮 */}
        {[-0.7, 0.7].map((x, i) => (
          <group key={i} position={[x, -0.4, 0]}>
            <mesh position={[0, 0, 0.41]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
              <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.4} transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0, -0.41]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
              <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.4} transparent opacity={opacity} />
            </mesh>
          </group>
        ))}
        {/* 光源（火车顶部） */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} transparent opacity={opacity} />
        </mesh>

        {/* 光束（向下） */}
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, lightBeamRotation]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#60a5fa"
            emissiveIntensity={2}
            transparent
            opacity={0.7 * opacity}
          />
        </mesh>
      </group>

      {/* 地面参考点（接收光束） */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <group key={i} position={[x, -0.45, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} transparent opacity={opacity} />
          </mesh>
          {/* 接收到光的高亮（火车到达时） */}
          {Math.abs(trainX - x) < 0.3 && (
            <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.2, 16]} />
              <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      ))}

      {/* 速度箭头 v（火车移动方向） */}
      <mesh position={[trainX, 1.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} transparent opacity={opacity} />
      </mesh>

      {/* 远景星云（爱因斯坦的宇宙） */}
      <mesh position={[8, 5, -10]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1e3a8a"
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[-6, 4, -12]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#581c87"
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}
