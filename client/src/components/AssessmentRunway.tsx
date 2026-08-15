/* Design reminder: “Decision Archive Assessment Runway” — a task path inside the evidence archive. Warm ivory, charcoal, and archive vermilion only; make the user's next move obvious without turning the workbench into a generic dashboard. */
import { useState } from "react";
import { ArrowRight, FileCheck2, LockKeyhole, MapPinned, Scale, Sparkles } from "lucide-react";
import { type Language } from "@/contexts/LanguageContext";
import { gateDescription, isHardRoiGate, type EvidenceGate } from "@/lib/evidence";
import type { Driver } from "@/lib/oneOracleDrivers";
import FreightAuditTask from "./FreightAuditTask";
import "./assessment-runway.css";

export type RunwayPath = "audit" | "visibility" | "broader";
export type RunwayStage = "problem" | "driver" | "discovery" | "evidence" | "roi" | "output";

type PathOption = { id: RunwayPath; driverId: string; eyebrow: string; title: string; copy: string; cue: string; task: string; input: string; output: string };
type RunwayCopy = {
  eyebrow: string; title: string; intro: string; pathLabel: string; choose: string; current: string; nextLabel: string; resultLabel: string;
  stageLabels: [string, string, string, string, string, string]; stageOutputs: [string, string, string, string, string, string];
  nextChoose: string; nextDriver: string; nextDiscovery: string; nextEvidence: string; nextEvidenceLocked: string; nextRoi: string; nextOutput: string;
  actionDriver: string; actionDiscovery: string; actionEvidence: string; actionRoi: string; actionOutput: string;
  noPathTitle: string; noPathCopy: string; gateOpen: string; gateLocked: string; broaderNote: string; fieldNote: string; taskLabel: string; inputLabel: string; outputLabel: string; paths: PathOption[];
};

