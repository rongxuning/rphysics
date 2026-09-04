const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "rongxuning";
pres.title = "rPhysics - Project Introduction";

// Tech & Night palette (dark mode, gold accent)
const theme = {
  primary:   "F5F5F5",   // light text
  secondary: "8B95A7",   // muted secondary text
  accent:    "FFC300",   // primary gold accent
  highlight: "FFD60A",   // brighter gold
  light:     "001D3D",   // card panel (slightly lighter than bg)
  bg:        "000814"    // deep night background
};

const order = [
  "./slide-01.js",
  "./slide-02.js",
  "./slide-03.js",
  "./slide-04.js",
  "./slide-05.js",
  "./slide-06.js",
  "./slide-07.js",
  "./slide-08.js",
  "./slide-09.js",
  "./slide-10.js"
];

order.forEach((p) => {
  const mod = require(path.resolve(__dirname, p));
  mod.createSlide(pres, theme);
});

const outPath = path.resolve(__dirname, "output/rphysics-intro.pptx");
pres.writeFile({ fileName: outPath }).then((f) => {
  console.log("WROTE: " + f);
});
