// Slide 05 - Section Divider 01 (Core Features)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Big background number
  slide.addText("03", {
    x: 0.3, y: 0.8, w: 4.5, h: 4.0,
    fontSize: 220, fontFace: "Calibri", color: theme.light,
    bold: true, margin: 0, valign: "middle"
  });

  // Accent vertical bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 4.3, y: 1.9, w: 0.06, h: 1.85,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // Section label
  slide.addText("SECTION 03", {
    x: 4.55, y: 1.9, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Title (Chinese)
  slide.addText("核心特性", {
    x: 4.55, y: 2.2, w: 5, h: 0.9,
    fontSize: 48, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // English subtitle
  slide.addText("Core Features", {
    x: 4.55, y: 3.1, w: 5, h: 0.5,
    fontSize: 22, fontFace: "Calibri", color: theme.secondary,
    margin: 0
  });

  // Intro line
  slide.addText("从 Hero 循环到实验仿真: 两个场景, 两类用户旅程.", {
    x: 4.55, y: 3.75, w: 5, h: 0.4,
    fontSize: 14, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // Page number
  slide.addText("05", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
