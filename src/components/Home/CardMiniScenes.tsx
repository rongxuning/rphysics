import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 实验卡迷你 3D 预览
 * 保持轻量几何，多卡可并行
 */

export function PullFrictionMini() {
  const blockRef = useRef<THREE.Mesh>(null!)
  const arrowRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (blockRef.current) {
      blockRef.current.position.x = -0.4 + ((t * 0.35) % 1.6)
    }
    if (arrowRef.current) {
      arrowRef.current.rotation.z = -Math.PI / 6 + Math.sin(t * 2) * 0.05
    }
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#1a2030" />
      </mesh>
      <mesh ref={blockRef} position={[-0.4, -0.1, 0]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.3} />
      </mesh>
      <group ref={arrowRef} position={[0.2, 0.25, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.35, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.45} />
        </mesh>
      </group>
    </group>
  )
}

/** 光学 · 双缝干涉条纹 */
export function DoubleSlitMini() {
  const group = useRef<THREE.Group>(null!)
  useFrame((s) => {
    if (group.current) group.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.15
  })
  return (
    <group ref={group}>
      <mesh position={[-1.1, 0, 0]}>
        <boxGeometry args={[0.12, 1.4, 0.08]} />
        <meshStandardMaterial color="#312e81" />
      </mesh>
      {[-0.18, 0.18].map((y) => (
        <mesh key={y} position={[-1.1, y, 0.05]}>
          <boxGeometry args={[0.04, 0.22, 0.02]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = -0.2 + i * 0.28
        const intensity = 1 - Math.abs(i - 3) * 0.22
        return (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.08, 1.2 * intensity, 0.02]} />
            <meshStandardMaterial
              color="#c4b5fd"
              emissive="#8b5cf6"
              emissiveIntensity={0.3 + intensity * 0.7}
              transparent
              opacity={0.55 + intensity * 0.35}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/** 电磁学 · 线圈磁通量 */
export function InductionMini() {
  const magnet = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (magnet.current) magnet.current.position.y = Math.sin(s.clock.elapsedTime * 1.6) * 0.55
  })
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[0.55, 0.07, 12, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh ref={magnet} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.7, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

/** 热力学 · 分子运动 */
export function IdealGasMini() {
  const dots = useRef<THREE.Group>(null!)
  const seeds = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        x: ((i * 37) % 10) / 10 - 0.5,
        y: ((i * 53) % 10) / 10 - 0.3,
        z: ((i * 17) % 10) / 10 - 0.3,
        s: 0.7 + (i % 5) * 0.15,
      })),
    []
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    dots.current?.children.forEach((child, i) => {
      const p = seeds[i]
      child.position.x = p.x + Math.sin(t * p.s + i) * 0.35
      child.position.y = p.y + Math.cos(t * p.s * 1.3 + i) * 0.25
    })
  })
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.2, 1.4, 1.2]} />
        <meshStandardMaterial color="#7f1d1d" transparent opacity={0.25} wireframe />
      </mesh>
      <group ref={dots}>
        {seeds.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** 波动 · 驻波 */
export function StandingWaveMini() {
  const dots = useRef<THREE.Group>(null!)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    dots.current?.children.forEach((child, i) => {
      const x = (i / 23) * 2.4 - 1.2
      const y = Math.sin(Math.PI * 2 * ((x + 1.2) / 2.4)) * Math.cos(t * 3) * 0.45
      child.position.set(x, y, 0)
    })
  })
  return (
    <group>
      <mesh position={[-1.25, 0, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[1.25, 0, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <group ref={dots}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** 流体 · 管径变化流速 */
export function BernoulliMini() {
  const drop = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    const t = s.clock.elapsedTime % 2.2
    if (!drop.current) return
    // 左宽右窄：右侧更快
    if (t < 1.1) {
      drop.current.position.set(-0.9 + t * 0.7, 0.15, 0)
      drop.current.scale.setScalar(1)
    } else {
      const u = t - 1.1
      drop.current.position.set(-0.13 + u * 1.4, -0.05, 0)
      drop.current.scale.setScalar(0.7)
    }
  })
  return (
    <group>
      <mesh position={[-0.7, 0.05, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.9, 16]} />
        <meshStandardMaterial color="#0f766e" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.55, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 1.3, 16]} />
        <meshStandardMaterial color="#14b8a6" transparent opacity={0.4} />
      </mesh>
      <mesh ref={drop}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#5eead4" emissive="#2dd4bf" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

/** 近代物理 · 光电效应 */
export function PhotoelectricMini() {
  const electron = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    const t = s.clock.elapsedTime % 2
    if (!electron.current) return
    if (t < 0.6) {
      electron.current.visible = false
    } else {
      electron.current.visible = true
      electron.current.position.set(-0.2 + (t - 0.6) * 1.1, 0.15 + (t - 0.6) * 0.35, 0)
    }
  })
  return (
    <group>
      <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#a3e635" emissive="#84cc16" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.15, -0.35, 0]}>
        <boxGeometry args={[0.15, 0.9, 0.5]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.7} />
      </mesh>
      <mesh ref={electron}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

/** 电路 · RLC */
export function RlcCircuitMini() {
  const spark = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (spark.current) {
      const a = 0.5 + 0.5 * Math.sin(t * 4)
      ;(spark.current.material as THREE.MeshStandardMaterial).emissiveIntensity = a
      spark.current.scale.setScalar(0.7 + a * 0.5)
    }
  })
  return (
    <group>
      <mesh>
        <torusGeometry args={[0.7, 0.04, 8, 48]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} />
      </mesh>
      <mesh position={[-0.7, 0, 0]}>
        <boxGeometry args={[0.25, 0.35, 0.2]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      <mesh position={[0.7, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.35, 12]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.4} />
      </mesh>
      <mesh ref={spark} position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fdba74" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

/** 声学 · 多普勒波前 */
export function DopplerMini() {
  const rings = useRef<THREE.Group>(null!)
  useFrame((s) => {
    const t = s.clock.elapsedTime
    rings.current?.children.forEach((child, i) => {
      const age = (t * 0.7 + i * 0.35) % 1.4
      const mesh = child as THREE.Mesh
      mesh.scale.setScalar(0.2 + age * 1.3)
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = Math.max(0, 1 - age / 1.4)
      mesh.position.x = -0.6 + age * 0.9
    })
  })
  return (
    <group>
      <mesh position={[-0.6, 0, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.45} />
      </mesh>
      <group ref={rings}>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.02, 6, 32]} />
            <meshStandardMaterial color="#f9a8d4" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** 天体力学 · 椭圆轨道 */
export function KeplerMini() {
  const planet = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.9
    const a = 1.05
    const b = 0.65
    if (planet.current) {
      planet.current.position.set(Math.cos(t) * a, Math.sin(t) * b, 0)
    }
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.7} />
      </mesh>
      {Array.from({ length: 48 }).map((_, i) => {
        const th = (i / 48) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(th) * 1.05, Math.sin(th) * 0.65, 0]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial color="#818cf8" />
          </mesh>
        )
      })}
      <mesh ref={planet}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}
