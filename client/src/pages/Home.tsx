/* Design reminder: "决策档案室" — evidence-first interactive archive; use asymmetric editorial composition and restrained vermilion highlights. */
import { useMemo, useState } from "react";
import AssessmentWorkflow from "@/components/AssessmentWorkflow";
import AssessmentRunway, { type RunwayPath, type RunwayStage } from "@/components/AssessmentRunway";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { OtmFitQuickCheck } from "@/components/OtmFitScale";
import RoiExportWorkspace from "@/components/RoiExportWorkspace";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { DEFAULT_EVIDENCE_GATES, type EvidenceGate } from "@/lib/evidence";
import { translate } from "@/lib/i18n";
import { DRIVERS, localizeDriver, type Driver } from "@/lib/oneOracleDrivers";

const MANUS_ASSET_ORIGIN = "https://otmvaldriv-n3maueuh.manus.space";
const assetUrl = (assetPath: string) => window.location.hostname.endsWith("github.io") ? `${MANUS_ASSET_ORIGIN}${assetPath}` : assetPath;

type FamilyFilter = "all" | "OTM" | "GTM";
const FAMILY_COPY = {
  zh: { all: "全部价值域", otm: "OTM 运输", gtm: "GTM 贸易", headline: "十五个价值域，一套 One Oracle 证据库。", intro: "将运输与全球贸易放在同一价值治理模型中；不同能力可联动，但同一经济结果只能被一个主 driver 认领。", capability: "能力", formula: "ROI 公式", overlap: "跨域去重检查", overlapCopy: "文件延误、异常响应与加急成本可能同时触发 OTM 与 GTM；导出前必须指定唯一的价值归属。" },
  en: { all: "All value domains", otm: "OTM transport", gtm: "GTM trade", headline: "Fifteen value domains. One One-Oracle evidence library.", intro: "Place transportation and global trade in one value-governance model. Capabilities can work together, but only one primary driver may claim the same economic outcome.", capability: "Capability", formula: "ROI formula", overlap: "Cross-domain de-duplication check", overlapCopy: "Document delays, exception response, and expedite costs can arise in both OTM and GTM. Assign one owner before export." },
  es: { all: "Todos los dominios", otm: "Transporte OTM", gtm: "Comercio GTM", headline: "Quince dominios de valor. Una biblioteca de evidencia One Oracle.", intro: "Sitúe transporte y comercio global en un modelo de gobierno de valor. Las capacidades pueden colaborar, pero un único driver principal debe reclamar cada resultado económico.", capability: "Capacidad", formula: "Fórmula ROI", overlap: "Control de deduplicación entre dominios", overlapCopy: "Retrasos documentales, respuesta a excepciones y costes urgentes pueden aparecer en OTM y GTM. Asigne un propietario antes de exportar." },
} as const;

const VALUE_STATUS_COPY = {
  zh: { quantified: "已有数据可以确认", pending: "还需要补一项数据", directional: "先作为讨论方向", extension: "视你的情况再考虑" },
  en: { quantified: "Information can confirm this", pending: "One more data point is needed", directional: "Keep as a discussion direction", extension: "Consider if it fits your situation" },
  es: { quantified: "La información permite confirmarlo", pending: "Hace falta un dato más", directional: "Mantener como dirección de conversación", extension: "Considérelo si encaja con su situación" },
} as const;

const HERO_CUSTOMER_COPY = {
  zh: { top: "你的运输探索", brandSub: "从问题到下一步", decision: "下一步怎么做", scope: "运输与贸易", meta: "从你的运营问题开始", captionLeft: "你能先看清什么", captionRight: "问题 → 改善方向 → 可确认的价值", startHere: "从一个问题开始", fullToolkit: "查看完整工具" },
  en: { top: "Your transport exploration", brandSub: "From question to next step", decision: "What to do next", scope: "Transport & trade", meta: "Start with your operating question", captionLeft: "What you can clarify", captionRight: "Issue → improvement direction → value to confirm", startHere: "Start with one question", fullToolkit: "View the full toolkit" },
  es: { top: "Su exploración de transporte", brandSub: "De la pregunta al siguiente paso", decision: "Qué hacer después", scope: "Transporte y comercio", meta: "Empiece con su pregunta operativa", captionLeft: "Lo que puede aclarar", captionRight: "Problema → mejora posible → valor por confirmar", startHere: "Empiece con una pregunta", fullToolkit: "Ver el kit completo" },
} as const;

