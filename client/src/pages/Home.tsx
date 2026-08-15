/* Design reminder: "决策档案室" — evidence-first interactive archive; use asymmetric editorial composition and restrained vermilion highlights. */
import { useMemo, useState } from "react";
import AssessmentWorkflow from "@/components/AssessmentWorkflow";
import AssessmentRunway, { type RunwayPath, type RunwayStage } from "@/components/AssessmentRunway";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RoiExportWorkspace from "@/components/RoiExportWorkspace";
import { useLanguage } from "@/contexts/LanguageContext";
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

const VIEWS = {
  internal: {
    label: "内部工作台",
    code: "VIEW / 01",
    title: "让每个主张都能回到数据。",
    copy: "为售前、咨询与财务团队保留方法论、公式准备度、数据血缘与去重规则。这里不是客户交付物，而是受控的价值工作底稿。",
    items: [["ROI 公式家族", "已定义；需逐项验证假设与去重逻辑", "quantified"], ["数据质量门槛", "发票、费率、运输事件必须可匹配", "pending"], ["范围与产品边界", "OTM 与更广 Oracle 能力独立标识", "directional"], ["批准状态", "首期仅纳入已确认的 US 价值闭环", "quantified"]],
  },
  assessment: {
    label: "客户 Value Assessment",
    code: "VIEW / 02",
    title: "先看清机会，再讨论数字。",
    copy: "以诊断问题、KPI 和所需数据帮助客户共同识别价值；不展示内部方法论，也不把尚未验证的机会伪装成已承诺收益。",
    items: [["客户触发条件", "哪些费率、账单或状态信号正在造成损失？", "quantified"], ["可验证的机会", "先确认基线、范围和可用证据", "pending"], ["所需数据类别", "运输、账单、费率、里程碑和服务事件", "pending"], ["证据状态", "已量化 / 有证据待量化 / 方向性", "directional"]],
  },
  business: {
    label: "Business Case",
    code: "VIEW / 03",
    title: "把已证实的发现转成决策。",
    copy: "面向预算与优先级决策者，呈现已选 driver 的量化价值、关键假设、实施依赖和分期路线图；未验证的内容保留在扩展层。",
    items: [["核心价值", "US freight audit + visibility 的直接、去重 ROI", "quantified"], ["关键假设", "基线、适用费率、可实现性与责任归属", "pending"], ["分期范围", "首期验证 US；Europe 进入独立证据阶段", "directional"], ["下一决策", "用验证门槛控制后续产品与区域扩展", "quantified"]],
  },
} as const;

