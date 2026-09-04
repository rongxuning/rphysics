// Slide 01 - Cover
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Decorative top-left "star" accent (gold dot)
  slide.addShape(pres.shapes.OVAL, {
    x: 0.5, y: 0.5, w: 0.08, h: 0.08,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 0.85, y: 1.2, w: 0.05, h: 0.05,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 0.7, w: 0.06, h: 0.06,
    fill: { color: theme.highlight }, line: { color: theme.highlight, width: 0 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 8.9, y: 4.8, w: 0.05, h: 0.05,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 0.4, y: 4.9, w: 0.04, h: 0.04,
    fill: { color: theme.highlight }, line: { color: theme.highlight, width: 0 }
  });

  // Side accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.06, h: 1.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Eyebrow label
  slide.addText("3D PHYSICS DEMO · 2026", {
    x: 0.7, y: 1.6, w: 6, h: 0.35,
    fontSize: 12, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Main title (Chinese)
  slide.addText("rPhysics", {
    x: 0.7, y: 1.95, w: 8, h: 1.0,
    fontSize: 64, fontFace: "Calibri", color: theme.primary,
    bold: true, margin: 0
  });

  // Subtitle (Chinese)
  slide.addText("物理原理演示", {
    x: 0.7, y: 2.9, w: 8, h: 0.6,
    fontSize: 32, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: false, margin: 0
  });

  // Tagline
  slide.addText("从伽利略到爱因斯坦 · 用 3D 动画呈现经典物理实验", {
    x: 0.7, y: 3.65, w: 8.5, h: 0.4,
    fontSize: 16, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // Bottom meta info
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 4.7, w: 0.04, h: 0.4,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText([
    { text: "BUILT WITH", options: { color: theme.secondary, fontSize: 10, bold: true, charSpacing: 3, breakLine: true } },
    { text: "Vite 6 · React 18 · R3F · Three.js · Tailwind 4", options: { color: theme.primary, fontSize: 13, fontFace: "Calibri" } }
  ], {
    x: 0.85, y: 4.65, w: 6, h: 0.5,
    fontFace: "Calibri", margin: 0, valign: "top"
  });

  // Author / date
  slide.addText([
    { text: "AUTHOR", options: { color: theme.secondary, fontSize: 10, bold: true, charSpacing: 3, breakLine: true } },
    { text: "rongxuning", options: { color: theme.primary, fontSize: 13, fontFace: "Calibri" } }
  ], {
    x: 7.5, y: 4.65, w: 2, h: 0.5,
    fontFace: "Calibri", margin: 0, valign: "top", align: "right"
  });
}

module.exports = { createSlide };
