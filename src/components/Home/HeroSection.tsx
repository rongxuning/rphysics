import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useHeroStore, PHYSICISTS } from '@/store/heroStore'
import { useStore } from '@/store/useStore'
import { ambientEngine } from '@/audio/ambient'
import HeroScene from './HeroScene'
import HeroOverlay from './HeroOverlay'
import HeroControls from './HeroControls'
import { ChevronUp } from 'lucide-react'

/**
 * 首页 Hero 区
 * - 6 位物理学家循环 5s/位
 * - 3D 场景 + 后处理
 * - 2D HUD overlay（姓名/年代/公式瀑布）
 * - Ambient 音效同步切换
 */
export default function HeroSection({ onExplore }: { onExplore?: () => void }) {
  const phase = useHeroStore((s) => s.phase)
  const setPhase = useHeroStore((s) => s.setPhase)
  const currentIdx = useHeroStore((s) => s.currentIdx)
  const setCurrentIdx = useHeroStore((s) => s.setCurrentIdx)
  const paused = useHeroStore((s) => s.paused)
  const audioEnabled = useStore((s) => s.audioEnabled)
  const heroRef = useRef<HTMLElement>(null)

  // Master 5s loop
  useEffect(() => {
    if (paused) return
    let raf: number
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const newPhase = phase + dt / 5
      if (newPhase >= 1) {
        setPhase(0)
        setCurrentIdx((currentIdx + 1) % 6)
      } else {
        setPhase(newPhase)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, phase, currentIdx, setPhase, setCurrentIdx])

  // 滚出视口暂停
  useEffect(() => {
    if (!heroRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          useHeroStore.setState({ paused: true })
          ambientEngine.stop()
        } else if (entry.intersectionRatio > 0.5) {
          useHeroStore.setState({ paused: false })
        }
      },
      { threshold: [0.3, 0.5] }
    )
    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  // 同步 ambient 音效
  useEffect(() => {
    if (paused || !audioEnabled) {
      ambientEngine.setEnabled(false)
      return
    }
    ambientEngine.unlock().then(() => {
      const track = PHYSICISTS[currentIdx].id
      ambientEngine.switchTo(track)
      ambientEngine.setEnabled(true)
    })
  }, [currentIdx, paused, audioEnabled])

  return (
    <section ref={heroRef} className="relative h-full min-h-0 overflow-hidden">
      <div className="absolute inset-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 3, 9], fov: 45 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
        >
          <HeroScene />
        </Canvas>
      </div>

      <HeroOverlay />
      <HeroControls />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={onExplore}
          className="glass inline-flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-text-2)] animate-bounce hover:text-[var(--color-text-0)] transition pointer-events-auto"
        >
          <ChevronUp size={14} />
          向上滑动探索更多
          <ChevronUp size={14} />
        </button>
      </div>

      <AudioUnlockHint />
    </section>
  )
}

function AudioUnlockHint() {
  const audioUnlocked = useStore((s) => s.audioUnlocked)
  if (audioUnlocked) return null
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="glass px-3 py-1.5 text-[10px] text-[var(--color-text-2)] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-amber)] animate-pulse" />
        点击页面任意位置启用 ambient 音效
      </div>
    </div>
  )
}
