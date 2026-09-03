import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 网格卡 mini 3D 场景
 * 每个场景都是循环动画，简化几何保证多卡同时运行的性能
 */

export function PullFrictionMini() {
  const blockRef = useRef<THREE.Mesh>(null!)
  const arrowRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (blockRef.current) {
      blockRef.current.position.x = 0.5 + Math.min(t * 0.4, 1.5) // 物块向右滑
    }
    if (arrowRef.current) {
      arrowRef.current.rotation.z = Math.sin(t * 2) * 0.05 // 拉力箭头轻微晃动
    }
  })

  return (
    <group>
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1a2030" />
      </mesh>
      {/* 物块 */}
      <mesh ref={blockRef} position={[0.5, -0.1, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* 拉力箭头 */}
      <group ref={arrowRef} position={[0.5, 0.2, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 6]}>
          <coneGeometry args={[0.1, 0.4, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* 摩擦箭头（反向） */}
      <mesh position={[0.5, -0.1, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export function FreeFallMini() {
  const appleRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (appleRef.current) {
      // 循环下落：h = ½gt² 然后重置
      const cycle = t % 2
      appleRef.current.position.y = 1.5 - 0.5 * 9.8 * cycle * cycle
      if (cycle < 0.1) appleRef.current.position.y = 1.5
    }
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1a2030" />
      </mesh>
      {/* 苹果 */}
      <mesh ref={appleRef} position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#dc2626" metalness={0.1} roughness={0.5} />
      </mesh>
      {/* 阴影圆 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export function SpringOscMini() {
  const massRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (massRef.current) {
      // 简谐振动：x = A*cos(ωt)
      massRef.current.position.y = Math.sin(t * 3) * 0.6
    }
  })

  return (
    <group>
      {/* 顶部固定 */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* 弹簧（用线段模拟） */}
      <SpringLine />
      {/* 质量块 */}
      <mesh ref={massRef} position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function SpringLine() {
  const points = []
  const segments = 12
  for (let i = 0; i <= segments; i++) {
    const y = 1.1 - i * 0.18
    const x = (i % 2 === 0 ? 0 : 0.08) * (1 - i / segments)
    points.push(new THREE.Vector3(x, y, 0))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#94a3b8" />
    </line>
  )
}

export function InclineMini() {
  const blockRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (blockRef.current) {
      // 沿斜面下滑，循环
      const cycle = t % 3
      const progress = cycle / 3
      blockRef.current.position.x = -1 + progress * 2
    }
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1a2030" />
      </mesh>
      {/* 斜面 */}
      <group position={[0, -0.3, 0]} rotation={[0, 0, -0.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.1, 0.8]} />
          <meshStandardMaterial color="#6b5a3a" />
        </mesh>
      </group>
      {/* 滑块 */}
      <mesh ref={blockRef} position={[-1, 0.1, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
