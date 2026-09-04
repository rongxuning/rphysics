// Slide 08 - 仿真引擎 + 实时图表
function createSlide(pres, theme) {
  const slide = pres.addSlide();
  slide.background = { color: theme.bg };

  // Section indicator
  slide.addText("03.3 · ENGINE", {
    x: 0.5, y: 0.4, w: 5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 4, margin: 0
  });

  // Title
  slide.addText("仿真引擎 + 60Hz 实时图表", {
    x: 0.5, y: 0.75, w: 9, h: 0.7,
    fontSize: 30, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  slide.addText("ref-based tick · 解耦 React 渲染 · canvas 时序图 · 时间游标拖拽回放", {
    x: 0.5, y: 1.5, w: 9, h: 0.4,
    fontSize: 13, fontFace: "Microsoft YaHei", color: theme.secondary,
    margin: 0
  });

  // LEFT - Engine flow
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 2.05, w: 4.4, h: 2.9,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 },
    rectRadius: 0.1
  });
  slide.addText("SIMULATION LOOP", {
    x: 0.75, y: 2.18, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("引擎数据流", {
    x: 0.75, y: 2.45, w: 3, h: 0.4,
    fontSize: 18, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // Flow steps (vertical)
  const flow = [
    { num: "1", title: "参数订阅", body: "Slider 改变 -> Zustand store" },
    { num: "2", title: "60Hz Tick", body: "engine.tick() 推进 dt = 1/60" },
    { num: "3", title: "状态计算", body: "检测静止/滑动/匀速/离地" },
    { num: "4", title: "写入 ref", body: "不触发 React rerender" },
    { num: "5", title: "帧同步", body: "useFrame 读取 ref 渲染 3D" }
  ];
  const flowY = 2.95;
  flow.forEach((f, i) => {
    const y = flowY + i * 0.4;
    // Number circle
    slide.addShape(pres.shapes.OVAL, {
      x: 0.75, y, w: 0.32, h: 0.32,
      fill: { color: theme.accent }, line: { color: theme.accent, width: 0 }
    });
    slide.addText(f.num, {
      x: 0.75, y, w: 0.32, h: 0.32,
      fontSize: 12, fontFace: "Calibri", color: theme.bg,
      bold: true, align: "center", valign: "middle", margin: 0
    });
    // Title
    slide.addText(f.title, {
      x: 1.2, y, w: 1.3, h: 0.32,
      fontSize: 12, fontFace: "Microsoft YaHei", color: theme.primary,
      bold: true, valign: "middle", margin: 0
    });
    // Body
    slide.addText(f.body, {
      x: 2.55, y, w: 2.2, h: 0.32,
      fontSize: 10, fontFace: "Calibri", color: theme.secondary,
      valign: "middle", margin: 0
    });
  });

  // RIGHT - Live data + charts
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 2.05, w: 4.4, h: 2.9,
    fill: { color: theme.light }, line: { color: theme.light, width: 0 },
    rectRadius: 0.1
  });
  slide.addText("LIVE DATA", {
    x: 5.35, y: 2.18, w: 3, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.accent,
    bold: true, charSpacing: 3, margin: 0
  });
  slide.addText("实时数据 · 图表 · 回放", {
    x: 5.35, y: 2.45, w: 4, h: 0.4,
    fontSize: 18, fontFace: "Microsoft YaHei", color: theme.primary,
    bold: true, margin: 0
  });

  // 3 chart chips
  const charts = [
    { sym: "v(t)", label: "速度", color: "4ADE80" },
    { sym: "a(t)", label: "加速度", color: "60A5FA" },
    { sym: "F_net(t)", label: "水平合力", color: "F97316" }
  ];
  const chartY = 2.95;
  charts.forEach((c, i) => {
    const y = chartY + i * 0.45;
    // Color dot
    slide.addShape(pres.shapes.OVAL, {
      x: 5.35, y: y + 0.08, w: 0.14, h: 0.14,
      fill: { color: c.color }, line: { color: c.color, width: 0 }
    });
    // Symbol
    slide.addText(c.sym, {
      x: 5.6, y, w: 1.4, h: 0.3,
      fontSize: 13, fontFace: "Consolas", color: theme.primary,
      bold: true, italic: true, margin: 0
    });
    // Label
    slide.addText(c.label, {
      x: 7.05, y, w: 1.4, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", color: theme.primary,
      margin: 0
    });
    // uPlot
    slide.addText("uPlot 60Hz", {
      x: 8.4, y, w: 1.0, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: theme.secondary,
      align: "right", margin: 0
    });
  });

  // Scrub bar hint
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.35, y: 4.5, w: 4.0, h: 0.18,
    fill: { color: theme.bg }, line: { color: theme.accent, width: 0.5 },
    rectRadius: 0.05
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.4, y: 4.45, w: 0.4, h: 0.28,
    fill: { color: theme.accent }, line: { color: theme.accent, width: 0 },
    rectRadius: 0.05
  });
  slide.addText("Scrub Bar - 拖拽游标回放任意时刻", {
    x: 5.35, y: 4.75, w: 4.0, h: 0.25,
    fontSize: 10, fontFace: "Microsoft YaHei", color: theme.secondary,
    italic: true, margin: 0
  });

  // Page number
  slide.addText("08", {
    x: 9.3, y: 5.1, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: theme.secondary,
    align: "right", margin: 0
  });
}

module.exports = { createSlide };
