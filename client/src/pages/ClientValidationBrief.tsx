/* Design reminder: "验证简报 / Validation Brief" — quiet luxury client decision paper; one decision, one blue hue, progressive disclosure, no archive-density or dark dashboard styling. */
import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, CircleHelp, FileCheck2, Languages, ListChecks, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import "./ClientValidationBrief.css";

type Copy = {
  eyebrow: string;
  phase: string;
  archiveLink: string;
  decisionKicker: string;
  signature: string;
  approvalLabel: string;
  approvalValue: string;
  title: string;
  subtitle: string;
  factKicker: string;
  factTitles: [string, string, string];
  factBodies: [string, string, string];
  dataKicker: string;
  dataTitle: string;
  dataBody: string;
  dataPoints: [string, string, string];
  cta: string;
  planKicker: string;
  planTitle: string;
  planBody: string;
  steps: Array<{ number: string; title: string; body: string; evidence: string }>;
  planFoot: string;
  status: string;
  statusDone: string;
  onlyAction: string;
  noFinancial: string;
  language: string;
};

const COPY: Record<Language, Copy> = {
  en: {
    eyebrow: "IBM TLS · OTM VALUE ASSESSMENT",
    phase: "PHASE 1 · VALIDATION BRIEF",
    archiveLink: "View the Decision Archive",
    decisionKicker: "VALIDATION DECISION",
    signature: "VALIDATE FIRST. DECIDE SECOND.",
    approvalLabel: "DECISION REQUESTED",
    approvalValue: "Approve a bounded Phase 1 validation plan",
    title: "Before deciding on OTM, validate whether Freight Audit & Visibility can create a cashable business case for IBM TLS.",
    subtitle: "This is a bounded evidence-validation step — not an enterprise deployment decision.",
    factKicker: "WHY START HERE",
    factTitles: ["Invoice leakage may be addressable.", "Manual status checking may release capacity.", "Exception and expedite causes may be measurable."],
    factBodies: ["Validate the invoice population, rate and accessorial evidence before claiming recovery.", "Measure effort by role before calling productivity a financial benefit.", "Separate operating disruption from finance-approved risk avoidance."],
    dataKicker: "DATA POSITION",
    dataTitle: "Enough to begin validation. Not yet enough to approve an investment case.",
    dataBody: "We have sufficient context to define a bounded Phase 1. Three inputs will unlock the next decision.",
    dataPoints: ["Confirm the operating population", "Assign Wave 1 data owners", "Agree Finance treatment"],
    cta: "Review the validation plan",
    planKicker: "THE NEXT SMALL STEP",
    planTitle: "A three-part validation plan",
    planBody: "Each action is deliberately small, owned and reversible. No financial result is created by completing these steps; they only make the evidence review possible.",
    steps: [
      { number: "01", title: "Confirm the Phase 1 scope", body: "Name the region, shipment and invoice population, modes, carriers and system boundary.", evidence: "Output: a bounded population with a named owner." },
      { number: "02", title: "Assign Wave 1 data owners", body: "Request freight-spend, shipment, invoice, leakage and status-check evidence at an agreed grain and period.", evidence: "Output: three delivery owners and dates." },
      { number: "03", title: "Agree Finance treatment", body: "Separate capacity release from cashable benefits and confirm how any benefit may enter a decision case.", evidence: "Output: a Finance-approved treatment path." },
    ],
    planFoot: "A decision case becomes possible only after scope, customer evidence, TCO and Finance treatment are confirmed.",
    status: "Selected for discussion",
    statusDone: "Discussion point noted",
    onlyAction: "One decision · one next step",
    noFinancial: "No financial value is shown until customer evidence, TCO and Finance treatment are confirmed.",
    language: "Language",
  },
  zh: {
    eyebrow: "IBM TLS · OTM 价值评估",
    phase: "第一阶段 · 验证简报",
    archiveLink: "查看 Decision Archive",
    decisionKicker: "验证决策",
    signature: "先验证，再决定。",
    approvalLabel: "当前请求的决策",
    approvalValue: "批准一个有边界的第一阶段验证计划",
    title: "在决定是否采用 OTM 之前，先验证 Freight Audit 与 Visibility 能否为 IBM TLS 形成可兑现的商业案例。",
    subtitle: "这是一项有边界的证据验证步骤，而不是企业级部署决策。",
    factKicker: "为什么从这里开始",
    factTitles: ["发票泄漏可能存在可验证空间。", "人工状态查询可能释放产能。", "异常与加急的根因可能可被量化。"],
    factBodies: ["先验证发票人口、费率与附加费证据，再讨论可回收金额。", "先按岗位度量投入，再将生产率视为财务收益。", "将运营中断与经财务认可的风险规避区分开来。"],
    dataKicker: "数据位置",
    dataTitle: "足以开始验证；尚不足以批准投资案例。",
    dataBody: "现有信息足以界定一个有边界的第一阶段。三个输入将解锁下一项决策。",
    dataPoints: ["确认运营人口", "指定 Wave 1 数据 owner", "确认 Finance 处理规则"],
    cta: "查看验证计划",
    planKicker: "下一个小步骤",
    planTitle: "三部分验证计划",
    planBody: "每一步都刻意保持小、明确责任、可逆。完成这些步骤不会产生任何财务结论；它们只让证据审阅成为可能。",
    steps: [
      { number: "01", title: "确认第一阶段范围", body: "明确地区、运输与发票人口、模式、carrier 和系统边界。", evidence: "产出：一个有边界且有明确 owner 的运营人口。" },
      { number: "02", title: "指定 Wave 1 数据 owner", body: "按约定粒度和期间请求运费、运输、发票、泄漏和状态查询证据。", evidence: "产出：三位交付 owner 与日期。" },
      { number: "03", title: "确认 Finance 处理规则", body: "将产能释放与可兑现收益分开，并确认任何收益如何进入决策案例。", evidence: "产出：一条经 Finance 认可的处理路径。" },
    ],
    planFoot: "只有在范围、客户证据、TCO 和 Finance 处理规则均得到确认后，才可能形成决策案例。",
    status: "已选为讨论项",
    statusDone: "讨论项已记录",
    onlyAction: "一个决策 · 一个下一步",
    noFinancial: "在客户证据、TCO 和 Finance 处理规则确认前，不展示任何财务价值。",
    language: "语言",
  },
  es: {
    eyebrow: "IBM TLS · EVALUACIÓN DE VALOR OTM",
    phase: "FASE 1 · BRIEF DE VALIDACIÓN",
    archiveLink: "Ver el Decision Archive",
    decisionKicker: "DECISIÓN DE VALIDACIÓN",
    signature: "VALIDAR PRIMERO. DECIDIR DESPUÉS.",
    approvalLabel: "DECISIÓN SOLICITADA",
    approvalValue: "Aprobar un plan acotado de validación de Fase 1",
    title: "Antes de decidir sobre OTM, validemos si Freight Audit y Visibility pueden crear un caso de negocio realizable para IBM TLS.",
    subtitle: "Es un paso acotado de validación de evidencia, no una decisión de despliegue empresarial.",
    factKicker: "POR QUÉ EMPEZAR AQUÍ",
    factTitles: ["La fuga de facturas puede ser abordable.", "La consulta manual de estado puede liberar capacidad.", "Las causas de excepciones y urgencias pueden medirse."],
    factBodies: ["Valide la población de facturas, tarifas y evidencia de recargos antes de reclamar recuperación.", "Mida el esfuerzo por rol antes de llamar beneficio financiero a la productividad.", "Separe la disrupción operativa de la evitación de riesgo aprobada por Finanzas."],
    dataKicker: "POSICIÓN DE DATOS",
    dataTitle: "Suficiente para iniciar la validación. Aún no para aprobar un caso de inversión.",
    dataBody: "Hay contexto suficiente para definir una Fase 1 acotada. Tres insumos desbloquearán la próxima decisión.",
    dataPoints: ["Confirmar la población operativa", "Asignar responsables de datos Wave 1", "Acordar el tratamiento de Finanzas"],
    cta: "Revisar el plan de validación",
    planKicker: "EL PRÓXIMO PASO PEQUEÑO",
    planTitle: "Un plan de validación en tres partes",
    planBody: "Cada acción es pequeña, tiene responsable y es reversible. Completarlas no crea un resultado financiero; solo hace posible la revisión de evidencia.",
    steps: [
      { number: "01", title: "Confirmar el alcance de Fase 1", body: "Nombre región, población de envíos y facturas, modos, carriers y límite de sistemas.", evidence: "Resultado: una población acotada con responsable nombrado." },
      { number: "02", title: "Asignar responsables de datos Wave 1", body: "Solicite evidencia de gasto, envíos, facturas, fugas y consultas de estado con granularidad y período acordados.", evidence: "Resultado: tres responsables y fechas de entrega." },
      { number: "03", title: "Acordar el tratamiento de Finanzas", body: "Separe la liberación de capacidad de beneficios realizables y confirme cómo entra un beneficio al caso.", evidence: "Resultado: una ruta de tratamiento aprobada por Finanzas." },
    ],
    planFoot: "Un caso de decisión solo es posible después de confirmar alcance, evidencia del cliente, TCO y tratamiento de Finanzas.",
    status: "Seleccionado para discusión",
    statusDone: "Punto de discusión registrado",
    onlyAction: "Una decisión · un siguiente paso",
    noFinancial: "No se muestra valor financiero hasta confirmar evidencia del cliente, TCO y tratamiento de Finanzas.",
    language: "Idioma",
  },
};

