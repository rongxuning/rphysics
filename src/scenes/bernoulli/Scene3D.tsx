import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls } from '@react-three/drei'
import type { SceneState } from '../types'

const PARTICLE_COUNT = 24

type FlowParticle = {
  s: number // 沿管线进度 0..1
  phase: number
}

/**
 * 伯努利方程 · 3D 场景
 * 宽→窄变截面管；窄段粒子更快（基于 state.t / 连续性）
 */
export default function BernoulliScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const particlesRef = useRef<THREE.InstancedMesh>(null!)
  const particles = useRef<FlowParticle[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const A1 = Math.max(params.A1 ?? 0.08, 1e-6)
  const A2 = Math.max(params.A2 ?? 0.02, 1e-6)
  const v1 = params.v1 ?? 1
  const h1 = params.h1 ?? 1
  const h2 = params.h2 ?? 0.5

  const r1 = 0.22 + Math.sqrt(A1) * 0.9
  const r2 = 0.12 + Math.sqrt(A2) * 0.9
  const y1 = (h1 - 2.5) * 0.15
  const y2 = (h2 - 2.5) * 0.15

  // 管道路径：左宽段 → 过渡 → 右窄段
  const pathPoint = (s: number): THREE.Vector3 => {
    // s in [0,1]: x from -2.4 to 2.4
    const x = -2.4 + s * 4.8
    let y: number
    let r: number
    if (s < 0.35) {
      y = y1
      r = r1
    } else if (s < 0.55) {
      const u = (s - 0.35) / 0.2
      const smooth = u * u * (3 - 2 * u)
      y = y1 + (y2 - y1) * smooth
      r = r1 + (r2 - r1) * smooth
    } else {
      y = y2
      r = r2
    }
    return new THREE.Vector3(x, y, 0)
  }

  const radiusAt = (s: number): number => {
    if (s < 0.35) return r1
    if (s < 0.55) {
      const u = (s - 0.35) / 0.2
      const smooth = u * u * (3 - 2 * u)
      return r1 + (r2 - r1) * smooth
    }
    return r2
  }

  const speedAt = (s: number): number => {
    const r = radiusAt(s)
    // 连续性：v ∝ 1/A ∝ 1/r²，以 v1 为宽段基准
    const v = v1 * (r1 * r1) / Math.max(r * r, 1e-6)
    return 0.08 + v * 0.12
  }

  useEffect(() => {
    const list: FlowParticle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      list.push({
        s: i / PARTICLE_COUNT,
        phase: (i / PARTICLE_COUNT) * Math.PI * 2,
      })
    }
    particles.current = list
  }, [])

  useFrame((_, dt) => {
    const mesh = particlesRef.current
    if (!mesh) return
    const clampedDt = Math.min(dt, 0.05)
    // 用 state.t 驱动整体相位，保证与物理 tick 同步感
    const flowBoost = 0.35 + (state.x % 1) * 0.15

    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i]
      p.s = (p.s + speedAt(p.s) * clampedDt * flowBoost) % 1
      const pos = pathPoint(p.s)
      const r = radiusAt(p.s)
      const orbit = 0.35 * r
      pos.y += Math.sin(state.t * 2 + p.phase) * orbit * 0.35
      pos.z += Math.cos(state.t * 1.7 + p.phase) * orbit * 0.55
      dummy.position.copy(pos)
      const scale = 0.7 + 0.5 * (r1 / Math.max(r, 0.05))
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  // 管道壳体：三段圆柱近似
  const wideLen = 1.7
  const taperLen = 1.0
  const narrowLen = 2.1

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#2dd4bf" />

      <Grid
        position={[0, -1.8, 0]}
        args={[16, 16]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#3b4a5a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#5a6a7a"
        fadeDistance={16}
        fadeStrength={1.2}
        infiniteGrid
      />

      {/* 宽段 */}
      <mesh position={[-1.55, y1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r1, r1, wideLen, 24, 1, true]} />
        <meshStandardMaterial
          color="#2dd4bf"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* 过渡锥 */}
      <mesh position={[-0.2, (y1 + y2) / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r2, r1, taperLen, 24, 1, true]} />
        <meshStandardMaterial
          color="#14b8a6"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* 窄段 */}
      <mesh position={[1.35, y2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r2, r2, narrowLen, 24, 1, true]} />
        <meshStandardMaterial
          color="#0d9488"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>

      {/* 端环 */}
      <mesh position={[-2.4, y1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[r1, 0.035, 8, 32]} />
        <meshStandardMaterial color="#5eead4" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[2.4, y2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[r2, 0.03, 8, 32]} />
        <meshStandardMaterial color="#5eead4" metalness={0.5} roughness={0.3} />
      </mesh>

      <instancedMesh ref={particlesRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial
          color="#99f6e4"
          emissive="#2dd4bf"
          emissiveIntensity={0.55}
          metalness={0.15}
          roughness={0.35}
        />
      </instancedMesh>

      <OrbitControls maxDistance={16} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
