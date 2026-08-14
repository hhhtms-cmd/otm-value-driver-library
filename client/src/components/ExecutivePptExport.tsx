/* Design reminder: client PPT output is a concise decision dossier: evidence-gated, restrained, and never a generic sales deck. */
import type { Language } from "@/contexts/LanguageContext";

type PptDriver = { id: string; family: "OTM" | "GTM"; title: string; impact: string; formula: string; statusLabel: string; };
type Props = { language: Language; baseDrivers: PptDriver[]; opportunityDrivers: PptDriver[]; baseBenefit: number; opportunityBenefit: number; implementationCost: number; annualRunCost: number; firstYearNetBenefit: number; roi: number | null; paybackMonths: number | null; overlapAlert: boolean; reportDate: string; onStatus: (message: string) => void; };

const COPY = {
  zh: { button: "下载客户版 PPT", preparing: "正在生成客户版 PowerPoint…", done: "客户版 PowerPoint 已开始下载。", unavailable: "至少需要一个 E2/E3 driver 才能生成客户版 PPT。", title: "One Oracle 价值评估", subtitle: "客户决策摘要 · 已验证 Base ROI", scope: "范围与证据门槛", financials: "五年投资决策视图", drivers: "已验证价值驱动", controls: "关键决策控制", base: "Base ROI", opportunity: "待验证机会", next: "下一步", evidence: "证据状态", implementation: "一次性实施成本", annualCost: "年度运营成本", firstYear: "首年净收益", payback: "预计回收期", noPayback: "尚未达到正向回收", ready: "准备进入财务评审", review: "需先完成验证", overlap: "跨域重叠归属待确认", noOverlap: "未检测到当前已选 driver 的重叠警示", footer: "Evidence before assertion · Base ROI includes E2/E3 drivers only", decision: "建议决策路径", decisionCopy: "确认范围、TCO、重叠归属及责任人后，进入投资评审。", file: "客户版业务案例" },
  en: { button: "Download client PPT", preparing: "Generating client PowerPoint…", done: "Client PowerPoint download has started.", unavailable: "At least one E2/E3 driver is required to generate a client PPT.", title: "One Oracle Value Assessment", subtitle: "Client Decision Summary · Validated Base ROI", scope: "Scope & evidence gate", financials: "Five-year investment view", drivers: "Validated value drivers", controls: "Key decision controls", base: "Base ROI", opportunity: "Evidence-pending opportunity", next: "Next action", evidence: "Evidence status", implementation: "One-time implementation cost", annualCost: "Annual operating cost", firstYear: "First-year net benefit", payback: "Expected payback", noPayback: "No positive payback yet", ready: "Ready for finance review", review: "Validation required first", overlap: "Cross-domain overlap owner to confirm", noOverlap: "No overlap alert detected for the current selection", footer: "Evidence before assertion · Base ROI includes E2/E3 drivers only", decision: "Recommended decision path", decisionCopy: "Confirm scope, TCO, overlap ownership, and accountable owners before investment review.", file: "Client Business Case" },
  es: { button: "Descargar PPT para cliente", preparing: "Generando PowerPoint para cliente…", done: "La descarga de PowerPoint para cliente ha comenzado.", unavailable: "Se requiere al menos un driver E2/E3 para generar un PPT de cliente.", title: "Evaluación de valor One Oracle", subtitle: "Resumen de decisión del cliente · ROI base validado", scope: "Alcance y puerta de evidencia", financials: "Visión de inversión a cinco años", drivers: "Drivers de valor validados", controls: "Controles clave de decisión", base: "ROI base", opportunity: "Oportunidad pendiente de evidencia", next: "Próxima acción", evidence: "Estado de evidencia", implementation: "Coste único de implementación", annualCost: "Coste operativo anual", firstYear: "Beneficio neto del primer año", payback: "Recuperación esperada", noPayback: "Aún no hay recuperación positiva", ready: "Listo para revisión financiera", review: "Primero se requiere validación", overlap: "Pendiente confirmar propietario de solapamiento", noOverlap: "No se detectó alerta de solapamiento en la selección actual", footer: "Evidencia antes que afirmación · El ROI base incluye solo drivers E2/E3", decision: "Ruta de decisión recomendada", decisionCopy: "Confirme alcance, TCO, propietario de solapamiento y responsables antes de la revisión de inversión.", file: "Caso de negocio para cliente" },
} as const;

const C = { dark: "202A35", paper: "FFFAF2", red: "D84A36", green: "365C56", softGreen: "CFE9E0", muted: "68717C", beige: "EAE3D6", line: "D8D0C3", pale: "F5F0E7" };
const inches = { w: 13.333, h: 7.5 };