function scrollToId(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

export default function Home() {
  const { language } = useLanguage();
  const t = (value: string) => translate(language, value);
  const [selectedId, setSelectedId] = useState("04");
  const [familyFilter, setFamilyFilter] = useState<FamilyFilter>("all");
  const [activeView, setActiveView] = useState<keyof typeof VIEWS>("internal");
  const [evidenceGates, setEvidenceGates] = useState<Record<string, EvidenceGate>>(DEFAULT_EVIDENCE_GATES);
  const [runwayPath, setRunwayPath] = useState<RunwayPath | null>(null);
  const [runwayStage, setRunwayStage] = useState<RunwayStage>("problem");
  const familyCopy = FAMILY_COPY[language];
  const localizedDrivers = useMemo(() => DRIVERS.map((driver) => localizeDriver(driver, language, t)), [language]);
  const visibleDrivers = useMemo(() => localizedDrivers.filter((driver) => familyFilter === "all" || driver.family === familyFilter), [localizedDrivers, familyFilter]);
  const selected = useMemo(() => localizedDrivers.find((driver) => driver.id === selectedId) ?? localizedDrivers[0], [localizedDrivers, selectedId]);
  const view = VIEWS[activeView];

  const selectDriver = (id: string) => { setSelectedId(id); window.setTimeout(() => scrollToId("driver-detail"), 10); };
  const chooseRunwayPath = (path: RunwayPath) => {
    const driverId = path === "audit" ? "04" : path === "visibility" ? "05" : "01";
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
      <div className="top-ledger"><span className="ledger-identity"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />One Oracle Value Driver Library · Framework v0.2</span><div className="top-ledger-tools"><LanguageSwitcher /><span>Evidence before assertion</span></div></div>
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
          <div className="hero-dossier-frame" aria-hidden="true"><span>FILE / OTM-VDL-01</span><span>DECISION DOSSIER</span><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /></div>
          <div className="hero-evidence-stamp" aria-hidden="true"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>EVIDENCE<br />FILED</span><b>01</b></div>
          <div className="hero-margin-file" aria-hidden="true"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>CASE FILE</span><b>01</b><i>US / Audit + Visibility</i></div>
          <div className="hero-content">
            <div className="hero-file-header"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>FILE / OO-VDL-001</span><b>DECISION EVIDENCE</b><i>OTM ↔ GTM</i></div>
            <div className="hero-meta"><i /> Framework / Value Driver Library</div>
            <div className="hero-file-caption"><span>Evidence register</span><b>pain point → capability → KPI → value</b></div>
            <h1>{t("从运输信号，建立")}<br /><em>{t("可验证的")}</em>{t("价值档案。")}</h1>
            <p className="hero-copy">{language === "zh" ? "以 OTM、GTM 能力、客户数据、ROI 方法和决策叙事构成一条有证据、可回溯、可组装的 One Oracle 价值路径。" : language === "es" ? "Conecte capacidades OTM y GTM, datos del cliente, métodos ROI y narrativa de decisión en una ruta de valor One Oracle trazable y basada en evidencia." : "Connect OTM and GTM capabilities, customer data, ROI methods, and a decision narrative into an evidence-led, traceable One Oracle value path."}</p>
            <div className="hero-causal-rail" aria-label="Value causal path"><span>{t("痛点")}</span><b>01</b><span>{t("能力")}</span><b>02</b><span>{t("变量")}</span><b>03</b><span>KPI</span><b>04</b><span>{t("价值")}</span></div>
            <div className="hero-actions"><a className="button-archive" href="#library">{t("检索价值档案")} <span>↓</span></a><button className="button-archive ghost" onClick={() => selectDriver("04")}>{t("验证当前证据")} <span>↗</span></button></div>
          </div>
          <aside className="hero-annotation"><strong>Current focus</strong>US freight audit & visibility<br />{t("已量化的首期价值闭环")}</aside>
        </section>

        <AssessmentRunway language={language} path={runwayPath} stage={runwayStage} selectedDriver={selected} evidenceGate={evidenceGates[selectedId] ?? "E0"} onChoosePath={chooseRunwayPath} onGoToDriver={goToRunwayDriver} onGoToDiscovery={goToRunwayDiscovery} onGoToEvidence={goToRunwayEvidence} onGoToRoi={goToRunwayRoi} onGoToOutput={goToRunwayOutput} />

        <section className="section-wrap section-anchor" id="library">
          <div className="section-lead"><div><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />01 / One Oracle value map</div><h2 className="section-heading">{familyCopy.headline}</h2></div><div className="value-map-intro"><p className="section-intro">{familyCopy.intro}</p><div className="evidence-legend" aria-label="Evidence status"><span className="quantified">{t("已量化")}</span><span className="pending">{t("待量化")}</span><span className="directional">{t("方向性")}</span><span className="extension">{t("可选扩展")}</span></div></div></div>
          <div className="library-family-tabs" role="tablist" aria-label="One Oracle capability families"><button className={familyFilter === "all" ? "active" : ""} onClick={() => setFamilyFilter("all")}>{familyCopy.all}<b>{localizedDrivers.length}</b></button><button className={familyFilter === "OTM" ? "active" : ""} onClick={() => setFamilyFilter("OTM")}>{familyCopy.otm}<b>{localizedDrivers.filter((driver) => driver.family === "OTM").length}</b></button><button className={familyFilter === "GTM" ? "active" : ""} onClick={() => setFamilyFilter("GTM")}>{familyCopy.gtm}<b>{localizedDrivers.filter((driver) => driver.family === "GTM").length}</b></button></div>
          <div className="value-map" aria-label="One Oracle value domains">
            {visibleDrivers.map((driver) => <button key={driver.id} onClick={() => selectDriver(driver.id)} className={`value-row ${driver.status} ${driver.family.toLowerCase()} ${selectedId === driver.id ? "selected" : ""}`} aria-pressed={selectedId === driver.id}><span className="value-number">{driver.id}</span><div className="value-title"><i className={`family-chip ${driver.family.toLowerCase()}`}>{driver.family}</i>{driver.title}<span>{driver.english}</span></div><div className="value-description">{driver.description}</div><span className={`status-label ${driver.status}`}><b />{driver.statusLabel}</span><span className="row-arrow">→</span></button>)}
          </div>
          <article className="detail-drawer" id="driver-detail" aria-live="polite">
            <div><div className="detail-file-strip"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>DRIVER FILE / {selected.family}-{selected.id}</span><b className={selected.status}>{selected.statusLabel}</b></div><div className="detail-kicker">{selected.family} / Selected driver / {selected.id} · {selected.statusLabel}</div><h3>{selected.title}</h3><p>{selected.narrative}</p><div className="path-line"><span className="path-step"><b>01</b>{t("客户痛点")}</span><span className="path-step"><b>02</b>{selected.family} {familyCopy.capability}</span><span className="path-step"><b>03</b>{t("经营变量")}</span><span className="path-step"><b>04</b>KPI</span><span className="path-step"><b>05</b>{t("价值判断")}</span></div></div>
            <div className="detail-aside"><h4>Evidence register</h4><div className="detail-status-ledger"><i className={selected.status} /><span>{selected.statusLabel}</span><b>FILED / {selected.family}</b></div><div className="mini-metric"><span>Value</span><strong>{selected.impact}</strong></div><div className="mini-metric"><span>Drivers</span><strong>{selected.driver}</strong></div><div className="mini-metric"><span>KPIs</span><strong>{selected.kpis.join(" · ")}</strong></div><div className="mini-metric"><span>Data</span><strong>{selected.data}</strong></div><div className="mini-metric"><span>{familyCopy.formula}</span><strong>{selected.formula}</strong></div></div>
          </article>
        </section>

        <section className="view-section section-wrap section-anchor" id="views">
          <div className="view-layout"><div className="view-statement"><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />02 / Same evidence, different view</div><h2>{t("一次维护，三种决策视图。")}</h2><p>{t("不从头建立客户版与内部版。每张 driver 卡都是唯一事实源，只按读者改变展示深度。")}</p><div className="view-toggle">{(Object.keys(VIEWS) as Array<keyof typeof VIEWS>).map((key) => <button key={key} onClick={() => setActiveView(key)} className={activeView === key ? "active" : ""}>{t(VIEWS[key].label)}</button>)}</div></div>
            <article className="view-card"><div className="view-card-head"><span>{view.code}</span><span>{t(view.label)}</span></div><div className="view-card-body"><h3>{t(view.title)}</h3><p>{t(view.copy)}</p><div className="evidence-list">{view.items.map(([title, description, status]) => <div className={`evidence-item ${status}`} key={title}><i /><div><strong>{t(title)}</strong><span>{t(description)}</span></div></div>)}</div></div></article>
          </div>
        </section>

        <section className="assessment-grid section-anchor" id="assessment">
          <div className="assessment-image"><img src={assetUrl("/manus-storage/otm-evidence-path_0f8a0592.jpg")} alt="Abstract value evidence path" /></div>
          <div className="assessment-content"><div className="eyebrow">03 / Assessment entry</div><h2>{t("Value Assessment 是共同诊断，不是预设结论。")}</h2><p>{t("从客户可以回答的问题开始，逐步确认基线、数据和证据状态；只有通过数据门槛的 driver 才进入 ROI 计算和预算叙事。")}</p><div className="question-list"><div className="question-row"><span>01</span><strong>{t("运输支出是否能与合同费率和运输事件逐项匹配？")}</strong><i>↗</i></div><div className="question-row"><span>02</span><strong>{language === "zh" ? "进出口申报量、代理费、关税货值和原产地资格是否有按国家/贸易流的可信基线？" : language === "es" ? "¿Existen líneas base confiables por país y flujo para declaraciones, honorarios de agentes, valor sujeto a arancel y elegibilidad de origen?" : "Are filing volumes, broker fees, dutiable goods value, and origin eligibility baselined credibly by country and trade flow?"}</strong><i>↗</i></div><div className="question-row"><span>03</span><strong>{language === "zh" ? "文件延误、例外响应与加急成本在 OTM 和 GTM 之间是否已指定唯一价值归属？" : language === "es" ? "¿Se ha asignado un único propietario de valor entre OTM y GTM para retrasos documentales, respuesta a excepciones y costes urgentes?" : "Has a single value owner been assigned between OTM and GTM for document delays, exception response, and expedite cost?"}</strong><i>↗</i></div><div className="question-row"><span>04</span><strong>{language === "zh" ? "风险规避、FTA 和 drawback 是否具备资格、范围、实现率及法务/财务确认？" : language === "es" ? "¿Riesgo evitado, FTA y drawback tienen elegibilidad, alcance, tasa de realización y confirmación legal/financiera?" : "Do risk avoidance, FTA, and drawback have eligibility, scope, realization rate, and legal/finance confirmation?"}</strong><i>↗</i></div></div></div>
        </section>

        <AssessmentWorkflow drivers={localizedDrivers} evidenceGates={evidenceGates} onEvidenceGateChange={(driverId, gate) => setEvidenceGates((current) => ({ ...current, [driverId]: gate }))} brandMarkSrc={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} onSelectDriver={selectDriver} runwayFocus={runwayPath === "visibility" ? "visibility" : runwayPath === "audit" ? "audit" : undefined} />

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
