// Slide 03 - Project Overview (3 columns: 灵感 / 目标 / 现状)
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section indicator
  slide.addText("01 · PROJECT OVERVIEW", {
    x: 0.5, y: 0.4, w: 5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("让物理从纸面\"动\"起来", {
    x: 0.5, y: 0.75, w: 9, h: 0.7,
    fontSize: 32, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Lead paragraph
  slide.addText("一个用 3D 动画把经典物理实验搬到浏览器里的轻量 Web App.", {
    x: 0.5, y: 1.5, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // 3 columns
  const cards = [
    {
      x: 0.5, label: "INSPIRATION", title: "灵感",
      body: "中学物理课本的插图太抽象;看到公式却看不到\"为什么\". 希望每个公式都能对应一段可视化的运动.",
      icon: "*"
    },
    {
      x: 3.7, label: "GOAL", title: "目标",
      body: "从伽利略到爱因斯坦 - 6 位物理学家 + 5 个经典实验,完全程序化 3D 场景,无需外部模型/HDR.",
      icon: ">"
    },
    {
      x: 6.9, label: "STATUS", title: "现状",
      body: "MVP 已完成: Hero 6 人循环, 斜面拉力+摩擦实验, 60Hz 实时图表, Scrub Bar 时间游标, 12 个 KaTeX 公式.",
      icon: "V"
    }
  ];

  cards.forEach((c) => {
    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: c.x, y: 2.1, w: 2.6, h: 2.85,
      fill: { color: theme.light }, line: { color: theme.light, width: 0 },
      rectRadius: 0.1
    });
    // Top accent
    slide.addShape(pres.shapes.RECTANGLE, {
      x: c.x, y: 2.1, w: 2.6, h: 0.06,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    // Label
    slide.addText(c.label, {
      x: c.x + 0.25, y: 2.3, w: 2.2, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: theme.accent,
      bold: true, charSpacing: 3, margin: 0
    });
    // Title
    slide.addText(c.title, {
      x: c.x + 0.25, y: 2.6, w: 2.2, h: 0.5,
      fontSize: 22, fontFace: "Microsoft YaHei", color: theme.primary,
      bold: true, margin: 0
    });
    // Body
    slide.addText(c.body, {
      x: c.x + 0.25, y: 3.2, w: 2.2, h: 1.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: theme.secondary,
      margin: 0, valign: "top", paraSpaceAfter: 4
    });
  });

  // Page number
  slide.addText("03", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
