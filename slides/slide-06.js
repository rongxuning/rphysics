// Slide 06 - Hero: 6 physicists cycle
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section indicator
  slide.addText("03.1 · HERO", {
    x: 0.5, y: 0.4, w: 5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("Hero · 6 位物理学家循环", {
    x: 0.5, y: 0.75, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Lead
  slide.addText("5s/位 · 完全程序化 3D 场景(无外部模型/HDR)", {
    x: 0.5, y: 1.5, w: 9, h: 0.4,
    fontSize: 13, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // 6 physicist cards in 2 rows x 3 cols
  const phys = [
    { name: "伽利略", en: "Galileo", formula: "v = v0 + gt", year: "1564-1642" },
    { name: "牛顿", en: "Newton", formula: "F = ma", year: "1643-1727" },
    { name: "阿基米德", en: "Archimedes", formula: "F_buoyancy = rho V g", year: "BC 287-212" },
    { name: "焦耳", en: "Joule", formula: "Q = I^2 R t", year: "1818-1889" },
    { name: "麦克斯韦", en: "Maxwell", formula: "del x E = -dB/dt", year: "1831-1879" },
    { name: "爱因斯坦", en: "Einstein", formula: "E = mc^2", year: "1879-1955" }
  ];

  const cardW = 2.9, cardH = 1.35, gapX = 0.15, gapY = 0.15;
  const startX = 0.5, startY = 2.0;

  phys.forEach((p, i) => {
    const row = Math.floor(i / 3), col = i % 3;
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cardW, h: cardH,
      fill: { color: theme.light }, line: { color: theme.light, width: 0 },
      rectRadius: 0.08
    });
    // Left accent
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.05, h: cardH,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    // Name (Chinese)
    slide.addText(p.name, {
      x: x + 0.2, y: y + 0.12, w: cardW - 0.3, h: 0.4,
      fontSize: 18, fontFace: "Microsoft YaHei", color: theme.primary,
      bold: true, margin: 0
    });
    // English name + year
    slide.addText(p.en + "  ·  " + p.year, {
      x: x + 0.2, y: y + 0.5, w: cardW - 0.3, h: 0.28,
      fontSize: 9, fontFace: "Calibri", color: theme.secondary,
      margin: 0
    });
    // Formula (monospace-ish look)
    slide.addText(p.formula, {
      x: x + 0.2, y: y + 0.82, w: cardW - 0.3, h: 0.4,
      fontSize: 13, fontFace: "Consolas", color: theme.accent,
      italic: true, margin: 0
    });
  });

  // Bottom highlight bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.85, w: 9, h: 0.04,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
  });
  slide.addText("Paused / Prev / Next 控制 · 公式瀑布 stagger 出现/淡出 · 6 套独立合成音色", {
    x: 0.5, y: 4.92, w: 9, h: 0.3,
    fontSize: 11, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // Page number
  slide.addText("06", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
