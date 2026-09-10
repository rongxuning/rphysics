import { useEffect, useState } from 'react'
import type { SimulationEngine } from '@/sim/engine'

const PREFERRED_ORDER = [
  'P',
  'T',
  'V',
  'epsilon',
  'flux',
  'I_center',
  'fringe',
  'frequency',
  'wavelength',
  'v2',
  'deltaP',
  'K_max',
  'rate',
  'Q',
  'I',
  'energy',
  'f_obs',
  'r',
  'speed',
]

/**
 * 通用实时数据 overlay（非拉力摩擦场景）
 * 显示 t + derived 中的关键数值
 */
export default function GenericLiveDataOverlay({ engine }: { engine: SimulationEngine }) {
  const [, setTick] = useState(0)
  useEffect(() => engine.subscribe(() => setTick((n) => (n + 1) % 1000000)), [engine])

  const s = engine.state
  const d = s.derived
  const keys = Object.keys(d)
    .filter((k) => typeof d[k] === 'number' && Number.isFinite(d[k]))
    .sort((a, b) => {
      const ia = PREFERRED_ORDER.indexOf(a)
      const ib = PREFERRED_ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    .slice(0, 8)

  const cells = [
    { label: '时间 t', value: s.t, unit: 's', precision: 2 },
    ...keys.map((k) => ({
      label: k,
      value: d[k],
      unit: '',
      precision: Math.abs(d[k]) >= 100 ? 1 : Math.abs(d[k]) >= 1 ? 2 : 3,
    })),
  ]

  return (
    <div
      className="absolute top-3 left-3 z-10 w-52 rounded-xl overflow-hidden backdrop-blur-md"
      style={{
        background: 'rgba(10, 14, 26, 0.78)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        className="px-3 py-2 text-[10px] font-semibold tracking-widest uppercase"
        style={{
          color: '#94a3b8',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        实时数据
      </div>
      <div className="px-2 py-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
        {cells.map((c) => (
          <div key={c.label} className="min-w-0">
            <div className="text-[9px] text-[var(--color-text-3)] truncate">{c.label}</div>
            <div className="text-xs font-mono text-[var(--color-text-0)] truncate">
              {c.value.toFixed(c.precision)}
              {c.unit ? (
                <span className="text-[9px] text-[var(--color-text-3)] ml-0.5">{c.unit}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
