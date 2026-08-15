/* Design reminder: “Decision Archive” — customer-owned tasks first; optional evidence reference only when requested. */
import { useEffect, useMemo, useState } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { gateDescription, isHardRoiGate, type EvidenceGate } from "@/lib/evidence";
import type { Driver } from "@/lib/oneOracleDrivers";
import "./layered-workflow.css";

type WorkflowFocus = "optimization" | "audit" | "visibility";
type WorkflowProps = {
  drivers: Driver[];
  evidenceGates: Record<string, EvidenceGate>;
  onEvidenceGateChange: (driverId: string, gate: EvidenceGate) => void;
  brandMarkSrc: string;
  onSelectDriver: (id: string) => void;
  runwayFocus?: WorkflowFocus;
};

type Copy = {
  kicker: string; title: string; intro: string; discovery: string; collaboration: string; evidence: string;
  optimization: string; audit: string; visibility: string; focusCopy: string; owner: string; period: string;
  scope: string; source: string; fallback: string; status: string; statusValues: string[]; required: string;
  hard: string; opportunity: string; next: string; exportReady: string; notReady: string; question: string;
  questions: string[]; sourcePlaceholder: string; fallbackPlaceholder: string; readyCopy: string; notReadyCopy: string;
  referenceOpen: string; referenceClose: string; referenceHint: string; driverAction: string;
};

