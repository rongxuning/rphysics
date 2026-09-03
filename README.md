# rPhysics · 物理原理演示

> 从伽利略到爱因斯坦 · 用 3D 动画呈现经典物理实验

## 阶段路线图

- [x] **Stage 1** · 项目骨架（路由 + 首页 + 实验页占位）
- [ ] **Stage 2** · 首页 Hero · 伽利略位
- [ ] **Stage 3** · 首页 Hero · 其余 5 位
- [ ] **Stage 4** · 首页 Grid · 4 真实卡 + 1 占位 + Ambient 音效
- [ ] **Stage 5** · 实验页 · 斜面拉力 + 摩擦
- [ ] **Stage 6** · 60Hz 图表 + Scrub Bar
- [ ] **Stage 7** · Vercel 部署

## 本地开发

```bash
npm install
npm run dev    # http://localhost:5173
```

## 技术栈

- Vite 6 + React 18 + TypeScript 5
- Tailwind CSS 4
- three + @react-three/fiber + drei + postprocessing
- Zustand（状态）
- react-router-dom（路由）
- uPlot（60Hz 时序图表，阶段 6）
- Howler.js + GSAP（ambient 音效 + 公式瀑布，阶段 4）
- KaTeX（公式渲染，阶段 5）

## 部署

Vercel 推送即部署（`vercel.json` 已配置 SPA 路由）。
