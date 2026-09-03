/**
 * 实时数据面板占位
 * 阶段 1：假数据
 * 阶段 5：从 scene plugin 的 derive() 实时计算
 */
const fakeData = [
  { label: '加速度 a', value: '0.00', unit: 'm/s²', highlight: true },
  { label: '速度 v', value: '0.00', unit: 'm/s', highlight: true },
  { label: '位移 x', value: '0.00', unit: 'm' },
  { label: '已用时间 t', value: '0.00', unit: 's' },
  { label: '正压力 N', value: '0.00', unit: 'N' },
  { label: '摩擦力 f', value: '0.00', unit: 'N' },
]

export default function LiveDataPlaceholder() {
  return (
    <div className="glass p-4">
      <div className="text-[11px] font-semibold text-[var(--color-text-3)] uppercase tracking-widest mb-3">
        📊 实时数据
      </div>
      <div className="grid grid-cols-2 gap-2">
        {fakeData.map((d) => (
          <div
            key={d.label}
            className={`p-2.5 rounded-lg bg-[rgba(13,18,32,0.5)] border border-[var(--color-border)] ${
              d.highlight ? 'border-[rgba(96,165,250,0.3)]' : ''
            }`}
          >
            <div className="text-[10px] text-[var(--color-text-3)] mb-0.5 tracking-wide">
              {d.label}
            </div>
            <div
              className={`text-base font-mono font-semibold ${
                d.highlight
                  ? 'text-[var(--color-brand-blue)]'
                  : 'text-[var(--color-text-0)]'
              }`}
            >
              {d.value}
              <span className="text-[10px] text-[var(--color-text-3)] ml-1 font-normal">
                {d.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
