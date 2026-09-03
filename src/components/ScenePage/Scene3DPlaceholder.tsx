/**
 * 3D 场景占位
 * 阶段 1：纯 CSS 网格 + "3D 场景" 文字
 * 阶段 5：替换为 R3F <Canvas> + 真实 3D
 */
export default function Scene3DPlaceholder({ sceneId }: { sceneId: string }) {
  return (
    <div className="glass relative overflow-hidden h-[560px]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, #1a2138 0%, var(--color-bg-0) 75%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(96, 165, 250, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(900px) rotateX(58deg) scale(1.5)',
          transformOrigin: '50% 65%',
        }}
      />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div className="text-xs tracking-widest text-[var(--color-text-3)] uppercase mb-3">
          Stage 5 · 3D 场景
        </div>
        <div className="text-3xl font-mono text-[var(--color-text-1)] mb-2">
          ⟨ R3F Canvas ⟩
        </div>
        <div className="text-sm text-[var(--color-text-3)]">
          sceneId = <code className="text-[var(--color-brand-blue)]">{sceneId}</code>
        </div>
        <div className="text-xs text-[var(--color-text-3)] mt-6 max-w-md">
          阶段 5 将接入：透视相机 + 地面 + 物块 + 4 个力箭头（F / mg / N / f）
          <br />+ 运动轨迹 + OrbitControls
        </div>
      </div>
    </div>
  )
}
