import { useEffect, useState } from 'react'
import type { SimulationEngine } from '@/sim/engine'

/**
 * 实验页顶部状态条
 * 显示当前物理状态判定
 */
export default function StatusBar({ engine }: { engine: SimulationEngine }) {
  const [, setTick] = useState(0)
  useEffect(() => engine.subscribe(() => setTick((n) => n + 1)), [engine])

  const status = engine.scene.detectStatus(engine.state, engine.params)
  const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
    static: { bg: 'bg-[rgba(148,163,184,0.1)]', text: 'text-[var(--color-text-2)]', dot: 'bg-slate-400' },
    blocked: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
    moving: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
    uniform: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    liftoff: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  }
  const c = colorMap[status.type]

  return (
    <div className="mb-3 flex items-center gap-3">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} ${c.text} text-xs font-medium`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
        {status.label}
      </div>
      <div className="text-xs text-[var(--color-text-3)] flex-1 truncate">
        {status.description}
      </div>
    </div>
  )
}
