// Slide 07 - 斜面拉力+摩擦 实验 (mixed media: text + parameter table + state machine)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section indicator
  slide.addText("03.2 · EXPERIMENT", {
    x: 0.5, y: 0.4, w: 5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("实验页 · 斜面拉力 + 摩擦", {
    x: 0.5, y: 0.75, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Lead
  slide.addText("MVP 唯一完整场景 · 6 参数 + 4 力箭头 + 状态机 + 12 公式", {
    x: 0.5, y: 1.5, w: 9, h: 0.4,
    fontSize: 13, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // LEFT - Parameters table
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 2.05, w: 4.4, h: 2.9,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 },
    rectRadius: 0.1
  });
  slide.addText("6 PARAMETERS", {
    x: 0.75, y: 2.18, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("参数滑块", {
    x: 0.75, y: 2.45, w: 3, h: 0.4,
    fontSize: 18, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Param list
  const params = [
    ["F", "起始拉力", "N"],
    ["theta", "拉力角度", "deg"],
    ["m", "物体质量", "kg"],
    ["mu_s", "静摩擦系数", ""],
    ["mu_k", "动摩擦系数", ""],
    ["g", "重力加速度", "m/s^2"]
  ];
  const paramY = 2.95;
  params.forEach((p, i) => {
    const y = paramY + i * 0.31;
    // Symbol
    slide.addText(p[0], {
      x: 0.75, y, w: 0.85, h: 0.28,
      fontSize: 13, fontFace: "Consolas", color: theme.accent,
      bold: true, italic: true, margin: 0
    });
    // Label
    slide.addText(p[1], {
      x: 1.65, y, w: 2.0, h: 0.28,
      fontSize: 12, fontFace: "Microsoft YaHei", color: theme.primary,
      margin: 0
    });
    // Unit
    slide.addText(p[2], {
      x: 3.7, y, w: 1.0, h: 0.28,
      fontSize: 11, fontFace: "Calibri", color: theme.secondary,
      align: "right", margin: 0
    });
  });

  // RIGHT - State machine + forces
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 2.05, w: 4.4, h: 2.9,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 },
    rectRadius: 0.1
  });
  slide.addText("STATE MACHINE", {
    x: 5.35, y: 2.18, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("物理状态机", {
    x: 5.35, y: 2.45, w: 3, h: 0.4,
    fontSize: 18, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // 4 states in 2x2
  const states = [
    { label: "REST", cn: "静止", x: 5.35, y: 2.95 },
    { label: "SLIDING", cn: "滑动", x: 7.4, y: 2.95 },
    { label: "UNIFORM", cn: "匀速", x: 5.35, y: 3.85 },
    { label: "AIRBORNE", cn: "离地", x: 7.4, y: 3.85 }
  ];
  states.forEach((s) => {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: s.x, y: s.y, w: 1.85, h: 0.8,
      fill: { color: theme.bg }, line: { color: theme.accent, width: 1 },
      rectRadius: 0.06
    });
    slide.addText(s.label, {
      x: s.x, y: s.y + 0.1, w: 1.85, h: 0.3,
      fontSize: 11, fontFace: "Calibri", color: theme.accent,
      bold: true, align: "center", charSpacing: 2, margin: 0
    });
    slide.addText(s.cn, {
      x: s.x, y: s.y + 0.42, w: 1.85, h: 0.3,
      fontSize: 16, fontFace: "Microsoft YaHei", color: theme.primary,
      bold: true, align: "center", margin: 0
    });
  });

  // Force arrows hint
  slide.addText("4 forces:  F (拉) · mg (重力) · N (正压力) · f (摩擦)", {
    x: 5.35, y: 4.7, w: 4.0, h: 0.25,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    italic: true, margin: 0
  });

  // Page number
  slide.addText("07", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
