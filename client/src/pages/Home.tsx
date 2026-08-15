/* Design reminder: "决策档案室" — evidence-first interactive archive; use asymmetric editorial composition and restrained vermilion highlights. */
import { useMemo, useState } from "react";
import AssessmentWorkflow from "@/components/AssessmentWorkflow";
import AssessmentRunway, { type RunwayPath, type RunwayStage } from "@/components/AssessmentRunway";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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
  const [selectedId, setSelectedId] = useState("04");
  const [familyFilter, setFamilyFilter] = useState<FamilyFilter>("all");
  const [activeView, setActiveView] = useState<ViewKey>("explore");
  const [evidenceGates, setEvidenceGates] = useState<Record<string, EvidenceGate>>(DEFAULT_EVIDENCE_GATES);
  const [runwayPath, setRunwayPath] = useState<RunwayPath | null>(null);
  const [runwayStage, setRunwayStage] = useState<RunwayStage>("problem");
  const familyCopy = FAMILY_COPY[language];
  const localizedDrivers = useMemo(() => DRIVERS.map((driver) => localizeDriver(driver, language, t)), [language]);
  const visibleDrivers = useMemo(() => localizedDrivers.filter((driver) => familyFilter === "all" || driver.family === familyFilter), [localizedDrivers, familyFilter]);
  const selected = useMemo(() => localizedDrivers.find((driver) => driver.id === selectedId) ?? localizedDrivers[0], [localizedDrivers, selectedId]);
  const views = VIEWS[language];
  const view = views[activeView];

  const selectDriver = (id: string) => { setSelectedId(id); window.setTimeout(() => scrollToId("driver-detail"), 10); };
  const chooseRunwayPath = (path: RunwayPath) => {
    const driverId = path === "optimization" ? "01" : path === "audit" ? "04" : path === "visibility" ? "05" : "01";
    setRunwayPath(path);
    setSelectedId(driverId);
    setRunwayStage("driver");
  };
  const goToRunwayDriver = () => { setRunwayStage("discovery"); scrollToId("driver-detail"); };
  const goToRunwayDiscovery = () => { setRunwayStage("evidence"); scrollToId("discovery-file"); };
  const goToRunwayEvidence = () => { setRunwayStage("evidence"); scrollToId("evidence-gate"); };
  const goToRunwayRoi = () => { setRunwayStage("roi"); scrollToId("roi-export"); };
  const goToRunwayOutput = () => { setRunwayStage("output"); scrollToId("roi-export"); };

  return (
    <div className="archive-shell">
      <div className="top-ledger"><span className="ledger-identity"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />One Oracle Decision Archive · Your OTM Exploration</span><div className="top-ledger-tools"><a href="/client-brief">{language === "zh" ? "三分钟快速探索" : language === "es" ? "Exploración rápida" : "Three-minute quick start"}</a><LanguageSwitcher /><span>Evidence before assertion</span></div></div>
      <aside className="sidebar-rail" aria-label={t("Value Driver 目录")}>
        <div className="brand-block">
          <img className="brand-mark" src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="Value Driver Library mark" />
          <div><div className="brand-name">Value Driver<br />Library</div><div className="brand-sub">One Oracle / Decision Archive</div></div>
        </div>
        <nav className="rail-nav">
          <p className="rail-kicker">Value domains / {String(localizedDrivers.length).padStart(2, "0")}</p>
          {localizedDrivers.map((driver) => <button key={driver.id} onClick={() => selectDriver(driver.id)} className={`nav-archive-item ${selectedId === driver.id ? "active" : ""}`}><span className="nav-index">{driver.family === "GTM" ? "G" : driver.id}</span><span className="nav-label">{driver.title}</span><i className={`nav-dot ${driver.status}`} /></button>)}
        </nav>
        <div className="rail-footer"><span>{t("框架原则")}</span><p>{t("价值主张必须可追溯到痛点、能力、经营变量、KPI 与证据状态。")}</p></div>
      </aside>

      <main className="page-main">
        <section className="hero" id="overview">
          <img className="hero-image" src={assetUrl("/manus-storage/otm-archive-hero_347dc198.jpg")} alt="Abstract transportation value evidence archive" />
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="hero-file-header"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>FILE / OO-VDL-001</span><b>DECISION EVIDENCE</b><i>OTM ↔ GTM</i></div>
            <div className="hero-meta"><i /> Framework / Value Driver Library</div>
            <div className="hero-file-caption"><span>Evidence register</span><b>pain point → capability → KPI → value</b></div>
            <h1>{t("从运输信号，建立")}<br /><em>{t("可验证的")}</em>{t("价值档案。")}</h1>
            <p className="hero-copy">{language === "zh" ? "先从 Shipment Optimization 开始：用你的订单、路线、运力和服务约束，弄清哪里可以计划得更满、更准、更少临时改动；再按需要探索费用完整性与可视化。" : language === "es" ? "Empiece por Shipment Optimization: use sus pedidos, rutas, capacidad y restricciones de servicio para aclarar dónde puede planificar cargas más completas, mejores decisiones y menos cambios; después explore integridad de gasto y visibilidad según sea necesario." : "Start with Shipment Optimization: use your orders, routes, capacity, and service constraints to clarify where you can plan fuller loads, make better decisions, and reduce plan changes; then explore spend integrity and visibility as needed."}</p>
            <div className="hero-causal-rail" aria-label="Value causal path"><span>{t("痛点")}</span><b>01</b><span>{t("能力")}</span><b>02</b><span>{t("变量")}</span><b>03</b><span>KPI</span><b>04</b><span>{t("价值")}</span></div>
            <div className="hero-actions"><a className="button-archive" href="#assessment-runway">{language === "zh" ? "开始我的探索" : language === "es" ? "Iniciar mi exploración" : "Start my exploration"} <span>↓</span></a><a className="button-archive ghost" href="#library">{language === "zh" ? "浏览价值档案" : language === "es" ? "Explorar la biblioteca" : "Explore the library"} <span>↗</span></a></div>
            <div className="hero-runway-launch" aria-label={language === "zh" ? "从你的问题开始" : language === "es" ? "Empiece con su pregunta" : "Start with your question"}>
              <div className="hero-runway-launch-head"><span>START HERE / ASSESSMENT RUNWAY</span><b>{language === "zh" ? "从你的问题开始" : language === "es" ? "Empiece con su pregunta" : "Start with your question"}</b></div>
              <div className="hero-runway-launch-options">
                <button onClick={() => { chooseRunwayPath("optimization"); window.setTimeout(() => scrollToId("assessment-runway"), 10); }}><span>01</span><strong>Shipment Optimization</strong><i>↘</i></button>
                <button onClick={() => { chooseRunwayPath("audit"); window.setTimeout(() => scrollToId("assessment-runway"), 10); }}><span>02</span><strong>{language === "zh" ? "运费、发票与结算" : language === "es" ? "Gasto de flete, facturas y liquidación" : "Freight spend, invoices and settlement"}</strong><i>↘</i></button>
                <button onClick={() => { chooseRunwayPath("visibility"); window.setTimeout(() => scrollToId("assessment-runway"), 10); }}><span>03</span><strong>{language === "zh" ? "可视化与异常" : language === "es" ? "Visibilidad y excepciones" : "Visibility and exceptions"}</strong><i>↘</i></button>
                <button onClick={() => { chooseRunwayPath("broader"); window.setTimeout(() => scrollToId("assessment-runway"), 10); }}><span>04</span><strong>{language === "zh" ? "其他运输或贸易问题" : language === "es" ? "Otra pregunta de transporte o comercio" : "Another transport or trade question"}</strong><i>↘</i></button>
              </div>
            </div>
          </div>
        </section>

        <AssessmentRunway language={language} path={runwayPath} stage={runwayStage} selectedDriver={selected} evidenceGate={evidenceGates[selectedId] ?? "E0"} onChoosePath={chooseRunwayPath} onGoToDriver={goToRunwayDriver} onGoToDiscovery={goToRunwayDiscovery} onGoToEvidence={goToRunwayEvidence} onGoToRoi={goToRunwayRoi} onGoToOutput={goToRunwayOutput} />

        <section className="section-wrap section-anchor" id="library">
          <div className="section-lead"><div><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />01 / One Oracle value map</div><h2 className="section-heading">{familyCopy.headline}</h2></div><div className="value-map-intro"><p className="section-intro">{familyCopy.intro}</p><div className="evidence-legend" aria-label="Evidence status"><span className="quantified">{t("已量化")}</span><span className="pending">{t("待量化")}</span><span className="directional">{t("方向性")}</span><span className="extension">{t("可选扩展")}</span></div></div></div>
          <div className="library-family-tabs" role="tablist" aria-label="One Oracle capability families"><button className={familyFilter === "all" ? "active" : ""} onClick={() => setFamilyFilter("all")}>{familyCopy.all}<b>{localizedDrivers.length}</b></button><button className={familyFilter === "OTM" ? "active" : ""} onClick={() => setFamilyFilter("OTM")}>{familyCopy.otm}<b>{localizedDrivers.filter((driver) => driver.family === "OTM").length}</b></button><button className={familyFilter === "GTM" ? "active" : ""} onClick={() => setFamilyFilter("GTM")}>{familyCopy.gtm}<b>{localizedDrivers.filter((driver) => driver.family === "GTM").length}</b></button></div>
          <div className="value-map" aria-label="One Oracle value domains">
            {visibleDrivers.map((driver) => <button key={driver.id} onClick={() => selectDriver(driver.id)} className={`value-row ${driver.status} ${driver.family.toLowerCase()} ${selectedId === driver.id ? "selected" : ""}`} aria-pressed={selectedId === driver.id}><span className="value-number">{driver.id}</span><div className="value-title"><i className={`family-chip ${driver.family.toLowerCase()}`}>{driver.family}</i>{driver.title}<span>{driver.english}</span></div><div className="value-description">{driver.description}</div><span className={`status-label ${driver.status}`}><b />{driver.statusLabel}</span><span className="row-arrow">→</span></button>)}
          </div>
          <article className="detail-drawer" id="driver-detail" aria-live="polite">
            <div><div className="detail-file-strip"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>DRIVER FILE / {selected.family}-{selected.id}</span><b className={selected.status}>{selected.statusLabel}</b></div><div className="detail-kicker">{selected.family} / Selected driver / {selected.id} · {selected.statusLabel}</div><h3>{selected.title}</h3><p>{selected.narrative}</p><div className="path-line"><span className="path-step"><b>01</b>{language === "zh" ? "你的运营问题" : language === "es" ? "Su problema operativo" : "Your operating question"}</span><span className="path-step"><b>02</b>{selected.family} {familyCopy.capability}</span><span className="path-step"><b>03</b>{t("经营变量")}</span><span className="path-step"><b>04</b>KPI</span><span className="path-step"><b>05</b>{t("价值判断")}</span></div></div>
            <div className="detail-aside"><h4>Evidence register</h4><div className="detail-status-ledger"><i className={selected.status} /><span>{selected.statusLabel}</span><b>FILED / {selected.family}</b></div><div className="mini-metric"><span>Value</span><strong>{selected.impact}</strong></div><div className="mini-metric"><span>Drivers</span><strong>{selected.driver}</strong></div><div className="mini-metric"><span>KPIs</span><strong>{selected.kpis.join(" · ")}</strong></div><div className="mini-metric"><span>Data</span><strong>{selected.data}</strong></div><div className="mini-metric"><span>{familyCopy.formula}</span><strong>{selected.formula}</strong></div></div>
          </article>
        </section>

        <section className="view-section section-wrap section-anchor" id="views">
          <div className="view-layout"><div className="view-statement"><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />02 / Your working views</div><h2>{language === "zh" ? "同一套资料，帮你从不同角度看清下一步。" : language === "es" ? "La misma información, diferentes formas de aclarar su siguiente paso." : "The same information, different ways to clarify your next step."}</h2><p>{language === "zh" ? "不是内部版与客户版的区分；这是你自己从问题、资料到讨论摘要的三个视角。" : language === "es" ? "No es una separación entre versión interna y de cliente; son tres perspectivas para pasar de su problema a un resumen de discusión." : "This is not a split between an internal and client version. It is your own three views from a question to a discussion brief."}</p><div className="view-toggle">{(Object.keys(views) as ViewKey[]).map((key) => <button key={key} onClick={() => setActiveView(key)} className={activeView === key ? "active" : ""}>{views[key].label}</button>)}</div></div>
            <article className="view-card"><div className="view-card-head"><span>{view.code}</span><span>{view.label}</span></div><div className="view-card-body"><h3>{view.title}</h3><p>{view.copy}</p><div className="evidence-list">{view.items.map(([title, description, status]) => <div className={`evidence-item ${status}`} key={title}><i /><div><strong>{title}</strong><span>{description}</span></div></div>)}</div></div></article>
          </div>
        </section>

        <section className="assessment-grid section-anchor" id="assessment">
          <div className="assessment-image"><img src={assetUrl("/manus-storage/otm-evidence-path_0f8a0592.jpg")} alt="Abstract value evidence path" /></div>
          <div className="assessment-content"><div className="eyebrow">03 / Your exploration questions</div><h2>{language === "zh" ? "先回答你能回答的问题，再决定要不要继续。" : language === "es" ? "Responda primero lo que ya sabe y luego decida si quiere continuar." : "First answer what you already know; then decide whether to continue."}</h2><p>{language === "zh" ? "这些问题帮你判断现有资料是否足以继续探索。只有资料和范围足够清楚时，才值得尝试价值估算。" : language === "es" ? "Estas preguntas le ayudan a decidir si su información actual permite continuar. Solo pruebe una estimación de valor cuando la información y el alcance estén claros." : "These questions help you decide whether your current information supports a deeper exploration. Try a value estimate only when the information and scope are clear."}</p><div className="question-list"><div className="question-row"><span>01</span><strong>{t("运输支出是否能与合同费率和运输事件逐项匹配？")}</strong><i>↗</i></div><div className="question-row"><span>02</span><strong>{language === "zh" ? "进出口申报量、代理费、关税货值和原产地资格是否有按国家/贸易流的可信基线？" : language === "es" ? "¿Existen líneas base confiables por país y flujo para declaraciones, honorarios de agentes, valor sujeto a arancel y elegibilidad de origen?" : "Are filing volumes, broker fees, dutiable goods value, and origin eligibility baselined credibly by country and trade flow?"}</strong><i>↗</i></div><div className="question-row"><span>03</span><strong>{language === "zh" ? "文件延误、例外响应与加急成本在 OTM 和 GTM 之间是否已指定唯一价值归属？" : language === "es" ? "¿Se ha asignado un único propietario de valor entre OTM y GTM para retrasos documentales, respuesta a excepciones y costes urgentes?" : "Has a single value owner been assigned between OTM and GTM for document delays, exception response, and expedite cost?"}</strong><i>↗</i></div><div className="question-row"><span>04</span><strong>{language === "zh" ? "风险规避、FTA 和 drawback 是否具备资格、范围、实现率及法务/财务确认？" : language === "es" ? "¿Riesgo evitado, FTA y drawback tienen elegibilidad, alcance, tasa de realización y confirmación legal/financiera?" : "Do risk avoidance, FTA, and drawback have eligibility, scope, realization rate, and legal/finance confirmation?"}</strong><i>↗</i></div></div></div>
        </section>

        <AssessmentWorkflow drivers={localizedDrivers} evidenceGates={evidenceGates} onEvidenceGateChange={(driverId, gate) => setEvidenceGates((current) => ({ ...current, [driverId]: gate }))} brandMarkSrc={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} onSelectDriver={selectDriver} runwayFocus={runwayPath === "optimization" ? "optimization" : runwayPath === "visibility" ? "visibility" : runwayPath === "audit" ? "audit" : undefined} />

        <section className="overlap-dossier section-wrap"><div className="overlap-file"><div className="eyebrow">03.5 / One Oracle governance</div><h3>{familyCopy.overlap}</h3><p>{familyCopy.overlapCopy}</p></div><div className="overlap-matrix"><span>OTM visibility</span><b>↔</b><span>GTM documentation</span><i>ONE ECONOMIC OWNER</i><em>Delay / expedite exposure</em></div></section>

        <RoiExportWorkspace drivers={localizedDrivers} evidenceGates={evidenceGates} onEvidenceGateChange={(driverId, gate) => setEvidenceGates((current) => ({ ...current, [driverId]: gate }))} brandMarkSrc={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} />

        <section className="narrative-section section-wrap section-anchor" id="narrative">
          <div className="section-lead"><div><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />04 / Narrative scaffold</div><h2 className="section-heading">{t("用证据状态管理范围，而不是用全部能力堆叠范围。")}</h2></div><p className="section-intro">{t("每一个新增诉求必须进入既定 driver 卡，并明确其证据层级、数据条件和决策门槛。")}</p></div>
          <div className="narrative-grid"><div className="narrative-steps"><div className="narrative-file-strip"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>CASE FILE / SCOPE CONTROL</span><b>04</b></div><div className="narrative-step"><span className="step-number">LAYER / 1</span><div><h3>{t("已验证的核心价值")}</h3><p>{t("US freight audit 与 visibility 的直接价值闭环；使用基线、范围、去重规则和敏感性表达。")}</p></div><span className="step-tag">Hard ROI</span></div><div className="narrative-step"><span className="step-number">LAYER / 2</span><div><h3>{t("有证据、待量化的扩展价值")}</h3><p>{t("Europe 的相同 driver 或相邻机会；说明诊断和验证计划，不承诺具体金额。")}</p></div><span className="step-tag">Validate</span></div><div className="narrative-step"><span className="step-number">LAYER / 3</span><div><h3>{t("战略路线图选项")}</h3><p>{t("网络建模、车队、可持续性或更广 Oracle 能力；保留给独立的范围确认和商业案例。")}</p></div><span className="step-tag">Roadmap</span></div></div><div className="narrative-art"><img src={assetUrl("/manus-storage/otm-narrative-layers_d2d229db.jpg")} alt="Abstract layered business-case narrative" /></div></div>
        </section>

        <footer className="footer-strip"><h2>{t("先确认数据成熟度，再进入 ROI 计算。")}</h2><div className="footer-note"><b>Operational principle</b>{t("OTM Value Driver Library 将每个价值主张锚定到痛点、能力、经营变量、KPI 与可审计的证据状态。")}</div></footer>
      </main>
    </div>
  );
}