type CustomerNavKey = "start" | "improve" | "fit" | "prepare" | "deeper";
const CUSTOMER_NAV: Record<Language, Array<{ key: CustomerNavKey; label: string; id: string }>> = {
  zh: [
    { key: "start", label: "从这里开始", id: "overview" },
    { key: "improve", label: "我想改善什么", id: "customer-outcomes" },
    { key: "fit", label: "适不适合继续了解 OTM？", id: "otm-fit" },
    { key: "prepare", label: "下一步要准备什么", id: "assessment-runway" },
    { key: "deeper", label: "深入查看完整工具", id: "library" },
  ],
  en: [
    { key: "start", label: "Start here", id: "overview" },
    { key: "improve", label: "What I want to improve", id: "customer-outcomes" },
    { key: "fit", label: "Is OTM worth exploring?", id: "otm-fit" },
    { key: "prepare", label: "What to prepare next", id: "assessment-runway" },
    { key: "deeper", label: "Explore the full toolkit", id: "library" },
  ],
  es: [
    { key: "start", label: "Empiece aquí", id: "overview" },
    { key: "improve", label: "Qué quiero mejorar", id: "customer-outcomes" },
    { key: "fit", label: "¿Vale la pena explorar OTM?", id: "otm-fit" },
    { key: "prepare", label: "Qué preparar después", id: "assessment-runway" },
    { key: "deeper", label: "Explorar el kit completo", id: "library" },
  ],
};

type CustomerOutcome = { icon: string; path: RunwayPath; title: string; copy: string };
type CustomerDiscoveryCopy = { eyebrow: string; title: string; intro: string; decisions: string[]; outcomeEyebrow: string; outcomeTitle: string; outcomeIntro: string; outcomes: CustomerOutcome[] };
const CUSTOMER_DISCOVERY: Record<Language, CustomerDiscoveryCopy> = {
  zh: {
    eyebrow: "OTM 能帮你决定什么？", title: "把运输中的每一个决定，变得更清楚。", intro: "OTM 帮助你计划、执行、追踪和优化运输。它让团队能更好地决定什么该运、何时运、怎样运、由谁运，以及发生问题时该怎么做。", decisions: ["哪些订单可以一起运？", "哪条路线和服务更合适？", "该选哪家承运商、花多少钱？", "延误发生时，谁该先行动？"], outcomeEyebrow: "你想改善什么？", outcomeTitle: "先选一个最接近你现状的问题。", outcomeIntro: "不需要知道 OTM 的术语。选择一个业务问题后，我们会说明 OTM 怎样帮助、可能改善什么，以及下一步需要确认什么。", outcomes: [
      { icon: "￥", path: "audit", title: "降低运输成本", copy: "我的运费是不是越付越多？" },
      { icon: "↗", path: "optimization", title: "更好地安排运输", copy: "订单、路线和装载能不能安排得更好？" },
      { icon: "◎", path: "audit", title: "改善承运商表现", copy: "费率、运力和服务是否真的匹配？" },
      { icon: "◷", path: "visibility", title: "提高准时交付", copy: "延误和加急是不是太多？" },
      { icon: "◉", path: "visibility", title: "看清运输状态", copy: "我们是否知道货物在哪里、问题何时发生？" },
      { icon: "◇", path: "broader", title: "减少人工工作", copy: "团队是否花太多时间追踪、核对和沟通？" },
      { icon: "⌁", path: "broader", title: "优化车队或网络", copy: "车辆、设备或运输网络是否被充分利用？" },
      { icon: "?", path: "broader", title: "我还有其他问题", copy: "先说清你想改善什么，我们会帮你找到方向。" },
    ]
  },
  en: {
    eyebrow: "What can OTM help you decide?", title: "Make every transport decision clearer.", intro: "OTM helps you plan, execute, track, and optimise transportation. It helps your team decide what to move, when and how to move it, who should move it, and what to do when something goes wrong.", decisions: ["Which orders can move together?", "Which route and service fit best?", "Which carrier should move it, and at what cost?", "When a delay happens, who should act first?"], outcomeEyebrow: "What would you like to improve?", outcomeTitle: "Choose the issue closest to your situation.", outcomeIntro: "You do not need to know OTM terminology. Choose a business issue and we will show how OTM can help, what could improve, and what to confirm next.", outcomes: [
      { icon: "$", path: "audit", title: "Reduce transportation cost", copy: "Are we paying more freight than we should?" },
      { icon: "↗", path: "optimization", title: "Plan shipments better", copy: "Can orders, routes, and loads be planned better?" },
      { icon: "◎", path: "audit", title: "Improve carrier performance", copy: "Do rates, capacity, and service really match?" },
      { icon: "◷", path: "visibility", title: "Improve on-time delivery", copy: "Are delays and expedites happening too often?" },
      { icon: "◉", path: "visibility", title: "Improve shipment visibility", copy: "Do we know where shipments are and when problems happen?" },
      { icon: "◇", path: "broader", title: "Reduce manual work", copy: "Does the team spend too much time chasing, checking, and communicating?" },
      { icon: "⌁", path: "broader", title: "Improve fleet or network use", copy: "Are vehicles, equipment, or the transport network fully used?" },
      { icon: "?", path: "broader", title: "I have another question", copy: "Tell us what you want to improve and we will help you find a direction." },
    ]
  },
  es: {
    eyebrow: "¿Qué puede ayudarle a decidir OTM?", title: "Haga más clara cada decisión de transporte.", intro: "OTM le ayuda a planificar, ejecutar, seguir y optimizar el transporte. Ayuda a su equipo a decidir qué mover, cuándo y cómo moverlo, quién debe moverlo y qué hacer cuando algo sale mal.", decisions: ["¿Qué pedidos pueden viajar juntos?", "¿Qué ruta y servicio encajan mejor?", "¿Qué carrier debe moverlo y a qué coste?", "Cuando hay un retraso, ¿quién debe actuar primero?"], outcomeEyebrow: "¿Qué le gustaría mejorar?", outcomeTitle: "Elija el problema más cercano a su situación.", outcomeIntro: "No necesita conocer terminología OTM. Elija un problema de negocio y mostraremos cómo OTM puede ayudar, qué podría mejorar y qué confirmar después.", outcomes: [
      { icon: "$", path: "audit", title: "Reducir el coste de transporte", copy: "¿Pagamos más flete de lo necesario?" },
      { icon: "↗", path: "optimization", title: "Planificar mejor los envíos", copy: "¿Podemos planificar mejor pedidos, rutas y cargas?" },
      { icon: "◎", path: "audit", title: "Mejorar el desempeño del carrier", copy: "¿Tarifas, capacidad y servicio realmente coinciden?" },
      { icon: "◷", path: "visibility", title: "Mejorar entregas a tiempo", copy: "¿Los retrasos y urgencias ocurren demasiado?" },
      { icon: "◉", path: "visibility", title: "Mejorar la visibilidad", copy: "¿Sabemos dónde están los envíos y cuándo ocurren problemas?" },
      { icon: "◇", path: "broader", title: "Reducir trabajo manual", copy: "¿El equipo dedica demasiado tiempo a perseguir, revisar y comunicar?" },
      { icon: "⌁", path: "broader", title: "Mejorar uso de flota o red", copy: "¿Vehículos, equipos o red de transporte se usan por completo?" },
      { icon: "?", path: "broader", title: "Tengo otra pregunta", copy: "Diga qué quiere mejorar y le ayudaremos a encontrar una dirección." },
    ]
  },
};

