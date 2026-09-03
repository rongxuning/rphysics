import { useEffect, useState } from 'react'
import type { SimulationEngine } from '@/sim/engine'

/**
 * 实时数据面板
 * 订阅 engine state 变化，每帧更新
 */
export default function LiveData({ engine }: { engine: SimulationEngine }) {
  const [, setTick] = useState(0)
  useEffect(() => engine.subscribe(() => setTick((n) => n + 1)), [engine])

  const s = engine.state
  const d = s.derived

  const cells = [
    { label: '加速度 a', value: s.a, unit: 'm/s²', precision: 2, highlight: true },
    { label: '速度 v', value: s.v, unit: 'm/s', precision: 2, highlight: true },
    { label: '位移 x', value: s.x, unit: 'm', precision: 2 },
    { label: '已用时间 t', value: s.t, unit: 's', precision: 2 },
    { label: 'F·cosθ', value: d.Fx ?? 0, unit: 'N', precision: 1 },
    { label: '正压力 N', value: d.N ?? 0, unit: 'N', precision: 1 },
    { label: '摩擦力 f', value: d.fk ?? 0, unit: 'N', precision: 1 },
    { label: '水平合力 F_合', value: (d.Fx ?? 0) - (d.fk ?? 0), unit: 'N', precision: 1 },
  ]

  return (
    <div className="glass p-4">
      <div className="text-[11px] font-semibold text-[var(--color-text-3)] uppercase tracking-widest mb-3">
        📊 实时数据
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cells.map((c) => (
          <div
            key={c.label}
            className={`p-2.5 rounded-lg bg-[rgba(13,18,32,0.5)] border ${
              c.highlight
                ? 'border-[rgba(96,165,250,0.3)]'
                : 'border-[var(--color-border)]'
            }`}
          >
            <div className="text-[10px] text-[var(--color-text-3)] mb-0.5 tracking-wide">
              {c.label}
            </div>
            <div
              className={`text-base font-mono font-semibold ${
                c.highlight
                  ? 'text-[var(--color-brand-blue)]'
                  : 'text-[var(--color-text-0)]'
              }`}
            >
              {c.value.toFixed(c.precision)}
              <span className="text-[10px] text-[var(--color-text-3)] ml-1 font-normal">
                {c.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
