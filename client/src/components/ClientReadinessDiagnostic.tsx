/* Design reminder: "验证简报 / Validation Brief" — a calm client co-diagnosis, not a scorecard; use one blue hue, short questions, visible progress, and an actionable plan rather than a financial promise. */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, Save, Share2, X } from "lucide-react";
import { type Language } from "@/contexts/LanguageContext";
import "@/pages/ClientValidationBrief.css";

type Answer = "yes" | "partial" | "no";
type Answers = Record<string, Answer | undefined>;

type DiagnosticCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  step: string;
  back: string;
  next: string;
  generate: string;
  close: string;
  options: Record<Answer, string>;
  questions: Array<{ id: string; prompt: string; helper: string }>;
  planEyebrow: string;
  planTitle: string;
  planIntro: string;
  ready: string;
  needs: string;
  actions: string;
  save: string;
  share: string;
  download: string;
  saved: string;
  shared: string;
  copied: string;
  restart: string;
  reviewPlan: string;
  finishLine: string;
  readyActions: [string, string];
  summaryLabels: { scope: string; evidence: string; owners: string; finance: string };
};

const COPY: Record<Language, DiagnosticCopy> = {
  en: {
    eyebrow: "FIVE-MINUTE VALIDATION CHECK",
    title: "Answer six short questions. Get a practical readiness plan.",
    intro: "This does not calculate ROI or commit IBM TLS to OTM. It only identifies the next smallest evidence step.",
    step: "Question",
    back: "Back",
    next: "Next question",
    generate: "Generate my readiness plan",
    close: "Close check",
    options: { yes: "Yes, we can do this", partial: "Partly / with help", no: "Not yet" },
    questions: [
      { id: "scope", prompt: "Can you name the Phase 1 region, transport flow and carrier / invoice population?", helper: "A broad label such as “global” is not enough. We only need a bounded starting population." },
      { id: "spend", prompt: "Can you access 12 months of freight spend or carrier-invoice information for that population?", helper: "An extract is ideal; an aggregate plus a representative sample is enough to begin." },
      { id: "shipment", prompt: "Can you access shipment, milestone or status-check information for the same population?", helper: "We are trying to understand the operational workload behind visibility." },
      { id: "owners", prompt: "Do you know who owns the freight, invoice and shipment data?", helper: "We do not need the files today. We need named people who can confirm delivery dates." },
      { id: "finance", prompt: "Can a Finance partner help distinguish capacity release from cashable benefit?", helper: "This protects you from treating productivity as a financial claim too early." },
      { id: "priority", prompt: "Can your team choose one first focus: invoice leakage, manual status checking, or exceptions / expedites?", helper: "A first focus helps us make the validation small enough to finish." },
    ],
    planEyebrow: "YOUR VALIDATION READINESS PLAN",
    planTitle: "A small, evidence-led next step.",
    planIntro: "Your answers identify where the validation can begin and which conditions still need an owner. They are not a financial result or a recommendation to purchase OTM.",
    ready: "Ready to validate",
    needs: "Needs confirmation",
    actions: "Recommended next actions",
    save: "Save on this device",
    share: "Share plan",
    download: "Download plan",
    saved: "Plan saved on this device",
    shared: "Plan shared",
    copied: "Plan summary copied",
    restart: "Start again",
    reviewPlan: "Review the full validation plan",
    finishLine: "Validate first. Decide second.",
    readyActions: ["Set a short evidence-delivery window with the named data owners.", "Schedule a Finance validation checkpoint after the evidence review."],
    summaryLabels: { scope: "Scope", evidence: "Evidence", owners: "Data ownership", finance: "Finance treatment" },
  },
  zh: {
    eyebrow: "5 分钟验证检查",
    title: "回答六个短问题，得到一份实际可用的准备计划。",
    intro: "它不会计算 ROI，也不会让 IBM TLS 承诺采用 OTM。它只识别下一步最小的证据动作。",
    step: "问题",
    back: "上一步",
    next: "下一个问题",
    generate: "生成我的准备计划",
    close: "关闭检查",
    options: { yes: "是，我们可以做到", partial: "部分可以 / 需要协助", no: "暂时不行" },
    questions: [
      { id: "scope", prompt: "你们能否说清第一阶段的地区、运输流，以及 carrier / 发票人口？", helper: "“全球”这样的宽泛标签不够。我们只需要一个有边界的起始人口。" },
      { id: "spend", prompt: "你们能否取得这部分人口过去 12 个月的运费或 carrier 发票信息？", helper: "最理想是明细；汇总信息加一个有代表性的样本，也足以开始。" },
      { id: "shipment", prompt: "你们能否取得同一人口的运输、里程碑或状态查询信息？", helper: "我们要理解的是 visibility 背后实际产生的运营工作量。" },
      { id: "owners", prompt: "你们是否知道谁拥有运费、发票和运输数据？", helper: "今天不需要文件；我们需要能确认交付日期的明确负责人。" },
      { id: "finance", prompt: "Finance 是否可以协助区分产能释放与可兑现收益？", helper: "这能保护你们不把生产率过早视为财务结论。" },
      { id: "priority", prompt: "团队能否选择一个优先点：发票泄漏、人工状态查询，还是异常 / 加急？", helper: "一个优先点能让验证保持足够小，并真正完成。" },
    ],
    planEyebrow: "你的验证准备计划",
    planTitle: "一项小而有证据的下一步。",
    planIntro: "你的回答会识别验证可以从哪里开始，以及哪些条件还需要负责人确认。它们不是财务结果，也不是购买 OTM 的建议。",
    ready: "可以开始验证",
    needs: "需要确认",
    actions: "建议的下一步动作",
    save: "保存在此设备",
    share: "分享计划",
    download: "下载计划",
    saved: "计划已保存在此设备",
    shared: "计划已分享",
    copied: "计划摘要已复制",
    restart: "重新开始",
    reviewPlan: "查看完整验证计划",
    finishLine: "先验证，再决定。",
    readyActions: ["与已明确的数据 owner 约定一个短的证据交付窗口。", "在证据审阅后安排一次 Finance 验证检查点。"],
    summaryLabels: { scope: "范围", evidence: "证据", owners: "数据负责人", finance: "Finance 处理规则" },
  },
  es: {
    eyebrow: "CHECK DE VALIDACIÓN DE CINCO MINUTOS",
    title: "Responda seis preguntas cortas. Obtenga un plan práctico de preparación.",
    intro: "No calcula ROI ni compromete a IBM TLS con OTM. Solo identifica el siguiente paso de evidencia más pequeño.",
    step: "Pregunta",
    back: "Atrás",
    next: "Siguiente pregunta",
    generate: "Generar mi plan de preparación",
    close: "Cerrar check",
    options: { yes: "Sí, podemos hacerlo", partial: "En parte / con ayuda", no: "Aún no" },
    questions: [
      { id: "scope", prompt: "¿Puede nombrar la región, flujo de transporte y población de carrier / facturas de Fase 1?", helper: "Una etiqueta amplia como “global” no es suficiente. Solo necesitamos una población inicial acotada." },
      { id: "spend", prompt: "¿Puede acceder a 12 meses de gasto de flete o información de facturas de carrier para esa población?", helper: "Un extracto es ideal; un agregado más una muestra representativa basta para empezar." },
      { id: "shipment", prompt: "¿Puede acceder a información de envíos, hitos o consultas de estado para la misma población?", helper: "Buscamos comprender la carga operativa detrás de visibility." },
      { id: "owners", prompt: "¿Sabe quién es dueño de los datos de flete, facturas y envíos?", helper: "No necesitamos los archivos hoy. Necesitamos personas que puedan confirmar fechas de entrega." },
      { id: "finance", prompt: "¿Puede Finanzas ayudar a diferenciar liberación de capacidad y beneficio realizable?", helper: "Esto evita tratar productividad como una conclusión financiera demasiado pronto." },
      { id: "priority", prompt: "¿Puede el equipo elegir un primer foco: fuga de facturas, consultas manuales o excepciones / urgencias?", helper: "Un primer foco mantiene la validación lo bastante pequeña para terminarla." },
    ],
    planEyebrow: "SU PLAN DE PREPARACIÓN PARA VALIDACIÓN",
    planTitle: "Un siguiente paso pequeño, liderado por evidencia.",
    planIntro: "Sus respuestas identifican dónde puede comenzar la validación y qué condiciones aún requieren un responsable. No son un resultado financiero ni una recomendación de compra de OTM.",
    ready: "Listo para validar",
    needs: "Requiere confirmación",
    actions: "Próximas acciones recomendadas",
    save: "Guardar en este dispositivo",
    share: "Compartir plan",
    download: "Descargar plan",
    saved: "Plan guardado en este dispositivo",
    shared: "Plan compartido",
    copied: "Resumen del plan copiado",
    restart: "Empezar de nuevo",
    reviewPlan: "Revisar el plan completo de validación",
    finishLine: "VALIDAR PRIMERO. DECIDIR DESPUÉS.",
    readyActions: ["Acordar una ventana corta de entrega de evidencia con los responsables de datos nombrados.", "Programar un punto de control de Finanzas después de revisar la evidencia."],
    summaryLabels: { scope: "Alcance", evidence: "Evidencia", owners: "Responsables de datos", finance: "Tratamiento de Finanzas" },
  },
};