type ViewKey = "explore" | "assessment" | "discussion";
type ViewContent = { label: string; code: string; title: string; copy: string; items: [string, string, string][] };
const VIEWS: Record<Language, Record<ViewKey, ViewContent>> = {
  zh: {
    explore: { label: "我的探索记录", code: "VIEW / 01", title: "先把你的运输问题看清。", copy: "用价值域把问题、可能的改善方向和可参考的指标放在一起，帮助你先找到最值得继续弄清的一件事。", items: [["你想改善什么", "从账单、费率、状态或流程中选一个真实问题", "quantified"], ["可能从哪里开始", "查看相关能力能回应什么问题", "pending"], ["先找哪些资料", "账单、费率、运输事件或服务线索", "pending"], ["目前知道多少", "先区分已确认、待确认与待探索的内容", "directional"]] },
    assessment: { label: "我的资料与机会", code: "VIEW / 02", title: "用你已有的线索判断是否值得继续。", copy: "不是要你马上做商业案例；只是帮你看清现有资料能支持什么，以及还需要向团队确认什么。", items: [["已有线索", "哪些账单、费率、状态或流程事实已经看得见？", "quantified"], ["值得确认的机会", "先核对基线、范围和资料是否可用", "pending"], ["需要谁帮忙", "找了解运输、财务或系统的人一起确认", "pending"], ["下一步边界", "先探索；资料不足时不把机会说成金额", "directional"]] },
    discussion: { label: "我的讨论摘要", code: "VIEW / 03", title: "把已经弄清的内容带回团队。", copy: "将问题、已知资料、待确认事项和可能的下一步整理成一份便于内部讨论的摘要，而不是产品推荐。", items: [["已经弄清的内容", "你和团队已确认的运营事实", "quantified"], ["还需要确认什么", "资料、范围、成本或责任归属", "pending"], ["可以分步探索什么", "先从最小范围开始，再决定是否扩展", "directional"], ["下一次讨论", "决定是否值得继续资料整理或价值估算", "quantified"]] },
  },
  en: {
    explore: { label: "My exploration notes", code: "VIEW / 01", title: "First, make your transport question clear.", copy: "Use value domains to connect your issue, possible improvement directions, and useful indicators—then find the one thing most worth clarifying next.", items: [["What you want to improve", "Choose one real issue in bills, rates, status, or process", "quantified"], ["Where you could start", "See which capability may address the issue", "pending"], ["Information to locate first", "Invoices, rates, transport events, or service clues", "pending"], ["What you know today", "Separate what is confirmed, to confirm, and to explore", "directional"]] },
    assessment: { label: "My information and opportunities", code: "VIEW / 02", title: "Use the clues you have to decide whether to continue.", copy: "This does not ask you to build a business case now. It helps you see what your current information supports and what your team still needs to confirm.", items: [["Clues you already have", "Which facts about bills, rates, status, or process are visible?", "quantified"], ["Opportunities worth confirming", "Check baseline, scope, and information availability first", "pending"], ["Who can help", "Involve colleagues who know transport, finance, or systems", "pending"], ["The next-step boundary", "Explore first; do not turn incomplete information into a value claim", "directional"]] },
    discussion: { label: "My discussion brief", code: "VIEW / 03", title: "Bring what you know back to your team.", copy: "Organise the issue, known information, open questions, and possible next move into a brief for an internal discussion—not a product recommendation.", items: [["What is already clear", "Operating facts you and your team have confirmed", "quantified"], ["What still needs confirmation", "Information, scope, cost, or ownership", "pending"], ["What can be explored in stages", "Start with the smallest scope, then decide whether to expand", "directional"], ["Your next discussion", "Decide whether further information gathering or value estimation is worthwhile", "quantified"]] },
  },
  es: {
    explore: { label: "Mis notas de exploración", code: "VIEW / 01", title: "Primero, aclare su pregunta de transporte.", copy: "Use los dominios de valor para conectar su problema, posibles mejoras e indicadores útiles; después elija lo que más vale la pena aclarar.", items: [["Lo que quiere mejorar", "Elija un problema real en facturas, tarifas, estados o procesos", "quantified"], ["Por dónde puede empezar", "Vea qué capacidad puede responder al problema", "pending"], ["Información que debe localizar", "Facturas, tarifas, eventos de transporte o señales de servicio", "pending"], ["Lo que sabe hoy", "Separe lo confirmado, lo que debe confirmar y lo que debe explorar", "directional"]] },
    assessment: { label: "Mi información y oportunidades", code: "VIEW / 02", title: "Use las pistas que tiene para decidir si continúa.", copy: "No se le pide construir un caso de negocio ahora. Le ayuda a ver qué respalda su información actual y qué debe confirmar su equipo.", items: [["Pistas que ya tiene", "¿Qué hechos sobre facturas, tarifas, estados o proceso son visibles?", "quantified"], ["Oportunidades por confirmar", "Compruebe primero línea base, alcance y disponibilidad de información", "pending"], ["Quién puede ayudar", "Involucre a colegas que conocen transporte, finanzas o sistemas", "pending"], ["El límite del siguiente paso", "Explore primero; no convierta información incompleta en una afirmación de valor", "directional"]] },
    discussion: { label: "Mi resumen de discusión", code: "VIEW / 03", title: "Lleve lo que sabe de vuelta a su equipo.", copy: "Organice el problema, la información conocida, las preguntas abiertas y el posible siguiente paso en un resumen para una discusión interna, no en una recomendación de producto.", items: [["Lo que ya está claro", "Hechos operativos que usted y su equipo confirmaron", "quantified"], ["Lo que aún debe confirmar", "Información, alcance, coste o responsabilidad", "pending"], ["Lo que puede explorar por etapas", "Empiece con el alcance mínimo y luego decida si amplía", "directional"], ["Su siguiente discusión", "Decida si conviene reunir más información o estimar valor", "quantified"]] },
  },
};

