import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "One Oracle Value Driver Library";
const slide = pptx.addSlide();
slide.background = { color: "202A35" };
slide.addText("Client PPT export smoke test", { x: 0.7, y: 1.0, w: 8, h: 0.45, fontSize: 26, color: "FFFAF2" });
slide.addText("Evidence-gated Base ROI presentation generation", { x: 0.72, y: 1.65, w: 6, h: 0.25, fontSize: 13, color: "EFC7BB" });
await pptx.writeFile({ fileName: "/home/ubuntu/otm-gtm-analysis/ppt_export_smoke_test.pptx" });
console.log("PPT_EXPORT_SMOKE_TEST_PASS");
