/* Design reminder: "决策档案室" — this workspace is a calculation dossier, using evidence tabs, rulers, and restrained vermilion actions. */
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import type { Driver } from "@/lib/oneOracleDrivers";

type DriverOption = Pick<Driver, "id" | "family" | "title" | "english" | "status" | "statusLabel" | "impact" | "kpis" | "formula">;

type RoiExportWorkspaceProps = { drivers: DriverOption[]; brandMarkSrc: string };

type ImportReport = {
  filename: string;
  matchedDriverIds: string[];
  unmatchedRows: number;
  updatedCosts: string[];
  warnings: string[];
};

type RoiScenario = {
  id: string;
  name: string;
  savedAt: string;
  selectedIds: string[];
  driverValues: Record<string, number>;
  implementationCost: number;
  annualRunCost: number;
};

const today = () => new Intl.DateTimeFormat("en-CA").format(new Date());
const safeValue = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const normalizeText = (value: unknown) => String(value ?? "").toLocaleLowerCase().replace(/[\s_\-–—()./\\%$￥¥,:：]/g, "");
const numericValue = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = String(value ?? "").replace(/[,$￥¥\s]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};
const fieldKey = (row: Record<string, unknown>, aliases: string[]) => Object.keys(row).find((key) => aliases.some((alias) => normalizeText(key) === normalizeText(alias)));
const SCENARIO_STORAGE_KEY = "otm-value-driver-library.roi-scenarios.v1";
const readStoredScenarios = (): RoiScenario[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(SCENARIO_STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(stored) ? stored.filter((item): item is RoiScenario => Boolean(item && typeof item === "object" && "id" in item && "name" in item)) : [];
  } catch { return []; }
};