const COPY: Record<Language, RunwayCopy> = {
  zh: {
    eyebrow: "00 / Assessment Runway", title: "从一个客户问题，走到一份可审计的 Business Case。", intro: "不要先浏览十五个价值域。先选这次客户对话最真实的问题；系统会给出受边界约束的起点、下一步和证据规则。", pathLabel: "选择客户问题", choose: "选择此路径", current: "当前路径", nextLabel: "下一步", resultLabel: "完成后得到",
    stageLabels: ["客户问题", "价值 Driver", "Discovery", "Evidence Gate", "ROI", "输出"], stageOutputs: ["一个被命名的经营问题", "一个受控的起始 Driver", "问题、数据与负责人", "E0–E3 的证据结论", "仅 E2/E3 的 Base ROI", "客户或高管材料"],
    nextChoose: "先选择一个本次要解决的客户问题。", nextDriver: "先查看已选择的 Driver 档案，确认痛点、能力、KPI 与需要的数据。", nextDiscovery: "开始 Discovery：记录客户问题、所需证据和数据负责人。", nextEvidence: "审阅 Evidence Gate：判断这个 Driver 是机会范围，还是可以进入 Base ROI。", nextEvidenceLocked: "当前证据仍不足以进入 Base ROI；先补齐客户基线与负责人验证。", nextRoi: "证据已达到 E2/E3。现在可以把这个 Driver 带进 ROI 工作区。", nextOutput: "ROI 与成本假设准备好后，再生成客户或高管版输出。",
    actionDriver: "查看 Driver 档案", actionDiscovery: "开始 Discovery", actionEvidence: "审阅 Evidence Gate", actionRoi: "打开 ROI 工作区", actionOutput: "前往输出工作区",
    noPathTitle: "尚未选择起始路径", noPathCopy: "请选择一个客户真实在谈的问题。系统不会默认把所有能力、地区或价值塞进同一个案例。", gateOpen: "Base ROI 已解锁", gateLocked: "仅机会范围", broaderNote: "这条路径会把你带到完整 Value Library；它不假装已有 Freight Audit／Visibility 的统一 Discovery 问卷。", fieldNote: "范围越小，证据越可信。", taskLabel: "现在做什么", inputLabel: "你需要", outputLabel: "完成后得到", paths: [
      { id: "audit", driverId: "04", eyebrow: "OTM / 04", title: "运费、发票与结算完整性", copy: "客户在谈发票错误、重复付款、费率偏差或审计覆盖不足。", cue: "开始 Freight Audit 任务", task: "准备下一次 Freight Audit 客户工作会", input: "一个具体问题、三类资料、两类参会角色", output: "可复制或下载的 45 分钟会议清单" },
      { id: "visibility", driverId: "05", eyebrow: "OTM / 05", title: "可视化、异常与服务保障", copy: "客户在谈运输不可视、状态查询、人工作业、延误或加急。", cue: "开始 Visibility 任务", task: "准备可视化与异常客户工作会", input: "一个异常场景、状态线索、运营角色", output: "有边界的 Discovery 起点与会议清单" },
      { id: "broader", driverId: "01", eyebrow: "ONE ORACLE", title: "其他运输或贸易问题", copy: "客户需要讨论规划、承运商、网络、车队、合规或全球贸易能力。", cue: "选择一个 Driver", task: "先定位一个具体 Value Driver", input: "一条运输或贸易问题描述", output: "对应的 Driver 档案与下一步 Discovery" },
    ],
  },
  en: {
    eyebrow: "00 / Assessment Runway", title: "Move from one customer problem to an auditable business case.", intro: "Do not start by browsing fifteen value domains. Choose the most real issue in this customer conversation; the runway shows a bounded starting point, next move, and evidence rule.", pathLabel: "Choose the customer problem", choose: "Choose this path", current: "Current path", nextLabel: "Next move", resultLabel: "You get",
    stageLabels: ["Customer problem", "Value driver", "Discovery", "Evidence gate", "ROI", "Output"], stageOutputs: ["A named operating problem", "A controlled starting driver", "Questions, data and owners", "An E0–E3 evidence decision", "Base ROI from E2/E3 only", "Client or executive material"],
    nextChoose: "Choose one customer problem to address in this conversation.", nextDriver: "Review the selected driver file and confirm its pain point, capability, KPIs, and required evidence.", nextDiscovery: "Start Discovery: document the questions, required evidence, and named data owners.", nextEvidence: "Review the Evidence Gate: decide whether this driver is opportunity-only or can enter Base ROI.", nextEvidenceLocked: "The evidence is not yet eligible for Base ROI. Complete the customer baseline and owner validation first.", nextRoi: "The evidence has reached E2/E3. You can now take this driver into the ROI workspace.", nextOutput: "When ROI and cost assumptions are ready, create the client or executive output.",
    actionDriver: "Review driver file", actionDiscovery: "Begin Discovery", actionEvidence: "Review Evidence Gate", actionRoi: "Open ROI workspace", actionOutput: "Go to output workspace",
    noPathTitle: "No starting path selected", noPathCopy: "Choose the real customer issue being discussed. The system will not place every capability, geography, or value claim into one case by default.", gateOpen: "Base ROI unlocked", gateLocked: "Opportunity only", broaderNote: "This path opens the full Value Library. It does not pretend that Freight Audit or Visibility already has a universal Discovery file for every capability.", fieldNote: "Smaller scope creates more credible evidence.", taskLabel: "DO THIS NOW", inputLabel: "YOU NEED", outputLabel: "YOU GET", paths: [
      { id: "audit", driverId: "04", eyebrow: "OTM / 04", title: "Freight spend, invoice and settlement integrity", copy: "The customer is discussing invoice errors, duplicate payment, rate variance, or limited audit coverage.", cue: "Start Freight Audit task", task: "Prepare the next Freight Audit customer working session", input: "One concrete issue, three inputs, and two meeting roles", output: "A copyable or downloadable 45-minute meeting brief" },
      { id: "visibility", driverId: "05", eyebrow: "OTM / 05", title: "Visibility, exceptions and service assurance", copy: "The customer is discussing low shipment visibility, status checking, manual effort, delays, or expedites.", cue: "Start Visibility task", task: "Prepare a visibility and exceptions working session", input: "One exception scenario, a status trail, and operating roles", output: "A bounded Discovery start and meeting brief" },
      { id: "broader", driverId: "01", eyebrow: "ONE ORACLE", title: "Another transport or trade issue", copy: "The customer needs to discuss planning, carriers, network, fleet, compliance, or global-trade capabilities.", cue: "Choose one driver", task: "First locate one specific value driver", input: "One transport or trade issue description", output: "The related driver file and a next Discovery move" },
    ],
  },
  es: {
    eyebrow: "00 / Assessment Runway", title: "Pase de un problema del cliente a un caso de negocio auditable.", intro: "No empiece revisando quince dominios de valor. Elija el problema más real de esta conversación; la ruta muestra un inicio acotado, el siguiente movimiento y la regla de evidencia.", pathLabel: "Elija el problema del cliente", choose: "Elegir esta ruta", current: "Ruta actual", nextLabel: "Siguiente movimiento", resultLabel: "Obtiene",
    stageLabels: ["Problema del cliente", "Driver de valor", "Discovery", "Puerta de evidencia", "ROI", "Salida"], stageOutputs: ["Un problema operativo nombrado", "Un driver inicial controlado", "Preguntas, datos y responsables", "Una decisión de evidencia E0–E3", "ROI base solo de E2/E3", "Material para cliente o ejecutivo"],
    nextChoose: "Elija un problema del cliente para abordar en esta conversación.", nextDriver: "Revise el archivo del driver seleccionado y confirme dolor, capacidad, KPI y evidencia requerida.", nextDiscovery: "Inicie Discovery: documente preguntas, evidencia requerida y responsables de datos.", nextEvidence: "Revise la puerta de evidencia: decida si el driver es solo oportunidad o puede entrar al ROI base.", nextEvidenceLocked: "La evidencia aún no es elegible para ROI base. Complete primero la línea base y validación de responsables.", nextRoi: "La evidencia llegó a E2/E3. Ahora puede llevar este driver al espacio ROI.", nextOutput: "Cuando ROI y supuestos de coste estén listos, cree la salida para cliente o ejecutivo.",
    actionDriver: "Revisar archivo del driver", actionDiscovery: "Iniciar Discovery", actionEvidence: "Revisar puerta de evidencia", actionRoi: "Abrir espacio ROI", actionOutput: "Ir al espacio de salida",
    noPathTitle: "No hay ruta inicial seleccionada", noPathCopy: "Elija el problema real que se está discutiendo. El sistema no colocará por defecto cada capacidad, geografía o valor en un mismo caso.", gateOpen: "ROI base desbloqueado", gateLocked: "Solo oportunidad", broaderNote: "Esta ruta abre la biblioteca completa de valor. No finge que Freight Audit o Visibility ya tengan un archivo Discovery universal para cada capacidad.", fieldNote: "Un alcance menor crea evidencia más creíble.", taskLabel: "HAGA ESTO AHORA", inputLabel: "NECESITA", outputLabel: "OBTIENE", paths: [
      { id: "audit", driverId: "04", eyebrow: "OTM / 04", title: "Integridad de gasto, facturas y liquidación", copy: "El cliente habla de errores de factura, pagos duplicados, variación de tarifa o cobertura de auditoría limitada.", cue: "Iniciar tarea Freight Audit", task: "Preparar la próxima sesión de trabajo de Freight Audit", input: "Un problema concreto, tres insumos y dos roles", output: "Un brief de reunión de 45 minutos para copiar o descargar" },
      { id: "visibility", driverId: "05", eyebrow: "OTM / 05", title: "Visibilidad, excepciones y garantía de servicio", copy: "El cliente habla de poca visibilidad, consultas de estado, esfuerzo manual, retrasos o urgencias.", cue: "Iniciar tarea Visibility", task: "Preparar una sesión de visibilidad y excepciones", input: "Un escenario de excepción, rastro de estado y roles operativos", output: "Un inicio de Discovery acotado y brief de reunión" },
      { id: "broader", driverId: "01", eyebrow: "ONE ORACLE", title: "Otro problema de transporte o comercio", copy: "El cliente necesita hablar de planificación, carriers, red, flota, cumplimiento o capacidades de comercio global.", cue: "Elegir un driver", task: "Primero ubique un driver de valor específico", input: "Una descripción de problema de transporte o comercio", output: "El archivo del driver relacionado y el siguiente movimiento de Discovery" },
    ],
  },
};

