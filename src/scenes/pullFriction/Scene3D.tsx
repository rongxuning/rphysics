import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls } from '@react-three/drei'
import ForceArrow from '@/components/Shell/ForceArrow'
import type { SceneState } from '../types'

/**
 * 斜面拉力 + 摩擦 · 3D 场景
 * - 地面（带网格）
 * - 物块（box，沿 x 方向位移）
 * - 4 个力箭头：F（红，斜上）/ mg（灰，下）/ N（蓝，上）/ f（橙，水平反向）
 * - 速度箭头（绿，沿运动方向）
 * - 运动轨迹（trail）
 */
export default function PullFrictionScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const movingGroupRef = useRef<THREE.Group>(null!)

  const F = params.F ?? 0
  const theta = ((params.theta ?? 0) * Math.PI) / 180
  const m = params.m ?? 1
  const g = params.g ?? 9.8
  const mu_s = params.mu_s ?? 0
  const mu_k = params.mu_k ?? 0

  const Fx = F * Math.cos(theta)
  const Fy = F * Math.sin(theta)
  const N = m * g - Fy
  const mg = m * g
  const fk = mu_k * Math.max(0, N)
  const fs_max = mu_s * Math.max(0, N)

  // 物块大小（质量相关）
  const blockSize = 0.5 + Math.min(m, 20) * 0.04

  // 同步位置
  useFrame(() => {
    if (movingGroupRef.current) {
      movingGroupRef.current.position.x = state.x
    }
  })

  // 摩擦力方向 + 大小
  const isMoving = state.v > 0.01
  const isBlocked = !isMoving && Fx <= fs_max + 0.05
  const isLifted = N <= 0
  const isUniform = isMoving && Math.abs(state.a) < 0.05
  const frictionDir: [number, number, number] = isMoving ? [-1, 0, 0] : [1, 0, 0]
  const frictionMag = isMoving ? fk : (isBlocked ? Fx : fk)

  // 状态颜色
  const statusColor = isLifted
    ? '#a855f7'
    : isBlocked
    ? '#ef4444'
    : isUniform
    ? '#22c55e'
    : '#60a5fa'

  return (
    <group>
      {/* 灯光 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 4, -3]} intensity={0.4} color="#88aaff" />

      {/* 背景雾 */}
      <fog attach="fog" args={['#0a0e1a', 15, 40]} />

      {/* 地面 */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[50, 30]} />
        <meshStandardMaterial color="#1a2030" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* 网格 */}
      <Grid
        position={[0, -0.49, 0]}
        args={[50, 30]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#3b4a5a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#5a6a7a"
        fadeDistance={20}
        fadeStrength={1.5}
        infiniteGrid={false}
      />

      {/* 坐标轴指示器（世界原点） */}
      <AxesIndicator position={[-8, -0.45, -5]} />

      {/* 运动轨迹 - 不在 movingGroup 内（保持原点） */}
      <Trajectory x={state.x} />

      {/* 物块 + 力箭头 - 全部在 movingGroup 内，随 state.x 移动 */}
      <group ref={movingGroupRef} position={[0, 0, 0]}>
        {/* 物块 */}
        <mesh position={[0, -0.5 + blockSize / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[blockSize, blockSize, blockSize]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.6}
            roughness={0.3}
            emissive={statusColor}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* 拉力 F（红色，斜上） */}
        <ForceArrow
          origin={[0, -0.5 + blockSize / 2, 0]}
          direction={[Math.cos(theta), Math.sin(theta), 0]}
          magnitude={F}
          color="#ef4444"
          scale={0.03}
          minLength={0.3}
          maxLength={3}
        />

        {/* 重力 mg（灰色，下） */}
        <ForceArrow
          origin={[0, -0.5 + blockSize / 2, 0]}
          direction={[0, -1, 0]}
          magnitude={mg}
          color="#94a3b8"
          scale={0.03}
          minLength={0.5}
          maxLength={3}
        />

        {/* 正压力 N（蓝色，上） - 仅在地面上 */}
        {!isLifted && (
          <ForceArrow
            origin={[0, -0.5 + blockSize / 2, 0]}
            direction={[0, 1, 0]}
            magnitude={N}
            color="#3b82f6"
            scale={0.03}
            minLength={0.3}
            maxLength={3}
          />
        )}

        {/* 摩擦力 f（橙色，水平反向） - 仅在地面上 */}
        {!isLifted && (
          <ForceArrow
            origin={[0, -0.5, 0]}
            direction={frictionDir}
            magnitude={frictionMag}
            color="#f97316"
            scale={0.03}
            minLength={0.2}
            maxLength={2}
          />
        )}

        {/* 速度箭头 v（绿色） */}
        {state.v > 0.1 && (
          <ForceArrow
            origin={[0, -0.3, 0]}
            direction={[1, 0, 0]}
            magnitude={state.v}
            color="#22c55e"
            scale={0.4}
            minLength={0.3}
            maxLength={1.5}
            thickness={0.03}
          />
        )}

        {/* 角度 θ 弧线指示器 */}
        {F > 0 && !isLifted && <AngleArc theta={theta} />}
      </group>

      {/* 摄像机控制 - 跟随物块 */}
      <OrbitControls
        target={[state.x, 0, 0]}
        maxDistance={20}
        minDistance={3}
        maxPolarAngle={Math.PI / 2.1}
      />
    </group>
  )
}

function Trajectory({ x }: { x: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 30; i++) {
      const xi = (i / 30) * x
      points.push(new THREE.Vector3(xi, -0.48, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [x])

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#4ade80" transparent opacity={0.4} />
    </line>
  )
}

function AngleArc({ theta }: { theta: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const r = 0.6
    for (let i = 0; i <= 20; i++) {
      const t = (i / 20) * theta
      points.push(new THREE.Vector3(r * Math.cos(t), -0.5 + r * Math.sin(t), 0))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [theta])

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#fbbf24" linewidth={2} />
    </line>
  )
}

function AxesIndicator({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
