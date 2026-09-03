import { useEffect, useState } from 'react'
import katex from 'katex'
import { useHeroStore, PHYSICISTS } from '@/store/heroStore'

/**
 * Hero 2D HUD overlay
 * - 左下：物理学家信息（姓名 / 年代 / 贡献）
 * - 右侧：公式瀑布（3 个公式，stagger 出现）
 * - 顶部：进度条（5s 周期）
 */
export default function HeroOverlay() {
  const currentIdx = useHeroStore((s) => s.currentIdx)
  const phase = useHeroStore((s) => s.phase)
  const physicist = PHYSICISTS[currentIdx]

  return (
    <>
      {/* 顶部进度条 */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-[var(--color-border)]">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${phase * 100}%`,
            background: `linear-gradient(to right, ${physicist.color}, ${physicist.color}88)`,
            boxShadow: `0 0 10px ${physicist.color}`,
          }}
        />
      </div>

      {/* 物理学家信息 - 左下 */}
      <div className="absolute bottom-12 left-8 z-20 max-w-md pointer-events-none">
        <div
          key={currentIdx}
          className="hero-info-animate"
          style={{ '--accent': physicist.color } as React.CSSProperties}
        >
          <div
            className="inline-block text-[10px] tracking-[0.2em] uppercase mb-2 px-2 py-0.5 rounded border"
            style={{
              color: physicist.color,
              borderColor: `${physicist.color}66`,
              background: `${physicist.color}11`,
            }}
          >
            {physicist.years}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-1 tracking-tight drop-shadow-2xl">
            {physicist.name}
          </h2>
          <p className="text-sm text-[var(--color-text-2)] mb-3 italic">
            {physicist.nameEn}
          </p>
          <p className="text-sm text-[var(--color-text-1)] leading-relaxed">
            {physicist.role}
          </p>
        </div>
      </div>

      {/* 公式瀑布 - 右侧 */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20 w-72 hidden lg:block">
        <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-3)] mb-3">
          ── 核心公式
        </div>
        <div className="space-y-2.5">
          {physicist.formulas.map((f, i) => (
            <FormulaCard
              key={`${currentIdx}-${i}`}
              index={i}
              name={f.name}
              latex={f.latex}
              color={physicist.color}
              phase={phase}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroInfoIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-info-animate {
          animation: heroInfoIn 0.6s ease-out;
        }
      `}</style>
    </>
  )
}

function FormulaCard({
  index,
  name,
  latex,
  color,
  phase,
}: {
  index: number
  name: string
  latex: string
  color: string
  phase: number
}) {
  // Formula 出现时机：phase > 0.15 + i*0.1，淡出 phase > 0.85
  const appearAt = 0.15 + index * 0.1
  const disappearAt = 0.85
  const opacity = Math.min(1, Math.max(0, (phase - appearAt) / 0.1)) *
    Math.min(1, (disappearAt - phase) / 0.1)

  const [rendered, setRendered] = useState('')
  useEffect(() => {
    try {
      setRendered(katex.renderToString(latex, { throwOnError: false, displayMode: false }))
    } catch (e) {
      setRendered(latex)
    }
  }, [latex])

  return (
    <div
      className="glass p-3 transition-all"
      style={{
        opacity,
        transform: `translateX(${(1 - opacity) * 30}px)`,
        borderColor: opacity > 0.5 ? `${color}66` : undefined,
        boxShadow: opacity > 0.5 ? `0 0 24px ${color}22` : undefined,
      }}
    >
      <div className="text-[10px] text-[var(--color-text-3)] uppercase tracking-wider mb-1">
        {name}
      </div>
      <div
        className="text-base font-medium"
        style={{ color }}
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </div>
  )
}
