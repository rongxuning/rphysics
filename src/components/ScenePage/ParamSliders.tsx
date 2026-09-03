import type { ParameterDef } from '@/scenes/types'

/**
 * 通用参数滑块面板
 * 从 scene.parameters 自动生成
 */
export default function ParamSliders({
  parameters,
  values,
  onChange,
}: {
  parameters: ParameterDef[]
  values: Record<string, number>
  onChange: (key: string, value: number) => void
}) {
  return (
    <div className="glass p-4">
      <div className="text-[11px] font-semibold text-[var(--color-text-3)] uppercase tracking-widest mb-3">
        ⚙ 实验参数
      </div>
      {parameters.map((p) => {
        const v = values[p.key] ?? p.default
        const pct = ((v - p.min) / (p.max - p.min)) * 100
        return (
          <div key={p.key} className="mb-3 last:mb-0">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs text-[var(--color-text-1)]">
                {p.label}{' '}
                <span className="italic text-[var(--color-text-0)]">{p.symbol}</span>
              </span>
              <span className="text-xs font-mono text-[var(--color-brand-blue)]">
                {v.toFixed(p.step < 0.1 ? 2 : 1)}
                {p.unit && (
                  <span className="text-[10px] text-[var(--color-text-3)] ml-0.5">
                    {p.unit}
                  </span>
                )}
              </span>
            </div>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={v}
              onChange={(e) => onChange(p.key, parseFloat(e.target.value))}
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
