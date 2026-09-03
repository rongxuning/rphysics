import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroStore } from '@/store/heroStore'

/**
 * 焦耳 · 搅拌 + 温度计
 * 关键：机械功转化为热能，水温升高
 */
export default function JouleScene() {
  const phase = useHeroStore((s) => s.phase)
  const paddleRef = useRef<THREE.Group>(null!)
  const mercuryRef = useRef<THREE.Mesh>(null!)

  // 搅拌器旋转
  useFrame((_, dt) => {
    if (paddleRef.current) {
      paddleRef.current.rotation.y += dt * 8 // 持续旋转
    }
  })

  // 温度上升（红色发光增强）
  const heatIntensity = useMemo(() => {
    return Math.min(1, phase * 1.2)
  }, [phase])

  // 水银柱高度
  const mercuryScale = useMemo(() => 0.3 + heatIntensity * 0.7, [heatIntensity])

  const opacity = useMemo(() => {
    if (phase < 0.05) return phase / 0.05
    if (phase > 0.9) return (1 - phase) / 0.1
    return 1
  }, [phase])

  useFrame(({ camera }) => {
    camera.position.set(0, 3, 8)
    camera.lookAt(0, 1, 0)
  })

  return (
    <group>
      {/* 地面 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2a2018" roughness={0.95} />
      </mesh>

      {/* 实验台 */}
      <mesh receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 1, 3]} />
        <meshStandardMaterial color="#5a4530" roughness={0.8} />
      </mesh>

      {/* 绝热容器 */}
      <group position={[-1.5, 1.05, 0]}>
        {/* 外壁 */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.9, 1.2, 24]} />
          <meshStandardMaterial color="#8a7560" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* 水（颜色随温度变化） */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.9, 24]} />
          <meshStandardMaterial
            color={new THREE.Color().lerpColors(
              new THREE.Color('#3b82f6'),
              new THREE.Color('#ef4444'),
              heatIntensity
            )}
            transparent
            opacity={0.7}
            emissive={new THREE.Color().lerpColors(
              new THREE.Color('#1e40af'),
              new THREE.Color('#b91c1c'),
              heatIntensity
            )}
            emissiveIntensity={heatIntensity * 0.3}
          />
        </mesh>

        {/* 搅拌器 */}
        <group ref={paddleRef} position={[0, 0.1, 0]}>
          {/* 主轴 */}
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* 桨叶 */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i / 4) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.4, -0.2, Math.sin(angle) * 0.4]}
                rotation={[0, angle, 0]}
                castShadow
              >
                <boxGeometry args={[0.6, 0.05, 0.15]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
              </mesh>
            )
          })}
        </group>

        {/* 顶部滑轮 */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <torusGeometry args={[0.2, 0.05, 8, 16]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 温度计 */}
      <group position={[2, 1.5, 0]}>
        {/* 底座 */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* 玻璃管 */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
        {/* 水银柱 */}
        <mesh ref={mercuryRef} position={[0, -0.4 + mercuryScale * 0.4, 0]} scale={[1, mercuryScale, 1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        {/* 顶部 */}
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* 蒸汽（高温时） */}
      {heatIntensity > 0.5 && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                -1.5 + Math.sin(phase * 10 + i) * 0.3,
                1.7 + ((phase * 5 + i * 0.3) % 1.5),
                Math.cos(phase * 10 + i) * 0.3,
              ]}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.3 * heatIntensity} />
            </mesh>
          ))}
        </>
      )}

      {/* 背景齿轮（工业革命感） */}
      {[-5, 5].map((x, i) => (
        <group key={i} position={[x, 3, -5]}>
          <mesh rotation={[0, 0, phase * 2 * (i === 0 ? 1 : -1)]}>
            <torusGeometry args={[0.8, 0.1, 8, 12]} />
            <meshStandardMaterial color="#4a3a2a" metalness={0.7} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
