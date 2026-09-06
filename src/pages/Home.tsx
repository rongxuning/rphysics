import { useCallback, useEffect, useRef } from 'react'
import HeroSection from '@/components/Home/HeroSection'
import SceneGrid from '@/components/Home/SceneGrid'

/**
 * 首页两屏吸附：
 * - 第 1 屏：物理学家 Hero
 * - 第 2 屏：实验目录
 * 滚动松手后落到整屏，不卡在半截
 */
export default function Home() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lockingRef = useRef(false)

  const scrollToCatalog = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ top: el.clientHeight, behavior: 'smooth' })
  }, [])

  // 强化整屏吸附：避免触控板惯性停在两屏之间
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (lockingRef.current) {
        e.preventDefault()
        return
      }
      const page = el.clientHeight
      const y = el.scrollTop
      const catalog = el.querySelector('#scene-catalog') as HTMLElement | null
      const catalogScroll = catalog?.scrollTop ?? 0

      // 在第一屏向下滚 → 吸附到第二屏
      if (y < page * 0.35 && e.deltaY > 20) {
        e.preventDefault()
        lockingRef.current = true
        el.scrollTo({ top: page, behavior: 'smooth' })
        window.setTimeout(() => {
          lockingRef.current = false
        }, 700)
        return
      }

      // 第二屏顶部再向上滚 → 回到第一屏
      if (y > page * 0.65 && e.deltaY < -20 && catalogScroll <= 1) {
        e.preventDefault()
        lockingRef.current = true
        el.scrollTo({ top: 0, behavior: 'smooth' })
        window.setTimeout(() => {
          lockingRef.current = false
        }, 700)
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      ref={scrollerRef}
      className="h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory overscroll-y-contain"
    >
      <section className="h-full min-h-0 snap-start snap-always shrink-0">
        <HeroSection onExplore={scrollToCatalog} />
      </section>
      <section
        id="scene-catalog"
        className="h-full min-h-0 snap-start snap-always shrink-0 overflow-y-auto overscroll-y-contain"
      >
        <SceneGrid />
      </section>
    </div>
  )
}
