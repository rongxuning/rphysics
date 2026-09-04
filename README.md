# rPhysics · 物理原理演示

> 从伽利略到爱因斯坦 · 用 3D 动画呈现经典物理实验

## ✨ 已实现（MVP）

### 首页 Hero · 6 位物理学家循环（5s/位）
- **伽利略** / **牛顿** / **阿基米德** / **焦耳** / **麦克斯韦** / **爱因斯坦**
- 完全程序化 3D 场景（无外部模型/HDR）
- ACES Filmic Tone Mapping + Bloom + Vignette 后处理
- 公式瀑布（KaTeX 渲染，stagger 出现/淡出）
- Ambient 音效（Web Audio API 合成，每位独立音色）
- 暂停 / 上一位 / 下一位 控制

### 首页 Grid · 实验目录
- 5 列实验卡片
- **斜面拉力 + 摩擦** MVP 完整可用
- 自由落体 / 弹簧振子 / 斜面滑块 占位（带 mini 3D 循环动画）

### 实验页 · 斜面拉力 + 摩擦
- 6 个参数滑块（自动从 scene plugin 生成）
- 3D 场景：物块 + 4 个力箭头（F / mg / N / f）+ 速度箭头 + 运动轨迹
- 物理状态机：静止 / 滑动 / 匀速 / 离地
- 实时数据：a / v / x / t / F·cosθ / N / f / F_合
- 60Hz uPlot 图表：v-t / a-t / F<sub>合</sub>-t
- Scrub Bar 时间游标（拖拽回放任意时刻）
- 12 个公式 KaTeX 渲染
- 状态条（匀速 / 无法拉动 / 离地 提示）

## 🚀 本地开发

```bash
npm install
npm run dev    # http://localhost:5173
```

## 🛠 技术栈

| 类别 | 选型 |
|---|---|
| 构建 | Vite 6 + React 18 + TypeScript 5 |
| 样式 | Tailwind CSS 4 |
| 3D | three + @react-three/fiber + drei + postprocessing |
| 状态 | Zustand |
| 公式 | KaTeX |
| 图表 | uPlot（60Hz canvas 时序） |
| 路由 | react-router-dom v6 |
| 物理仿真 | 自写 SimulationEngine（ref-based，60Hz tick） |

## 📁 项目结构

```
src/
├── main.tsx              # 入口（含 audio unlock）
├── App.tsx               # 路由
├── index.css             # Tailwind 4 + 主题
├── store/
│   ├── useStore.ts       # 顶层 UI 状态
│   └── heroStore.ts      # Hero 状态
├── audio/
│   └── ambient.ts        # Web Audio API 合成器
├── sim/
│   ├── engine.ts         # 仿真引擎（ref-based，60Hz tick）
│   └── useSimulation.ts  # React hook 订阅
├── scenes/               # 场景插件
│   ├── types.ts          # ScenePlugin 接口
│   ├── registry.ts       # 所有场景
│   └── pullFriction/     # MVP 唯一完整场景
│       ├── config.ts     # parameters / formulas / charts
│       ├── physics.ts    # tick / detectStatus
│       ├── Scene3D.tsx   # R3F 3D 场景
│       └── index.ts
├── components/
│   ├── Nav.tsx
│   ├── Home/
│   │   ├── HeroSection.tsx       # 6 位物理学家 5s 循环
│   │   ├── HeroScene.tsx         # R3F 共享基础设施
│   │   ├── HeroOverlay.tsx       # 2D HUD：姓名 + 公式瀑布
│   │   ├── HeroControls.tsx      # 暂停/上一位/下一位
│   │   ├── SceneGrid.tsx         # 5 列实验卡
│   │   ├── CardMiniScenes.tsx    # 网格卡 mini 3D
│   │   └── physicists/
│   │       ├── GalileoScene.tsx
│   │       ├── NewtonScene.tsx
│   │       ├── ArchimedesScene.tsx
│   │       ├── JouleScene.tsx
│   │       ├── MaxwellScene.tsx
│   │       ├── EinsteinScene.tsx
│   │       └── StarsBackground.tsx
│   ├── Shell/
│   │   └── ForceArrow.tsx        # 通用力箭头
│   └── ScenePage/
│       ├── ParamSliders.tsx      # 自动从 parameters[] 生成
│       ├── LiveData.tsx          # 实时数据
│       ├── StatusBar.tsx         # 物理状态条
│       ├── Charts.tsx            # uPlot 60Hz
│       ├── ScrubBar.tsx          # 时间游标（拖拽回放）
│       └── FormulaPanel.tsx      # KaTeX 公式
└── pages/
    ├── Home.tsx
    ├── ScenePage.tsx
    └── NotFound.tsx
```

## 🌐 部署到 Vercel

代码已 push 到 [github.com/rongxuning/rphysics](https://github.com/rongxuning/rphysics)。

`vercel.json` 已配置好 SPA 路由。Vercel CLI 已装好但**需要你的交互授权才能完成首次部署**。

### 你需要做的（5 分钟）

#### 方式 A · 推荐：浏览器导入（最稳）

1. 打开 [vercel.com/new](https://vercel.com/new)
2. 点击 "Import Git Repository"
3. 选择 `rongxuning/rphysics`
4. 框架预设：Vite（Vercel 会自动识别）
5. 点击 "Deploy"
6. 完成后访问 `https://rphysics.vercel.app` 验证

之后每次 push 到 `main` 分支会自动部署。

#### 方式 B · CLI（需要你执行）

```bash
# 打开终端，给 vercel 授权
vercel login

# 链接项目
cd /Users/rongxuning/Documents/rPhysics
vercel link

# 部署
vercel --prod
```

## 📋 路线图

- [x] **Stage 1** · 项目骨架
- [x] **Stage 2-3** · Hero · 6 位物理学家
- [x] **Stage 4** · Grid 真实卡 + ambient 音效
- [x] **Stage 5** · 实验页 · 斜面拉力 + 摩擦
- [x] **Stage 6** · 60Hz 图表 + Scrub Bar
- [ ] **Stage 7** · Vercel 部署（等你授权）
- [ ] **Stage 8** · 自由落体
- [ ] **Stage 9** · 弹簧振子
- [ ] **Stage 10** · 斜面滑块
- [ ] **Stage 11+** · 浮力 / 碰撞 / 振动 / 光学...
