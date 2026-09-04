import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid, OrbitControls, Text } from '@react-three/drei'
import ForceArrow from '@/components/Shell/ForceArrow'
import type { SceneState } from '../types'

/**
 * 斜面拉力 + 摩擦 · 3D 场景
 *
 * 优化重点：
 * 1. 物块半透明，所有力箭头从中心出发都可见（解决标签/箭头与物块重叠）
 * 2. 完整展示 6 个力：F / F·cosθ / F·sinθ / mg / N / f ·  + 静摩擦 vs 动摩擦状态区分
 * 3. 标签放在箭头外侧 + 描边 + depthTest=false，确保不被遮挡
 * 4. 摄像机跟随物块
 * 5. x 轴线 + 刻度
 * 6. 无限延伸的水平面
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

  // 同步物块位置 + 摄像机跟随（保持视角角度）
  // 关键：target 和 camera 必须同步移动，否则 OrbitControls 会改变观察角度
  useFrame(({ camera }, dt) => {
    if (movingGroupRef.current) {
      movingGroupRef.current.position.x = state.x
    }
    if (orbitRef.current) {
      const target = orbitRef.current.target
      const oldX = target.x
      // 平滑追到物块 x 位置
      target.x += (state.x - target.x) * dt * 3
      const dx = target.x - oldX
      // 相机也平移同样 dx，保持相对视角不变
      camera.position.x += dx
      orbitRef.current.update()
    }
  })

  const isMoving = state.v > 0.01
  const isBlocked = !isMoving && Fx <= fs_max + 0.05
  const isLifted = N <= 0
  const isUniform = isMoving && Math.abs(state.a) < 0.05

  // 摩擦力方向 + 大小
  const frictionDir: [number, number, number] = isMoving ? [-1, 0, 0] : [1, 0, 0]
  // 静止时实际摩擦 = Fx（与拉力平衡），运动时 = fk
  const frictionMag = isMoving ? fk : (isBlocked ? Fx : fk)

  const statusColor = isLifted
    ? '#a855f7'
    : isBlocked
    ? '#ef4444'
    : isUniform
    ? '#22c55e'
    : '#60a5fa'

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

      {/* 地面 - 200m 超长 */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[200, 30]} />
        <meshStandardMaterial color="#1a2030" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* 网格 - 无限延伸 */}
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

      {/* 坐标轴指示器 */}
      <AxesIndicator position={[-6, -0.45, -5]} />

      {/* x 轴线 */}
      <XAxis x={state.x} />

      {/* 运动轨迹 */}
      <Trajectory x={state.x} />

      {/* 物块 + 力箭头 */}
      <group ref={movingGroupRef} position={[0, 0, 0]}>
        {/* 物块 - 半透明，让力箭头可见 */}
        <mesh position={[0, blockCenterY, 0]} castShadow>
          <boxGeometry args={[blockSize, blockSize, blockSize]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.5}
            roughness={0.4}
            emissive={statusColor}
            emissiveIntensity={0.15}
            transparent
            opacity={0.55}
          />
        </mesh>
        {/* 物块边框（更明显） */}
        <mesh position={[0, blockCenterY, 0]}>
          <boxGeometry args={[blockSize * 1.01, blockSize * 1.01, blockSize * 1.01]} />
          <meshBasicMaterial color={statusColor} wireframe transparent opacity={0.5} />
        </mesh>

        {/* ===== 力的分解可视化 ===== */}
        {/* F 总力 - 实际力 (红色) */}
        <ForceArrow
          origin={[0, blockCenterY, 0]}
          direction={[Math.cos(theta), Math.sin(theta), 0]}
          magnitude={F}
          color="#ef4444"
          scale={F_SCALE}
          minLength={0.3}
          maxLength={2.0}
        />
        {/* F 标签 - 在箭头前方（沿 F 方向继续延伸一点） */}
        {F > 0 && (
          <Label
            position={[
              Math.cos(theta) * (Fx_len + 0.25),
              blockCenterY + Math.sin(theta) * (Fy_len + 0.25),
              0,
            ]}
            color="#ef4444"
            text={`F = ${F.toFixed(0)} N`}
            anchorX={Math.cos(theta) > 0 ? 'left' : 'right'}
            anchorY={Math.sin(theta) > 0 ? 'bottom' : 'top'}
          />
        )}

        {/* F·cosθ 水平分量 - 分解力 (蓝色) */}
        {F > 0 && Fx > 0.1 && (
          <>
            <DashedArrow
              start={[0, blockCenterY, 0]}
              end={[Fx_len, blockCenterY, 0]}
              color="#3b82f6"
              thickness={0.025}
            />
            {/* 标签 - 在箭头前方（线的右端外侧） */}
            <Label
              position={[Fx_len + 0.15, blockCenterY, 0]}
              color="#3b82f6"
              text={`F·cosθ = ${Fx.toFixed(1)} N`}
              anchorX="left"
              anchorY="middle"
            />
          </>
        )}

        {/* F·sinθ 竖直分量 - 分解力 (蓝色) */}
        {F > 0 && Fy > 0.1 && (
          <>
            <DashedArrow
              start={[0, blockCenterY, 0]}
              end={[0, blockCenterY + Fy_len, 0]}
              color="#3b82f6"
              thickness={0.025}
            />
            {/* 标签 - 在箭头前方（线的顶端外侧） */}
            <Label
              position={[0, blockCenterY + Fy_len + 0.15, 0]}
              color="#3b82f6"
              text={`F·sinθ = ${Fy.toFixed(1)} N`}
              anchorX="center"
              anchorY="bottom"
            />
          </>
        )}

        {/* 补全矩形 (虚线蓝) - 几何关系 */}
        {F > 0 && Fx > 0.1 && Fy > 0.1 && (
          <>
            <DashedLine
              start={[Fx_len, blockCenterY, 0]}
              end={[Fx_len, blockCenterY + Fy_len, 0]}
              color="#1e3a8a"
              opacity={0.5}
            />
            <DashedLine
              start={[0, blockCenterY + Fy_len, 0]}
              end={[Fx_len, blockCenterY + Fy_len, 0]}
              color="#1e3a8a"
              opacity={0.5}
            />
          </>
        )}

        {/* ===== 重力 mg - 实际力 (红色) ===== */}
        <ForceArrow
          origin={[0, blockCenterY, 0]}
          direction={[0, -1, 0]}
          magnitude={mg}
          color="#ef4444"
          scale={F_SCALE}
          minLength={0.4}
          maxLength={0.5}
        />
        {/* mg 标签 - 物块左上角，永远在地面以上 */}
        <Label
          position={[-blockSize / 2 - 0.15, blockCenterY + 0.1, 0]}
          color="#ef4444"
          text={`mg = ${mg.toFixed(0)} N`}
          anchorX="right"
        />

        {/* ===== 正压力 N - 实际力 (红色) - 仅在地面 ===== */}
        {!isLifted && (
          <>
            <ForceArrow
              origin={[0, blockCenterY, 0]}
              direction={[0, 1, 0]}
              magnitude={N}
              color="#ef4444"
              scale={F_SCALE}
              minLength={0.3}
              maxLength={1.5}
            />
            {/* N 标签 - 箭头前方（线顶端外侧） */}
            <Label
              position={[0, blockCenterY + Math.min(N, 50) * F_SCALE + 0.2, 0]}
              color="#ef4444"
              text={`N = ${N.toFixed(1)} N`}
              anchorX="center"
              anchorY="bottom"
            />
          </>
        )}

        {/* ===== 摩擦力 f - 实际力 (红色) ===== */}
        {!isLifted && (
          <>
            <ForceArrow
              origin={[0, blockCenterY, 0]}
              direction={frictionDir}
              magnitude={frictionMag}
              color="#ef4444"
              scale={F_SCALE}
              minLength={0.3}
              maxLength={1.2}
            />
            {/* f 标签 - 箭头前方（线端点外侧） */}
            <Label
              position={[
                frictionDir[0] * (frictionMag * F_SCALE + 0.2),
                blockCenterY,
                0,
              ]}
              color="#ef4444"
              text={`f = ${frictionMag.toFixed(1)} N`}
              anchorX={frictionDir[0] < 0 ? 'right' : 'left'}
              anchorY="middle"
            />
          </>
        )}

        {/* ===== 速度箭头 v（绿）===== */}
        {state.v > 0.1 && (
          <>
            <ForceArrow
              origin={[0, blockCenterY, 0]}
              direction={[1, 0, 0]}
              magnitude={state.v}
              color="#22c55e"
              scale={0.4}
              minLength={0.3}
              maxLength={1.5}
              thickness={0.03}
            />
            <Label
              position={[state.v * 0.4 + 0.15, blockCenterY, 0]}
              color="#22c55e"
              text={`v = ${state.v.toFixed(2)} m/s`}
              anchorX="left"
              anchorY="middle"
            />
          </>
        )}

        {/* 角度 θ 弧线指示器 */}
        {F > 0 && !isLifted && <AngleArc theta={theta} />}
      </group>

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
// 通用标签组件 - 始终在最上层（不被遮挡）
// ============================================================================

