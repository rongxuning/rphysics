import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useHeroStore } from '@/store/heroStore'
import GalileoScene from './physicists/GalileoScene'
import NewtonScene from './physicists/NewtonScene'
import ArchimedesScene from './physicists/ArchimedesScene'
import JouleScene from './physicists/JouleScene'
import MaxwellScene from './physicists/MaxwellScene'
import EinsteinScene from './physicists/EinsteinScene'
import StarsBackground from './physicists/StarsBackground'

/**
 * Hero 主场景：6 位物理学家循环
 * 共享灯光 / 相机 / 后处理 / 星空背景
 */
export default function HeroScene() {
  const currentIdx = useHeroStore((s) => s.currentIdx)
  const { scene } = useThree()

  // 每位物理学家对应一个 3D 组件
  const scenes = [
    GalileoScene,
    NewtonScene,
    ArchimedesScene,
    JouleScene,
    MaxwellScene,
    EinsteinScene,
  ]
  const CurrentScene = scenes[currentIdx]

  return (
    <>
      {/* 灯光 - 3 点照明 + 一点 emissive 氛围 */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#88aaff" />
      <pointLight position={[0, 4, 3]} intensity={0.6} color="#ffaa44" />

      {/* 星空背景 */}
      <StarsBackground />

      {/* 远雾 */}
      <fog attach="fog" args={['#060914', 12, 30]} />

      {/* 当前物理学家场景 */}
      <CurrentScene />

      {/* 后处理 */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.7} />
      </EffectComposer>
    </>
  )
}