function scrollToId(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

export default function Home() {
  const { language } = useLanguage();
  const t = (value: string) => translate(language, value);
  const [selectedId, setSelectedId] = useState("01");
  const [familyFilter, setFamilyFilter] = useState<FamilyFilter>("all");
  const [activeView, setActiveView] = useState<ViewKey>("explore");
  const [activeSection, setActiveSection] = useState<CustomerNavKey>("start");
  const [evidenceGates, setEvidenceGates] = useState<Record<string, EvidenceGate>>(DEFAULT_EVIDENCE_GATES);
  const [runwayPath, setRunwayPath] = useState<RunwayPath | null>(null);
  const [runwayStage, setRunwayStage] = useState<RunwayStage>("problem");
  const familyCopy = FAMILY_COPY[language];
  const heroCopy = HERO_CUSTOMER_COPY[language];
  const localizedDrivers = useMemo(() => DRIVERS.map((driver) => localizeDriver(driver, language, t)), [language]);
  const visibleDrivers = useMemo(() => localizedDrivers.filter((driver) => familyFilter === "all" || driver.family === familyFilter), [localizedDrivers, familyFilter]);
  const selected = useMemo(() => localizedDrivers.find((driver) => driver.id === selectedId) ?? localizedDrivers[0], [localizedDrivers, selectedId]);
  const views = VIEWS[language];
  const view = views[activeView];
  const customerDiscovery = CUSTOMER_DISCOVERY[language];
  const customerNav = CUSTOMER_NAV[language];
  const valueStatus = VALUE_STATUS_COPY[language];

  const selectDriver = (id: string) => { setSelectedId(id); window.setTimeout(() => scrollToId("driver-detail"), 10); };
  const chooseRunwayPath = (path: RunwayPath) => {
    const driverId = path === "optimization" ? "01" : path === "audit" ? "04" : path === "visibility" ? "05" : "01";
    setRunwayPath(path);
    setSelectedId(driverId);
    setRunwayStage("driver");
  };
  const chooseCustomerOutcome = (path: RunwayPath) => { chooseRunwayPath(path); setActiveSection("prepare"); window.setTimeout(() => scrollToId("assessment-runway"), 10); };
  const goToSection = (key: CustomerNavKey, id: string) => { setActiveSection(key); scrollToId(id); };
  const goToRunwayDriver = () => { setRunwayStage("discovery"); scrollToId("driver-detail"); };
  const goToRunwayDiscovery = () => { setRunwayStage("evidence"); scrollToId("discovery-file"); };
  const goToRunwayEvidence = () => { setRunwayStage("evidence"); scrollToId("evidence-gate"); };
  const goToRunwayRoi = () => { setRunwayStage("roi"); scrollToId("roi-export"); };
  const goToRunwayOutput = () => { setRunwayStage("output"); scrollToId("roi-export"); };
  const openGtmModule = (driverId: string) => { setSelectedId(driverId); setRunwayPath("broader"); setRunwayStage("driver"); window.setTimeout(() => scrollToId("driver-detail"), 10); };

  return (
    <div className="archive-shell">
      <div className="top-ledger"><span className="ledger-identity"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />{heroCopy.top}</span><div className="top-ledger-tools"><a href="/client-brief">{language === "zh" ? "三分钟快速探索" : language === "es" ? "Exploración rápida" : "Three-minute quick start"}</a><LanguageSwitcher /><span>{language === "zh" ? "先看事实，再谈价值" : language === "es" ? "Primero los hechos, luego el valor" : "Facts first, then value"}</span></div></div>
      <aside className="sidebar-rail" aria-label={language === "zh" ? "客户探索目录" : language === "es" ? "Índice de exploración del cliente" : "Customer exploration menu"}>
        <div className="brand-block">
          <img className="brand-mark" src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="Value Driver Library mark" />
          <div><div className="brand-name">Value Driver<br />Library</div><div className="brand-sub">{heroCopy.brandSub}</div></div>
        </div>
        <nav className="rail-nav customer-rail-nav">
          <p className="rail-kicker">{language === "zh" ? "你的探索目录" : language === "es" ? "Su ruta de exploración" : "Your exploration route"}</p>
          {customerNav.map((item) => <button key={item.key} onClick={() => goToSection(item.key, item.id)} className={`nav-archive-item customer-nav-item ${activeSection === item.key ? "active" : ""}`} aria-current={activeSection === item.key ? "page" : undefined}><span className="nav-label">{item.label}</span><i className="nav-dot customer" /></button>)}
        </nav>
        <div className="rail-footer"><span>{language === "zh" ? "怎么使用" : language === "es" ? "Cómo usarlo" : "How to use it"}</span><p>{language === "zh" ? "不需要一次看完。先从一个真实问题开始，再按需要往下看。" : language === "es" ? "No necesita verlo todo ahora. Empiece con un problema real y avance solo cuando lo necesite." : "You do not need to read everything now. Start with one real problem, then go deeper only when useful."}</p></div>
      </aside>

      <main className="page-main">
        <section className="hero" id="overview">
          <img className="hero-image" src={assetUrl("/manus-storage/otm-archive-hero_347dc198.jpg")} alt="Abstract transportation value evidence archive" />
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="hero-file-header"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><b>{heroCopy.decision}</b><i>{heroCopy.scope}</i></div>
            <div className="hero-meta"><i />{heroCopy.meta}</div>
            <div className="hero-file-caption"><span>{heroCopy.captionLeft}</span><b>{heroCopy.captionRight}</b></div>
            <h1>{language === "zh" ? <>OTM 能怎样<br />帮助你的<br /><em>运输业务？</em></> : language === "es" ? <>¿Cómo puede OTM ayudar<br />a su <em>negocio?</em></> : <>How can OTM help<br />your <em>business?</em></>}</h1>
            <p className="hero-copy">{language === "zh" ? "Oracle Transportation Management 帮助企业计划、执行、追踪和优化运输。它让你更清楚地决定：什么该运、何时运、怎样运、由谁运，以及出现问题时怎么办。" : language === "es" ? "Oracle Transportation Management ayuda a las empresas a planificar, ejecutar, seguir y optimizar el transporte. Aclara qué mover, cuándo y cómo moverlo, quién debe moverlo y qué hacer cuando algo sale mal." : "Oracle Transportation Management helps companies plan, execute, track, and optimise transportation. It clarifies what to move, when and how to move it, who should move it, and what to do when something goes wrong."}</p>
            <div className="hero-actions"><a className="button-archive" href="#what-is-otm">{language === "zh" ? "看看 OTM 能帮什么" : language === "es" ? "Ver cómo ayuda OTM" : "See how OTM can help"} <span>↓</span></a><a className="button-archive ghost" href="#library">{heroCopy.fullToolkit} <span>↗</span></a></div>
          </div>
        </section>

        <section className="customer-otm-intro section-wrap section-anchor" id="what-is-otm"><div className="customer-otm-lead"><div><div className="eyebrow">{customerDiscovery.eyebrow}</div><h2>{customerDiscovery.title}</h2></div><p>{customerDiscovery.intro}</p></div><div className="customer-decision-list">{customerDiscovery.decisions.map((decision) => <div key={decision}><i>→</i><span>{decision}</span></div>)}</div></section>

        <section className="customer-outcomes section-wrap section-anchor" id="customer-outcomes"><div className="section-lead"><div><div className="eyebrow">{customerDiscovery.outcomeEyebrow}</div><h2 className="section-heading">{customerDiscovery.outcomeTitle}</h2></div><p className="section-intro">{customerDiscovery.outcomeIntro}</p></div><div className="customer-outcome-grid">{customerDiscovery.outcomes.map((outcome) => <button type="button" key={outcome.title} className="customer-outcome-card" onClick={() => chooseCustomerOutcome(outcome.path)}><i>{outcome.icon}</i><h3>{outcome.title}</h3><p>{outcome.copy}</p><span>{language === "zh" ? "看看 OTM 怎样帮助" : language === "es" ? "Ver cómo ayuda OTM" : "See how OTM can help"} <b>→</b></span></button>)}</div></section>

        <OtmFitQuickCheck />

        <AssessmentRunway language={language} path={runwayPath} stage={runwayStage} selectedDriver={selected} evidenceGate={evidenceGates[selectedId] ?? "E0"} onChoosePath={chooseRunwayPath} onOpenGtmModule={openGtmModule} onGoToDriver={goToRunwayDriver} onGoToDiscovery={goToRunwayDiscovery} onGoToEvidence={goToRunwayEvidence} onGoToRoi={goToRunwayRoi} onGoToOutput={goToRunwayOutput} />

        <section className="section-wrap section-anchor" id="library">
          <div className="section-lead"><div><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />One Oracle value map</div><h2 className="section-heading">{familyCopy.headline}</h2></div><div className="value-map-intro"><p className="section-intro">{familyCopy.intro}</p><div className="evidence-legend" aria-label="Information readiness"><span className="quantified">{valueStatus.quantified}</span><span className="pending">{valueStatus.pending}</span><span className="directional">{valueStatus.directional}</span><span className="extension">{valueStatus.extension}</span></div></div></div>
          <div className="library-family-tabs" role="tablist" aria-label="One Oracle capability families"><button className={familyFilter === "all" ? "active" : ""} onClick={() => setFamilyFilter("all")}>{familyCopy.all}</button><button className={familyFilter === "OTM" ? "active" : ""} onClick={() => setFamilyFilter("OTM")}>{familyCopy.otm}</button><button className={familyFilter === "GTM" ? "active" : ""} onClick={() => setFamilyFilter("GTM")}>{familyCopy.gtm}</button></div>
          <div className="value-map" aria-label="One Oracle value domains">
            {visibleDrivers.map((driver) => <button key={driver.id} onClick={() => selectDriver(driver.id)} className={`value-row ${driver.status} ${driver.family.toLowerCase()} ${selectedId === driver.id ? "selected" : ""}`} aria-pressed={selectedId === driver.id}><div className="value-title"><i className={`family-chip ${driver.family.toLowerCase()}`}>{driver.family}</i>{driver.title}<span>{driver.english}</span></div><div className="value-description">{driver.description}</div><span className={`status-label ${driver.status}`}><b />{valueStatus[driver.status]}</span><span className="row-arrow">→</span></button>)}
          </div>
          <article className="detail-drawer" id="driver-detail" aria-live="polite">
            <div><div className="detail-file-strip"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>{selected.family} {familyCopy.capability}</span><b className={selected.status}>{valueStatus[selected.status]}</b></div><div className="detail-kicker">{selected.family} · {valueStatus[selected.status]}</div><h3>{selected.title}</h3><p>{selected.narrative}</p><div className="path-line"><span className="path-step">{language === "zh" ? "你的运营问题" : language === "es" ? "Su problema operativo" : "Your operating question"}</span><span className="path-step">{selected.family} {familyCopy.capability}</span><span className="path-step">{t("经营变量")}</span><span className="path-step">KPI</span><span className="path-step">{t("价值判断")}</span></div></div>
            <div className="detail-aside"><h4>{language === "zh" ? "这项价值现在能确认到什么程度？" : language === "es" ? "¿Hasta qué punto se puede confirmar este valor?" : "How much of this value can be confirmed today?"}</h4><div className="detail-status-ledger"><i className={selected.status} /><span>{valueStatus[selected.status]}</span><b>{selected.family}</b></div><div className="mini-metric"><span>{language === "zh" ? "可能改善什么" : language === "es" ? "Qué podría mejorar" : "What could improve"}</span><strong>{selected.impact}</strong></div><div className="mini-metric"><span>{language === "zh" ? "OTM/GTM 会怎样帮助" : language === "es" ? "Cómo puede ayudar OTM/GTM" : "How OTM/GTM can help"}</span><strong>{selected.driver}</strong></div><div className="mini-metric"><span>{language === "zh" ? "可以观察什么" : language === "es" ? "Qué se puede observar" : "What you can observe"}</span><strong>{selected.kpis.join(" · ")}</strong></div><div className="mini-metric"><span>{language === "zh" ? "还需要哪些资料" : language === "es" ? "Qué información aún hace falta" : "Information still needed"}</span><strong>{selected.data}</strong></div><div className="mini-metric"><span>{familyCopy.formula}</span><strong>{selected.formula}</strong></div></div>
          </article>
        </section>

        <section className="view-section section-wrap section-anchor" id="views">
          <div className="view-layout"><div className="view-statement"><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />Your working views</div><h2>{language === "zh" ? "同一套资料，帮你从不同角度看清下一步。" : language === "es" ? "La misma información, diferentes formas de aclarar su siguiente paso." : "The same information, different ways to clarify your next step."}</h2><p>{language === "zh" ? "不是内部版与客户版的区分；这是你自己从问题、资料到讨论摘要的三个视角。" : language === "es" ? "No es una separación entre versión interna y de cliente; son tres perspectivas para pasar de su problema a un resumen de discusión." : "This is not a split between an internal and client version. It is your own three views from a question to a discussion brief."}</p><div className="view-toggle">{(Object.keys(views) as ViewKey[]).map((key) => <button key={key} onClick={() => setActiveView(key)} className={activeView === key ? "active" : ""}>{views[key].label}</button>)}</div></div>
            <article className="view-card"><div className="view-card-head"><span>{view.label}</span></div><div className="view-card-body"><h3>{view.title}</h3><p>{view.copy}</p><div className="evidence-list">{view.items.map(([title, description, status]) => <div className={`evidence-item ${status}`} key={title}><i /><div><strong>{title}</strong><span>{description}</span></div></div>)}</div></div></article>
          </div>
        </section>

        <section className="assessment-grid section-anchor" id="assessment">
          <div className="assessment-image"><img src={assetUrl("/manus-storage/otm-evidence-path_0f8a0592.jpg")} alt="Abstract value evidence path" /></div>
          <div className="assessment-content"><div className="eyebrow">Your exploration questions</div><h2>{language === "zh" ? "先回答你能回答的问题，再决定要不要继续。" : language === "es" ? "Responda primero lo que ya sabe y luego decida si quiere continuar." : "First answer what you already know; then decide whether to continue."}</h2><p>{language === "zh" ? "这些问题帮你判断现有资料是否足以继续探索。只有资料和范围足够清楚时，才值得尝试价值估算。" : language === "es" ? "Estas preguntas le ayudan a decidir si su información actual permite continuar. Solo pruebe una estimación de valor cuando la información y el alcance estén claros." : "These questions help you decide whether your current information supports a deeper exploration. Try a value estimate only when the information and scope are clear."}</p><div className="question-list"><div className="question-row"><strong>{t("运输支出是否能与合同费率和运输事件逐项匹配？")}</strong><i>↗</i></div><div className="question-row"><strong>{language === "zh" ? "进出口申报量、代理费、关税货值和原产地资格是否有按国家/贸易流的可信基线？" : language === "es" ? "¿Existen líneas base confiables por país y flujo para declaraciones, honorarios de agentes, valor sujeto a arancel y elegibilidad de origen?" : "Are filing volumes, broker fees, dutiable goods value, and origin eligibility baselined credibly by country and trade flow?"}</strong><i>↗</i></div><div className="question-row"><strong>{language === "zh" ? "文件延误、例外响应与加急成本在 OTM 和 GTM 之间是否已指定唯一价值归属？" : language === "es" ? "¿Se ha asignado un único propietario de valor entre OTM y GTM para retrasos documentales, respuesta a excepciones y costes urgentes?" : "Has a single value owner been assigned between OTM and GTM for document delays, exception response, and expedite cost?"}</strong><i>↗</i></div><div className="question-row"><strong>{language === "zh" ? "风险规避、FTA 和 drawback 是否具备资格、范围、实现率及法务/财务确认？" : language === "es" ? "¿Riesgo evitado, FTA y drawback tienen elegibilidad, alcance, tasa de realización y confirmación legal/financiera?" : "Do risk avoidance, FTA, and drawback have eligibility, scope, realization rate, and legal/finance confirmation?"}</strong><i>↗</i></div></div></div>
        </section>

        <AssessmentWorkflow drivers={localizedDrivers} evidenceGates={evidenceGates} onEvidenceGateChange={(driverId, gate) => setEvidenceGates((current) => ({ ...current, [driverId]: gate }))} brandMarkSrc={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} onSelectDriver={selectDriver} runwayFocus={runwayPath === "optimization" ? "optimization" : runwayPath === "visibility" ? "visibility" : runwayPath === "audit" ? "audit" : undefined} />

        <section className="overlap-dossier section-wrap"><div className="overlap-file"><div className="eyebrow">One Oracle governance</div><h3>{familyCopy.overlap}</h3><p>{familyCopy.overlapCopy}</p></div><div className="overlap-matrix"><span>OTM visibility</span><b>↔</b><span>GTM documentation</span><i>ONE ECONOMIC OWNER</i><em>Delay / expedite exposure</em></div></section>

        <RoiExportWorkspace drivers={localizedDrivers} evidenceGates={evidenceGates} onEvidenceGateChange={(driverId, gate) => setEvidenceGates((current) => ({ ...current, [driverId]: gate }))} brandMarkSrc={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} />

        <section className="narrative-section section-wrap section-anchor" id="narrative">
          <div className="section-lead"><div><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />Narrative scaffold</div><h2 className="section-heading">{t("用证据状态管理范围，而不是用全部能力堆叠范围。")}</h2></div><p className="section-intro">{t("每一个新增诉求必须进入既定 driver 卡，并明确其证据层级、数据条件和决策门槛。")}</p></div>
          <div className="narrative-grid"><div className="narrative-steps"><div className="narrative-file-strip"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>CASE FILE / SCOPE CONTROL</span><b>04</b></div><div className="narrative-step"><span className="step-number">LAYER / 1</span><div><h3>{t("已验证的核心价值")}</h3><p>{t("US freight audit 与 visibility 的直接价值闭环；使用基线、范围、去重规则和敏感性表达。")}</p></div><span className="step-tag">Hard ROI</span></div><div className="narrative-step"><span className="step-number">LAYER / 2</span><div><h3>{t("有证据、待量化的扩展价值")}</h3><p>{t("Europe 的相同 driver 或相邻机会；说明诊断和验证计划，不承诺具体金额。")}</p></div><span className="step-tag">Validate</span></div><div className="narrative-step"><span className="step-number">LAYER / 3</span><div><h3>{t("战略路线图选项")}</h3><p>{t("网络建模、车队、可持续性或更广 Oracle 能力；保留给独立的范围确认和商业案例。")}</p></div><span className="step-tag">Roadmap</span></div></div><div className="narrative-art"><img src={assetUrl("/manus-storage/otm-narrative-layers_d2d229db.jpg")} alt="Abstract layered business-case narrative" /></div></div>
        </section>

        <footer className="footer-strip"><h2>{t("先确认数据成熟度，再进入 ROI 计算。")}</h2><div className="footer-note"><b>Operational principle</b>{t("OTM Value Driver Library 将每个价值主张锚定到痛点、能力、经营变量、KPI 与可审计的证据状态。")}</div></footer>
      </main>
    </div>
  );
}
