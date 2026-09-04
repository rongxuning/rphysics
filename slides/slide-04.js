// Slide 04 - Tech Stack (two columns)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section indicator
  slide.addText("02 · TECH STACK", {
    x: 0.5, y: 0.4, w: 5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("技术栈", {
    x: 0.5, y: 0.75, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  slide.addText("Modern React + 3D + 自写物理引擎, 无外部模型依赖.", {
    x: 0.5, y: 1.5, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // Two columns
  // LEFT - 前端
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 2.1, w: 4.4, h: 2.85,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 },
    rectRadius: 0.1
  });
  slide.addText("FRONTEND", {
    x: 0.75, y: 2.25, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("前端与渲染", {
    x: 0.75, y: 2.55, w: 3, h: 0.45,
    fontSize: 20, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });
  slide.addText([
    { text: "Vite 6", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "构建与 dev server,毫秒级 HMR", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "React 18 + TypeScript 5", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "组件 + 类型安全", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "R3F + three + drei", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "声明式 3D 场景", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "postprocessing (ACES + Bloom)", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "电影感色调映射", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "Tailwind 4 + KaTeX + Zustand", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "样式 / 公式 / 全局状态", options: { color: theme.secondary, fontSize: 11 } }
  ], {
    x: 0.75, y: 3.05, w: 4, h: 1.8, margin: 0, valign: "top", paraSpaceAfter: 0
  });

  // RIGHT - 仿真
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 2.1, w: 4.4, h: 2.85,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 },
    rectRadius: 0.1
  });
  slide.addText("SIMULATION", {
    x: 5.35, y: 2.25, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("仿真与可视化", {
    x: 5.35, y: 2.55, w: 3, h: 0.45,
    fontSize: 20, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });
  slide.addText([
    { text: "SimulationEngine", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "ref-based · 60Hz tick,解耦 React 渲染", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "uPlot", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "60Hz canvas 时序图表 (v-t / a-t / F-t)", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "Scrub Bar", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "拖拽回放任意时刻", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "ScenePlugin 接口", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "参数/公式/图表统一 schema,新增实验只填配置", options: { color: theme.secondary, fontSize: 11, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "Web Audio API", options: { bold: true, color: theme.primary, fontSize: 13, breakLine: true } },
    { text: "每位物理学家独立合成音色", options: { color: theme.secondary, fontSize: 11 } }
  ], {
    x: 5.35, y: 3.05, w: 4, h: 1.8, margin: 0, valign: "top", paraSpaceAfter: 0
  });

  // Page number
  slide.addText("04", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
