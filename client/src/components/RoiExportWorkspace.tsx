/* Design reminder: "决策档案室" — this workspace is a calculation dossier, using evidence tabs, rulers, and restrained vermilion actions. */
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

type DriverOption = {
  id: string;
  title: string;
  english: string;
  status: string;
  statusLabel: string;
  impact: string;
  kpis: string[];
};

type RoiExportWorkspaceProps = { drivers: DriverOption[]; brandMarkSrc: string };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const today = () => new Intl.DateTimeFormat("en-CA").format(new Date());
const safeValue = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;

export default function RoiExportWorkspace({ drivers, brandMarkSrc }: RoiExportWorkspaceProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["04", "05"]);
  const [driverValues, setDriverValues] = useState<Record<string, number>>({ "04": 285000, "05": 135000 });
  const [implementationCost, setImplementationCost] = useState(190000);
  const [annualRunCost, setAnnualRunCost] = useState(50000);
  const [exportMessage, setExportMessage] = useState("");
  const pdfRef = useRef<HTMLDivElement>(null);

  const selectedDrivers = useMemo(() => drivers.filter((driver) => selectedIds.includes(driver.id)), [drivers, selectedIds]);
  const totalBenefit = useMemo(() => selectedDrivers.reduce((total, driver) => total + safeValue(driverValues[driver.id] ?? 0), 0), [driverValues, selectedDrivers]);
  const netAnnualBenefit = totalBenefit - safeValue(annualRunCost);
  const firstYearNetBenefit = totalBenefit - safeValue(implementationCost) - safeValue(annualRunCost);
  const roi = implementationCost > 0 ? (firstYearNetBenefit / implementationCost) * 100 : 0;
  const paybackMonths = netAnnualBenefit > 0 ? (implementationCost / netAnnualBenefit) * 12 : null;
  const date = today();

  const updateMessage = (message: string) => {
    setExportMessage(message);
    window.setTimeout(() => setExportMessage(""), 4200);
  };

  const toggleDriver = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const setDriverValue = (id: string, value: number) => setDriverValues((current) => ({ ...current, [id]: safeValue(value) }));

  const exportExcel = () => {
    if (!selectedDrivers.length) { updateMessage("请至少选择一个价值驱动因素后再导出。"); return; }
    const summaryRows = [
      ["OTM Value Driver Library — ROI Summary"],
      ["Report date", date],
      ["Selected drivers", selectedDrivers.length],
      [],
      ["Metric", "Value (USD / %)"],
      ["Annual gross benefit", totalBenefit],
      ["Annual operating cost", annualRunCost],
      ["One-time implementation cost", implementationCost],
      ["Annual net benefit", netAnnualBenefit],
      ["First-year net benefit", firstYearNetBenefit],
      ["First-year ROI", roi / 100],
      ["Payback period (months)", paybackMonths ?? "Not reached"],
    ];
    const driverRows = selectedDrivers.map((driver) => ({
      "Driver ID": driver.id,
      "Value Driver": driver.title,
      "English Name": driver.english,
      "Evidence Status": driver.statusLabel,
      "Value Path": driver.impact,
      "Primary KPIs": driver.kpis.join(" / "),
      "Annual Benefit (USD)": safeValue(driverValues[driver.id] ?? 0),
    }));
    const assumptionRows = [
      { "Assumption": "One-time implementation cost", "Value": implementationCost, "Unit": "USD" },
      { "Assumption": "Annual operating cost", "Value": annualRunCost, "Unit": "USD" },
      { "Assumption": "First-year ROI formula", "Value": "(Annual benefit - annual operating cost - implementation cost) / implementation cost", "Unit": "Formula" },
    ];
    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 32 }, { wch: 44 }];
    summarySheet["B11"].z = "0.0%";
    const driversSheet = XLSX.utils.json_to_sheet(driverRows);
    driversSheet["!cols"] = [{ wch: 12 }, { wch: 38 }, { wch: 34 }, { wch: 15 }, { wch: 18 }, { wch: 40 }, { wch: 22 }];
    const assumptionsSheet = XLSX.utils.json_to_sheet(assumptionRows);
    assumptionsSheet["!cols"] = [{ wch: 32 }, { wch: 76 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "ROI Summary");
    XLSX.utils.book_append_sheet(workbook, driversSheet, "Selected Drivers");
    XLSX.utils.book_append_sheet(workbook, assumptionsSheet, "Assumptions");
    XLSX.writeFile(workbook, `otm-value-driver-roi-${date}.xlsx`, { compression: true });
    updateMessage("Excel 工作簿已开始下载。它包含 ROI Summary、Selected Drivers 和 Assumptions 三个表。 ");
  };

  const exportPdf = async () => {
    if (!selectedDrivers.length) { updateMessage("请至少选择一个价值驱动因素后再导出。"); return; }
    if (!pdfRef.current) { updateMessage("PDF 预览尚未准备好，请再试一次。"); return; }
    updateMessage("正在生成 PDF，请稍候…");
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, backgroundColor: "#fffaf2", useCORS: true, logging: false });
      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const margin = 30;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      let remainingHeight = imageHeight;
      let position = margin;
      pdf.addImage(image, "PNG", margin, position, imageWidth, imageHeight, undefined, "FAST");
      remainingHeight -= pageHeight - margin * 2;
      while (remainingHeight > 0) {
        position = remainingHeight - imageHeight + margin;
        pdf.addPage();
        pdf.addImage(image, "PNG", margin, position, imageWidth, imageHeight, undefined, "FAST");
        remainingHeight -= pageHeight - margin * 2;
      }
      pdf.save(`otm-value-driver-roi-${date}.pdf`);
      updateMessage("PDF 摘要已开始下载。 ");
    } catch {
      updateMessage("PDF 生成未完成，请确认浏览器允许下载后重试。");
    }
  };

  return (
    <section className="roi-export-section section-wrap section-anchor" id="roi-export">
      <div className="section-lead"><div><div className="eyebrow">04 / ROI export workspace</div><h2 className="section-heading">把已选择的证据，带进可下载的商业案例。</h2></div><p className="section-intro">选择相关 driver，录入年度价值与成本假设。网站会即时计算首年 ROI 与回收期，并生成 PDF 或 Excel 摘要。</p></div>
      <div className="roi-workspace">
        <div className="roi-selection-panel">
          <div className="roi-panel-heading"><div><span>01 / Select evidence</span><h3>选择价值驱动因素</h3></div><div className="roi-heading-mark"><img src={brandMarkSrc} alt="" /><b>{selectedDrivers.length.toString().padStart(2, "0")} / 08</b></div></div>
          <p className="roi-panel-copy">只有被选择的 driver 会进入计算与导出文件。金额默认是示例，需由你的客户数据替换。</p>
          <div className="roi-driver-list">
            {drivers.map((driver) => {
              const checked = selectedIds.includes(driver.id);
              return <div className={`roi-driver-row ${driver.status} ${checked ? "checked" : ""}`} key={driver.id}>
                <button className="roi-check" onClick={() => toggleDriver(driver.id)} aria-pressed={checked} aria-label={`选择 ${driver.title}`}><span>{checked ? "✓" : ""}</span></button>
                <div className="roi-driver-name"><b>{driver.id}</b><div><strong>{driver.title}</strong><small>{driver.statusLabel} · {driver.impact}</small></div></div>
                {checked && <label className="roi-value-field"><span>年度价值 / USD</span><input type="number" min="0" step="1000" value={driverValues[driver.id] ?? 0} onChange={(event) => setDriverValue(driver.id, Number(event.target.value))} /><em>{currency.format(safeValue(driverValues[driver.id] ?? 0))}</em></label>}
              </div>;
            })}
          </div>
        </div>
        <div className="roi-summary-panel">
          <div className="roi-panel-heading"><div><span>02 / Calculate value</span><h3>ROI 计算摘要</h3></div><div className="roi-heading-mark inverse"><img src={brandMarkSrc} alt="" /><b>USD</b></div></div>
          <div className="roi-input-grid">
            <label><span>一次性实施成本</span><input type="number" min="0" step="1000" value={implementationCost} onChange={(event) => setImplementationCost(safeValue(Number(event.target.value)))} /><em>{currency.format(implementationCost)}</em></label>
            <label><span>年度运营成本</span><input type="number" min="0" step="1000" value={annualRunCost} onChange={(event) => setAnnualRunCost(safeValue(Number(event.target.value)))} /><em>{currency.format(annualRunCost)}</em></label>
          </div>
          <div className="roi-total-card"><span>年度毛收益</span><strong>{currency.format(totalBenefit)}</strong><small>由 {selectedDrivers.length} 个已选 driver 的年度价值构成</small></div>
          <div className="roi-metric-pair"><div><span>首年净收益</span><strong>{currency.format(firstYearNetBenefit)}</strong></div><div><span>首年 ROI</span><strong>{roi.toFixed(1)}%</strong></div></div>
          <div className="roi-payback"><span>预计回收期</span><strong>{paybackMonths ? `${paybackMonths.toFixed(1)} 个月` : "未达到正向回收"}</strong><small>以年度净收益 {currency.format(netAnnualBenefit)} 计算</small></div>
          <div className="roi-formula"><b>Formula / First-year ROI</b><span>（年度收益 − 年度运营成本 − 一次性实施成本）÷ 一次性实施成本</span></div>
          <div className="roi-export-actions"><button onClick={exportPdf} className="roi-export-button pdf"><span>PDF</span>下载决策摘要 <i>↓</i></button><button onClick={exportExcel} className="roi-export-button excel"><span>XLSX</span>下载可编辑工作簿 <i>↓</i></button></div>
          {exportMessage && <p className="roi-export-message" role="status">{exportMessage}</p>}
        </div>
      </div>
      <div className="roi-disclaimer"><span>重要说明</span><p>此工具输出基于用户输入的年度价值与成本假设，适合形成可讨论的 Business Case 初稿；在对外承诺 ROI 前，应按 driver 卡的数据质量门槛、适用范围与去重规则完成确认。</p></div>
      <div className="roi-pdf-export" ref={pdfRef} aria-hidden="true">
        <header><div><span>OTM VALUE DRIVER LIBRARY</span><h1>ROI Decision Summary</h1></div><b>{date}</b></header>
        <section><span className="pdf-label">Selected value drivers / {selectedDrivers.length.toString().padStart(2, "0")}</span>{selectedDrivers.map((driver) => <div className="pdf-driver" key={driver.id}><b>{driver.id}</b><div><strong>{driver.title}</strong><span>{driver.statusLabel} · {driver.impact}</span></div><em>{currency.format(safeValue(driverValues[driver.id] ?? 0))}</em></div>)}</section>
        <section className="pdf-summary"><span className="pdf-label">ROI calculation</span><div><span>Annual gross benefit</span><strong>{currency.format(totalBenefit)}</strong></div><div><span>Annual operating cost</span><strong>{currency.format(annualRunCost)}</strong></div><div><span>One-time implementation cost</span><strong>{currency.format(implementationCost)}</strong></div><div className="pdf-highlight"><span>First-year ROI</span><strong>{roi.toFixed(1)}%</strong></div><div><span>Expected payback period</span><strong>{paybackMonths ? `${paybackMonths.toFixed(1)} months` : "Not reached"}</strong></div></section>
        <footer>Evidence before assertion · Inputs must be validated before external commitment.</footer>
      </div>
    </section>
  );
}