const COPY: Record<Language, Copy> = {
  zh: {
    kicker: "资料准备度", title: "先完成一件事，再决定要不要继续。", intro: "选择与你最相关的主题，先判断资料准备度；如果需要，再展开查看应该向团队索取哪些资料。",
    discovery: "选择主题", collaboration: "资料参考", evidence: "资料准备度", optimization: "运输计划与装载优化", audit: "运费审计", visibility: "运输可视化",
    focusCopy: "从一个真实的运营问题开始。你不需要现在填写完整清单，也不需要作出购买决定。", owner: "最了解情况的同事", period: "资料期间", scope: "适用范围", source: "资料来自哪里", fallback: "暂时替代方式", status: "准备状态", statusValues: ["还没开始", "正在整理", "等待确认", "已经确认"],
    required: "如果你要继续，这些资料最有帮助", hard: "资料足够尝试价值估算", opportunity: "先作为探索范围", next: "建议下一步", exportReady: "可以生成讨论摘要", notReady: "还不适合做价值估算", question: "可与团队确认的问题",
    questions: ["订单、交付窗口与路线是否能在同一个计划周期被一起查看？", "是否有订单合并、装载率、路线／服务选择和计划变更的样本可回看？", "当前 carrier invoice 是全部审核、抽样审核，还是自动付款？", "重复账单、合同费率、燃油附加费和 accessorial 是否有历史发现或样本？", "运输里程碑、ETA 与延误例外是否能逐票追溯？", "谁最了解加急、客服和计划团队因例外产生的可避免成本？"],
    sourcePlaceholder: "例如：TMS、订单系统或你的工作簿", fallbackPlaceholder: "样本、季度年化或暂时未知", readyCopy: "确认范围、币种、成本和可能重叠的影响后，再把它放进你的讨论摘要。", notReadyCopy: "先确认你的基线，以及最了解这项资料的同事；之后再决定是否需要做价值估算。",
    referenceOpen: "查看资料清单", referenceClose: "收起资料清单", referenceHint: "资料清单仅供你准备下一次讨论时参考；不填写也可以继续探索。", driverAction: "查看这个主题的价值方向"
  },
  en: {
    kicker: "information readiness", title: "Complete one useful step, then decide whether to continue.", intro: "Choose the topic closest to your situation, first assess your information readiness, and only then open the optional reference for what to gather from your team.",
    discovery: "Choose a topic", collaboration: "Reference information", evidence: "Information readiness", optimization: "Shipment Optimization", audit: "Freight Audit", visibility: "Visibility",
    focusCopy: "Start with one real operating question. You do not need to complete a full checklist or make a buying decision now.", owner: "Colleague who knows it", period: "Information period", scope: "Where it applies", source: "Where it comes from", fallback: "Temporary alternative", status: "Preparation status", statusValues: ["Not started", "Being organised", "Awaiting confirmation", "Confirmed"],
    required: "If you continue, these are the most useful items", hard: "Information supports a value estimate", opportunity: "Keep as an exploration range", next: "Suggested next step", exportReady: "Ready for a discussion brief", notReady: "Not ready for a value estimate", question: "Questions to confirm with your team",
    questions: ["Can orders, delivery windows, and routes be considered together in the same planning cycle?", "Do you have a sample of consolidation, load fill, route/service choice, and plan-change history to review?", "Are carrier invoices reviewed 100%, sampled, or released through straight-through payment today?", "Are historical duplicate, contracted-rate, fuel-surcharge, or accessorial findings available for review or sampling?", "Can shipment milestones, ETA, and delay exceptions be traced at shipment level?", "Who best understands avoidable expedite, customer-service, and planner cost triggered by exceptions?"],
    sourcePlaceholder: "e.g., TMS, order system, or your workbook", fallbackPlaceholder: "Sample, annualised quarter, or not yet known", readyCopy: "Confirm scope, currency, cost, and possible overlap before adding this to your discussion brief.", notReadyCopy: "First confirm your baseline and the colleague who knows this information; then decide whether a value estimate is worthwhile.",
    referenceOpen: "View information checklist", referenceClose: "Hide information checklist", referenceHint: "This reference is only for preparing a later team discussion; you can continue exploring without completing it.", driverAction: "View this value direction"
  },
  es: {
    kicker: "preparación de información", title: "Complete un paso útil y decida después si continúa.", intro: "Elija el tema más cercano a su situación, primero valore su preparación de información y abra después la referencia opcional sobre lo que puede solicitar a su equipo.",
    discovery: "Elegir un tema", collaboration: "Información de referencia", evidence: "Preparación de información", optimization: "Optimización de envíos y cargas", audit: "Auditoría de fletes", visibility: "Visibilidad",
    focusCopy: "Empiece con una pregunta operativa real. No necesita completar una lista ni tomar una decisión de compra ahora.", owner: "Colega que lo conoce", period: "Periodo de información", scope: "Dónde aplica", source: "De dónde viene", fallback: "Alternativa temporal", status: "Estado de preparación", statusValues: ["No iniciado", "En preparación", "Pendiente de confirmar", "Confirmado"],
    required: "Si continúa, estos son los elementos más útiles", hard: "La información permite una estimación de valor", opportunity: "Mantener como rango de exploración", next: "Siguiente paso sugerido", exportReady: "Listo para un resumen de discusión", notReady: "Aún no listo para una estimación de valor", question: "Preguntas para confirmar con su equipo",
    questions: ["¿Se pueden considerar pedidos, ventanas de entrega y rutas en el mismo ciclo de planificación?", "¿Tiene una muestra de consolidación, llenado de cargas, elección de ruta/servicio y cambios de plan para revisar?", "¿Las facturas de transporte se revisan al 100%, por muestra o se pagan automáticamente?", "¿Existen hallazgos históricos o muestras de duplicados, tarifas, combustible o accessorials?", "¿Se pueden rastrear hitos, ETA y excepciones de retraso por envío?", "¿Quién entiende mejor los costes evitables de urgencia, servicio y planificación causados por excepciones?"],
    sourcePlaceholder: "p. ej., TMS, sistema de pedidos o su libro", fallbackPlaceholder: "Muestra, trimestre anualizado o aún desconocido", readyCopy: "Confirme alcance, moneda, coste y posible solapamiento antes de añadirlo a su resumen de discusión.", notReadyCopy: "Primero confirme su línea base y el colega que conoce esta información; luego decida si vale la pena una estimación de valor.",
    referenceOpen: "Ver lista de información", referenceClose: "Ocultar lista de información", referenceHint: "Esta referencia solo sirve para preparar una conversación posterior con su equipo; puede continuar explorando sin completarla.", driverAction: "Ver esta dirección de valor"
  }
};

const DISCOVERY_FIELDS: Record<WorkflowFocus, string[]> = {
  optimization: ["Representative orders, releases, and delivery windows", "Shipment history by lane, equipment, and load", "Rate, service, and capacity constraints", "Plan-change, expedite, and exception history", "Planner work pattern and decision rules"],
  audit: ["Annual carrier invoice count", "Total annual freight spend", "Invoice audit-process walkthrough", "Duplicate / rate / surcharge / accessorial history", "Third-party audit fee and scope"],
  visibility: ["Shipment milestone and ETA coverage", "Exception volume and closure time", "Manual status-check minutes", "Avoidable expedite / recovery cost", "Customer-service and planner ownership"]
};

