import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls } from '@react-three/drei'
import type { SceneState } from '../types'

const PARTICLE_COUNT = 16

type Particle = {
  pos: THREE.Vector3
  vel: THREE.Vector3
}

/**
 * 理想气体定律 · 3D 场景
 * 透明盒子按 V^(1/3) 缩放；粒子以 ~√T 速度弹跳
 */
export default function IdealGasScene3D({
  state: _state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const boxRef = useRef<THREE.Mesh>(null!)
  const particlesRef = useRef<THREE.InstancedMesh>(null!)
  const particles = useRef<Particle[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const V = params.V ?? 0.05
  const T = params.T ?? 300
  const side = Math.max(0.6, Math.pow(V, 1 / 3) * 6)
  const half = side / 2
  const speed = 0.8 + Math.sqrt(T) * 0.12

  // 初始化 / 参数大幅变化时重新播种粒子
  useEffect(() => {
    const list: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize()
      list.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * side * 0.8,
          (Math.random() - 0.5) * side * 0.8,
          (Math.random() - 0.5) * side * 0.8
        ),
        vel: dir.multiplyScalar(speed * (0.7 + Math.random() * 0.6)),
      })
    }
    particles.current = list
  }, [side, speed])

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05)
    const mesh = particlesRef.current
    if (!mesh || particles.current.length === 0) return

    const h = half * 0.92
    const speedScale = speed / (0.8 + Math.sqrt(300) * 0.12)

    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i]
      // 保持速度量级随 T 变化
      const curSpeed = p.vel.length()
      if (curSpeed > 1e-6) {
        p.vel.setLength(curSpeed * 0.98 + speed * (0.7 + (i % 5) * 0.06) * 0.02 * speedScale)
      }

      p.pos.addScaledVector(p.vel, clampedDt)

      for (const axis of ['x', 'y', 'z'] as const) {
        if (p.pos[axis] > h) {
          p.pos[axis] = h
          p.vel[axis] *= -1
        } else if (p.pos[axis] < -h) {
          p.pos[axis] = -h
          p.vel[axis] *= -1
        }
      }

      dummy.position.copy(p.pos)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#fb7185" />

      <Grid
        position={[0, -half - 0.05, 0]}
        args={[14, 14]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#3b4a5a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#5a6a7a"
        fadeDistance={14}
        fadeStrength={1.2}
        infiniteGrid
      />

      {/* 透明容器 */}
      <mesh ref={boxRef}>
        <boxGeometry args={[side, side, side]} />
        <meshStandardMaterial
          color="#fb7185"
          transparent
          opacity={0.12}
          roughness={0.3}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[side, side, side]} />
        <meshBasicMaterial color="#fda4af" wireframe transparent opacity={0.45} />
      </mesh>

      {/* 分子 */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#fb7185"
          emissive="#e11d48"
          emissiveIntensity={0.45}
          metalness={0.2}
          roughness={0.4}
        />
      </instancedMesh>

      <OrbitControls maxDistance={16} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
