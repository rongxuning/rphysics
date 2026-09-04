// Slide 10 - Closing
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Decorative star dots
  slide.addShape(pres.shapes.OVAL, {
    x: 0.5, y: 0.5, w: 0.06, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 9.3, y: 0.6, w: 0.05, h: 0.05,
    fill: { color: theme.highlight }, line: { color: theme.highlight, width: 0 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 0.4, y: 4.9, w: 0.05, h: 0.05,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 8.9, y: 4.85, w: 0.04, h: 0.04,
    fill: { color: theme.highlight }, line: { color: theme.highlight, width: 0 }
  });

  // Side accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 1.85, w: 0.06, h: 1.7,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });

  // THANK YOU
  slide.addText("THANK YOU", {
    x: 0.9, y: 1.85, w: 6, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 5, margin: 0
  });

  // Main title
  slide.addText("让公式动起来", {
    x: 0.9, y: 2.25, w: 8, h: 1.1,
    fontSize: 64, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Sub
  slide.addText("rPhysics · 物理原理演示", {
    x: 0.9, y: 3.35, w: 8, h: 0.4,
    fontSize: 18, fontFace: "Calibri", color: theme.secondary,
    margin: 0
  });

  // Bottom info row
  // Left - GitHub
  slide.addText("CODE", {
    x: 0.9, y: 4.5, w: 1.5, h: 0.25,
    fontSize: 9, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("github.com/rongxuning/rphysics", {
    x: 0.9, y: 4.75, w: 3, h: 0.3,
    fontSize: 12, fontFace: "Calibri", color: theme.primary,
    margin: 0
  });

  // Middle - Dev
  slide.addText("DEVELOP", {
    x: 4.1, y: 4.5, w: 1.5, h: 0.25,
    fontSize: 9, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("npm install && npm run dev", {
    x: 4.1, y: 4.75, w: 3, h: 0.3,
    fontSize: 12, fontFace: "Consolas", color: theme.primary,
    margin: 0
  });

  // Right - Deploy
  slide.addText("DEPLOY", {
    x: 7.3, y: 4.5, w: 1.5, h: 0.25,
    fontSize: 9, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("Vercel · rphysics.vercel.app", {
    x: 7.3, y: 4.75, w: 2.4, h: 0.3,
    fontSize: 12, fontFace: "Calibri", color: theme.primary,
    margin: 0
  });

  // Page number
  slide.addText("10", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
