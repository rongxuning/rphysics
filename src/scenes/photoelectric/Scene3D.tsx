import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls } from '@react-three/drei'
import type { SceneState } from '../types'

const PHOTON_COUNT = 10
const ELECTRON_COUNT = 14

type Pulse = {
  t0: number
  y: number
  z: number
}

type Electron = {
  active: boolean
  age: number
  pos: THREE.Vector3
  vel: THREE.Vector3
}

/**
 * 光电效应 · 3D 场景
 * 金属板 + 射向板的光子脉冲；K_max>0 时从板面发射电子
 */
export default function PhotoelectricScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const photonsRef = useRef<THREE.InstancedMesh>(null!)
  const electronsRef = useRef<THREE.InstancedMesh>(null!)
  const pulses = useRef<Pulse[]>([])
  const electrons = useRef<Electron[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lastEmit = useRef(0)

  const intensity = params.intensity ?? 1
  const K_max = state.derived.K_max ?? state.x
  const rate = state.derived.rate ?? 0
  const emitting = K_max > 0

  const plateX = 0.9

  useEffect(() => {
    const pulseList: Pulse[] = []
    for (let i = 0; i < PHOTON_COUNT; i++) {
      pulseList.push({
        t0: i * 0.35,
        y: (Math.random() - 0.5) * 1.2,
        z: (Math.random() - 0.5) * 0.9,
      })
    }
    pulses.current = pulseList

    const electronList: Electron[] = []
    for (let i = 0; i < ELECTRON_COUNT; i++) {
      electronList.push({
        active: false,
        age: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
      })
    }
    electrons.current = electronList
  }, [])

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05)
    const t = state.t

    // 光子脉冲：从左向金属板飞行，循环
    const photonMesh = photonsRef.current
    if (photonMesh) {
      const travel = 3.2
      const speed = 1.8 + intensity * 0.4
      for (let i = 0; i < pulses.current.length; i++) {
        const p = pulses.current[i]
        const local = ((t - p.t0) * speed) % travel
        const x = -2.2 + local
        const hit = x >= plateX - 0.05
        dummy.position.set(Math.min(x, plateX - 0.08), p.y, p.z)
        const s = hit ? 0.01 : 0.9 + 0.3 * Math.sin(t * 8 + i)
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        photonMesh.setMatrixAt(i, dummy.matrix)
      }
      photonMesh.instanceMatrix.needsUpdate = true
    }

    // 电子发射
    const electronMesh = electronsRef.current
    if (electronMesh) {
      if (emitting) {
        const interval = Math.max(0.08, 0.55 / Math.max(rate, 0.15))
        if (t - lastEmit.current >= interval) {
          lastEmit.current = t
          const slot = electrons.current.find((e) => !e.active)
          if (slot) {
            const speed = 0.8 + Math.max(K_max, 0) * 0.55
            const angle = (Math.random() - 0.5) * 0.9
            const elev = (Math.random() - 0.5) * 0.5
            slot.active = true
            slot.age = 0
            slot.pos.set(
              plateX + 0.08,
              (Math.random() - 0.5) * 1.0,
              (Math.random() - 0.5) * 0.7
            )
            slot.vel.set(
              speed * Math.cos(angle),
              speed * Math.sin(elev),
              speed * Math.sin(angle) * 0.4
            )
          }
        }
      }

      for (let i = 0; i < electrons.current.length; i++) {
        const e = electrons.current[i]
        if (e.active) {
          e.age += clampedDt
          e.pos.addScaledVector(e.vel, clampedDt)
          if (e.age > 2.2 || e.pos.x > 4) {
            e.active = false
          }
        }
        if (e.active) {
          dummy.position.copy(e.pos)
          dummy.scale.setScalar(1)
        } else {
          dummy.position.set(0, -99, 0)
          dummy.scale.setScalar(0.001)
        }
        dummy.updateMatrix()
        electronMesh.setMatrixAt(i, dummy.matrix)
      }
      electronMesh.instanceMatrix.needsUpdate = true
    }
  })

  const plateGlow = emitting ? 0.35 + Math.min(0.5, rate * 0.08) : 0.08

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#a3e635" />

      <Grid
        position={[0, -1.6, 0]}
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

      {/* 金属板 */}
      <mesh position={[plateX, 0, 0]}>
        <boxGeometry args={[0.12, 2.2, 1.6]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.85}
          roughness={0.25}
          emissive={emitting ? '#a3e635' : '#334155'}
          emissiveIntensity={plateGlow}
        />
      </mesh>
      {/* 板框 */}
      <mesh position={[plateX, 0, 0]}>
        <boxGeometry args={[0.14, 2.28, 1.68]} />
        <meshBasicMaterial color="#64748b" wireframe transparent opacity={0.4} />
      </mesh>

      {/* 光源侧指示 */}
      <mesh position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#facc15"
          emissiveIntensity={0.5 + intensity * 0.25}
        />
      </mesh>

      {/* 光子脉冲 */}
      <instancedMesh ref={photonsRef} args={[undefined, undefined, PHOTON_COUNT]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial
          color="#fde047"
          emissive="#facc15"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </instancedMesh>

      {/* 电子 */}
      <instancedMesh ref={electronsRef} args={[undefined, undefined, ELECTRON_COUNT]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial
          color="#a3e635"
          emissive="#65a30d"
          emissiveIntensity={0.7}
          metalness={0.2}
          roughness={0.3}
        />
      </instancedMesh>

      <OrbitControls maxDistance={16} minDistance={2} maxPolarAngle={Math.PI / 2.05} />
    </group>
  )
}
