# 实验页一屏零滚动布局 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `/scene/pull-friction` 在桌面视口（≥1280×720）内完全无纵/横滚动，同时保留 5 张图、参数、overlays，并移除公式面板与重复状态角标。

**Architecture:** `App` 改为 `h-dvh` 视口壳；`Home` 在 `main` 内自行滚动；`ScenePage` 用 `h-full overflow-hidden` 的 flex 列分配顶栏 / 主行（3D+侧栏）/ 图表矮带。图表桌面 `grid-cols-5`，uPlot 用 `ResizeObserver` 跟容器；侧栏靠压缩密度装下 7 滑条，禁止滚动。

**Tech Stack:** React 18、React Router 6、Tailwind CSS 4、uPlot、Vite、TypeScript

## Global Constraints

- 窗口内完全不出现纵向滚动；完全不出现横向滚动（含图表区，禁止内部横滚）
- 物理公式面板整块从实验页移除（可不删 `FormulaPanel.tsx` 文件）
- 删除 3D 左下角 `StateOverlay`；只保留顶部 `StatusBar`
- 5 张图全部保留：速度、加速度、水平合力、动能、能量平衡；不可减张
- 不删参数；侧栏也不允许滚动；靠压缩行高/间距/padding
- 保留 `LiveDataOverlay`、`FrictionInfoOverlay` 默认可见与字段
- 桌面验收：约 1280×720 与 1440×900；移动零滚动非验收项
- 仓库无单元测试框架；用 `npm run lint`（`tsc --noEmit`）+ 浏览器目视验收
- Spec：`docs/superpowers/specs/2026-09-06-scene-one-page-layout-design.md`

## File Structure

| File | Responsibility |
|------|----------------|
| `src/App.tsx` | 视口高度壳；`main` 为 `flex-1 min-h-0` |
| `src/pages/Home.tsx` | 首页在 main 内 `h-full overflow-y-auto` |
| `src/pages/ScenePage.tsx` | 实验页零滚动 flex 布局；移除公式与 StateOverlay；3D 填满主行 |
| `src/components/ScenePage/Charts.tsx` | 五列单行矮图；uPlot 随容器 resize |
| `src/components/ScenePage/ParamSliders.tsx` | 压缩滑条密度，侧栏无滚动 |
| `src/components/ScenePage/StatusBar.tsx` | 略减外边距，适配顶栏矮预算 |

不修改：`FormulaPanel.tsx`（仅停用挂载）、物理/`config.ts` 图表定义、overlays 数据字段。

---

### Task 1: App 视口壳 + Home 内滚动

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: 现有 `Nav`、`Routes`
- Produces: App 根为固定视口高度；`main` 可被子页 `h-full` 填满；Home 可滚动，ScenePage 可锁死

- [ ] **Step 1: 修改 `App.tsx`**

将根容器从 `min-h-screen` 改为视口锁高：

```tsx
export default function App() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <Nav />
      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scene/:sceneId" element={<ScenePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 修改 `Home.tsx`**

```tsx
export default function Home() {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <HeroSection />
      <SceneGrid />
    </div>
  )
}
```

- [ ] **Step 3: 类型检查**

Run: `npm run lint`  
Expected: 无错误退出（exit 0）

- [ ] **Step 4: 目视冒烟（可选本任务内）**

Run: `npm run dev`，打开首页：应仍能纵向滚动浏览 Hero/场景网格；窗口本身不因 App 壳裁切掉首页滚动能力。

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/Home.tsx
git commit -m "fix(layout): App 视口壳，Home 内滚动"
```

---

### Task 2: ScenePage 零滚动壳 + 移除公式与 StateOverlay

**Files:**
- Modify: `src/pages/ScenePage.tsx`
- Modify: `src/components/ScenePage/StatusBar.tsx`

**Interfaces:**
- Consumes: Task 1 的 `main.flex-1.min-h-0`；现有 `Charts`、`ParamSliders`、`LiveDataOverlay`、`FrictionInfoOverlay`、`StatusBar`
- Produces: ScenePage 填满 main、无页面滚动；无 `FormulaPanel`；无 `StateOverlay`；3D 区域 `h-full`；图表区占位为 `shrink-0`（具体五列在 Task 3）