export default function AssessmentWorkflow({ drivers, evidenceGates, onEvidenceGateChange, brandMarkSrc, onSelectDriver, runwayFocus }: WorkflowProps) {
  const { language } = useLanguage();
  const c = COPY[language];
  const [focus, setFocus] = useState<WorkflowFocus>("optimization");
  const [collectionStatus, setCollectionStatus] = useState(c.statusValues[0]);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const targetId = focus === "optimization" ? "01" : focus === "audit" ? "04" : "05";
  const target = drivers.find((driver) => driver.id === targetId);
  const gate = evidenceGates[targetId] ?? "E0";
  const hardEligible = isHardRoiGate(gate);
  const readiness = useMemo(() => ({ optimized: evidenceGates["01"] ?? "E0", audited: evidenceGates["04"] ?? "E0", visible: evidenceGates["05"] ?? "E0" }), [evidenceGates]);
  const questionOffset = focus === "optimization" ? 0 : focus === "audit" ? 2 : 4;
  const focusId = focus === "optimization" ? "OTM-01" : focus === "audit" ? "OTM-04" : "OTM-05";

  useEffect(() => { if (runwayFocus) setFocus(runwayFocus); }, [runwayFocus]);
  useEffect(() => { setCollectionStatus(COPY[language].statusValues[0]); }, [language]);
  const chooseFocus = (next: WorkflowFocus, id: string) => { setFocus(next); onSelectDriver(id); };

  return <section className="assessment-workflow section-wrap section-anchor" id="workflow">
    <div className="section-lead">
      <div><div className="eyebrow"><img src={brandMarkSrc} alt="" />{c.kicker}</div><h2 className="section-heading">{c.title}</h2></div>
      <p className="section-intro">{c.intro}</p>
    </div>
    <div className={`workflow-dossier ${referenceOpen ? "reference-open" : "reference-closed"}`}>
      <div className="workflow-discovery" id="discovery-file">
        <div className="workflow-file-head"><img src={brandMarkSrc} alt="" /><span>{c.discovery}</span><b>{focusId}</b></div>
        <div className="workflow-focus-tabs">
          <button className={focus === "optimization" ? "active" : ""} onClick={() => chooseFocus("optimization", "01")}>{c.optimization}</button>
          <button className={focus === "audit" ? "active" : ""} onClick={() => chooseFocus("audit", "04")}>{c.audit}</button>
          <button className={focus === "visibility" ? "active" : ""} onClick={() => chooseFocus("visibility", "05")}>{c.visibility}</button>
        </div>
        <p>{c.focusCopy}</p>
        <button className="workflow-driver-link" onClick={() => onSelectDriver(targetId)}><span>{c.driverAction}</span><strong>{target?.title}</strong><i>↗</i></button>
        <button className="workflow-reference-toggle" type="button" aria-expanded={referenceOpen} onClick={() => setReferenceOpen((open) => !open)}><span>{referenceOpen ? c.referenceClose : c.referenceOpen}</span><i>{referenceOpen ? "−" : "+"}</i></button>
        <p className="workflow-reference-hint">{c.referenceHint}</p>
      </div>
      <div className="workflow-gate" id="evidence-gate">
        <div className="workflow-panel-label">{c.evidence}</div>
        <h3>{gate} <span>{gateDescription[gate]}</span></h3>
        <select value={gate} onChange={(event) => onEvidenceGateChange(targetId, event.target.value as EvidenceGate)}>{(["E0", "E1", "E2", "E3"] as EvidenceGate[]).map((item) => <option key={item} value={item}>{item} — {gateDescription[item]}</option>)}</select>
        <div className={`workflow-gate-result ${hardEligible ? "ready" : "blocked"}`}><b>{hardEligible ? c.hard : c.opportunity}</b><span>{hardEligible ? c.exportReady : c.notReady}</span></div>
        <div className="workflow-readiness"><span>OTM-01 / {readiness.optimized}</span><span>OTM-04 / {readiness.audited}</span><span>OTM-05 / {readiness.visible}</span></div>
        <p><strong>{c.next}:</strong> {hardEligible ? c.readyCopy : c.notReadyCopy}</p>
      </div>
      {referenceOpen && <div className="workflow-collaboration">
        <div className="workflow-panel-label">{c.collaboration}</div><h3>{c.required}</h3>
        <div className="workflow-questions"><span>{c.question}</span>{c.questions.slice(questionOffset, questionOffset + 2).map((question, index) => <div key={question}><b>Q0{index + 1}</b><strong>{question}</strong></div>)}</div>
        <div className="evidence-field-list">{DISCOVERY_FIELDS[focus].map((field, index) => <div className="evidence-field" key={field}><b>{String(index + 1).padStart(2, "0")}</b><span>{field}</span><i>{index < 2 ? c.owner : index === 2 ? c.period : c.scope}</i></div>)}</div>
        <div className="workflow-record-grid"><label><span>{c.source}</span><input placeholder={c.sourcePlaceholder} /></label><label><span>{c.status}</span><select value={collectionStatus} onChange={(event) => setCollectionStatus(event.target.value)}>{c.statusValues.map((status) => <option key={status}>{status}</option>)}</select></label><label><span>{c.fallback}</span><input placeholder={c.fallbackPlaceholder} /></label></div>
      </div>}
    </div>
  </section>;
}