const ROI_COPY: Record<Language, Record<string, string>> = {
  zh: { title: "把已选择的证据，带进可下载的商业案例。", intro: "选择相关 OTM/GTM driver，录入年度价值与成本假设。网站会即时计算首年 ROI 与回收期，并生成 PDF 或 Excel 摘要。", importTitle: "导入客户 Excel 基线，让假设自动就位。", importCopy: "文件只在当前浏览器中读取，不会上传或保存到服务器。建议使用模板；系统也能识别此前导出的 Excel 工作簿中的标准字段。", choose: "选择客户 Excel", template: "下载空白模板", review: "导入复核", prefilled: "个 driver 已预填", scenarioTitle: "将当前基线保存为情景，并并排审阅价值假设。", scenarioCopy: "情景只保存在当前浏览器。它包含已选 driver、年度价值及实施／运营成本，不会改变原始导入文件。", scenarioName: "情景名称", placeholder: "例如：US 审计 + GTM 代理费基准", new: "另存新情景", update: "更新当前情景", save: "保存当前情景", register: "已保存情景登记", saved: "已存", current: "当前", benefit: "年度收益", roi: "首年 ROI", payback: "回收期", firstYear: "首年净收益", drivers: "个 driver", load: "载入", delete: "删除", empty: "导入或编辑假设后，为当前基线命名并保存，即可在此建立并排的 ROI 比较。", select: "选择价值驱动因素", selectCopy: "只有被选择的 driver 会进入计算与导出文件。金额默认是示例，需由你的客户数据替换。", annualValue: "年度价值 / USD", calculation: "ROI 计算摘要", implementation: "一次性实施成本", runCost: "年度运营成本", gross: "年度毛收益", selectedBenefit: "由已选 driver 的年度价值构成", noPayback: "未达到正向回收", netAnnual: "以年度净收益", formula: "（年度收益 − 年度运营成本 − 一次性实施成本）÷ 一次性实施成本", pdf: "下载决策摘要", excel: "下载可编辑工作簿", note: "重要说明", disclaimer: "此工具输出基于用户输入的年度价值与成本假设，适合形成可讨论的 Business Case 初稿；在对外承诺 ROI 前，应按 driver 卡的数据质量门槛、适用范围、币种及去重规则完成确认。", selectLabel: "选择证据", calculateLabel: "计算价值", importLabel: "导入基线", compareLabel: "保存与比较", months: "个月", otm: "OTM 运输", gtm: "GTM 贸易", formulaFamily: "公式家族", overlap: "OTM/GTM 重叠检查", overlapRisk: "文件延误、例外响应或加急成本可能重复计入。请在导出前指定唯一价值归属。" },
  en: { title: "Turn selected evidence into a downloadable business case.", intro: "Select relevant OTM/GTM drivers and enter annual-value and cost assumptions. The workspace calculates first-year ROI and payback, then produces a PDF or Excel summary.", importTitle: "Import a customer Excel baseline and let assumptions fall into place.", importCopy: "The file is read only in this browser; it is never uploaded or saved to a server. Use the template where possible; standard fields in a previously exported workbook are also recognized.", choose: "Choose customer Excel", template: "Download blank template", review: "Import review", prefilled: "drivers prefilled", scenarioTitle: "Save the current baseline as a scenario and review value assumptions side by side.", scenarioCopy: "Scenarios stay only in this browser. Each includes selected drivers, annual values, and implementation/operating costs; the original imported file is unchanged.", scenarioName: "Scenario name", placeholder: "e.g., US audit + GTM broker-fee baseline", new: "Save as new scenario", update: "Update current scenario", save: "Save current scenario", register: "Saved scenario register", saved: "Saved", current: "Current", benefit: "Annual benefit", roi: "First-year ROI", payback: "Payback", firstYear: "First-year net benefit", drivers: "drivers", load: "Load", delete: "Delete", empty: "After importing or editing assumptions, name and save the baseline to build a side-by-side ROI comparison here.", select: "Select value drivers", selectCopy: "Only selected drivers enter calculations and exports. Values are illustrative until replaced by customer data.", annualValue: "Annual value / USD", calculation: "ROI calculation summary", implementation: "One-time implementation cost", runCost: "Annual operating cost", gross: "Annual gross benefit", selectedBenefit: "from selected-driver annual values", noPayback: "No positive payback", netAnnual: "using annual net benefit", formula: "(Annual benefit − annual operating cost − implementation cost) ÷ implementation cost", pdf: "Download decision summary", excel: "Download editable workbook", note: "Important note", disclaimer: "This output relies on user-entered annual-value and cost assumptions. It is suitable for a discussable business-case draft; confirm data-quality gates, scope, currency, and de-duplication rules before making an external ROI commitment.", selectLabel: "Select evidence", calculateLabel: "Calculate value", importLabel: "Import baseline", compareLabel: "Save & compare", months: "months", otm: "OTM transport", gtm: "GTM trade", formulaFamily: "Formula family", overlap: "OTM/GTM overlap check", overlapRisk: "Document delay, exception response, or expedite cost may be counted twice. Assign one value owner before export." },
  es: { title: "Convierta la evidencia seleccionada en un caso de negocio descargable.", intro: "Seleccione drivers OTM/GTM e introduzca supuestos de valor anual y coste. El espacio calcula ROI y recuperación del primer año, y genera un resumen PDF o Excel.", importTitle: "Importe una línea base Excel del cliente y haga que los supuestos encajen.", importCopy: "El archivo se lee solo en este navegador; nunca se carga ni se guarda en un servidor. Use la plantilla cuando sea posible; también se reconocen campos estándar de libros exportados previamente.", choose: "Elegir Excel del cliente", template: "Descargar plantilla vacía", review: "Revisión de importación", prefilled: "drivers precargados", scenarioTitle: "Guarde la línea base actual como escenario y revise los supuestos de valor en paralelo.", scenarioCopy: "Los escenarios permanecen solo en este navegador. Incluyen drivers seleccionados, valores anuales y costes de implementación/operación; el archivo original no cambia.", scenarioName: "Nombre del escenario", placeholder: "p. ej., línea base de auditoría + honorarios GTM en EE. UU.", new: "Guardar como escenario nuevo", update: "Actualizar escenario actual", save: "Guardar escenario actual", register: "Registro de escenarios guardados", saved: "Guardado", current: "Actual", benefit: "Beneficio anual", roi: "ROI del primer año", payback: "Recuperación", firstYear: "Beneficio neto del primer año", drivers: "drivers", load: "Cargar", delete: "Eliminar", empty: "Después de importar o editar supuestos, nombre y guarde la línea base para crear aquí una comparación ROI en paralelo.", select: "Seleccionar drivers de valor", selectCopy: "Solo los drivers seleccionados entran en cálculos y exportaciones. Los valores son ilustrativos hasta reemplazarlos con datos del cliente.", annualValue: "Valor anual / USD", calculation: "Resumen de cálculo ROI", implementation: "Coste único de implementación", runCost: "Coste operativo anual", gross: "Beneficio bruto anual", selectedBenefit: "de valores anuales de drivers seleccionados", noPayback: "Sin recuperación positiva", netAnnual: "usando beneficio neto anual", formula: "(Beneficio anual − coste operativo anual − coste de implementación) ÷ coste de implementación", pdf: "Descargar resumen de decisión", excel: "Descargar libro editable", note: "Nota importante", disclaimer: "Esta salida se basa en supuestos de valor anual y coste introducidos por el usuario. Es apta para un borrador de caso de negocio; confirme calidad de datos, alcance, moneda y deduplicación antes de comprometer un ROI externo.", selectLabel: "Seleccionar evidencia", calculateLabel: "Calcular valor", importLabel: "Importar línea base", compareLabel: "Guardar y comparar", months: "meses", otm: "Transporte OTM", gtm: "Comercio GTM", formulaFamily: "Familia de fórmulas", overlap: "Control de solapamiento OTM/GTM", overlapRisk: "Retraso documental, respuesta a excepciones o coste urgente pueden contarse dos veces. Asigne un propietario antes de exportar." },
};