- [ ] **Step 1: 压缩 `StatusBar` 外边距**

将 `StatusBar` 根节点 `mb-3` 改为 `mb-0`（顶栏间距改由 ScenePage 统一控制）：

```tsx
return (
  <div className="flex items-center gap-3 min-w-0">
    {/* ...其余不变... */}
  </div>
)
```

- [ ] **Step 2: 重写 `ScenePageInner` 的 return 布局**

删除：
- `import FormulaPanel ...`
- `FormulaPanel` 渲染块
- `StateOverlay` 函数组件及其在 3D 内的调用
- 3D 容器上的 `h-[560px]`

将 `ScenePageInner` 的 JSX 外壳改为（保留现有 hooks / `Transport` / `Scene3DHost` 逻辑）：

```tsx
return (
  <div className="h-full overflow-hidden px-4 py-2 max-w-[1440px] mx-auto w-full flex flex-col gap-2 min-h-0">
    {/* 顶栏：面包屑 + 状态 */}
    <div className="shrink-0 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-3)] min-w-0">
        <Link
          to="/"
          className="hover:text-[var(--color-text-1)] transition flex items-center gap-1 shrink-0"
        >
          <ChevronLeft size={12} />
          首页
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-1)] font-mono">{scene.id}</span>
        <span className="text-[var(--color-text-3)] truncate">· {scene.meta.title}</span>
      </div>
      <StatusBar engine={engine} />
    </div>

    {/* 主行：3D + 侧栏 */}
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-3">
      <div className="glass relative overflow-hidden min-h-0 h-full">
        <Scene3DHost engine={engine} />
        <LiveDataOverlay engine={engine} />
        <FrictionInfoOverlay engine={engine} />
      </div>
      <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ParamSliders
            parameters={scene.parameters}
            values={params}
            onChange={setParam}
          />
        </div>
        <div className="shrink-0">
          <Transport
            playing={playing}
            disabled={isLifted}
            onTogglePlay={togglePlay}
            onReset={() => {
              reset()
              engine.reset()
            }}
          />
        </div>
      </div>
    </div>

    {/* 图表带：高度预算由 Charts 内部控制；此处 shrink-0 */}
    <div className="shrink-0 min-w-0 overflow-hidden">
      <Charts engine={engine} chartDefs={scene.charts} />
    </div>
  </div>
)
```

注意：侧栏外层 `overflow-hidden` 是防止撑破页面；**不得**改成 `overflow-y-auto`。密度问题在 Task 4 解决。

同时删除文件底部整个 `StateOverlay` 函数（约原 204–224 行）。若 `useNavigate` / `speed` / `setSpeed` 等变为未使用，一并删掉未用变量以满足 `tsc`。

- [ ] **Step 3: 类型检查**

Run: `npm run lint`  
Expected: exit 0；不得残留对 `FormulaPanel` / `StateOverlay` 的引用

- [ ] **Step 4: Commit**

```bash
git add src/pages/ScenePage.tsx src/components/ScenePage/StatusBar.tsx
git commit -m "feat(scene): 实验页锁高布局，移除公式与重复状态"
```

---

### Task 3: 图表五列单行 + uPlot ResizeObserver

**Files:**
- Modify: `src/components/ScenePage/Charts.tsx`

**Interfaces:**
- Consumes: `chartDefs` 仍为 5 项；ScenePage 图表容器 `shrink-0 overflow-hidden`
- Produces: 桌面单行 5 列；单图总高落在约 110–130px 绘图区预算内；宽度随容器变化且不产生横滚

- [ ] **Step 1: 改造 `UPlotChart` 以跟随容器尺寸**

替换 `UPlotChart` 实现为带 `ResizeObserver` 的版本（创建时用容器 client 尺寸；之后 `setSize`）：

