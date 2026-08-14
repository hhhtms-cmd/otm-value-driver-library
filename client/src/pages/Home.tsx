/* Design reminder: "决策档案室" — evidence-first interactive archive; use asymmetric editorial composition and restrained vermilion highlights. */
import { useMemo, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RoiExportWorkspace from "@/components/RoiExportWorkspace";
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from "@/lib/i18n";

const MANUS_ASSET_ORIGIN = "https://otmvaldriv-n3maueuh.manus.space";
const assetUrl = (assetPath: string) => window.location.hostname.endsWith("github.io") ? `${MANUS_ASSET_ORIGIN}${assetPath}` : assetPath;

type DriverStatus = "quantified" | "pending" | "directional" | "extension";
export type Driver = {
  id: string;
  title: string;
  english: string;
  description: string;
  status: DriverStatus;
  statusLabel: string;
  impact: string;
  driver: string;
  kpis: string[];
  data: string;
  narrative: string;
};

export const DRIVERS: Driver[] = [
  { id: "01", title: "运输规划与 Cost-to-Serve 优化", english: "Planning & Cost-to-Serve", description: "以方式、路线、服务等级与合并逻辑降低每单位运输成本。", status: "pending", statusLabel: "待量化", impact: "成本与利用率", driver: "模式 / 路径选择 · 订单合并 · 加急管控", kpis: ["每票运输成本", "装载率", "加急运费"], data: "订单、费率、路线、服务等级和历史运量", narrative: "用于说明客户是否在每次运输中作出合适的成本—服务权衡。" },
  { id: "02", title: "承运商采购、商业条款与运力管理", english: "Carrier & Capacity", description: "将竞争性运价、可靠运力与承运商履约放入同一商业控制面。", status: "pending", statusLabel: "待量化", impact: "条款与运力", driver: "电子招标 · 费率治理 · 分配合规", kpis: ["合同价差", "主承运商使用率", "接受率"], data: "合同、tender、实际运价、承运商绩效", narrative: "用于把 carrier 管理从关系管理转换为可观察的经济表现。" },
  { id: "03", title: "运输执行与作业自动化", english: "Execution & Automation", description: "减少人工触点、重复沟通与操作偏差，让团队规模随运量而不是随人头增长。", status: "pending", statusLabel: "待量化", impact: "生产率", driver: "自动建运单 · 承运商协同 · 例外工作流", kpis: ["每票处理分钟", "自动化率", "返工率"], data: "流程日志、作业量、FTE、错误与返工记录", narrative: "用于建立业务效率而非单纯系统功能的价值基线。" },
  { id: "04", title: "货运支出完整性、审计与财务结算", english: "Spend Integrity & Settlement", description: "识别错付、重复账单和费率偏差，并把争议、结算与预提纳入闭环。", status: "quantified", statusLabel: "已量化", impact: "支出泄漏", driver: "三方匹配 · 异常收费 · 争议闭环", kpis: ["审计命中金额", "错付率", "账单一次通过率"], data: "发票、合同费率、运输事件、争议与付款记录", narrative: "首期硬 ROI 的核心：只把可验证、可去重的回收和避免支出计入。" },
  { id: "05", title: "运输可视化、例外响应与服务保障", english: "Visibility & Service Assurance", description: "更早看见风险、编排响应并提升承诺交付的可靠性。", status: "quantified", statusLabel: "已量化", impact: "服务与响应", driver: "里程碑 · ETA · 延迟预警 · 状态沟通", kpis: ["OTIF", "例外关闭时间", "加急补救成本"], data: "里程碑、ETA、延迟事件、客服与补救成本", narrative: "与 freight audit 组合形成“检测—决策—纠正—结算”的可验证闭环。" },
  { id: "06", title: "自有车队、设备与资产生产率", english: "Fleet & Asset Productivity", description: "在自有和外包运力之间优化车辆、司机、设备与回程资源。", status: "directional", statusLabel: "方向性", impact: "资产利用", driver: "自有/外包平衡 · 设备调配 · 空驶控制", kpis: ["空驶率", "自有车队利用率", "设备周转"], data: "车队状态、司机、设备、外包成本和线路", narrative: "仅在客户拥有或混合使用车队时进入正式价值范围。" },
  { id: "07", title: "网络决策、绩效洞察与持续改善", english: "Network Intelligence", description: "用真实运营数据进行情景建模，把单次优化变成可持续的治理机制。", status: "directional", statusLabel: "方向性", impact: "结构性改善", driver: "情景建模 · 车道治理 · 根因洞察", kpis: ["网络 Cost-to-Serve", "计划/实际偏差", "兑现率"], data: "历史运输、网络约束、成本、服务与情景参数", narrative: "作为已验证执行价值之后的结构性扩展，而不是首期 ROI 的填充项。" },
  { id: "08", title: "合规、碳排与韧性", english: "Compliance, Carbon & Resilience", description: "当客户议程覆盖跨境、ESG 或供应链风险时，才作为可选扩展领域。", status: "extension", statusLabel: "可选扩展", impact: "风险与外部性", driver: "排放分析 · 中断情景 · 文件完备性", kpis: ["CO₂e / 运量", "合规事件", "恢复时间"], data: "排放、法规、事件、路线与业务连续性数据", narrative: "需明确产品边界；跨境贸易深度合规不应默认归因于 OTM。" },
];

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
  const [activeView, setActiveView] = useState<keyof typeof VIEWS>("internal");
  const localizedDrivers = useMemo(() => DRIVERS.map((driver) => ({ ...driver, title: t(driver.title), description: t(driver.description), statusLabel: t(driver.statusLabel), impact: t(driver.impact), driver: t(driver.driver), kpis: driver.kpis.map(t), data: t(driver.data), narrative: t(driver.narrative) })), [language]);
  const selected = useMemo(() => localizedDrivers.find((driver) => driver.id === selectedId) ?? localizedDrivers[3], [localizedDrivers, selectedId]);
  const view = VIEWS[activeView];

  const selectDriver = (id: string) => { setSelectedId(id); window.setTimeout(() => scrollToId("driver-detail"), 10); };

  return (
    <div className="archive-shell">
      <div className="top-ledger"><span>OTM Value Driver Library · Framework v0.1</span><div className="top-ledger-tools"><LanguageSwitcher /><span>Evidence before assertion</span></div></div>
      <aside className="sidebar-rail" aria-label={t("Value Driver 目录")}>
        <div className="brand-block">
          <img className="brand-mark" src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="Value Driver Library mark" />
          <div><div className="brand-name">Value Driver<br />Library</div><div className="brand-sub">OTM / Decision Archive</div></div>
        </div>
        <nav className="rail-nav">
          <p className="rail-kicker">Value domains / 08</p>
          {localizedDrivers.map((driver) => <button key={driver.id} onClick={() => selectDriver(driver.id)} className={`nav-archive-item ${selectedId === driver.id ? "active" : ""}`}><span className="nav-index">{driver.id}</span><span className="nav-label">{driver.title}</span><i className={`nav-dot ${driver.status}`} /></button>)}
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
            <div className="hero-meta"><i /> Framework / Value Driver Library</div>
            <div className="hero-file-caption"><span>Evidence register</span><b>pain point → capability → KPI → value</b></div>
            <h1>{t("从运输信号，建立")}<br /><em>{t("可验证的")}</em>{t("价值档案。")}</h1>
            <p className="hero-copy">{t("以 OTM 能力、客户数据、ROI 方法和决策叙事构成一条有证据、可回溯、可组装的价值路径。")}</p>
            <div className="hero-causal-rail" aria-label="Value causal path"><span>{t("痛点")}</span><b>01</b><span>{t("能力")}</span><b>02</b><span>{t("变量")}</span><b>03</b><span>KPI</span><b>04</b><span>{t("价值")}</span></div>
            <div className="hero-actions"><a className="button-archive" href="#library">{t("检索价值档案")} <span>↓</span></a><button className="button-archive ghost" onClick={() => selectDriver("04")}>{t("验证当前证据")} <span>↗</span></button></div>
          </div>
          <aside className="hero-annotation"><strong>Current focus</strong>US freight audit & visibility<br />{t("已量化的首期价值闭环")}</aside>
        </section>

        <section className="section-wrap section-anchor" id="library">
          <div className="section-lead"><div><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />01 / Value map</div><h2 className="section-heading">{t("八个领域，一张可以复用的价值地图。")}</h2></div><div className="value-map-intro"><p className="section-intro">{t("一级分类按价值实现路径而非产品菜单构建。每个领域都可展开为独立的诊断、数据、ROI 和叙事模块。")}</p><div className="evidence-legend" aria-label="Evidence status"><span className="quantified">{t("已量化")}</span><span className="pending">{t("待量化")}</span><span className="directional">{t("方向性")}</span><span className="extension">{t("可选扩展")}</span></div></div></div>
          <div className="value-map" aria-label="OTM value domains">
            {localizedDrivers.map((driver) => <button key={driver.id} onClick={() => selectDriver(driver.id)} className={`value-row ${driver.status} ${selectedId === driver.id ? "selected" : ""}`} aria-pressed={selectedId === driver.id}><span className="value-number">{driver.id}</span><div className="value-title">{driver.title}<span>{driver.english}</span></div><div className="value-description">{driver.description}</div><span className={`status-label ${driver.status}`}><b />{driver.statusLabel}</span><span className="row-arrow">→</span></button>)}
          </div>
          <article className="detail-drawer" id="driver-detail" aria-live="polite">
            <div><div className="detail-kicker">Selected driver / {selected.id} · {selected.statusLabel}</div><h3>{selected.title}</h3><p>{selected.narrative}</p><div className="path-line"><span className="path-step"><b>01</b>{t("客户痛点")}</span><span className="path-step"><b>02</b>{t("OTM 能力")}</span><span className="path-step"><b>03</b>{t("经营变量")}</span><span className="path-step"><b>04</b>KPI</span><span className="path-step"><b>05</b>{t("价值判断")}</span></div></div>
            <div className="detail-aside"><h4>Evidence register</h4><div className="mini-metric"><span>Value</span><strong>{selected.impact}</strong></div><div className="mini-metric"><span>Drivers</span><strong>{selected.driver}</strong></div><div className="mini-metric"><span>KPIs</span><strong>{selected.kpis.join(" · ")}</strong></div><div className="mini-metric"><span>Data</span><strong>{selected.data}</strong></div></div>
          </article>
        </section>

        <section className="view-section section-wrap section-anchor" id="views">
          <div className="view-layout"><div className="view-statement"><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />02 / Same evidence, different view</div><h2>{t("一次维护，三种决策视图。")}</h2><p>{t("不从头建立客户版与内部版。每张 driver 卡都是唯一事实源，只按读者改变展示深度。")}</p><div className="view-toggle">{(Object.keys(VIEWS) as Array<keyof typeof VIEWS>).map((key) => <button key={key} onClick={() => setActiveView(key)} className={activeView === key ? "active" : ""}>{t(VIEWS[key].label)}</button>)}</div></div>
            <article className="view-card"><div className="view-card-head"><span>{view.code}</span><span>{t(view.label)}</span></div><div className="view-card-body"><h3>{t(view.title)}</h3><p>{t(view.copy)}</p><div className="evidence-list">{view.items.map(([title, description, status]) => <div className={`evidence-item ${status}`} key={title}><i /><div><strong>{t(title)}</strong><span>{t(description)}</span></div></div>)}</div></div></article>
          </div>
        </section>

        <section className="assessment-grid section-anchor" id="assessment">
          <div className="assessment-image"><img src={assetUrl("/manus-storage/otm-evidence-path_0f8a0592.jpg")} alt="Abstract value evidence path" /></div>
          <div className="assessment-content"><div className="eyebrow">03 / Assessment entry</div><h2>{t("Value Assessment 是共同诊断，不是预设结论。")}</h2><p>{t("从客户可以回答的问题开始，逐步确认基线、数据和证据状态；只有通过数据门槛的 driver 才进入 ROI 计算和预算叙事。")}</p><div className="question-list"><div className="question-row"><span>01</span><strong>{t("运输支出是否能与合同费率和运输事件逐项匹配？")}</strong><i>↗</i></div><div className="question-row"><span>02</span><strong>{t("异常和延迟被识别时，是否还来得及采取纠正行动？")}</strong><i>↗</i></div><div className="question-row"><span>03</span><strong>{t("哪些 KPI 已有可信基线，哪些仍需作为方向性价值？")}</strong><i>↗</i></div><div className="question-row"><span>04</span><strong>{t("US 证据与 Europe 证据是否被明确隔离，避免错误外推？")}</strong><i>↗</i></div></div></div>
        </section>

        <RoiExportWorkspace drivers={localizedDrivers} brandMarkSrc={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} />

        <section className="narrative-section section-wrap section-anchor" id="narrative">
          <div className="section-lead"><div><div className="eyebrow"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" />04 / Narrative scaffold</div><h2 className="section-heading">{t("用证据状态管理范围，而不是用全部能力堆叠范围。")}</h2></div><p className="section-intro">{t("每一个新增诉求必须进入既定 driver 卡，并明确其证据层级、数据条件和决策门槛。")}</p></div>
          <div className="narrative-grid"><div className="narrative-steps"><div className="narrative-file-strip"><img src={assetUrl("/manus-storage/otm-evidence-mark_3295b18f.png")} alt="" /><span>CASE FILE / SCOPE CONTROL</span><b>04</b></div><div className="narrative-step"><span className="step-number">LAYER / 1</span><div><h3>{t("已验证的核心价值")}</h3><p>{t("US freight audit 与 visibility 的直接价值闭环；使用基线、范围、去重规则和敏感性表达。")}</p></div><span className="step-tag">Hard ROI</span></div><div className="narrative-step"><span className="step-number">LAYER / 2</span><div><h3>{t("有证据、待量化的扩展价值")}</h3><p>{t("Europe 的相同 driver 或相邻机会；说明诊断和验证计划，不承诺具体金额。")}</p></div><span className="step-tag">Validate</span></div><div className="narrative-step"><span className="step-number">LAYER / 3</span><div><h3>{t("战略路线图选项")}</h3><p>{t("网络建模、车队、可持续性或更广 Oracle 能力；保留给独立的范围确认和商业案例。")}</p></div><span className="step-tag">Roadmap</span></div></div><div className="narrative-art"><img src={assetUrl("/manus-storage/otm-narrative-layers_d2d229db.jpg")} alt="Abstract layered business-case narrative" /></div></div>
        </section>

        <footer className="footer-strip"><h2>{t("先确认数据成熟度，再进入 ROI 计算。")}</h2><div className="footer-note"><b>Operational principle</b>{t("OTM Value Driver Library 将每个价值主张锚定到痛点、能力、经营变量、KPI 与可审计的证据状态。")}</div></footer>
      </main>
    </div>
  );
}