type Props = {
  language: Language;
  path: RunwayPath | null;
  stage: RunwayStage;
  selectedDriver: Driver;
  evidenceGate: EvidenceGate;
  onChoosePath: (path: RunwayPath) => void;
  onGoToDriver: () => void;
  onGoToDiscovery: () => void;
  onGoToEvidence: () => void;
  onGoToRoi: () => void;
  onGoToOutput: () => void;
};

const STAGES: RunwayStage[] = ["problem", "driver", "discovery", "evidence", "roi", "output"];

export default function AssessmentRunway({ language, path, stage, selectedDriver, evidenceGate, onChoosePath, onGoToDriver, onGoToDiscovery, onGoToEvidence, onGoToRoi, onGoToOutput }: Props) {
  const c = COPY[language];
  const [taskOpen, setTaskOpen] = useState(false);
  const activeIndex = STAGES.indexOf(stage);
  const hardEligible = isHardRoiGate(evidenceGate);
  const selectedPath = c.paths.find((item) => item.id === path) ?? null;
  const isBroader = path === "broader";
  const next = !path ? { copy: c.nextChoose, label: c.choose, action: undefined, locked: false } : stage === "driver" ? { copy: c.nextDriver, label: c.actionDriver, action: onGoToDriver, locked: false } : stage === "discovery" ? { copy: c.nextDiscovery, label: c.actionDiscovery, action: onGoToDiscovery, locked: false } : stage === "evidence" && !hardEligible ? { copy: c.nextEvidenceLocked, label: c.actionEvidence, action: onGoToEvidence, locked: true } : stage === "evidence" ? { copy: c.nextRoi, label: c.actionRoi, action: onGoToRoi, locked: false } : stage === "roi" ? { copy: c.nextOutput, label: c.actionOutput, action: onGoToOutput, locked: false } : { copy: c.nextOutput, label: c.actionOutput, action: onGoToOutput, locked: false };

  const chooseTask = (nextPath: RunwayPath) => {
    onChoosePath(nextPath);
    const shouldOpenTask = nextPath === "audit";
    setTaskOpen(shouldOpenTask);
    if (shouldOpenTask) window.setTimeout(() => document.getElementById("freight-audit-task")?.scrollIntoView({ behavior: "smooth", block: "start" }), 10);
  };

  return <section className="assessment-runway section-wrap section-anchor" id="assessment-runway">
    <div className="runway-heading"><div><div className="eyebrow"><span className="runway-eyebrow-mark" aria-hidden="true" /><span>{c.eyebrow}</span></div><h2>{c.title}</h2></div><p>{c.intro}</p></div>
    <div className="runway-problem-zone">
      <div className="runway-zone-label"><span>{c.pathLabel}</span><i /></div>
      <div className="runway-path-cards">
        {c.paths.map((option) => <button key={option.id} type="button" className={`runway-path-card ${path === option.id ? "active" : ""}`} onClick={() => chooseTask(option.id)} aria-pressed={path === option.id}>
          <span className="runway-path-code">{option.eyebrow}</span><h3>{option.title}</h3><p>{option.copy}</p><div className="runway-task-preview"><span>{c.taskLabel}</span><strong>{option.task}</strong><em>{c.inputLabel}: {option.input}</em><em>{c.outputLabel}: {option.output}</em></div><div><span>{path === option.id ? c.current : option.cue}</span><ArrowRight size={16} strokeWidth={1.8} /></div>
        </button>)}
      </div>
    </div>
    {taskOpen && path === "audit" ? <FreightAuditTask language={language} onOpenDiscovery={onGoToDiscovery} /> : <>
    <div className="runway-track" aria-label="Assessment Runway">
      {STAGES.map((key, index) => <button type="button" key={key} className={`runway-step ${index < activeIndex ? "done" : ""} ${index === activeIndex ? "active" : ""} ${index > activeIndex ? "pending" : ""} ${key === "roi" && !hardEligible ? "locked" : ""}`} onClick={key === "driver" ? onGoToDriver : key === "discovery" ? onGoToDiscovery : key === "evidence" ? onGoToEvidence : key === "roi" && hardEligible ? onGoToRoi : key === "output" ? onGoToOutput : undefined} disabled={key === "roi" && !hardEligible}>
        <span className="runway-step-dot">{index < activeIndex ? <FileCheck2 size={13} strokeWidth={2.1} /> : index === activeIndex ? <MapPinned size={13} strokeWidth={2.1} /> : key === "roi" && !hardEligible ? <LockKeyhole size={12} strokeWidth={2.1} /> : String(index + 1).padStart(2, "0")}</span>
        <strong>{c.stageLabels[index]}</strong><em>{c.stageOutputs[index]}</em>
      </button>)}
    </div>
    <div className="runway-next-card">
      <div className="runway-next-icon" aria-hidden="true">{!path ? <Sparkles size={21} strokeWidth={1.6} /> : stage === "evidence" ? <Scale size={21} strokeWidth={1.6} /> : <ArrowRight size={21} strokeWidth={1.6} />}</div>
      <div className="runway-next-copy"><span>{c.nextLabel}</span><h3>{next.copy}</h3>{selectedPath && <p>{isBroader ? c.broaderNote : `${c.current}: ${selectedDriver.title} · ${evidenceGate} — ${gateDescription[evidenceGate]}`}</p>}</div>
      {next.action ? <button type="button" className={`runway-next-action ${next.locked ? "locked" : ""}`} onClick={next.action}><span>{next.label}</span><ArrowRight size={17} strokeWidth={1.9} /></button> : <div className="runway-select-hint"><span>{c.noPathTitle}</span><p>{c.noPathCopy}</p></div>}
    </div>
    {path && <div className={`runway-gate-strip ${hardEligible ? "open" : "locked"}`}><span>{hardEligible ? c.gateOpen : c.gateLocked}</span><i /><b>{evidenceGate} — {gateDescription[evidenceGate]}</b><em>{c.fieldNote}</em></div>}
    </>}
  </section>;
}