```tsx
function UPlotChart({
  data,
  options,
  yMin,
  yMax,
}: {
  data: uPlot.AlignedData
  options: Omit<uPlot.Options, 'width' | 'height'> & {
    width?: number
    height?: number
  }
  yMin?: number
  yMax?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<uPlot | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const width = Math.max(el.clientWidth, 1)
    const height = Math.max(el.clientHeight, 1)
    plotRef.current = new uPlot({ ...options, width, height }, data, el)

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry || !plotRef.current) return
      const { width: w, height: h } = entry.contentRect
      if (w > 0 && h > 0) plotRef.current.setSize({ width: w, height: h })
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      plotRef.current?.destroy()
      plotRef.current = null
    }
  }, [])

  useEffect(() => {
    plotRef.current?.setData(data)
  }, [data])

  useEffect(() => {
    if (!plotRef.current || yMin === undefined || yMax === undefined) return
    plotRef.current.setScale('y', { min: yMin, max: yMax })
  }, [yMin, yMax])

  return <div ref={containerRef} className="w-full h-full min-w-0" />
}
```

- [ ] **Step 2: 改 `Charts` 网格为五列单行**

```tsx
export default function Charts({
  engine,
  chartDefs,
}: {
  engine: SimulationEngine
  chartDefs: ChartDef[]
}) {
  return (
    <div className="grid grid-cols-5 gap-2 min-w-0">
      {chartDefs.map((def) => (
        <SingleChart key={def.id} engine={engine} def={def} />
      ))}
    </div>
  )
}
```

（桌面验收为主；不在此加横滚。若 `lg` 以下暂时挤，可接受，因移动非验收项。不要使用 `overflow-x-auto`。）

- [ ] **Step 3: 压缩 `SingleChart` 卡片与 plot 高度**

在 `SingleChart` 中：

1. `options` 去掉固定大尺寸依赖，改为：

```tsx
  const options: Omit<uPlot.Options, 'width' | 'height'> = {
    pxAlign: false,
    cursor: { drag: { x: false, y: false }, points: { show: false } },
    legend: { show: false },
    scales: {
      x: { time: false },
      y: { range: [yMin, yMax] },
    },
    axes: [
      {
        stroke: '#64748b',
        grid: { stroke: 'rgba(148,163,184,0.06)', width: 1 },
        ticks: { stroke: '#475569', size: 4 },
        font: '9px monospace',
        size: 22,
      },
      {
        stroke: '#64748b',
        grid: { stroke: 'rgba(148,163,184,0.06)', width: 1 },
        ticks: { stroke: '#475569', size: 4 },
        font: '9px monospace',
        size: 28,
      },
    ],
    series,
  }
```

2. 卡片 JSX 改为矮卡片 + 固定 plot 高度（约 112px）：

```tsx
  return (
    <div className="glass p-2 min-w-0 overflow-hidden flex flex-col">
      <div className="flex justify-between items-baseline mb-1 gap-1 min-w-0">
        <span className="text-[10px] font-semibold text-[var(--color-text-2)] uppercase tracking-wider truncate">
          {def.title}{' '}
          <span className="italic text-[var(--color-text-0)]">{def.symbol}</span>
        </span>
        <span
          className="text-xs font-mono font-semibold shrink-0"
          style={{ color: def.color }}
        >
          {current.toFixed(2)}
          <span className="text-[9px] text-[var(--color-text-3)] ml-0.5 font-normal">
            {def.yUnit}
          </span>
          {current2 !== null && (
            <>
              <span className="text-[var(--color-text-3)] mx-0.5">·</span>
              <span style={{ color: '#fb923c' }}>
                {current2.toFixed(2)}
                <span className="text-[9px] text-[var(--color-text-3)] ml-0.5 font-normal">
                  Q
                </span>
              </span>
            </>
          )}
        </span>
      </div>
      <div className="h-[112px] min-w-0 w-full">
        <UPlotChart data={data} options={options} yMin={yMin} yMax={yMax} />
      </div>
    </div>
  )
```

series 线宽可改为 `1.25` 以适配窄列。

- [ ] **Step 4: 类型检查**

Run: `npm run lint`  
Expected: exit 0

- [ ] **Step 5: Commit**

```bash
git add src/components/ScenePage/Charts.tsx
git commit -m "feat(charts): 五列单行矮图并跟随容器 resize"
```

---

### Task 4: 侧栏参数密度压缩（无滚动）

**Files:**
- Modify: `src/components/ScenePage/ParamSliders.tsx`
- Modify: `src/pages/ScenePage.tsx`（仅当 Transport 按钮高度需略减时）

**Interfaces:**
- Consumes: Task 2 侧栏 `overflow-hidden` + `flex-1 min-h-0`
- Produces: 7 个参数 + Transport 在主行高度内完整可见，侧栏无滚动条

