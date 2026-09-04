// Slide 02 - Table of Contents
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Page title
  slide.addText("CONTENTS", {
    x: 0.5, y: 0.45, w: 4, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 5, margin: 0
  });
  slide.addText("目录", {
    x: 0.5, y: 0.85, w: 6, h: 0.8,
    fontSize: 44, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Right side decorative line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 9.4, y: 0.85, w: 0.04, h: 1.2,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("4 sections · 10 slides", {
    x: 7.5, y: 1.55, w: 2, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });

  // 4 sections in a 2x2 grid
  const sections = [
    { num: "01", title: "项目概览", desc: "Project Overview", x: 0.5, y: 2.4 },
    { num: "02", title: "技术栈", desc: "Tech Stack", x: 5.15, y: 2.4 },
    { num: "03", title: "核心特性", desc: "Core Features", x: 0.5, y: 3.85 },
    { num: "04", title: "部署与路线图", desc: "Deploy & Roadmap", x: 5.15, y: 3.85 }
  ];

  sections.forEach((s) => {
    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: s.x, y: s.y, w: 4.35, h: 1.25,
      fill: { color: theme.light }, line: { color: theme.light, width: 0 },
      rectRadius: 0.1
    });
    // Big number
    slide.addText(s.num, {
      x: s.x + 0.25, y: s.y + 0.15, w: 1.3, h: 0.95,
      fontSize: 52, fontFace: "Calibri", color: theme.accent,
      bold: true, margin: 0, valign: "middle"
    });
    // Title (Chinese)
    slide.addText(s.title, {
      x: s.x + 1.55, y: s.y + 0.25, w: 2.7, h: 0.5,
      fontSize: 22, fontFace: "Microsoft YaHei", color: theme.primary,
      bold: true, margin: 0
    });
    // English subtitle
    slide.addText(s.desc, {
      x: s.x + 1.55, y: s.y + 0.75, w: 2.7, h: 0.35,
      fontSize: 12, fontFace: "Calibri", color: theme.secondary,
      margin: 0
    });
  });

  // Page number badge
  slide.addText("02", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