const STORAGE_KEY = "otm-validation-brief.diagnostic.v1";

function answerStatus(answer: Answer | undefined, copy: DiagnosticCopy) {
  return answer === "yes" ? copy.ready : copy.needs;
}

function buildActions(answers: Answers, copy: DiagnosticCopy) {
  const actions: string[] = [];
  if (answers.scope !== "yes") actions.push(copy.questions[0].prompt);
  if (answers.spend !== "yes" || answers.shipment !== "yes") actions.push(copy.questions[1].prompt);
  if (answers.owners !== "yes") actions.push(copy.questions[3].prompt);
  if (answers.finance !== "yes") actions.push(copy.questions[4].prompt);
  if (answers.priority !== "yes") actions.push(copy.questions[5].prompt);
  return actions.length ? actions.slice(0, 3) : copy.readyActions;
}

function formatPlan(copy: DiagnosticCopy, answers: Answers) {
  const summary = [
    `${copy.summaryLabels.scope}: ${answerStatus(answers.scope, copy)}`,
    `${copy.summaryLabels.evidence}: ${answerStatus(answers.spend, copy)}`,
    `${copy.summaryLabels.owners}: ${answerStatus(answers.owners, copy)}`,
    `${copy.summaryLabels.finance}: ${answerStatus(answers.finance, copy)}`,
  ];
  const actions = buildActions(answers, copy).map((action, index) => `${index + 1}. ${action}`);
  return `${copy.planEyebrow}\n${copy.planTitle}\n\n${summary.join("\n")}\n\n${copy.actions}\n${actions.join("\n")}\n\n${copy.finishLine}`;
}

