/**
 * 公式面板占位
 * 阶段 1：6 张假数据
 * 阶段 5：从 scene plugin 的 formulas[] 渲染
 */
const fakeFormulas = [
  { id: 1, name: '牛顿第二定律', math: 'F_合 = ma' },
  { id: 2, name: '正压力（斜拉）', math: 'N = mg - F·sinθ' },
  { id: 3, name: '最大静摩擦', math: 'f_s,max = μ_s·N' },
  { id: 4, name: '动摩擦', math: 'f_k = μ_k·N' },
  { id: 5, name: '水平合力', math: 'F·cosθ - f_k = ma' },
  { id: 6, name: '起动条件', math: 'F·cosθ > μ_s·N' },
]

export default function FormulaPanelPlaceholder() {
  return (
    <div className="glass p-5">
      <div className="text-[11px] font-semibold text-[var(--color-text-3)] uppercase tracking-widest mb-3">
        📐 物理公式参考
        <span className="ml-2 text-[var(--color-text-3)] normal-case font-normal">
          · 阶段 5 接入 KaTeX 渲染 + 点击高亮 3D 中对应力
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {fakeFormulas.map((f) => (
          <div
            key={f.id}
            className="p-3 rounded-lg bg-[rgba(13,18,32,0.5)] border border-[var(--color-border)] hover:border-[rgba(96,165,250,0.3)] transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-4 h-4 rounded bg-[rgba(96,165,250,0.12)] text-[var(--color-brand-blue)] text-[9px] font-semibold flex items-center justify-center">
                {f.id}
              </span>
              <span className="text-[10px] text-[var(--color-text-3)]">
                {f.name}
              </span>
            </div>
            <code className="text-xs font-mono text-[var(--color-text-0)] block">
              {f.math}
            </code>
          </div>
        ))}
      </div>
    </div>
  )
}
