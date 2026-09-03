import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useHeroStore, PHYSICISTS } from '@/store/heroStore'

/**
 * Hero 控制按钮：暂停/继续/上一位/下一位
 */
export default function HeroControls() {
  const paused = useHeroStore((s) => s.paused)
  const togglePaused = useHeroStore((s) => s.togglePaused)
  const next = useHeroStore((s) => s.next)
  const prev = useHeroStore((s) => s.prev)
  const currentIdx = useHeroStore((s) => s.currentIdx)

  return (
    <div className="absolute bottom-12 right-6 z-20 flex items-center gap-1.5">
      {/* 人物序号指示器 */}
      <div className="flex items-center gap-1 mr-2">
        {PHYSICISTS.map((p, i) => (
          <div
            key={p.id}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{
              background: i === currentIdx ? p.color : 'rgba(148,163,184,0.2)',
              boxShadow: i === currentIdx ? `0 0 8px ${p.color}` : undefined,
              transform: i === currentIdx ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <div className="glass flex items-center gap-0.5 p-1">
        <button
          onClick={prev}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] transition"
          aria-label="上一位"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={togglePaused}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-text-0)] hover:bg-[var(--color-border)] transition"
          aria-label={paused ? '继续' : '暂停'}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          onClick={next}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-text-2)] hover:text-[var(--color-text-0)] hover:bg-[var(--color-border)] transition"
          aria-label="下一位"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