function Label({
  position,
  color,
  text,
  anchorX = 'center',
  anchorY = 'middle',
}: {
  position: [number, number, number]
  color: string
  text: string
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
}) {
  return (
    <Text
      position={position}
      fontSize={0.22}
      color={color}
      anchorX={anchorX}
      anchorY={anchorY}
      outlineWidth={0.025}
      outlineColor="#000000"
      outlineOpacity={0.9}
      renderOrder={999}
      // 关键：让文字始终在场景最上层，不被任何几何体遮挡
      material-depthTest={false}
      material-depthWrite={false}
    >
      {text}
    </Text>
  )
}

// ============================================================================
// X 轴线
// ============================================================================

function XAxis({ x }: { x: number }) {
  const startX = Math.max(0, x - 10)
  const endX = x + 30

  const points = useMemo(() => {
    return [new THREE.Vector3(startX, -0.48, 0), new THREE.Vector3(endX, -0.48, 0)]
  }, [startX, endX])

  const lineGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  const ticks = useMemo(() => {
    const arr: { x: number; major: boolean; label?: string }[] = []
    for (let xi = Math.floor(startX / 2) * 2; xi <= endX; xi += 2) {
      const major = xi % 10 === 0
      arr.push({ x: xi, major, label: major ? `${xi}` : undefined })
    }
    return arr
  }, [startX, endX])

  return (
    <group>
      <line>
        <primitive object={lineGeom} attach="geometry" />
        <lineBasicMaterial color="#22c55e" linewidth={2} />
      </line>

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

      {ticks
        .filter((t) => t.label)
        .map((t, i) => (
          <Text
            key={`label-${i}`}
            position={[t.x, -0.45, 0.4]}
            fontSize={0.22}
            color="#22c55e"
            anchorX="center"
            anchorY="top"
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {t.label}
          </Text>
        ))}

      <mesh position={[endX, -0.48, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
      </mesh>

      <Text
        position={[endX + 0.3, -0.48, 0]}
        fontSize={0.32}
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
// 虚线箭头
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
  const lineRef = useRef<any>(null)
  useFrame(() => {
    if (lineRef.current && !lineRef.current.geometry.attributes.lineDistance) {
      lineRef.current.computeLineDistances()
    }
  })

  const { quat, length } = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const dir = e.clone().sub(s)
    const len = dir.length()
    dir.normalize()
    const up = new THREE.Vector3(0, 1, 0)
    return { quat: new THREE.Quaternion().setFromUnitVectors(up, dir), length: len }
  }, [start, end])

  return (
    <group>
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
