import { useEffect, useState } from 'react'
import type { SimulationEngine } from '@/sim/engine'
import { useStore } from '@/store/useStore'

/**
 * 实时数据 - HTML overlay
 * 固定在 3D 画布左上角，相机怎么动都不影响
 *
 * 数据源策略：
 *   - state 类（a, v, x, t）：从 engine 读（要 tick 才有值）
 *   - params 类（F·cosθ, N, f, F_合）：从 useStore 实时算（与 3D 场景 + 摩擦面板同源）
 */
export default function LiveDataOverlay({ engine }: { engine: SimulationEngine }) {
  const params = useStore((s) => s.params)
  const [, setTick] = useState(0)
  useEffect(() => engine.subscribe(() => setTick((n) => (n + 1) % 1000000)), [engine])

  const s = engine.state

  // params 实时算（与 Scene3D / FrictionInfoOverlay 完全一致的公式）
  const F = params.F ?? 0
  const theta_rad = ((params.theta ?? 0) * Math.PI) / 180
  const m = params.m ?? 0
  const g = params.g ?? 9.8
  const Fx = F * Math.cos(theta_rad)
  const Fy = F * Math.sin(theta_rad)
  const N = Math.max(0, m * g - Fy)
  const mu_k = params.mu_k ?? 0
  const mu_s = params.mu_s ?? 0
  const fs_max = mu_s * N
  // 实际摩擦：移动时 = μk·N；静止时若 Fx ≤ μs·N 则 = Fx（被锁住），否则 = μk·N
  const f_actual = s.v > 0.01 ? mu_k * N : (Fx <= fs_max + 0.05 ? Fx : mu_k * N)

  const cells = [
    { label: '加速度 a', value: s.a, unit: 'm/s²', precision: 2, highlight: true },
    { label: '速度 v', value: s.v, unit: 'm/s', precision: 2, highlight: true },
    { label: '位移 x', value: s.x, unit: 'm', precision: 2 },
    { label: '时间 t', value: s.t, unit: 's', precision: 2 },
    { label: 'F·cosθ', value: Fx, unit: 'N', precision: 1 },
    { label: '正压力 N', value: N, unit: 'N', precision: 1 },
    { label: '摩擦力 f', value: f_actual, unit: 'N', precision: 1 },
    { label: '水平合力', value: Fx - f_actual, unit: 'N', precision: 1 },
  ]

  return (
    <div
      className="absolute top-3 left-3 z-10 w-56 rounded-xl overflow-hidden backdrop-blur-md"
      style={{
        background: 'rgba(10, 14, 26, 0.78)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* 标题栏 */}
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

      {/* 数据网格 - 2 列紧凑布局 */}
      <div className="grid grid-cols-2 gap-1.5 p-2.5">
        {cells.map((c) => (
          <div
            key={c.label}
            className="px-2 py-1.5 rounded-md"
            style={{
              background: 'rgba(13, 18, 32, 0.6)',
              border: c.highlight
                ? '1px solid rgba(96, 165, 250, 0.3)'
                : '1px solid rgba(148, 163, 184, 0.08)',
            }}
          >
            <div
              className="text-[9px] mb-0.5 tracking-wide"
              style={{ color: '#64748b' }}
            >
              {c.label}
            </div>
            <div
              className="text-[13px] font-mono font-semibold leading-none"
              style={{
                color: c.highlight ? '#60a5fa' : '#f1f5f9',
              }}
            >
              {c.value.toFixed(c.precision)}
              <span
                className="text-[9px] ml-1 font-normal"
                style={{ color: '#64748b' }}
              >
                {c.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
