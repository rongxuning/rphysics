import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 通用力箭头：从 origin 出发，沿 direction 方向，长度 ∝ magnitude
 * direction 必须是单位向量
 */
export type ForceArrowProps = {
  origin: [number, number, number]
  direction: [number, number, number]
  magnitude: number
  color: string
  /** 长度缩放：实际长度 = magnitude * scale */
  scale?: number
  /** 最小/最大长度（避免太短看不见 / 太长穿模） */
  minLength?: number
  maxLength?: number
  thickness?: number
  label?: string
  highlighted?: boolean
}

export default function ForceArrow({
  origin,
  direction,
  magnitude,
  color,
  scale = 0.02,
  minLength = 0.2,
  maxLength = 3,
  thickness = 0.05,
  highlighted = false,
}: ForceArrowProps) {
  const groupRef = useRef<THREE.Group>(null!)

  // 计算箭头长度和朝向
  const { length, quat, pos } = useMemo(() => {
    const dir = new THREE.Vector3(...direction).normalize()
    const len = Math.min(Math.max(magnitude * scale, magnitude > 0 ? minLength : 0), maxLength)

    // 起点：origin
    // 终点：origin + dir * len
    const start = new THREE.Vector3(...origin)
    const end = start.clone().addScaledVector(dir, len)

    // 圆柱居中放在 (start + end) / 2
    const center = start.clone().add(end).multiplyScalar(0.5)
    // 圆柱默认沿 Y 轴，需要转到 dir 方向
    const up = new THREE.Vector3(0, 1, 0)
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir)

    return { length: len, quat: q, pos: center }
  }, [origin, direction, magnitude, scale, minLength, maxLength])

  // 锥头位置
  const headPos = useMemo(() => {
    const dir = new THREE.Vector3(...direction).normalize()
    return new THREE.Vector3(...origin).addScaledVector(dir, length)
  }, [origin, direction, length])

  // 闪烁效果（高亮时）
  useFrame((state) => {
    if (!groupRef.current) return
    if (highlighted) {
      const t = state.clock.elapsedTime
      const s = 1 + Math.sin(t * 6) * 0.1
      groupRef.current.scale.set(s, s, s)
    } else {
      groupRef.current.scale.set(1, 1, 1)
    }
  })

  if (magnitude < 0.001) return null

  return (
    <group ref={groupRef}>
      {/* 杆 */}
      <mesh position={pos} quaternion={quat} castShadow>
        <cylinderGeometry args={[thickness, thickness, length * 0.85, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={highlighted ? 0.8 : 0.3}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
      {/* 头 */}
      <mesh position={headPos} quaternion={quat} castShadow>
        <coneGeometry args={[thickness * 2.2, length * 0.15, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={highlighted ? 1.0 : 0.4}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}