- [ ] **Step 1: 压缩 `ParamSliders` 视觉密度**

```tsx
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
    <div className="glass p-2.5 h-full min-h-0 overflow-hidden flex flex-col">
      <div className="text-[10px] font-semibold text-[var(--color-text-3)] uppercase tracking-widest mb-1.5 shrink-0">
        ⚙ 实验参数
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-evenly">
        {parameters.map((p) => {
          const v = values[p.key] ?? p.default
          const pct = ((v - p.min) / (p.max - p.min)) * 100
          return (
            <div key={p.key} className="min-w-0">
              <div className="flex justify-between items-baseline mb-0.5 gap-1">
                <span className="text-[11px] text-[var(--color-text-1)] truncate">
                  {p.label}{' '}
                  <span className="italic text-[var(--color-text-0)]">{p.symbol}</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--color-brand-blue)] shrink-0">
                  {v.toFixed(p.step < 0.1 ? 2 : 1)}
                  {p.unit && (
                    <span className="text-[9px] text-[var(--color-text-3)] ml-0.5">
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
    </div>
  )
}
```

用 `justify-evenly` 在可用高度内均分 7 行，避免 `mb-3` 把侧栏撑破。

- [ ] **Step 2: 如需，略减 `Transport` 按钮高度**

在 `ScenePage.tsx` 的 `Transport` 中，将 `h-9` 改为 `h-8`，`text-sm` 可保留。

- [ ] **Step 3: 类型检查**

Run: `npm run lint`  
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add src/components/ScenePage/ParamSliders.tsx src/pages/ScenePage.tsx
git commit -m "fix(scene): 压缩参数侧栏密度以适配一屏高度"
```

---

### Task 5: 桌面目视验收与收尾

**Files:**
- 无必须代码改动；若验收发现轻微溢出，仅允许在已改文件内做 padding/gap/侧栏宽度微调（侧栏宽度已为 `300px`，必要时可到 `280px`，不得引入滚动）

**Interfaces:**
- Consumes: Tasks 1–4 完整布局
- Produces: 满足 spec 验收标准的可合并状态

- [ ] **Step 1: 启动开发服**

Run: `npm run lint && npm run dev`  
Expected: lint 通过；dev server 可访问

- [ ] **Step 2: 验收清单（浏览器，建议 1280×720 与 1440×900）**

打开 `/scene/pull-friction`，确认：

1. 窗口无纵向滚动条、无横向滚动条；滚轮无法露出更多主内容  
2. 可见：3D、7 个参数、开始/重置、5 张图、左上实时数据、右上摩擦力、顶部 StatusBar  
3. 不可见：物理公式参考；3D 左下角重复状态角标  
4. 点开始 / 拖滑条：仿真与曲线仍更新  
5. 回首页：首页仍可正常纵向滚动  

- [ ] **Step 3: 若 720p 侧栏仍裁切**

只允许：再减 `ParamSliders` padding、标题行、或 ScenePage 侧栏列宽 `300px → 280px`。  
**禁止**：`overflow-y-auto`、删除参数、删除图表。若仍不够，停止并在 PR 说明中标注需产品确认。

- [ ] **Step 4: 最终 commit（仅当有微调时）**

```bash
git add -u
git commit -m "fix(scene): 一屏布局验收微调"
```

- [ ] **Step 5: Push**

```bash
git push -u origin cursor/scene-one-page-layout-ee33
```

---

## Spec Coverage Checklist

| Spec 要求 | Task |
|-----------|------|
| App `h-dvh` + main `flex-1 min-h-0` | Task 1 |
| Home 内滚动 | Task 1 |
| ScenePage `h-full overflow-hidden` | Task 2 |
| 移除 FormulaPanel 挂载 | Task 2 |
| 移除 StateOverlay | Task 2 |
| 3D 取消固定 560、填满主行 | Task 2 |
| 五图保留、单行等分、矮带 | Task 3 |
| 禁止图表横滚；ResizeObserver | Task 3 |
| 侧栏不删参、无滚动、压密度 | Task 4 |
| LiveData / Friction 保留 | Task 2（未改 overlays） |
| 1280×720 / 1440×900 验收 | Task 5 |
