// Slide 09 - 项目结构 + 路线图
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section indicator
  slide.addText("04 · DEPLOY & ROADMAP", {
    x: 0.5, y: 0.4, w: 5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("部署与路线图", {
    x: 0.5, y: 0.75, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // LEFT - 项目结构
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.65, w: 3.4, h: 3.3,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 },
    rectRadius: 0.1
  });
  slide.addText("STRUCTURE", {
    x: 0.7, y: 1.78, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("项目结构", {
    x: 0.7, y: 2.05, w: 3, h: 0.4,
    fontSize: 18, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Tree
  slide.addText([
    { text: "src/", options: { bold: true, color: theme.accent, fontSize: 12, fontFace: "Consolas", breakLine: true } },
    { text: "  scenes/pullFriction/", options: { color: theme.primary, fontSize: 11, fontFace: "Consolas", breakLine: true } },
    { text: "    config.ts | physics.ts | Scene3D.tsx", options: { color: theme.secondary, fontSize: 10, fontFace: "Consolas", breakLine: true } },
    { text: "  components/", options: { color: theme.primary, fontSize: 11, fontFace: "Consolas", breakLine: true } },
    { text: "    Home/  ScenePage/  Shell/", options: { color: theme.secondary, fontSize: 10, fontFace: "Consolas", breakLine: true } },
    { text: "  sim/engine.ts", options: { color: theme.primary, fontSize: 11, fontFace: "Consolas", breakLine: true } },
    { text: "  store/  audio/  pages/", options: { color: theme.secondary, fontSize: 10, fontFace: "Consolas" } }
  ], {
    x: 0.7, y: 2.5, w: 3.1, h: 2.3, margin: 0, valign: "top", paraSpaceAfter: 0
  });

  // RIGHT - Roadmap timeline
  slide.addText("ROADMAP", {
    x: 4.15, y: 1.78, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("路线图", {
    x: 4.15, y: 2.05, w: 3, h: 0.4,
    fontSize: 18, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Timeline line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 4.4, y: 2.85, w: 5.2, h: 0.04,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // 5 milestones
  const milestones = [
    { x: 4.4, label: "S1-S3", title: "项目骨架\n+ Hero", state: "done" },
    { x: 5.6, label: "S4-S6", title: "Grid + 斜面\n+ 图表", state: "done" },
    { x: 6.8, label: "S7", title: "Vercel\n部署", state: "next" },
    { x: 8.0, label: "S8-S10", title: "自由落体\n弹簧 · 滑块", state: "todo" },
    { x: 9.2, label: "S11+", title: "浮力 · 碰撞\n光学...", state: "todo" }
  ];

  milestones.forEach((m) => {
    // Dot
    const dotColor = m.state === "done" ? theme.accent : (m.state === "next" ? theme.highlight : theme.secondary);
    slide.addShape(pres.shapes.OVAL, {
      x: m.x, y: 2.75, w: 0.24, h: 0.24,
      fill: { color: dotColor }, line: { color: theme.bg, width: 1.5 }
    });
    // Label
    slide.addText(m.label, {
      x: m.x - 0.3, y: 2.4, w: 0.85, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: theme.accent,
      bold: true, align: "center", margin: 0
    });
    // Title
    slide.addText(m.title, {
      x: m.x - 0.4, y: 3.1, w: 1.05, h: 0.85,
      fontSize: 10, fontFace: "Microsoft YaHei", color: theme.primary,
      align: "center", margin: 0
    });
  });

  // Status legend
  slide.addShape(pres.shapes.OVAL, {
    x: 4.15, y: 4.55, w: 0.14, h: 0.14,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("已完成", {
    x: 4.32, y: 4.5, w: 0.8, h: 0.25,
    fontSize: 10, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 5.2, y: 4.55, w: 0.14, h: 0.14,
    fill: { color: theme.highlight }, line: { color: theme.highlight, width: 0 }
  });
  slide.addText("下一步", {
    x: 5.37, y: 4.5, w: 0.8, h: 0.25,
    fontSize: 10, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 6.25, y: 4.55, w: 0.14, h: 0.14,
    fill: { color: theme.secondary }, line: { color: theme.secondary, width: 0 }
  });
  slide.addText("规划中", {
    x: 6.42, y: 4.5, w: 0.8, h: 0.25,
    fontSize: 10, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // Deploy info bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 4.15, y: 4.85, w: 5.4, h: 0.05,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("Deploy: Vercel ·  github.com/rongxuning/rphysics", {
    x: 4.15, y: 4.92, w: 5.4, h: 0.25,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    margin: 0
  });

  // Page number
  slide.addText("09", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