const LANGUAGES: Array<{ id: Language; label: string }> = [
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
  { id: "zh", label: "中" },
];

export default function ClientValidationBrief() {
  const { language, setLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const copy = COPY[language];
  const [planOpen, setPlanOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const activeStepCopy = useMemo(() => activeStep === null ? null : copy.steps[activeStep], [activeStep, copy.steps]);

  const openPlan = () => {
    setPlanOpen(true);
    window.setTimeout(() => document.getElementById("validation-plan")?.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
  };

  return (
    <main className="validation-brief-shell">
      <div className="validation-brief-paper">
        <header className="brief-topline">
          <div className="brief-wordmark" aria-label="IBM TLS OTM Value Assessment">
            <span className="brief-mark" aria-hidden="true"><i /><i /></span>
            <span>{copy.eyebrow}</span>
          </div>
          <div className="brief-tools">
            <span className="phase-label">{copy.phase}</span>
            <div className="brief-language" aria-label={copy.language}>
              {LANGUAGES.map((item) => <button key={item.id} onClick={() => setLanguage(item.id)} className={language === item.id ? "active" : ""} aria-pressed={language === item.id}>{item.label}</button>)}
            </div>
          </div>
        </header>

        <section className="brief-hero" aria-labelledby="brief-title">
          <div className="brief-hero-copy">
            <div className="brief-decision-line"><span>{copy.decisionKicker}</span><i /><b>{copy.onlyAction}</b></div>
            <h1 id="brief-title">{copy.title}</h1>
            <p>{copy.subtitle}</p>
            <div className="approval-memo"><span>{copy.approvalLabel}</span><strong>{copy.approvalValue}</strong></div>
          </div>
          <aside className="validation-seal" aria-label={copy.signature}>
            <span className="seal-lines" aria-hidden="true"><i /><i /><i /></span>
            <b>01</b>
            <em>{copy.signature}</em>
          </aside>
        </section>

        <section className="brief-facts" aria-label={copy.factKicker}>
          <div className="brief-section-label"><span>{copy.factKicker}</span><i /></div>
          <div className="fact-grid">
            {copy.factTitles.map((title, index) => <article className="fact-item" key={title}>
              <span className="fact-number">0{index + 1}</span>
              <h2>{title}</h2>
              <p>{copy.factBodies[index]}</p>
            </article>)}
          </div>
        </section>

        <section className="brief-data-position" aria-label={copy.dataKicker}>
          <div className="data-position-main">
            <div className="brief-section-label"><span>{copy.dataKicker}</span><i /></div>
            <h2>{copy.dataTitle}</h2>
            <p>{copy.dataBody}</p>
          </div>
          <div className="data-position-points">
            {copy.dataPoints.map((point) => <div key={point}><FileCheck2 size={15} strokeWidth={1.8} /><span>{point}</span></div>)}
          </div>
          <button className="validation-cta" type="button" onClick={openPlan} aria-expanded={planOpen} aria-controls="validation-plan">
            <span>{copy.cta}</span><ArrowRight size={18} strokeWidth={1.8} />
          </button>
        </section>

        <section id="validation-plan" className={`validation-plan ${planOpen ? "open" : ""}`} aria-hidden={!planOpen}>
          <div className="plan-heading"><div><span>{copy.planKicker}</span><h2>{copy.planTitle}</h2></div><p>{copy.planBody}</p></div>
          <div className="plan-list">
            {copy.steps.map((step, index) => <button key={step.number} type="button" onClick={() => setActiveStep(activeStep === index ? null : index)} className={`plan-step ${activeStep === index ? "active" : ""}`} aria-expanded={activeStep === index}>
              <span className="plan-number">{step.number}</span>
              <span className="plan-copy"><strong>{step.title}</strong><em>{step.body}</em>{activeStep === index && <small><Check size={14} strokeWidth={2} /> {step.evidence}</small>}</span>
              <ChevronDown className="plan-chevron" size={18} strokeWidth={1.6} />
            </button>)}
          </div>
          <p className="plan-foot"><ShieldCheck size={16} strokeWidth={1.6} />{copy.planFoot}</p>
        </section>

        <footer className="brief-footer">
          <p><CircleHelp size={15} strokeWidth={1.7} /> {copy.noFinancial}</p>
          <button type="button" onClick={() => navigate("/")}><ListChecks size={15} strokeWidth={1.7} /> {copy.archiveLink}</button>
        </footer>
      </div>
    </main>
  );
}
