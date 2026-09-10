# 九场景 MVP 设计

**日期：** 2026-09-10  
**范围：** 首页 9 个「待开放」实验卡 → 可运行 `ScenePlugin`；实验页壳适配多场景  
**状态：** 方案 A 已确认

## 目标

首页目录中除 `pull-friction` 外的 9 个卡片全部可点击进入 `/scene/<id>`，各自具备：

- 参数滑条（`parameters`）
- 播放 / 暂停 / 重置
- 可读的 3D 可视化（R3F）
- 3–5 张时序图（`charts`）
- 顶部 `StatusBar`
- 物理 `tick` + `detectStatus`

深度可低于 `pull-friction`（无完整力箭头体系、无能量蓄能系统）；后续再加深。

## 非目标

- 不恢复公式面板挂载（公式数组可保留在 config，面板仍不渲染）
- 不把 9 个场景做到与拉力摩擦同等细节
- 不减少首页已有卡片数量或改 ID（ID 必须与现有卡一致）
- 不改一屏零滚动布局约束（桌面实验页仍无页面纵/横滚动）

## 已确认决策

| 决策 | 结论 |
|------|------|
| 方案 | **A：9 个可运行 MVP** |
| 卡片 ID | 与 `SceneGrid` 现有 id 一一对应（见下表） |
| 壳层 | 摩擦专用 overlay / 离地 Transport 仅对 `pull-friction` 生效 |
| 图表列数 | 按 `charts.length` 动态网格（3–5），不强制 5 |
| 实时数据 | 非摩擦场景用通用 overlay（t / 核心 derived），不做摩擦力专用面板 |

## 场景清单

| id | 文件夹 | 领域 | MVP 核心量 |
|----|--------|------|-----------|
| `double-slit` | `doubleSlit` | 光学 | λ, d, L → 条纹强度 I(x) |
| `faraday-induction` | `faradayInduction` | 电磁学 | B, N, v → ε(t) |
| `ideal-gas` | `idealGas` | 热力学 | n, T, V → P |
| `standing-wave` | `standingWave` | 波动 | L, μ, tension, n → 驻波 y(x,t) |
| `bernoulli` | `bernoulli` | 流体 | ρ, A1, A2, Δh → v1/v2, ΔP |
| `photoelectric` | `photoelectric` | 近代物理 | f, I, W → K_max, 是否发射 |
| `rlc-circuit` | `rlcCircuit` | 电路 | R, L, C, V0 → Q(t), I(t) |
| `doppler` | `doppler` | 声学 | f0, vs, vo, v_sound → f' |
| `kepler-orbit` | `keplerOrbit` | 天体 | M, a, e → 椭圆轨道 r(θ) |

## 架构

沿用现有插件契约（`src/scenes/types.ts`）：

```
src/scenes/<camelCase>/
  config.ts      # parameters, formulas, charts
  physics.ts     # createInitialState, tick, detectStatus
  Scene3D.tsx    # R3F { state, params }
  index.ts       # export ScenePlugin
```

注册：`src/scenes/registry.ts`  
解锁：`SceneGrid` 中对应卡 `status: 'available'`

`SceneState` 仍用 `{ t, x, v, a, derived }`；场景特异量全部进 `derived`。  
`x/v/a` 可映射为场景有意义的主运动量（如轨道角、电荷、波相位），不必字面表示位移。

## ScenePage 壳层改动

1. **条件渲染**：`LiveDataOverlay` / `FrictionInfoOverlay` / 离地自动暂停 / Transport「离地」仅当 `sceneId === 'pull-friction'`。
2. **通用 LiveData**：其他场景显示精简 overlay：`t` + 若干 `derived` 关键量（由物理写入的已知 key，或取 derived 前 N 项）。
3. **Charts**：`grid-cols-{n}` 随 `chartDefs.length` 变化（夹在 3–5）。

## 验收

- 首页 10 卡均可点进实验页（无「待开放」锁）
- 每个 `/scene/<id>` 可调参、播放、见 3D 运动、见图表更新
- `npm run lint` 通过
- 拉力摩擦既有行为不回归（离地、overlay、五图）

## 风险

- 图表硬编码 `grid-cols-5` → 3 图场景会留空；必须动态列
- 摩擦专用逻辑泄漏到其他场景会错误禁用播放 → 必须按 sceneId 隔离
- 轻量物理若数值爆炸（RLC、开普勒）需钳制 dt / 参数范围
