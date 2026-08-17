/* Design reminder: “Cobalt Field Guide” — a premium OTM exploration route, not a sales landing page or scorecard. Use Cobalt Route Blue only for paths, selection, and the one clear next action. */
import { useEffect, useMemo, useState } from "react";
/* Design reminder: “Cobalt Field Guide” — a customer-completable exploration route. One calm action at a time; never expose internal ROI, Evidence Gate, or workbench navigation as customer tasks. */
import { ArrowLeft, ArrowRight, Check, Clipboard, Download, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { OtmFitScale, type OtmFitStage } from "@/components/OtmFitScale";
import "./ClientBriefV2.css";

type Answer = "yes" | "partial" | "no";
type Answers = Partial<Record<QuestionId, Answer>>;
type QuestionId = "need" | "scope" | "systems" | "data" | "team" | "explore";
type SignalKey = "need" | "foundation" | "mobilisation";
type Screen = "start" | "question" | "result";
type FocusKey = "audit" | "visibility" | "other";

type Question = { id: QuestionId; prompt: string; helper: string; routeLabel: string };
type Signal = { key: SignalKey; label: string; note: string; conditions: [string, string] };
type FocusOption = { id: FocusKey; title: string; detail: string; bring: string };
type Copy = {
  brand: string;
  oldVersion: string;
  language: string;
  startEyebrow: string;
  startKicker: string;
  title: string;
  intro: string;
  start: string;
  startNote: string;
  startPickKicker: string;
  startPickTitle: string;
  startUnsure: string;
  focusOptions: FocusOption[];
  startingPoint: string;
  bringLabel: string;
  workbenchLabel: string;
  workbenchNote: string;
  routeKicker: string;
  routeTitle: string;
  routeSteps: [string, string, string];
  routeFoot: string;
  questionKicker: string;
  questionProgress: string;
  options: Record<Answer, string>;
  back: string;
  next: string;
  showMap: string;
  exit: string;
  routeLabel: string;
  questions: Question[];
  signals: Signal[];
  resultKicker: string;
  resultTitleReady: string;
  resultTitleFocus: string;
  resultTitleClarify: string;
  resultBodyReady: string;
  resultBodyFocus: string;
  resultBodyClarify: string;
  signalKicker: string;
  ready: string;
  developing: string;
  open: string;
  nextKicker: string;
  nextReady: string;
  nextNeed: string;
  nextFoundation: string;
  nextMobilisation: string;
  resultNote: string;
  copy: string;
  copied: string;
  download: string;
  restart: string;
  classicNote: string;
  classicLink: string;
  signature: string;
};

const COPY: Record<Language, Copy> = {
  en: {
    brand: "OTM EXPLORATION",
    oldVersion: "View previous prototype",
    language: "Language",
    startEyebrow: "A FIELD GUIDE FOR THE FIRST CONVERSATION",
    startKicker: "THREE MINUTES · SIX SIGNALS",
    title: "Find the right place to begin your OTM conversation.",
    intro: "Six plain-language questions bring one transport reality into focus—before you spend time on a larger evaluation.",
    start: "Map my starting point",
    startNote: "No ROI claim. No product recommendation. Just a clearer next conversation.",
    startPickKicker: "START WITH THE CLOSEST REALITY", startPickTitle: "What would you most like to make clearer?", startUnsure: "I am not sure yet — start with the general questions",
    focusOptions: [
      { id: "audit", title: "Freight bills and spend", detail: "There may be questions around invoices, charges, rates, payments or spend control.", bring: "Bring one recent invoice, rate question, or a simple description of how freight bills are checked today." },
      { id: "visibility", title: "Visibility and exceptions", detail: "There may be questions around shipment status, delays, escalation, service or manual chasing.", bring: "Bring one recent delay, expedite, status-chasing example, or description of how exceptions are handled." },
      { id: "other", title: "Another transport or trade question", detail: "The first conversation may concern planning, carriers, network, compliance or trade operations.", bring: "Bring one concrete process example and the name of the person who understands it best." },
    ],
    startingPoint: "YOUR STARTING POINT", bringLabel: "BRING TO THE CONVERSATION",
    workbenchLabel: "Open Decision Archive internal workbench", workbenchNote: "For presales, consulting and finance teams: value drivers, Discovery, evidence, ROI and export.",
    routeKicker: "YOUR EXPLORATION ROUTE",
    routeTitle: "One route. Three signals.",
    routeSteps: ["A real operating need", "A visible digital foundation", "The ability to mobilise a small next step"],
    routeFoot: "Start with one real transport flow, not the whole enterprise.",
    questionKicker: "OTM EXPLORATION",
    questionProgress: "Question",
    options: { yes: "Yes, clearly", partial: "Somewhat / not sure", no: "Not yet" },
    back: "Back",
    next: "Continue",
    showMap: "Show my exploration map",
    exit: "Leave exploration",
    routeLabel: "Route progress",
    questions: [
      { id: "need", routeLabel: "Reason", prompt: "Is transportation an active operating concern for your team today?", helper: "Think about a pain the team already talks about: cost, visibility, service, carrier performance, exceptions or manual work." },
      { id: "scope", routeLabel: "Start", prompt: "Can you point to one transport flow, region or business problem that would make sense to explore first?", helper: "A good starting point is specific enough to describe, but small enough to discuss without redesigning the whole enterprise." },
      { id: "systems", routeLabel: "Systems", prompt: "Can someone explain which systems currently support that transport flow?", helper: "You do not need a technical architecture. Knowing where planning, shipment or cost information lives is enough for a first conversation." },
      { id: "data", routeLabel: "Trace", prompt: "Could your team find a basic trail of shipment, cost or service information for that flow?", helper: "The information does not need to be perfect or ready to upload. We only need to know that a trail exists and where to look." },
      { id: "team", routeLabel: "People", prompt: "Could one business owner and one data or technology owner join a short exploration conversation?", helper: "This is not a project team. It is simply two people who can connect the operating problem to the facts behind it." },
      { id: "explore", routeLabel: "Next", prompt: "Could you make room for one small, time-boxed exploration step before deciding anything bigger?", helper: "The next step is a working conversation around one reality—not a commitment to buy, implement or calculate ROI." },
    ],
    signals: [
      { key: "need", label: "Operating need", note: "Is there a real transport issue and a visible starting point?", conditions: ["A live operating concern", "One bounded place to begin"] },
      { key: "foundation", label: "Digital foundation", note: "Can the team trace the systems and information around that starting point?", conditions: ["Systems can be named", "A basic information trail exists"] },
      { key: "mobilisation", label: "Mobilisation ability", note: "Can the right people protect a small next conversation?", conditions: ["Business and data voices can join", "A small exploration is possible"] },
    ],
    resultKicker: "YOUR EXPLORATION MAP",
    resultTitleReady: "You have a credible place to start exploring OTM.",
    resultTitleFocus: "The opportunity is visible. Make the next conversation smaller.",
    resultTitleClarify: "Start by clarifying the transport problem—not the software.",
    resultBodyReady: "The operating reason, information trail and people needed for a bounded conversation are in view. That is enough to explore—not enough to approve an investment case.",
    resultBodyFocus: "There is a meaningful reason to explore OTM, but one or two conditions need attention. Treat them as the agenda for a short working session, not as reasons to stop.",
    resultBodyClarify: "The first useful move is to name one real transportation concern and where it happens. Once that is clearer, the OTM conversation becomes more useful and less abstract.",
    signalKicker: "THREE EXPLORATION SIGNALS",
    ready: "Visible",
    developing: "Needs a little more shape",
    open: "Open question",
    nextKicker: "THE MOST USEFUL NEXT MOVE",
    nextReady: "Set a 45-minute exploration conversation around the flow you named. Invite the business owner and the person who knows the relevant systems or data.",
    nextNeed: "Choose one transport flow or operating issue that people already want to improve. Describe where it happens and why it matters before discussing technology.",
    nextFoundation: "Invite the person who can point to the current systems and information trail for the chosen flow. A simple walkthrough is more useful than a complete data extract right now.",
    nextMobilisation: "Name one business voice and one data or technology voice for a 45-minute conversation. The goal is to decide whether a small exploration is worth protecting.",
    resultNote: "This map is a conversation aid. It does not calculate value, evaluate implementation readiness, or recommend a product decision.",
    copy: "Copy summary",
    copied: "Exploration summary copied",
    download: "Download notes",
    restart: "Map another starting point",
    classicNote: "Want to compare the earlier board-memo prototype?",
    classicLink: "Open the previous Client Brief",
    signature: "CLARIFY THE TERRAIN. THEN DECIDE THE ROUTE.",
  },
  zh: {
    brand: "OTM 探索路线图",
    oldVersion: "查看上一版原型",
    language: "语言",
    startEyebrow: "为第一次对话准备的探索指南",
    startKicker: "3 分钟 · 6 个信号",
    title: "找到最适合开始讨论 OTM 的地方。",
    intro: "回答六个大白话问题，把一个真实的运输场景带到焦点中，再决定是否值得投入更大的评估。",
    start: "绘制我的起点地图",
    startNote: "不计算 ROI，不推荐产品，只让下一次对话更清楚。",
    startPickKicker: "从最接近的真实情况开始", startPickTitle: "你现在最想把哪件事讲清楚？", startUnsure: "我还不确定，先从通用问题开始",
    focusOptions: [
      { id: "audit", title: "运费账单与支出", detail: "团队可能正在处理发票、收费、费率、付款或支出控制方面的问题。", bring: "带来一张近期账单、一个费率问题，或简单说明今天如何审核货运账单。" },
      { id: "visibility", title: "可视化与异常", detail: "团队可能正在处理运输状态、延误、升级处理、服务或人工追踪方面的问题。", bring: "带来一个近期延误、加急、状态追踪案例，或说明今天如何处理例外。" },
      { id: "other", title: "其他运输或贸易问题", detail: "第一次对话可能涉及规划、承运商、网络、合规或贸易运营。", bring: "带来一个具体流程案例，以及最了解该流程的人员姓名。" },
    ],
    startingPoint: "你的探索起点", bringLabel: "下一次对话请带来",
    workbenchLabel: "打开 Decision Archive 内部工作台", workbenchNote: "供售前、咨询与财务团队使用：价值 Driver、Discovery、证据、ROI 与导出。",
    routeKicker: "你的探索路线",
    routeTitle: "一条路线，三个信号。",
    routeSteps: ["一个真实的运营需求", "一条看得见的数字基础", "推进一个小步骤的能力"],
    routeFoot: "从一条真实运输流开始，而不是从整个企业开始。",
    questionKicker: "OTM 探索路线图",
    questionProgress: "问题",
    options: { yes: "是，很清楚", partial: "有一些 / 还不确定", no: "暂时没有" },
    back: "上一步",
    next: "继续",
    showMap: "查看我的探索地图",
    exit: "离开探索",
    routeLabel: "路线进度",
    questions: [
      { id: "need", routeLabel: "原因", prompt: "运输现在是否是你们团队正在面对的运营问题？", helper: "想想团队已经在谈的问题：成本、可视化、服务、承运商表现、异常，或人工工作。" },
      { id: "scope", routeLabel: "起点", prompt: "你们能否指出一条应该优先探索的运输流、区域，或业务问题？", helper: "一个好的起点足够具体，能够讲清楚；也足够小，不需要重做整个企业就能开始讨论。" },
      { id: "systems", routeLabel: "系统", prompt: "是否有人能解释目前哪些系统在支持这条运输流？", helper: "不需要技术架构图。只要知道计划、运输或成本信息分别在哪里，就足够开始第一次对话。" },
      { id: "data", routeLabel: "线索", prompt: "团队是否能找到这条运输流的基本运输、成本或服务信息线索？", helper: "信息不需要完美，也不需要马上上传；我们只需要知道这条线索存在，以及从哪里找。" },
      { id: "team", routeLabel: "人员", prompt: "一位业务负责人和一位数据或技术负责人，能否参加一次短的探索对话？", helper: "这不是项目团队，只是两位能把运营问题与背后事实连接起来的人。" },
      { id: "explore", routeLabel: "下一步", prompt: "在做更大决定之前，团队能否为一次小而有时间边界的探索留出空间？", helper: "下一步是一场围绕真实场景的工作对话，不是购买、实施或计算 ROI 的承诺。" },
    ],
    signals: [
      { key: "need", label: "运营需求", note: "是否存在真实的运输问题，以及可见的起点？", conditions: ["一个正在发生的运营问题", "一个有边界的起点"] },
      { key: "foundation", label: "数字基础", note: "团队能否追溯这一起点周边的系统与信息？", conditions: ["可以说清相关系统", "存在基本的信息线索"] },
      { key: "mobilisation", label: "推进能力", note: "合适的人能否共同保护一个小的下一步？", conditions: ["业务与数据声音可以加入", "可以进行一次小探索"] },
    ],
    resultKicker: "你的探索地图",
    resultTitleReady: "你们已经有一个可信的 OTM 探索起点。",
    resultTitleFocus: "机会已经可见，把下一次对话再缩小一点。",
    resultTitleClarify: "先说清运输问题，再讨论软件。",
    resultBodyReady: "运营原因、信息线索和开启一次有边界对话所需的人都已经在视野中。它足以开始探索，还不足以批准投资案例。",
    resultBodyFocus: "探索 OTM 的理由是有意义的，但还有一两项条件需要补齐。把它们作为一次短工作会的议程，而不是停止的理由。",
    resultBodyClarify: "最有用的第一步，是说清一个真实运输问题，以及它发生在哪里。这个起点越清楚，后续的 OTM 对话就越具体。",
    signalKicker: "三个探索信号",
    ready: "已经可见",
    developing: "还需要一点轮廓",
    open: "开放问题",
    nextKicker: "最有用的下一步",
    nextReady: "围绕你们指出的那条运输流安排一次 45 分钟探索对话。邀请业务负责人和了解相关系统或数据的人参加。",
    nextNeed: "选择一条团队已经希望改善的运输流或运营问题。先说明它发生在哪里、为什么重要，再讨论技术。",
    nextFoundation: "邀请能够指出现有系统与信息线索的人，围绕选定运输流做一次简单讲解。此刻，简单走读比完整数据提取更有用。",
    nextMobilisation: "指定一位业务代表和一位数据或技术代表参加 45 分钟对话。目标只是判断这次小探索是否值得推进。",
    resultNote: "这张地图用于帮助对话，不计算价值、不评估实施准备度，也不推荐产品决策。",
    copy: "复制摘要",
    copied: "探索摘要已复制",
    download: "下载笔记",
    restart: "绘制另一个起点",
    classicNote: "想和早期的董事会备忘录原型对比吗？",
    classicLink: "打开上一版 Client Brief",
    signature: "先看清地形，再决定路线。",
  },
  es: {
    brand: "EXPLORACIÓN OTM",
    oldVersion: "Ver prototipo anterior",
    language: "Idioma",
    startEyebrow: "UNA GUÍA DE CAMPO PARA LA PRIMERA CONVERSACIÓN",
    startKicker: "TRES MINUTOS · SEIS SEÑALES",
    title: "Encuentre el punto correcto para iniciar su conversación sobre OTM.",
    intro: "Seis preguntas en lenguaje sencillo enfocan una realidad de transporte antes de invertir tiempo en una evaluación mayor.",
    start: "Trazar mi punto de partida",
    startNote: "Sin cálculo de ROI. Sin recomendación de producto. Solo una próxima conversación más clara.",
    startPickKicker: "EMPIECE POR LA REALIDAD MÁS CERCANA", startPickTitle: "¿Qué le gustaría aclarar primero?", startUnsure: "Aún no estoy seguro — empezar con las preguntas generales",
    focusOptions: [
      { id: "audit", title: "Facturas de flete y gasto", detail: "Puede haber preguntas sobre facturas, cargos, tarifas, pagos o control de gasto.", bring: "Traiga una factura reciente, una duda de tarifa o una explicación sencilla de cómo se revisan hoy las facturas de flete." },
      { id: "visibility", title: "Visibilidad y excepciones", detail: "Puede haber preguntas sobre estado de envíos, retrasos, escalaciones, servicio o seguimiento manual.", bring: "Traiga un ejemplo reciente de retraso, urgencia o seguimiento de estado, o describa cómo se manejan hoy las excepciones." },
      { id: "other", title: "Otra pregunta de transporte o comercio", detail: "La primera conversación puede tratar planificación, carriers, red, cumplimiento u operaciones comerciales.", bring: "Traiga un ejemplo concreto de proceso y el nombre de la persona que mejor lo conoce." },
    ],
    startingPoint: "SU PUNTO DE PARTIDA", bringLabel: "TRAIGA A LA CONVERSACIÓN",
    workbenchLabel: "Abrir Decision Archive interno", workbenchNote: "Para preventa, consultoría y finanzas: drivers de valor, Discovery, evidencia, ROI y exportación.",
    routeKicker: "SU RUTA DE EXPLORACIÓN",
    routeTitle: "Una ruta. Tres señales.",
    routeSteps: ["Una necesidad operativa real", "Una base digital visible", "La capacidad de movilizar un siguiente paso pequeño"],
    routeFoot: "Empiece con un flujo de transporte real, no con toda la empresa.",
    questionKicker: "EXPLORACIÓN OTM",
    questionProgress: "Pregunta",
    options: { yes: "Sí, claramente", partial: "En parte / no estoy seguro", no: "Aún no" },
    back: "Atrás",
    next: "Continuar",
    showMap: "Ver mi mapa de exploración",
    exit: "Salir de la exploración",
    routeLabel: "Progreso de la ruta",
    questions: [
      { id: "need", routeLabel: "Razón", prompt: "¿El transporte es hoy una preocupación operativa activa para su equipo?", helper: "Piense en un problema que el equipo ya comenta: costo, visibilidad, servicio, desempeño de carriers, excepciones o trabajo manual." },
      { id: "scope", routeLabel: "Inicio", prompt: "¿Puede señalar un flujo de transporte, región o problema de negocio que tenga sentido explorar primero?", helper: "Un buen inicio es suficientemente específico para describirlo y suficientemente pequeño para discutirlo sin rediseñar toda la empresa." },
      { id: "systems", routeLabel: "Sistemas", prompt: "¿Alguien puede explicar qué sistemas respaldan hoy ese flujo de transporte?", helper: "No necesita una arquitectura técnica. Saber dónde vive la información de planificación, envíos o costo basta para una primera conversación." },
      { id: "data", routeLabel: "Rastro", prompt: "¿Podría su equipo encontrar un rastro básico de información de envíos, costo o servicio para ese flujo?", helper: "La información no tiene que ser perfecta ni estar lista para cargar. Solo necesitamos saber que existe un rastro y dónde buscarlo." },
      { id: "team", routeLabel: "Personas", prompt: "¿Podrían participar en una conversación corta un responsable de negocio y uno de datos o tecnología?", helper: "No es un equipo de proyecto; son dos personas que pueden conectar el problema operativo con los hechos que lo sustentan." },
      { id: "explore", routeLabel: "Siguiente", prompt: "¿Podría abrir espacio para un paso de exploración pequeño y limitado en tiempo antes de decidir algo mayor?", helper: "El siguiente paso es una conversación de trabajo sobre una realidad, no un compromiso de comprar, implementar o calcular ROI." },
    ],
    signals: [
      { key: "need", label: "Necesidad operativa", note: "¿Hay un problema de transporte real y un punto de partida visible?", conditions: ["Una preocupación operativa actual", "Un lugar acotado para comenzar"] },
      { key: "foundation", label: "Base digital", note: "¿Puede el equipo rastrear sistemas e información alrededor de ese punto de partida?", conditions: ["Se pueden nombrar los sistemas", "Existe un rastro básico de información"] },
      { key: "mobilisation", label: "Capacidad de movilización", note: "¿Pueden las personas adecuadas proteger una conversación pequeña?", conditions: ["Pueden sumarse voces de negocio y datos", "Es posible una exploración pequeña"] },
    ],
    resultKicker: "SU MAPA DE EXPLORACIÓN",
    resultTitleReady: "Tiene un punto de partida creíble para explorar OTM.",
    resultTitleFocus: "La oportunidad es visible. Haga más pequeña la próxima conversación.",
    resultTitleClarify: "Aclare primero el problema de transporte, no el software.",
    resultBodyReady: "La razón operativa, el rastro de información y las personas necesarias para una conversación acotada están a la vista. Basta para explorar; no para aprobar un caso de inversión.",
    resultBodyFocus: "Hay una razón significativa para explorar OTM, pero una o dos condiciones necesitan atención. Trátelas como agenda para una sesión corta de trabajo, no como razones para detenerse.",
    resultBodyClarify: "El primer movimiento útil es nombrar una preocupación de transporte real y dónde ocurre. Cuando eso es más claro, la conversación sobre OTM es más útil y menos abstracta.",
    signalKicker: "TRES SEÑALES DE EXPLORACIÓN",
    ready: "Visible",
    developing: "Necesita un poco más de forma",
    open: "Pregunta abierta",
    nextKicker: "EL SIGUIENTE MOVIMIENTO MÁS ÚTIL",
    nextReady: "Programe una conversación de exploración de 45 minutos sobre el flujo que nombró. Invite al responsable de negocio y a quien conozca los sistemas o datos relevantes.",
    nextNeed: "Elija un flujo de transporte o problema operativo que la gente ya quiere mejorar. Describa dónde ocurre y por qué importa antes de hablar de tecnología.",
    nextFoundation: "Invite a la persona que puede señalar los sistemas actuales y el rastro de información del flujo elegido. Un recorrido simple es más útil que un extracto completo de datos ahora.",
    nextMobilisation: "Nombre una voz de negocio y una voz de datos o tecnología para una conversación de 45 minutos. El objetivo es decidir si vale la pena proteger una exploración pequeña.",
    resultNote: "Este mapa ayuda a conversar. No calcula valor, evalúa preparación de implementación ni recomienda una decisión de producto.",
    copy: "Copiar resumen",
    copied: "Resumen de exploración copiado",
    download: "Descargar notas",
    restart: "Trazar otro punto de partida",
    classicNote: "¿Quiere comparar el prototipo anterior de memo ejecutivo?",
    classicLink: "Abrir el Client Brief anterior",
    signature: "ACLARE EL TERRENO. LUEGO DECIDA LA RUTA.",
  },
};

const LANGUAGES: Array<{ id: Language; label: string }> = [{ id: "en", label: "EN" }, { id: "es", label: "ES" }, { id: "zh", label: "中" }];
const STORAGE_KEY = "otm-exploration-field-guide.v1";

function statusFor(pair: [Answer | undefined, Answer | undefined]) {
  if (pair.every((value) => value === "yes")) return "ready" as const;
  if (pair.some((value) => value === "yes" || value === "partial")) return "developing" as const;
  return "open" as const;
}

function signalStatus(answers: Answers): Record<SignalKey, "ready" | "developing" | "open"> {
  return {
    need: statusFor([answers.need, answers.scope]),
    foundation: statusFor([answers.systems, answers.data]),
    mobilisation: statusFor([answers.team, answers.explore]),
  };
}

export default function ClientBriefV2() {
  const { language, setLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const copy = COPY[language];
  const [screen, setScreen] = useState<Screen>("start");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [focus, setFocus] = useState<FocusKey | null>(null);
  const [feedback, setFeedback] = useState("");
  const question = copy.questions[step];
  const answerCount = Object.keys(answers).length;
  const statuses = signalStatus(answers);
  const focusOption = copy.focusOptions.find((option) => option.id === focus) ?? null;
  const readyCount = Object.values(statuses).filter((status) => status === "ready").length;
  const operatingExists = answers.need === "yes" || answers.need === "partial";
  const hasStartingPoint = answers.scope === "yes" || answers.scope === "partial";
  const resultState = !operatingExists || !hasStartingPoint ? "clarify" : readyCount === 3 ? "ready" : "focus";

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const saved = JSON.parse(stored) as { answers?: Answers };
      if (saved.answers) setAnswers(saved.answers);
    } catch { /* Start clean when a stale local entry cannot be interpreted. */ }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, savedAt: new Date().toISOString() }));
  }, [answers]);

  const selectAnswer = (answer: Answer) => {
    setFeedback("");
    setAnswers((current) => ({ ...current, [question.id]: answer }));
  };

  const start = (selectedFocus: FocusKey | null = focus) => {
    setFeedback("");
    setAnswers({});
    setFocus(selectedFocus);
    setScreen("question");
    setStep(0);
  };

  const back = () => {
    if (step === 0) setScreen("start");
    else setStep((current) => current - 1);
  };

  const next = () => {
    if (step === copy.questions.length - 1) setScreen("result");
    else setStep((current) => current + 1);
  };

  const restart = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setFocus(null);
    setStep(0);
    setFeedback("");
    setScreen("start");
  };

  const summary = useMemo(() => {
    const signalLines = copy.signals.map((signal) => {
      const status = statuses[signal.key];
      const label = status === "ready" ? copy.ready : status === "developing" ? copy.developing : copy.open;
      return `${signal.label}: ${label}`;
    });
    const nextMove = resultState === "ready" ? copy.nextReady : resultState === "clarify" ? copy.nextNeed : statuses.foundation !== "ready" ? copy.nextFoundation : copy.nextMobilisation;
    const focusLines = focusOption ? `${copy.startingPoint}\n${focusOption.title}\n\n${copy.bringLabel}\n${focusOption.bring}\n\n` : "";
    return `${copy.resultKicker}\n\n${resultState === "ready" ? copy.resultTitleReady : resultState === "focus" ? copy.resultTitleFocus : copy.resultTitleClarify}\n\n${focusLines}${signalLines.join("\n")}\n\n${copy.nextKicker}\n${nextMove}\n\n${copy.resultNote}`;
  }, [copy, focusOption, resultState, statuses]);

  const copySummary = async () => {
    try {
      await navigator.clipboard?.writeText(summary);
      setFeedback(copy.copied);
    } catch { setFeedback(summary); }
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "otm-exploration-map.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resultTitle = resultState === "ready" ? copy.resultTitleReady : resultState === "focus" ? copy.resultTitleFocus : copy.resultTitleClarify;
  const resultBody = resultState === "ready" ? copy.resultBodyReady : resultState === "focus" ? copy.resultBodyFocus : copy.resultBodyClarify;
  const nextMove = resultState === "ready" ? copy.nextReady : resultState === "clarify" ? copy.nextNeed : statuses.foundation !== "ready" ? copy.nextFoundation : copy.nextMobilisation;
  const fitStage: OtmFitStage = resultState === "ready" ? "assess" : resultState === "focus" ? "explore" : "clarify";

  return (
    <main className={`field-guide ${screen !== "start" ? "field-guide-active" : ""}`}>
      <header className="field-header">
        <button type="button" className="field-brand" onClick={() => setScreen("start")} aria-label={copy.brand}>
          <span className="route-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>{copy.brand}</span>
        </button>
        <div className="field-header-tools">
          <div className="field-language" aria-label={copy.language}>
            {LANGUAGES.map((item) => <button type="button" key={item.id} className={language === item.id ? "active" : ""} onClick={() => setLanguage(item.id)} aria-pressed={language === item.id}>{item.label}</button>)}
          </div>
          <button type="button" className="workbench-shortcut" onClick={() => navigate("/workbench")}>{copy.workbenchLabel}<ArrowRight size={14} strokeWidth={1.8} /></button>
        </div>
      </header>

      {screen === "start" && <section className="field-start" aria-labelledby="field-guide-title">
        <div className="field-start-copy">
          <div className="field-kicker"><span>{copy.startEyebrow}</span><i /></div>
          <p className="field-timing">{copy.startKicker}</p>
          <h1 id="field-guide-title">{copy.title}</h1>
          <p className="field-intro">{copy.intro}</p>
          <div className="field-focus-picker">
            <span>{copy.startPickKicker}</span><h2>{copy.startPickTitle}</h2>
            <div className="field-focus-options">
              {copy.focusOptions.map((option, index) => <button type="button" key={option.id} onClick={() => start(option.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{option.title}</strong><i><ArrowRight size={16} strokeWidth={1.8} /></i></button>)}
            </div>
            <button type="button" className="field-secondary field-unsure-start" onClick={() => start(null)}>{copy.startUnsure}<ArrowRight size={16} strokeWidth={1.8} /></button>
          </div>
          <p className="field-note">{copy.startNote}</p>
          <button type="button" className="field-workbench-bridge" onClick={() => navigate("/workbench")}>
            <span>DECISION ARCHIVE / INTERNAL WORKBENCH</span><strong>{copy.workbenchLabel}</strong><p>{copy.workbenchNote}</p><ArrowRight size={17} strokeWidth={1.8} />
          </button>
        </div>
        <aside className="field-route-map" aria-label={copy.routeKicker}>
          <div className="route-map-top"><span>{copy.routeKicker}</span><b>01—06</b></div>
          <div className="route-map-plot" aria-hidden="true">
            <svg viewBox="0 0 440 470" preserveAspectRatio="none"><path d="M43 42 C 176 37, 113 138, 235 144 S 390 185, 335 278 S 174 321, 228 417" /><path className="route-map-dash" d="M43 42 C 176 37, 113 138, 235 144 S 390 185, 335 278 S 174 321, 228 417" /></svg>
            <i className="map-node map-start" /><i className="map-node map-mid-one" /><i className="map-node map-mid-two" /><i className="map-node map-mid-three" /><i className="map-node map-end" />
            <span className="map-coordinate coordinate-one">N 01. / NEED</span><span className="map-coordinate coordinate-two">E 02. / TRACE</span><span className="map-coordinate coordinate-three">S 03. / MOVE</span>
          </div>
          <div className="route-map-copy"><span className="route-map-index">01—06</span><h2>{copy.routeTitle}</h2></div>
          <div className="route-map-legend">
            {copy.routeSteps.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><i /><p>{item}</p></div>)}
          </div>
          <p className="route-map-foot">{copy.routeFoot}</p>
          <span className="field-note-stamp">{copy.signature}</span>
        </aside>
      </section>}

      {screen === "question" && <section className="field-question-shell" aria-labelledby="field-question-title">
        <aside className="field-question-route" aria-label={copy.routeLabel}>
          <div className="question-route-kicker"><span>{copy.routeLabel}</span><b>{String(answerCount).padStart(2, "0")} / 06</b></div>
          <span className="question-route-seal" aria-hidden="true"><i /><i /><i /></span>
          <div className="question-route-line" aria-hidden="true" />
          <ol>
            {copy.questions.map((item, index) => <li key={item.id} className={`${index === step ? "current" : ""} ${answers[item.id] ? "answered" : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.routeLabel}</strong><i>{answers[item.id] ? <Check size={11} strokeWidth={2.6} /> : null}</i></li>)}
          </ol>
          <p>{copy.routeFoot}</p>
        </aside>
        <div className="field-question-stage">
          <div className="question-stage-top"><span>{copy.questionKicker}</span><b>{copy.questionProgress} {String(step + 1).padStart(2, "0")} / 06</b></div>
          {focusOption && <div className="field-question-context"><span>{copy.startingPoint}</span><b>{focusOption.title}</b></div>}
          <div className="question-stage-index">0{step + 1}</div>
          <h1 id="field-question-title">{question.prompt}</h1>
          <p className="question-helper">{question.helper}</p>
          <div className="field-answer-list" role="radiogroup" aria-label={question.prompt}>
            {(Object.entries(copy.options) as Array<[Answer, string]>).map(([key, label]) => <button type="button" role="radio" aria-checked={answers[question.id] === key} key={key} className={answers[question.id] === key ? "selected" : ""} onClick={() => selectAnswer(key)}><span className="answer-node" aria-hidden="true">{answers[question.id] === key && <Check size={14} strokeWidth={2.5} />}</span><span>{label}</span><i /></button>)}
          </div>
          <div className="question-stage-actions"><button type="button" className="field-secondary" onClick={back}><ArrowLeft size={17} strokeWidth={1.7} />{copy.back}</button><button type="button" className="field-primary" disabled={!answers[question.id]} onClick={next}><span>{step === copy.questions.length - 1 ? copy.showMap : copy.next}</span><ArrowRight size={19} strokeWidth={1.7} /></button></div>
        </div>
      </section>}

      {screen === "result" && <section className="field-result" aria-labelledby="exploration-map-title">
        <div className="field-result-heading">
          <div><div className="field-kicker"><span>{copy.resultKicker}</span><i /></div><h1 id="exploration-map-title">{resultTitle}</h1>{focusOption && <div className="field-result-context"><span>{copy.startingPoint}</span><b>{focusOption.title}</b><p>{focusOption.detail}</p></div>}</div>
          <p>{resultBody}</p>
        </div>
        <OtmFitScale stage={fitStage} language={language} />
        <div className="signal-map" aria-label={copy.signalKicker}>
          <div className="signal-map-head"><span>{copy.signalKicker}</span><b>{String(readyCount).padStart(2, "0")} / 03</b></div>
          <div className="result-route-line" aria-hidden="true"><svg viewBox="0 0 1000 76" preserveAspectRatio="none"><path d="M28 52 C 190 52, 180 18, 360 22 S 622 62, 688 42 S 810 15, 970 17" /></svg><i /><i /><i /><i /></div>
          <div className="signal-map-lanes">
            {copy.signals.map((signal, index) => {
              const status = statuses[signal.key];
              const statusLabel = status === "ready" ? copy.ready : status === "developing" ? copy.developing : copy.open;
              return <article className={`signal-lane ${status}`} key={signal.key}>
                <div className="signal-lane-head"><span>0{index + 1}</span><i /><b>{statusLabel}</b></div>
                <h2>{signal.label}</h2><p>{signal.note}</p>
                <div className="signal-conditions">{signal.conditions.map((condition, conditionIndex) => <div key={condition} className={answers[copy.questions[index * 2 + conditionIndex].id] === "yes" ? "confirmed" : ""}><i />{condition}</div>)}</div>
              </article>;
            })}
          </div>
        </div>
        <div className="field-next-move"><div className="next-route-mark" aria-hidden="true"><i /><i /><i /></div><div><span>{copy.nextKicker}</span><h2>{nextMove}</h2>{focusOption && <p className="field-next-prep"><b>{copy.bringLabel}</b>{focusOption.bring}</p>}</div><button type="button" className="field-primary" onClick={copySummary}><Clipboard size={18} strokeWidth={1.8} /><span>{copy.copy}</span></button></div>
        <div className="field-result-utilities"><p>{copy.resultNote}</p><div><button type="button" onClick={downloadSummary}><Download size={16} strokeWidth={1.7} />{copy.download}</button><button type="button" onClick={restart}><RotateCcw size={16} strokeWidth={1.7} />{copy.restart}</button></div></div>
        {feedback && <p className="field-feedback" aria-live="polite">{feedback}</p>}
        <footer className="field-footer"><p>{copy.signature}</p></footer>
      </section>}
    </main>
  );
}
