import { useStore } from '@/store/useStore'

/**
 * 滑块面板占位
 * 阶段 1：6 个假数据滑块，演示 UI
 * 阶段 5：从 scene plugin 的 parameters[] 动态生成
 */
const fakeParams = [
  { key: 'F', label: '起始拉力', symbol: 'F', value: 50, unit: 'N', min: 0, max: 200, step: 1 },
  { key: 'theta', label: '拉力角度', symbol: 'θ', value: 30, unit: '°', min: 0, max: 90, step: 1 },
  { key: 'm', label: '物体质量', symbol: 'm', value: 5, unit: 'kg', min: 0.5, max: 20, step: 0.1 },
  { key: 'mu_s', label: '静摩擦系数', symbol: 'μₛ', value: 0.3, unit: '', min: 0, max: 1, step: 0.01 },
  { key: 'mu_k', label: '动摩擦系数', symbol: 'μₖ', value: 0.2, unit: '', min: 0, max: 1, step: 0.01 },
  { key: 'g', label: '重力加速度', symbol: 'g', value: 9.8, unit: 'm/s²', min: 1, max: 25, step: 0.1 },
]

export default function ParamSlidersPlaceholder() {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)

  return (
    <div className="glass p-4">
      <div className="text-[11px] font-semibold text-[var(--color-text-3)] uppercase tracking-widest mb-3">
        ⚙ 实验参数
      </div>
      {fakeParams.map((p) => {
        const v = params[p.key] ?? p.value
        const pct = ((v - p.min) / (p.max - p.min)) * 100
        return (
          <div key={p.key} className="mb-3 last:mb-0">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs text-[var(--color-text-1)]">
                {p.label}{' '}
                <span className="italic text-[var(--color-text-0)]">{p.symbol}</span>
              </span>
              <span className="text-xs font-mono text-[var(--color-brand-blue)]">
                {typeof v === 'number' ? v.toFixed(p.step < 0.1 ? 2 : 1) : v}
                <span className="text-[10px] text-[var(--color-text-3)] ml-0.5">
                  {p.unit}
                </span>
              </span>
            </div>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step < 0.1 ? 0.01 : 0.1}
              value={v}
              onChange={(e) => setParam(p.key, parseFloat(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-brand-blue) 0%, var(--color-brand-blue) ${pct}%, rgba(148,163,184,0.15) ${pct}%, rgba(148,163,184,0.15) 100%)`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
