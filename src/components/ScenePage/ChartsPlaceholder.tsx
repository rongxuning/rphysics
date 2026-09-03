/**
 * 图表占位（v-t / a-t / F_合-t）
 * 阶段 1：3 个空 chart 框
 * 阶段 6：接入 uPlot · 60Hz
 */
const charts = [
  { id: 'v', title: '速度 v(t)', color: '#4ade80', current: '0.00 m/s' },
  { id: 'a', title: '加速度 a(t)', color: '#60a5fa', current: '0.00 m/s²' },
  { id: 'F', title: '水平合力 F_合,x(t)', color: '#f97316', current: '0.00 N' },
]

export default function ChartsPlaceholder() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {charts.map((c) => (
        <div key={c.id} className="glass p-4">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-[11px] font-semibold text-[var(--color-text-2)] uppercase tracking-wider">
              {c.title}
            </span>
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: c.color }}
            >
              {c.current}
            </span>
          </div>
          <div
            className="h-[140px] rounded-lg border border-dashed border-[var(--color-border-2)] flex items-center justify-center text-[10px] text-[var(--color-text-3)] uppercase tracking-widest"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${c.color}08 100%)`,
            }}
          >
            Stage 6 · uPlot 60Hz
          </div>
        </div>
      ))}
    </div>
  )
}
