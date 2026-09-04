import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls, Text } from '@react-three/drei'
import ForceArrow from '@/components/Shell/ForceArrow'
import type { SceneState } from '../types'

/**
 * 斜面拉力 + 摩擦 · 3D 场景
 *
 * 特性：
 * - 无限延伸的水平面（200m 长 + 摄像机跟随）
 * - x 轴线 + 刻度 + 标签
 * - 4 个力箭头：F（红，斜上）/ mg（灰，下）/ N（蓝，上）/ f（橙，水平反向）
 * - F 力的分解：F·cosθ（水平虚线）+ F·sinθ（垂直虚线）
 * - 速度箭头（绿）
 * - 运动轨迹
 * - 文字标签（drei Text）
 */
export default function PullFrictionScene3D({
  state,
  params,
}: {
  state: SceneState
  params: Record<string, number>
}) {
  const movingGroupRef = useRef<THREE.Group>(null!)
  const orbitRef = useRef<any>(null)

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

  // 物块大小
  const blockSize = 0.5 + Math.min(m, 20) * 0.04
  const blockCenterY = -0.5 + blockSize / 2

  // 同步物块位置 + 摄像机跟随
  useFrame(({ camera }, dt) => {
    if (movingGroupRef.current) {
      movingGroupRef.current.position.x = state.x
    }
    // 摄像机目标跟随物块（但不强制位置，让用户可以自由旋转）
    if (orbitRef.current) {
      const target = orbitRef.current.target
      const newX = state.x
      target.x += (newX - target.x) * dt * 3 // 平滑跟随
      orbitRef.current.update()
    }
  })

  const isMoving = state.v > 0.01
  const isBlocked = !isMoving && Fx <= fs_max + 0.05
  const isLifted = N <= 0
  const isUniform = isMoving && Math.abs(state.a) < 0.05
  const frictionDir: [number, number, number] = isMoving ? [-1, 0, 0] : [1, 0, 0]
  const frictionMag = isMoving ? fk : (isBlocked ? Fx : fk)

  const statusColor = isLifted
    ? '#a855f7'
    : isBlocked
    ? '#ef4444'
    : isUniform
    ? '#22c55e'
    : '#60a5fa'

  // F 分解箭头长度（基于力的 scale）
  const F_SCALE = 0.03
  const Fx_len = Fx * F_SCALE
  const Fy_len = Fy * F_SCALE

  return (
    <group>
      {/* 灯光 */}
      <ambientLight intensity={0.55} />
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

      <fog attach="fog" args={['#0a0e1a', 20, 60]} />

      {/* 地面 - 超长（200m）保证物体运动时不走出边界 */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[200, 30]} />
        <meshStandardMaterial color="#1a2030" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* 网格 - 跟随物块位置（视觉上无限延伸） */}
      <Grid
        position={[0, -0.49, 0]}
        args={[40, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#3b4a5a"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#5a6a7a"
        fadeDistance={30}
        fadeStrength={1.5}
        infiniteGrid
        followCamera={false}
      />

      {/* 坐标轴指示器（世界原点） */}
      <AxesIndicator position={[-6, -0.45, -5]} />

      {/* x 轴线 + 刻度 + 标签 - 始终从物块当前位置开始向前延伸 */}
      <XAxis x={state.x} />

      {/* 运动轨迹 */}
      <Trajectory x={state.x} />

      {/* 物块 + 力箭头 - 在 movingGroup 内随物块移动 */}
      <group ref={movingGroupRef} position={[0, 0, 0]}>
        {/* 物块 */}
        <mesh position={[0, blockCenterY, 0]} castShadow receiveShadow>
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
          origin={[0, blockCenterY, 0]}
          direction={[Math.cos(theta), Math.sin(theta), 0]}
          magnitude={F}
          color="#ef4444"
          scale={F_SCALE}
          minLength={0.3}
          maxLength={3}
        />
        {/* F 标签 */}
        {F > 0 && (
          <Text
            position={[
              Math.cos(theta) * Fx_len + 0.25,
              blockCenterY + Math.sin(theta) * Fy_len + 0.25,
              0,
            ]}
            fontSize={0.25}
            color="#ef4444"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            F = {F.toFixed(0)} N
          </Text>
        )}

        {/* F 的水平分量 F_x = F·cosθ (虚线红) */}
        {F > 0 && Fx > 0.1 && (
          <>
            <DashedArrow
              start={[0, blockCenterY, 0]}
              end={[Fx_len, blockCenterY, 0]}
              color="#fb7185"
              thickness={0.025}
            />
            <Text
              position={[Fx_len / 2, blockCenterY + 0.2, 0]}
              fontSize={0.18}
              color="#fb7185"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.015}
              outlineColor="#000000"
            >
              F·cosθ = {Fx.toFixed(1)} N
            </Text>
          </>
        )}

        {/* F 的竖直分量 F_y = F·sinθ (虚线红) */}
        {F > 0 && Fy > 0.1 && (
          <>
            <DashedArrow
              start={[0, blockCenterY, 0]}
              end={[0, blockCenterY + Fy_len, 0]}
              color="#fb7185"
              thickness={0.025}
            />
            <Text
              position={[-0.25, blockCenterY + Fy_len / 2, 0]}
              fontSize={0.18}
              color="#fb7185"
              anchorX="right"
              anchorY="middle"
              outlineWidth={0.015}
              outlineColor="#000000"
            >
              F·sinθ = {Fy.toFixed(1)} N
            </Text>
          </>
        )}

        {/* 补全矩形 (虚线淡红) - 显示 F = F_x + F_y 的几何关系 */}
        {F > 0 && Fx > 0.1 && Fy > 0.1 && (
          <>
            <DashedLine
              start={[Fx_len, blockCenterY, 0]}
              end={[Fx_len, blockCenterY + Fy_len, 0]}
              color="#7f1d1d"
              opacity={0.5}
            />
            <DashedLine
              start={[0, blockCenterY + Fy_len, 0]}
              end={[Fx_len, blockCenterY + Fy_len, 0]}
              color="#7f1d1d"
              opacity={0.5}
            />
          </>
        )}

        {/* 重力 mg（灰色，下） */}
        <ForceArrow
          origin={[0, blockCenterY, 0]}
          direction={[0, -1, 0]}
          magnitude={mg}
          color="#94a3b8"
          scale={F_SCALE}
          minLength={0.5}
          maxLength={3}
        />
        <Text
          position={[0.3, blockCenterY - mg * F_SCALE - 0.15, 0]}
          fontSize={0.18}
          color="#94a3b8"
          anchorX="left"
          anchorY="top"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          mg = {mg.toFixed(1)} N
        </Text>

        {/* 正压力 N（蓝色，上） - 仅在地面上 */}
        {!isLifted && (
          <>
            <ForceArrow
              origin={[0, blockCenterY, 0]}
              direction={[0, 1, 0]}
              magnitude={N}
              color="#3b82f6"
              scale={F_SCALE}
              minLength={0.3}
              maxLength={3}
            />
            <Text
              position={[0.3, blockCenterY + N * F_SCALE + 0.15, 0]}
              fontSize={0.18}
              color="#3b82f6"
              anchorX="left"
              anchorY="bottom"
              outlineWidth={0.015}
              outlineColor="#000000"
            >
              N = {N.toFixed(1)} N
            </Text>
          </>
        )}

        {/* 摩擦力 f（橙色，水平反向） - 仅在地面上 */}
        {!isLifted && (
          <>
            <ForceArrow
              origin={[0, -0.5, 0]}
              direction={frictionDir}
              magnitude={frictionMag}
              color="#f97316"
              scale={F_SCALE}
              minLength={0.2}
              maxLength={2}
            />
            <Text
              position={[-frictionMag * F_SCALE * 0.5 * frictionDir[0], -0.5 + 0.3, 0]}
              fontSize={0.18}
              color="#f97316"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.015}
              outlineColor="#000000"
            >
              f = {frictionMag.toFixed(1)} N
            </Text>
          </>
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
        {state.v > 0.1 && (
          <Text
            position={[state.v * 0.4 + 0.3, -0.3, 0]}
            fontSize={0.2}
            color="#22c55e"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            v = {state.v.toFixed(2)} m/s
          </Text>
        )}

        {/* 角度 θ 弧线指示器 */}
        {F > 0 && !isLifted && <AngleArc theta={theta} />}
      </group>

      {/* 摄像机控制 - 跟随物块 */}
      <OrbitControls
        ref={orbitRef}
        target={[state.x, 0, 0]}
        maxDistance={25}
        minDistance={3}
        maxPolarAngle={Math.PI / 2.1}
      />
    </group>
  )
}

// ============================================================================
// X 轴线 + 刻度 + 标签
// ============================================================================

function XAxis({ x }: { x: number }) {
  // x 轴从物块当前 x 位置向前延伸 30m，向后延伸 10m
  const startX = Math.max(0, x - 10)
  const endX = x + 30

  // 主轴线
  const points = useMemo(() => {
    return [new THREE.Vector3(startX, -0.48, 0), new THREE.Vector3(endX, -0.48, 0)]
  }, [startX, endX])

  const lineGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  // 刻度（每 2m 一个短刻度，每 10m 一个长刻度 + 标签）
  const ticks = useMemo(() => {
    const arr: { x: number; major: boolean; label?: string }[] = []
    const firstMajor = Math.ceil(startX / 10) * 10
    for (let xi = Math.floor(startX / 2) * 2; xi <= endX; xi += 2) {
      const major = xi % 10 === 0
      arr.push({ x: xi, major, label: major ? `${xi}` : undefined })
    }
    return arr
  }, [startX, endX])

  return (
    <group>
      {/* 主轴线 */}
      <line>
        <primitive object={lineGeom} attach="geometry" />
        <lineBasicMaterial color="#22c55e" linewidth={2} />
      </line>

      {/* 刻度 */}
      {ticks.map((t, i) => (
        <mesh key={i} position={[t.x, -0.47, 0]}>
          <boxGeometry args={[0.04, 0.01, t.major ? 0.3 : 0.15]} />
          <meshStandardMaterial
            color={t.major ? '#22c55e' : '#16a34a'}
            emissive="#22c55e"
            emissiveIntensity={t.major ? 0.5 : 0.2}
          />
        </mesh>
      ))}

      {/* 标签（每 10m） */}
      {ticks
        .filter((t) => t.label)
        .map((t, i) => (
          <Text
            key={`label-${i}`}
            position={[t.x, -0.45, 0.4]}
            fontSize={0.25}
            color="#22c55e"
            anchorX="center"
            anchorY="top"
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {t.label}
          </Text>
        ))}

      {/* 轴端箭头 */}
      <mesh position={[endX, -0.48, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
      </mesh>

      {/* x 轴标签 */}
      <Text
        position={[endX + 0.3, -0.48, 0]}
        fontSize={0.35}
        color="#22c55e"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#000000"
      >
        x
      </Text>
    </group>
  )
}

// ============================================================================
// 运动轨迹
// ============================================================================

function Trajectory({ x }: { x: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 30; i++) {
      const xi = (i / 30) * x
      points.push(new THREE.Vector3(xi, -0.485, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [x])

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#4ade80" transparent opacity={0.5} />
    </line>
  )
}

// ============================================================================
// 角度 θ 弧线
// ============================================================================

function AngleArc({ theta }: { theta: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const r = 0.5
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

// ============================================================================
// 虚线箭头（用于力分解）
// ============================================================================

function DashedArrow({
  start,
  end,
  color,
  thickness = 0.03,
}: {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  thickness?: number
}) {
  const ref = useRef<THREE.Line>(null!)

  const { lineGeom, quat, pos, length } = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const dir = e.clone().sub(s)
    const len = dir.length()
    dir.normalize()
    const center = s.clone().add(e).multiplyScalar(0.5)
    const up = new THREE.Vector3(0, 1, 0)
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir)
    return { lineGeom: null, quat: q, pos: center, length: len }
  }, [start, end])

  // 用 LineDashedMaterial 需要 computeLineDistances
  const lineRef = useRef<any>(null)
  useFrame(() => {
    if (lineRef.current && !lineRef.current.geometry.attributes.lineDistance) {
      lineRef.current.computeLineDistances()
    }
  })

  return (
    <group>
      {/* 杆 - 虚线 */}
      <line ref={lineRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                start[0], start[1], start[2],
                end[0], end[1], end[2],
              ]),
              3,
            ]}
            count={2}
          />
        </bufferGeometry>
        <lineDashedMaterial
          color={color}
          dashSize={0.08}
          gapSize={0.06}
          linewidth={thickness}
        />
      </line>
      {/* 头 - 小锥 */}
      <mesh position={end} quaternion={quat}>
        <coneGeometry args={[thickness * 2.5, length * 0.18, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  )
}

function DashedLine({
  start,
  end,
  color,
  opacity = 1,
}: {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  opacity?: number
}) {
  const lineRef = useRef<any>(null)
  useFrame(() => {
    if (lineRef.current && !lineRef.current.geometry.attributes.lineDistance) {
      lineRef.current.computeLineDistances()
    }
  })

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            new Float32Array([
              start[0], start[1], start[2],
              end[0], end[1], end[2],
            ]),
            3,
          ]}
          count={2}
        />
      </bufferGeometry>
      <lineDashedMaterial
        color={color}
        dashSize={0.1}
        gapSize={0.08}
        transparent
        opacity={opacity}
      />
    </line>
  )
}

// ============================================================================
// 坐标轴指示器
// ============================================================================

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
