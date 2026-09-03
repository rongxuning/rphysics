import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroStore } from '@/store/heroStore'

/**
 * 伽利略 · 比萨斜塔 + 双球自由落体
 * 关键：两球同时落地，演示重力加速度与质量无关
 */
const TOWER_HEIGHT = 6
const BALL_START_Y = TOWER_HEIGHT + 0.5
const FALL_DURATION = 0.35 // phase 比例 ≈ 1.75s
const HOLD_DURATION = 0.1
const FADE_DURATION = 0.15

export default function GalileoScene() {
  const phase = useHeroStore((s) => s.phase)
  const largeBallRef = useRef<THREE.Mesh>(null!)
  const smallBallRef = useRef<THREE.Mesh>(null!)
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 0))

  // 计算球的位置（基于 phase）
  const ballY = useMemo(() => {
    if (phase < HOLD_DURATION) return BALL_START_Y
    if (phase < HOLD_DURATION + FALL_DURATION) {
      const t = (phase - HOLD_DURATION) / FALL_DURATION // 0-1
      // h = ½gt², t 从 0 加速到 1
      const fallDistance = BALL_START_Y - 0.15 // 落到地面
      const y = BALL_START_Y - fallDistance * t * t
      return y
    }
    return 0.15
  }, [phase])

  // 落地时的反弹（用 phase 0.4-0.45 模拟一次小弹跳）
  const bounceOffset = useMemo(() => {
    const bounceStart = HOLD_DURATION + FALL_DURATION // 0.45
    const bounceEnd = bounceStart + 0.1
    if (phase < bounceStart || phase > bounceEnd) return 0
    const t = (phase - bounceStart) / (bounceEnd - bounceStart) // 0-1
    return Math.sin(t * Math.PI) * 0.3
  }, [phase])

  // 整体淡入淡出
  const opacity = useMemo(() => {
    if (phase < 0.05) return phase / 0.05
    if (phase > 1 - FADE_DURATION) return (1 - phase) / FADE_DURATION
    return 1
  }, [phase])

  // 摄像机缓慢 dolly
  useFrame(({ camera }, dt) => {
    const dollyPhase = Math.min(1, phase * 1.2) // 0-1
    const targetZ = 9 - dollyPhase * 1.5
    camera.position.z += (targetZ - camera.position.z) * dt * 1.5
    camera.lookAt(cameraTargetRef.current)
  })

  return (
    <group>
      {/* 地面 - 草地 + 路径 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a2410" roughness={0.9} metalness={0} />
      </mesh>

      {/* 比萨斜塔 - 略微倾斜 */}
      <group rotation={[0, 0, 0.08]} position={[-1, 0, 0]}>
        <Tower />
      </group>

      {/* 远景剪影（托斯卡纳丘陵感） */}
      <Hills />

      {/* 大球 (铁球，重) */}
      <mesh
        ref={largeBallRef}
        position={[0.5, ballY + bounceOffset, 1.5]}
        castShadow
      >
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.85}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 小球 (木球，轻) */}
      <mesh
        ref={smallBallRef}
        position={[0.5, ballY + bounceOffset, 2.2]}
        castShadow
      >
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color="#8b6f47"
          metalness={0.1}
          roughness={0.7}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 阴影圆（落地时可见） */}
      {phase > HOLD_DURATION + FALL_DURATION * 0.9 && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.01, 1.5]}>
            <circleGeometry args={[0.4, 32]} />
            <meshBasicMaterial color="#000" transparent opacity={0.4 * opacity} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.01, 2.2]}>
            <circleGeometry args={[0.22, 32]} />
            <meshBasicMaterial color="#000" transparent opacity={0.4 * opacity} />
          </mesh>
        </>
      )}
    </group>
  )
}

function Tower() {
  // 塔身由多个圆柱段组成
  const sections = 7
  const sectionHeight = TOWER_HEIGHT / sections
  const radius = 0.9

  return (
    <group>
      {/* 基座 */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.3, 16]} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.85} />
      </mesh>
      {/* 主体段 */}
      {Array.from({ length: sections }).map((_, i) => {
        const y = 0.3 + i * sectionHeight + sectionHeight / 2
        return (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow>
              <cylinderGeometry
                args={[radius - i * 0.02, radius - (i - 1) * 0.02, sectionHeight, 16]}
              />
              <meshStandardMaterial color="#e8d9b8" roughness={0.85} />
            </mesh>
            {/* 拱门装饰 */}
            {i > 0 && (
              <mesh position={[radius * 0.9, y, 0]} castShadow>
                <boxGeometry args={[0.15, sectionHeight * 0.6, 0.15]} />
                <meshStandardMaterial color="#3a2818" roughness={0.9} />
              </mesh>
            )}
          </group>
        )
      })}
      {/* 顶部钟楼 */}
      <mesh position={[0, TOWER_HEIGHT + 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.6, 12]} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.8} />
      </mesh>
      {/* 塔尖 */}
      <mesh position={[0, TOWER_HEIGHT + 0.9, 0]} castShadow>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Hills() {
  // 远景剪影
  return (
    <group position={[0, 0, -10]}>
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={i} position={[x, 1 + (i % 2) * 0.3, 0]}>
          <sphereGeometry args={[2 + Math.random() * 0.5, 16, 16]} />
          <meshStandardMaterial color="#0f1a0a" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}