export default function RoiExportWorkspace({ drivers, brandMarkSrc }: RoiExportWorkspaceProps) {
  const { language } = useLanguage();
  const c = ROI_COPY[language];
  const locale = language === "zh" ? "zh-CN" : language === "es" ? "es-ES" : "en-US";
  const currency = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }), [locale]);
  const number = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const formatScenarioStamp = (value: string) => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  const [selectedIds, setSelectedIds] = useState<string[]>(["04", "05"]);
  const [driverValues, setDriverValues] = useState<Record<string, number>>({ "04": 285000, "05": 135000 });
  const [implementationCost, setImplementationCost] = useState(190000);
  const [annualRunCost, setAnnualRunCost] = useState(50000);
  const [exportMessage, setExportMessage] = useState("");
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [scenarios, setScenarios] = useState<RoiScenario[]>(readStoredScenarios);
  const [scenarioName, setScenarioName] = useState("");
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDrivers = useMemo(() => drivers.filter((driver) => selectedIds.includes(driver.id)), [drivers, selectedIds]);
  const selectedByFamily = useMemo(() => ({ OTM: selectedDrivers.filter((driver) => driver.family === "OTM"), GTM: selectedDrivers.filter((driver) => driver.family === "GTM") }), [selectedDrivers]);
  const potentialOverlap = selectedIds.includes("05") && selectedIds.includes("GTM-02");
  const totalBenefit = useMemo(() => selectedDrivers.reduce((total, driver) => total + safeValue(driverValues[driver.id] ?? 0), 0), [driverValues, selectedDrivers]);
  const netAnnualBenefit = totalBenefit - safeValue(annualRunCost);
  const firstYearNetBenefit = totalBenefit - safeValue(implementationCost) - safeValue(annualRunCost);
  const roi = implementationCost > 0 ? (firstYearNetBenefit / implementationCost) * 100 : 0;
  const paybackMonths = netAnnualBenefit > 0 ? (implementationCost / netAnnualBenefit) * 12 : null;
  const date = today();
  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? null;
  const scenarioComparison = useMemo(() => scenarios.map((scenario) => {
    const benefit = scenario.selectedIds.reduce((total, id) => total + safeValue(scenario.driverValues[id] ?? 0), 0);
    const netBenefit = benefit - safeValue(scenario.annualRunCost);
    const firstYear = benefit - safeValue(scenario.implementationCost) - safeValue(scenario.annualRunCost);
    return { scenario, benefit, firstYear, roi: scenario.implementationCost > 0 ? (firstYear / scenario.implementationCost) * 100 : 0, payback: netBenefit > 0 ? (scenario.implementationCost / netBenefit) * 12 : null };
  }), [scenarios]);

  useEffect(() => {
    try { window.localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(scenarios)); } catch { /* The workspace remains usable when local storage is unavailable. */ }
  }, [scenarios]);

  const updateMessage = (message: string) => {
    setExportMessage(message);
    window.setTimeout(() => setExportMessage(""), 4200);
  };

  const toggleDriver = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const setDriverValue = (id: string, value: number) => setDriverValues((current) => ({ ...current, [id]: safeValue(value) }));

  const saveScenario = () => {
    const name = scenarioName.trim() || `未命名情景 ${scenarios.length + 1}`;
    const now = new Date().toISOString();
    const snapshot: RoiScenario = { id: activeScenarioId ?? `scenario-${Date.now().toString(36)}`, name, savedAt: now, selectedIds: selectedIds.slice(), driverValues: { ...driverValues }, implementationCost: safeValue(implementationCost), annualRunCost: safeValue(annualRunCost) };
    const isUpdate = Boolean(activeScenarioId && scenarios.some((scenario) => scenario.id === activeScenarioId));
    setScenarios((current) => isUpdate ? current.map((scenario) => scenario.id === snapshot.id ? snapshot : scenario) : current.concat(snapshot));
    setActiveScenarioId(snapshot.id);
    setScenarioName(name);
    updateMessage(isUpdate ? `“${name}” 已更新并保存在当前浏览器。` : `“${name}” 已保存，可在下方与其他情景并排比较。`);
  };

  const loadScenario = (scenario: RoiScenario) => {
    setSelectedIds(scenario.selectedIds.slice());
    setDriverValues({ ...scenario.driverValues });
    setImplementationCost(safeValue(scenario.implementationCost));
    setAnnualRunCost(safeValue(scenario.annualRunCost));
    setScenarioName(scenario.name);
    setActiveScenarioId(scenario.id);
    updateMessage(`已载入“${scenario.name}”。ROI 工作区与后续导出将使用该情景。`);
  };

  const startNewScenario = () => {
    setActiveScenarioId(null);
    setScenarioName(scenarioName ? `${scenarioName} — 比较版` : "");
    updateMessage("当前数值已保留；请命名后保存为新的独立情景。 ");
  };

  const removeScenario = (scenario: RoiScenario) => {
    if (!window.confirm(`删除“${scenario.name}”？此操作只会移除本浏览器中保存的情景。`)) return;
    setScenarios((current) => current.filter((item) => item.id !== scenario.id));
    if (activeScenarioId === scenario.id) { setActiveScenarioId(null); setScenarioName(""); }
    updateMessage(`“${scenario.name}” 已从本浏览器移除。`);
  };

  const downloadTemplate = () => {
    const driverBaseline = drivers.map((driver) => ({
      "Driver ID": driver.id,
      "Capability Family": driver.family,
      "Value Driver": driver.title,
      "ROI Formula Family": driver.formula,
      "Annual Benefit (USD)": "",
      "Evidence Notes": "",
    }));
    const costAssumptions = [
      { "Assumption": "One-time implementation cost", "Value": "", "Unit": "USD" },
      { "Assumption": "Annual operating cost", "Value": "", "Unit": "USD" },
    ];
    const workbook = XLSX.utils.book_new();
    const driverSheet = XLSX.utils.json_to_sheet(driverBaseline);
    const costSheet = XLSX.utils.json_to_sheet(costAssumptions);
    driverSheet["!cols"] = [{ wch: 12 }, { wch: 42 }, { wch: 24 }, { wch: 30 }];
    costSheet["!cols"] = [{ wch: 34 }, { wch: 18 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, driverSheet, "Driver Baseline");
    XLSX.utils.book_append_sheet(workbook, costSheet, "Cost Assumptions");
    XLSX.writeFile(workbook, "one-oracle-otm-gtm-roi-baseline-template.xlsx", { compression: true });
    updateMessage("空白基线模板已开始下载。请填写年度价值与成本后再导入。 ");
  };

  const importBaseline = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["xlsx", "xls", "csv"].includes(extension)) { updateMessage("请选择 .xlsx、.xls 或 .csv 格式的 Excel 基线文件。 "); return; }
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheets = workbook.SheetNames.map((sheetName) => ({
        name: sheetName,
        rows: XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: "" }),
      }));
      const importedValues: Record<string, number> = {};
      const matchedDriverIds: string[] = [];
      const warnings: string[] = [];
      let unmatchedRows = 0;
      let importedImplementationCost: number | null = null;
      let importedAnnualRunCost: number | null = null;

      sheets.forEach(({ rows }) => {
        if (!rows.length) return;
        const idKey = fieldKey(rows[0], ["Driver ID", "Value Driver ID", "价值驱动编号", "驱动因素编号"]);
        const nameKey = fieldKey(rows[0], ["Value Driver", "Driver Name", "价值驱动因素", "价值驱动名称"]);
        const benefitKey = fieldKey(rows[0], ["Annual Benefit (USD)", "Annual Benefit", "Annual Value", "年度价值", "年度价值（USD）"]);
        if (benefitKey && (idKey || nameKey)) {
          rows.forEach((row) => {
            const id = String(idKey ? row[idKey] : "").padStart(2, "0");
            const name = String(nameKey ? row[nameKey] : "");
            const driver = drivers.find((item) => item.id === id) ?? drivers.find((item) => normalizeText(item.title) === normalizeText(name) || normalizeText(item.english) === normalizeText(name));
            const value = numericValue(row[benefitKey]);
            if (driver && value !== null) { importedValues[driver.id] = safeValue(value); matchedDriverIds.push(driver.id); }
            else if (value !== null) unmatchedRows += 1;
          });
        }

        const assumptionKey = fieldKey(rows[0], ["Assumption", "Metric", "假设", "指标"]);
        const valueKey = fieldKey(rows[0], ["Value", "Value (USD / %)", "金额", "数值"]);
        if (assumptionKey && valueKey) {
          rows.forEach((row) => {
            const label = normalizeText(row[assumptionKey]);
            const value = numericValue(row[valueKey]);
            if (value === null) return;
            if (["onetimeimplementationcost", "implementationcost", "一次性实施成本", "实施成本"].some((item) => label.includes(normalizeText(item)))) importedImplementationCost = safeValue(value);
            if (["annualoperatingcost", "annualruncost", "年度运营成本", "运营成本"].some((item) => label.includes(normalizeText(item)))) importedAnnualRunCost = safeValue(value);
          });
        }
      });

      const uniqueMatchedIds = Array.from(new Set(matchedDriverIds));
      const updatedCosts: string[] = [];
      if (importedImplementationCost !== null) { setImplementationCost(importedImplementationCost); updatedCosts.push("一次性实施成本"); }
      if (importedAnnualRunCost !== null) { setAnnualRunCost(importedAnnualRunCost); updatedCosts.push("年度运营成本"); }
      if (uniqueMatchedIds.length) {
        setDriverValues((current) => ({ ...current, ...importedValues }));
        setSelectedIds((current) => Array.from(new Set(current.concat(uniqueMatchedIds))));
      }
      if (uniqueMatchedIds.length || updatedCosts.length) { setScenarioName(file.name.replace(/\.(xlsx|xls|csv)$/i, "")); setActiveScenarioId(null); }
      if (!uniqueMatchedIds.length && !updatedCosts.length) warnings.push("没有找到可识别的 Driver ID / Value Driver 或成本假设列。请使用下载的模板，或检查列名。 ");
      if (unmatchedRows) warnings.push(`${unmatchedRows} 行年度价值没有匹配到当前 Value Driver，未被写入。`);
      setImportReport({ filename: file.name, matchedDriverIds: uniqueMatchedIds, unmatchedRows, updatedCosts, warnings });
      updateMessage(uniqueMatchedIds.length || updatedCosts.length ? "基线数据已导入并预填到 ROI 工作区，请复核高亮字段。" : "已读取文件，但未找到可预填的字段。 ");
    } catch {
      setImportReport({ filename: file.name, matchedDriverIds: [], unmatchedRows: 0, updatedCosts: [], warnings: ["文件无法读取。请确认它不是受密码保护的 Excel 文件，并尝试重新导出为 .xlsx。"] });
      updateMessage("Excel 文件未能读取，请查看导入复核提示。 ");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const exportExcel = () => {
    if (!selectedDrivers.length) { updateMessage("请至少选择一个价值驱动因素后再导出。"); return; }
    const summaryRows = [
      ["One Oracle Value Driver Library — ROI Summary"],
      ["Report date", date],
      ["Selected drivers", selectedDrivers.length],
      ["OTM drivers", selectedByFamily.OTM.length],
      ["GTM drivers", selectedByFamily.GTM.length],
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
      "Capability Family": driver.family,
      "Value Driver": driver.title,
      "English Name": driver.english,
      "Evidence Status": driver.statusLabel,
      "Value Path": driver.impact,
      "Primary KPIs": driver.kpis.join(" / "),
      "ROI Formula Family": driver.formula,
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
    summarySheet["B13"].z = "0.0%";
    const driversSheet = XLSX.utils.json_to_sheet(driverRows);
    driversSheet["!cols"] = [{ wch: 12 }, { wch: 18 }, { wch: 38 }, { wch: 34 }, { wch: 15 }, { wch: 18 }, { wch: 35 }, { wch: 48 }, { wch: 22 }];
    const assumptionsSheet = XLSX.utils.json_to_sheet(assumptionRows);
    assumptionsSheet["!cols"] = [{ wch: 32 }, { wch: 76 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "ROI Summary");
    XLSX.utils.book_append_sheet(workbook, driversSheet, "Selected Drivers");
    XLSX.utils.book_append_sheet(workbook, assumptionsSheet, "Assumptions");
    XLSX.writeFile(workbook, `one-oracle-otm-gtm-roi-${date}.xlsx`, { compression: true });
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
      <div className="section-lead"><div><div className="eyebrow">04 / ROI export workspace</div><h2 className="section-heading">{c.title}</h2></div><p className="section-intro">{c.intro}</p></div>
      <div className="roi-import-dossier">
        <div className="roi-import-copy"><div className="roi-import-seal"><img src={brandMarkSrc} alt="" /> <span>00 / {c.importLabel}</span></div><h3>{c.importTitle}</h3><p>{c.importCopy}</p></div>
        <div className="roi-import-actions"><input ref={fileInputRef} id="baseline-upload" className="roi-file-input" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBaseline(file); }} /><label className="roi-import-button primary" htmlFor="baseline-upload"><span>IMPORT</span>{c.choose} <i>↑</i></label><button className="roi-import-button" onClick={downloadTemplate}><span>TEMPLATE</span>{c.template} <i>↓</i></button></div>
        {importReport && <div className="roi-import-report"><div><b>{c.review}</b><span>{importReport.filename}</span></div><p><strong>{importReport.matchedDriverIds.length}</strong> {c.prefilled}{importReport.updatedCosts.length ? ` · ${c.saved}` : ""}.</p>{importReport.warnings.map((warning) => <small key={warning}>{warning}</small>)}</div>}
      </div>
      <div className="roi-scenario-dossier">
        <div className="roi-scenario-copy"><div className="roi-import-seal"><img src={brandMarkSrc} alt="" /> <span>00.1 / {c.compareLabel}</span></div><h3>{c.scenarioTitle}</h3><p>{c.scenarioCopy}</p></div>
        <div className="roi-scenario-form"><label><span>{c.scenarioName}</span><input value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} placeholder={c.placeholder} /></label>{activeScenario && <button className="roi-import-button" onClick={startNewScenario}><span>NEW</span>{c.new} <i>↗</i></button>}<button className="roi-import-button primary" onClick={saveScenario}><span>{activeScenario ? "UPDATE" : "SAVE"}</span>{activeScenario ? c.update : c.save} <i>+</i></button></div>
        {scenarioComparison.length > 0 ? <div className="roi-comparison-grid"><div className="roi-comparison-heading"><span>{c.register}</span><b>{number.format(scenarioComparison.length).padStart(2, "0")} {c.saved}</b></div>{scenarioComparison.map(({ scenario, benefit, firstYear, roi: scenarioRoi, payback }) => <article className={`roi-scenario-card ${activeScenarioId === scenario.id ? "active" : ""}`} key={scenario.id}><div className="scenario-card-top"><div><span>SCENARIO / {formatScenarioStamp(scenario.savedAt)}</span><h4>{scenario.name}</h4></div><i>{activeScenarioId === scenario.id ? c.current : c.saved}</i></div><div className="scenario-card-metrics"><div><span>{c.benefit}</span><strong>{currency.format(benefit)}</strong></div><div><span>{c.roi}</span><strong>{scenarioRoi.toFixed(1)}%</strong></div><div><span>{c.payback}</span><strong>{payback ? `${payback.toFixed(1)} ${c.months}` : "—"}</strong></div></div><p>{c.firstYear} {currency.format(firstYear)} · {scenario.selectedIds.length} {c.drivers}</p><div className="scenario-card-actions"><button onClick={() => loadScenario(scenario)}>{c.load}</button><button onClick={() => removeScenario(scenario)}>{c.delete}</button></div></article>)}</div> : <div className="roi-empty-scenario"><span>SCENARIO REGISTER / EMPTY</span><p>{c.empty}</p></div>}
      </div>
      <div className="roi-workspace">
        <div className="roi-selection-panel">
          <div className="roi-panel-heading"><div><span>01 / {c.selectLabel}</span><h3>{c.select}</h3></div><div className="roi-heading-mark"><img src={brandMarkSrc} alt="" /><b>{selectedDrivers.length.toString().padStart(2, "0")} / {drivers.length.toString().padStart(2, "0")}</b></div></div>
          <p className="roi-panel-copy">{c.selectCopy}</p>
          <div className="roi-driver-list">
            {drivers.map((driver) => {
              const checked = selectedIds.includes(driver.id);
              return <div className={`roi-driver-row ${driver.status} ${driver.family.toLowerCase()} ${checked ? "checked" : ""}`} key={driver.id}>
                <button className="roi-check" onClick={() => toggleDriver(driver.id)} aria-pressed={checked} aria-label={`${c.select} ${driver.title}`}><span>{checked ? "✓" : ""}</span></button>
                <div className="roi-driver-name"><b>{driver.id}</b><div><strong><i className={`roi-family-chip ${driver.family.toLowerCase()}`}>{driver.family}</i>{driver.title}</strong><small>{driver.statusLabel} · {driver.impact}</small></div></div>
                {checked && <label className="roi-value-field"><span>{c.annualValue}</span><input type="number" min="0" step="1000" value={driverValues[driver.id] ?? 0} onChange={(event) => setDriverValue(driver.id, Number(event.target.value))} /><em>{currency.format(safeValue(driverValues[driver.id] ?? 0))}</em></label>}
              </div>;
            })}
          </div>
        </div>
        <div className="roi-summary-panel">
          <div className="roi-panel-heading"><div><span>02 / {c.calculateLabel}</span><h3>{c.calculation}</h3></div><div className="roi-heading-mark inverse"><img src={brandMarkSrc} alt="" /><b>USD</b></div></div>
          <div className="roi-input-grid">
            <label><span>{c.implementation}</span><input type="number" min="0" step="1000" value={implementationCost} onChange={(event) => setImplementationCost(safeValue(Number(event.target.value)))} /><em>{currency.format(implementationCost)}</em></label>
            <label><span>{c.runCost}</span><input type="number" min="0" step="1000" value={annualRunCost} onChange={(event) => setAnnualRunCost(safeValue(Number(event.target.value)))} /><em>{currency.format(annualRunCost)}</em></label>
          </div>
          <div className="roi-total-card"><span>{c.gross}</span><strong>{currency.format(totalBenefit)}</strong><small>{c.selectedBenefit}</small></div>
          <div className="roi-metric-pair"><div><span>{c.firstYear}</span><strong>{currency.format(firstYearNetBenefit)}</strong></div><div><span>{c.roi}</span><strong>{roi.toFixed(1)}%</strong></div></div>
          <div className="roi-payback"><span>{c.payback}</span><strong>{paybackMonths ? `${paybackMonths.toFixed(1)} ${c.months}` : c.noPayback}</strong><small>{c.netAnnual} {currency.format(netAnnualBenefit)}</small></div>
          <div className="roi-formula"><b>Formula / First-year ROI</b><span>{c.formula}</span></div>
          <div className={`roi-overlap-check ${potentialOverlap ? "alert" : ""}`}><b>{c.overlap}</b><span>{potentialOverlap ? c.overlapRisk : `${c.otm}: ${selectedByFamily.OTM.length} · ${c.gtm}: ${selectedByFamily.GTM.length}`}</span></div>
          <div className="roi-export-actions"><button onClick={exportPdf} className="roi-export-button pdf"><span>PDF</span>{c.pdf} <i>↓</i></button><button onClick={exportExcel} className="roi-export-button excel"><span>XLSX</span>{c.excel} <i>↓</i></button></div>
          {exportMessage && <p className="roi-export-message" role="status">{exportMessage}</p>}
        </div>
      </div>
      <div className="roi-disclaimer"><span>{c.note}</span><p>{c.disclaimer}</p></div>
      <div className="roi-pdf-export" ref={pdfRef} aria-hidden="true">
        <header><div><span>ONE ORACLE VALUE DRIVER LIBRARY</span><h1>{c.calculation}</h1></div><b>{date}</b></header>
        <section><span className="pdf-label">Selected value drivers / {selectedDrivers.length.toString().padStart(2, "0")}</span>{selectedDrivers.map((driver) => <div className="pdf-driver" key={driver.id}><b>{driver.id}</b><div><strong>{driver.title}</strong><span>{driver.statusLabel} · {driver.impact}</span></div><em>{currency.format(safeValue(driverValues[driver.id] ?? 0))}</em></div>)}</section>
        <section className="pdf-summary"><span className="pdf-label">ROI calculation</span><div><span>{c.gross}</span><strong>{currency.format(totalBenefit)}</strong></div><div><span>{c.runCost}</span><strong>{currency.format(annualRunCost)}</strong></div><div><span>{c.implementation}</span><strong>{currency.format(implementationCost)}</strong></div><div className="pdf-highlight"><span>{c.roi}</span><strong>{roi.toFixed(1)}%</strong></div><div><span>{c.payback}</span><strong>{paybackMonths ? `${paybackMonths.toFixed(1)} ${c.months}` : c.noPayback}</strong></div></section>
        <footer>Evidence before assertion · Inputs must be validated before external commitment.</footer>
      </div>
    </section>
  );
}