export default function ClientReadinessDiagnostic({ language, open, onClose, onReviewPlan }: { language: Language; open: boolean; onClose: () => void; onReviewPlan: () => void }) {
  const copy = COPY[language];
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [showPlan, setShowPlan] = useState(false);
  const [feedback, setFeedback] = useState("");
  const current = copy.questions[step];
  const complete = Object.keys(answers).length === copy.questions.length;
  const progress = ((step + 1) / copy.questions.length) * 100;
  const planText = useMemo(() => formatPlan(copy, answers), [answers, copy]);

  useEffect(() => {
    if (!open) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { answers?: Answers };
        if (parsed.answers) setAnswers(parsed.answers);
      } catch { /* Ignore malformed local storage and start a clean check. */ }
    }
  }, [open]);

  if (!open) return null;

  const selectAnswer = (answer: Answer) => setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: answer }));
  const next = () => step < copy.questions.length - 1 ? setStep(step + 1) : setShowPlan(true);
  const save = () => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, savedAt: new Date().toISOString() })); setFeedback(copy.saved); };
  const download = () => {
    const blob = new Blob([planText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "validation-readiness-plan.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: copy.planEyebrow, text: planText }); setFeedback(copy.shared); }
      else { await navigator.clipboard.writeText(planText); setFeedback(copy.copied); }
    } catch { /* User cancelled the native share sheet; no error state is needed. */ }
  };
  const restart = () => { setAnswers({}); setStep(0); setShowPlan(false); setFeedback(""); window.localStorage.removeItem(STORAGE_KEY); };

  return (
    <section className="diagnostic-overlay" role="dialog" aria-modal="true" aria-labelledby="diagnostic-title">
      <div className="diagnostic-paper">
        <button type="button" className="diagnostic-close" onClick={onClose} aria-label={copy.close}><X size={18} /></button>
        {!showPlan ? <>
          <div className="diagnostic-head"><span>{copy.eyebrow}</span><b>{copy.step} {step + 1} / {copy.questions.length}</b></div>
          <div className="diagnostic-progress"><i style={{ width: `${progress}%` }} /></div>
          <h2 id="diagnostic-title">{step === 0 ? copy.title : current.prompt}</h2>
          <p className="diagnostic-intro">{step === 0 ? copy.intro : current.helper}</p>
          <div className="diagnostic-question"><p>{step === 0 ? current.prompt : ""}</p><div className="diagnostic-options">
            {(Object.keys(copy.options) as Answer[]).map((option) => <button type="button" key={option} onClick={() => selectAnswer(option)} className={answers[current.id] === option ? "selected" : ""}><span>{copy.options[option]}</span>{answers[current.id] === option && <Check size={18} />}</button>)}
          </div></div>
          <div className="diagnostic-actions"><button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={16} />{copy.back}</button><button type="button" className="diagnostic-primary" onClick={next} disabled={!answers[current.id]}>{step === copy.questions.length - 1 ? copy.generate : copy.next}<ArrowRight size={16} /></button></div>
        </> : <>
          <div className="diagnostic-head"><span>{copy.planEyebrow}</span><b>{copy.finishLine}</b></div>
          <h2 id="diagnostic-title">{copy.planTitle}</h2>
          <p className="diagnostic-intro">{copy.planIntro}</p>
          <div className="readiness-summary">
            {([
              ["scope", copy.summaryLabels.scope, answers.scope],
              ["evidence", copy.summaryLabels.evidence, answers.spend],
              ["owners", copy.summaryLabels.owners, answers.owners],
              ["finance", copy.summaryLabels.finance, answers.finance],
            ] as const).map(([key, label, answer]) => <div key={key}><span>{label}</span><strong className={answer === "yes" ? "ready" : "needs"}>{answerStatus(answer, copy)}</strong></div>)}
          </div>
          <div className="readiness-actions"><span>{copy.actions}</span>{buildActions(answers, copy).map((action, index) => <p key={action}><b>0{index + 1}</b>{action}</p>)}</div>
          <div className="plan-utilities"><button type="button" onClick={save}><Save size={15} />{copy.save}</button><button type="button" onClick={share}><Share2 size={15} />{copy.share}</button><button type="button" onClick={download}><Download size={15} />{copy.download}</button></div>
          {feedback && <p className="diagnostic-feedback">{feedback}</p>}
          <div className="diagnostic-actions plan-finish"><button type="button" onClick={restart}>{copy.restart}</button><button type="button" className="diagnostic-primary" onClick={onReviewPlan}>{copy.reviewPlan}<ArrowRight size={16} /></button></div>
        </>}
      </div>
    </section>
  );
}