export default function ExecutivePptExport(props: Props) {
  const copy = COPY[props.language];
  const currency = new Intl.NumberFormat(props.language === "zh" ? "zh-CN" : props.language === "es" ? "es-ES" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const exportPpt = async () => {
    if (!props.baseDrivers.length || props.roi === null) { props.onStatus(copy.unavailable); return; }
    props.onStatus(copy.preparing);
    try {
      const { default: PptxGenJS } = await import("pptxgenjs");
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "One Oracle Value Driver Library";
      pptx.company = "One Oracle";
      pptx.subject = "Evidence-gated client business case";
      pptx.title = `${copy.file} — ${props.reportDate}`;
      pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos" };
      const footer = (slide: any, n: number) => {
        slide.addShape(pptx.ShapeType.line, { x: 0.55, y: 7.06, w: 12.2, h: 0, line: { color: C.line, width: 0.7 } });
        slide.addText(copy.footer, { x: 0.6, y: 7.13, w: 10.7, h: 0.16, fontFace: "Aptos", fontSize: 6.5, color: C.muted, margin: 0 });
        slide.addText(String(n).padStart(2, "0"), { x: 12.05, y: 7.09, w: 0.5, h: 0.2, fontFace: "Courier New", fontSize: 7, color: C.red, align: "right", margin: 0 });
      };
      const label = (slide: any, text: string, x: number, y: number, w: number, color = C.red) => slide.addText(text.toUpperCase(), { x, y, w, h: 0.2, fontFace: "Courier New", fontSize: 7, color, bold: true, charSpacing: 1.2, margin: 0 });
      const metric = (slide: any, title: string, value: string, x: number, y: number, w: number, accent = C.green) => {
        slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 1.05, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
        slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.06, h: 1.05, fill: { color: accent }, line: { color: accent, transparency: 100 } });
        slide.addText(title.toUpperCase(), { x: x + 0.18, y: y + 0.16, w: w - 0.3, h: 0.14, fontFace: "Courier New", fontSize: 6.5, color: C.muted, bold: true, charSpacing: 0.8, margin: 0 });
        slide.addText(value, { x: x + 0.18, y: y + 0.42, w: w - 0.28, h: 0.34, fontFace: "Aptos Display", fontSize: 19, color: C.dark, bold: false, margin: 0, fit: "shrink" });
      };

      let slide = pptx.addSlide();
      slide.background = { color: C.dark };
      slide.addShape(pptx.ShapeType.rect, { x: 0.46, y: 0.45, w: 12.42, h: 6.58, line: { color: "89919A", transparency: 55, width: 0.8 }, fill: { color: C.dark, transparency: 100 } });
      slide.addShape(pptx.ShapeType.line, { x: 0.75, y: 1.6, w: 5.15, h: 0, line: { color: C.red, width: 1.2 } });
      label(slide, `FILE / OO-EXEC-${props.reportDate.replaceAll("-", "")}`, 0.76, 0.78, 3.1, "EFC7BB");
      slide.addText(copy.title, { x: 0.75, y: 2.0, w: 8.8, h: 0.78, fontFace: "Aptos Display", fontSize: 30, color: C.paper, bold: false, margin: 0, breakLine: false, fit: "shrink" });
      slide.addText(copy.subtitle, { x: 0.78, y: 2.95, w: 7.4, h: 0.32, fontFace: "Aptos", fontSize: 13, color: "DED7CD", margin: 0 });
      slide.addText(`${props.baseDrivers.length} E2/E3 ${copy.drivers.toLowerCase()}  •  ${props.reportDate}`, { x: 0.78, y: 4.0, w: 6.7, h: 0.22, fontFace: "Courier New", fontSize: 8, color: "EFC7BB", margin: 0 });
      slide.addShape(pptx.ShapeType.rect, { x: 9.25, y: 1.35, w: 2.7, h: 2.7, fill: { color: "2A3542", transparency: 15 }, line: { color: "D8D0C3", transparency: 55, width: 0.7 } });
      slide.addShape(pptx.ShapeType.rect, { x: 9.55, y: 1.65, w: 1.7, h: 0.07, fill: { color: C.red }, line: { color: C.red, transparency: 100 } });
      slide.addText("EVIDENCE\nFILED", { x: 9.57, y: 2.05, w: 1.2, h: 0.5, fontFace: "Courier New", fontSize: 11, color: C.paper, bold: true, charSpacing: 1.2, breakLine: false, margin: 0 });
      slide.addText("E2 / E3", { x: 9.57, y: 3.0, w: 1.3, h: 0.22, fontFace: "Courier New", fontSize: 8, color: C.red, bold: true, margin: 0 });
      footer(slide, 1);

      slide = pptx.addSlide();
      slide.background = { color: C.pale };
      label(slide, `01 / ${copy.scope}`, 0.65, 0.55, 4.5);
      slide.addText(copy.scope, { x: 0.65, y: 0.92, w: 6.8, h: 0.52, fontFace: "Aptos Display", fontSize: 24, color: C.dark, margin: 0 });
      slide.addText(copy.footer, { x: 0.67, y: 1.55, w: 7.2, h: 0.23, fontFace: "Aptos", fontSize: 10, color: C.muted, margin: 0 });
      const scopeRows = [[copy.evidence, `E2/E3 — ${copy.ready}`], [copy.base, `${props.baseDrivers.length} ${copy.drivers}`], [copy.opportunity, `${props.opportunityDrivers.length} ${copy.drivers}`], [copy.next, props.overlapAlert ? copy.overlap : copy.noOverlap]];
      scopeRows.forEach(([name, value], index) => {
        const y = 2.2 + index * 0.87;
        slide.addShape(pptx.ShapeType.line, { x: 0.68, y, w: 11.95, h: 0, line: { color: C.line, width: 0.7 } });
        slide.addText(name, { x: 0.7, y: y + 0.18, w: 3.3, h: 0.2, fontFace: "Courier New", fontSize: 8, color: C.muted, bold: true, charSpacing: 0.7, margin: 0 });
        slide.addText(value, { x: 4.0, y: y + 0.14, w: 7.7, h: 0.28, fontFace: "Aptos", fontSize: 13, color: index === 0 || index === 1 ? C.green : index === 3 && props.overlapAlert ? C.red : C.dark, bold: index < 2, margin: 0 });
      });
      footer(slide, 2);

      slide = pptx.addSlide();
      slide.background = { color: C.pale };
      label(slide, `02 / ${copy.financials}`, 0.65, 0.55, 4.5);
      slide.addText(copy.financials, { x: 0.65, y: 0.92, w: 6.8, h: 0.52, fontFace: "Aptos Display", fontSize: 24, color: C.dark, margin: 0 });
      metric(slide, copy.base, currency.format(props.baseBenefit), 0.68, 2.0, 2.85);
      metric(slide, copy.firstYear, currency.format(props.firstYearNetBenefit), 3.72, 2.0, 2.85);
      metric(slide, copy.base, `${props.roi.toFixed(1)}%`, 6.76, 2.0, 2.85, C.red);
      metric(slide, copy.payback, props.paybackMonths ? `${props.paybackMonths.toFixed(1)} ${copy.payback.toLowerCase()}` : copy.noPayback, 9.8, 2.0, 2.85);
      slide.addShape(pptx.ShapeType.rect, { x: 0.68, y: 3.75, w: 12.0, h: 1.42, fill: { color: C.dark }, line: { color: C.dark, transparency: 100 } });
      slide.addText(copy.implementation.toUpperCase(), { x: 0.95, y: 4.05, w: 2.6, h: 0.14, fontFace: "Courier New", fontSize: 7, color: "C6C1B9", charSpacing: 0.7, margin: 0 });
      slide.addText(currency.format(props.implementationCost), { x: 0.95, y: 4.32, w: 2.5, h: 0.3, fontFace: "Aptos Display", fontSize: 18, color: C.paper, margin: 0 });
      slide.addText(copy.annualCost.toUpperCase(), { x: 4.15, y: 4.05, w: 2.8, h: 0.14, fontFace: "Courier New", fontSize: 7, color: "C6C1B9", charSpacing: 0.7, margin: 0 });
      slide.addText(currency.format(props.annualRunCost), { x: 4.15, y: 4.32, w: 2.5, h: 0.3, fontFace: "Aptos Display", fontSize: 18, color: C.paper, margin: 0 });
      slide.addText(copy.opportunity.toUpperCase(), { x: 7.35, y: 4.05, w: 3.2, h: 0.14, fontFace: "Courier New", fontSize: 7, color: "C6C1B9", charSpacing: 0.7, margin: 0 });
      slide.addText(currency.format(props.opportunityBenefit), { x: 7.35, y: 4.32, w: 2.5, h: 0.3, fontFace: "Aptos Display", fontSize: 18, color: "E2C58E", margin: 0 });
      footer(slide, 3);

      slide = pptx.addSlide();
      slide.background = { color: C.pale };
      label(slide, `03 / ${copy.drivers}`, 0.65, 0.55, 5.2);
      slide.addText(copy.drivers, { x: 0.65, y: 0.92, w: 8.0, h: 0.52, fontFace: "Aptos Display", fontSize: 24, color: C.dark, margin: 0 });
      slide.addShape(pptx.ShapeType.rect, { x: 0.67, y: 1.82, w: 12.0, h: 0.38, fill: { color: C.dark }, line: { color: C.dark, transparency: 100 } });
      ["ID", "DOMAIN", "VALUE DRIVER", "VALUE PATH", "EVIDENCE"].forEach((header, index) => slide.addText(header, { x: [0.9, 1.55, 2.55, 6.9, 11.05][index], y: 1.95, w: [0.5, 0.8, 3.8, 3.7, 1.1][index], h: 0.12, fontFace: "Courier New", fontSize: 6.5, color: C.paper, bold: true, charSpacing: 0.6, margin: 0 }));
      props.baseDrivers.slice(0, 7).forEach((driver, index) => {
        const y = 2.2 + index * 0.55;
        slide.addShape(pptx.ShapeType.line, { x: 0.67, y: y + 0.47, w: 12.0, h: 0, line: { color: C.line, width: 0.55 } });
        slide.addText(driver.id, { x: 0.9, y: y + 0.12, w: 0.5, h: 0.14, fontFace: "Courier New", fontSize: 7.2, color: C.red, bold: true, margin: 0 });
        slide.addText(driver.family, { x: 1.55, y: y + 0.12, w: 0.8, h: 0.14, fontFace: "Courier New", fontSize: 7, color: driver.family === "GTM" ? C.green : "8B6C38", bold: true, margin: 0 });
        slide.addText(driver.title, { x: 2.55, y: y + 0.1, w: 4.05, h: 0.16, fontFace: "Aptos", fontSize: 9, color: C.dark, bold: true, margin: 0, fit: "shrink" });
        slide.addText(driver.impact, { x: 6.9, y: y + 0.1, w: 3.75, h: 0.16, fontFace: "Aptos", fontSize: 8.3, color: C.muted, margin: 0, fit: "shrink" });
        slide.addText("E2/E3", { x: 11.05, y: y + 0.11, w: 0.8, h: 0.14, fontFace: "Courier New", fontSize: 7, color: C.green, bold: true, margin: 0 });
      });
      footer(slide, 4);

      slide = pptx.addSlide();
      slide.background = { color: C.dark };
      label(slide, `04 / ${copy.decision}`, 0.72, 0.62, 4.7, "EFC7BB");
      slide.addText(copy.decision, { x: 0.72, y: 1.04, w: 7.6, h: 0.56, fontFace: "Aptos Display", fontSize: 25, color: C.paper, margin: 0 });
      slide.addText(copy.decisionCopy, { x: 0.74, y: 1.78, w: 7.1, h: 0.45, fontFace: "Aptos", fontSize: 12, color: "D6D0C7", breakLine: false, margin: 0 });
      const decisions = [props.baseDrivers.length ? copy.ready : copy.review, props.overlapAlert ? copy.overlap : copy.noOverlap, `${copy.opportunity}: ${currency.format(props.opportunityBenefit)}`];
      decisions.forEach((item, index) => {
        const y = 3.0 + index * 0.78;
        slide.addShape(pptx.ShapeType.rect, { x: 0.75, y, w: 0.12, h: 0.12, fill: { color: index === 1 && props.overlapAlert ? C.red : index === 0 ? C.green : "C6A36A" }, line: { color: "FFFFFF", transparency: 100 } });
        slide.addText(item, { x: 1.05, y: y - 0.04, w: 8.7, h: 0.25, fontFace: "Aptos", fontSize: 13, color: C.paper, margin: 0 });
      });
      slide.addShape(pptx.ShapeType.rect, { x: 9.35, y: 1.18, w: 2.7, h: 3.95, fill: { color: "2A3542" }, line: { color: "89919A", transparency: 50, width: 0.7 } });
      slide.addText("EVIDENCE\nBEFORE\nASSERTION", { x: 9.68, y: 2.08, w: 1.9, h: 0.78, fontFace: "Courier New", fontSize: 12, color: C.paper, bold: true, charSpacing: 1.1, margin: 0 });
      slide.addText(`FILE / ${props.reportDate}`, { x: 9.68, y: 4.42, w: 1.8, h: 0.16, fontFace: "Courier New", fontSize: 7, color: C.red, margin: 0 });
      footer(slide, 5);

      await pptx.writeFile({ fileName: `one-oracle-client-business-case-${props.reportDate}.pptx` });
      props.onStatus(copy.done);
    } catch (error) {
      props.onStatus(error instanceof Error ? `PPT export failed: ${error.message}` : "PPT export failed. Please try again.");
    }
  };

  return <button onClick={() => void exportPpt()} className="roi-export-button ppt" disabled={!props.baseDrivers.length || props.roi === null} title={!props.baseDrivers.length || props.roi === null ? copy.unavailable : copy.button}><span>PPTX</span>{copy.button}<i>↓</i></button>;
}
