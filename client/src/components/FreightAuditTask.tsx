/* Design reminder: Decision Archive task panel — make one internal job completable. Use archive paper, ink, and vermilion; never expose a generic dashboard or force the full evidence/ROI process before a client meeting is prepared. */
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clipboard, Download, FileCheck2, RotateCcw } from "lucide-react";
import type { Language } from "@/contexts/LanguageContext";
import "./freight-audit-task.css";

type Step = "issue" | "evidence" | "people" | "result";

type Copy = {
  eyebrow: string; title: string; intro: string; progress: string[];
  issueKicker: string; issueTitle: string; issues: string[];
  evidenceKicker: string; evidenceTitle: string; evidenceCopy: string; evidenceItems: string[];
  peopleKicker: string; peopleTitle: string; peopleCopy: string; peopleItems: string[];
  back: string; next: string; build: string; resultKicker: string; resultTitle: string; resultCopy: string;
  focusLabel: string; requestLabel: string; peopleLabel: string; agendaLabel: string; agenda: string[];
  copy: string; copied: string; download: string; restart: string; openDiscovery: string; boundary: string;
};

const COPY: Record<Language, Copy> = {
  zh: {
    eyebrow: "TASK / 01 · FREIGHT AUDIT", title: "准备下一次 Freight Audit 客户工作会。", intro: "用不到五分钟，把下一次 45 分钟对话的焦点、资料和参会角色写清楚。完成后会得到一份可以直接转发的会议清单。",
    progress: ["确定问题", "确认资料", "安排人员"],
    issueKicker: "第一步 / 选择最真实的问题", issueTitle: "这次最值得先看哪一种情况？", issues: ["账单或收费错误", "重复付款", "合同费率偏差", "审计覆盖不足"],
    evidenceKicker: "第二步 / 最小资料包", evidenceTitle: "客户工作会请带来哪些资料？", evidenceCopy: "这些资料不用完整、也不需要提前清洗。第一次工作会只需要确认线索是否存在，以及由谁解释。", evidenceItems: ["一组近期货运账单或费用明细", "对应的合同费率、费率表或费用规则", "付款、争议或异常处理的一个样本"],
    peopleKicker: "第三步 / 把合适的人放进同一间会议室", peopleTitle: "谁应该参加这 45 分钟？", peopleCopy: "先以角色为准，不需要立刻填写完整项目团队。", peopleItems: ["了解运输流程的人", "了解应付账款、财务或费用审核的人", "需要时：了解数据或系统线索的人"],
    back: "上一步", next: "继续", build: "生成会议清单", resultKicker: "你的下一次客户工作会", resultTitle: "Freight Audit Exploration Brief 已准备好。", resultCopy: "这不是 ROI，也不是产品推荐。它只让下一次客户对话有明确焦点、资料和角色。",
    focusLabel: "本次对话焦点", requestLabel: "请客户带来", peopleLabel: "请邀请", agendaLabel: "45 分钟建议议程", agenda: ["5 分钟：确认这个问题发生在哪里、为什么重要", "20 分钟：走读账单、费率与审核流程", "10 分钟：确认现有资料线索和负责人", "10 分钟：决定是否进入详细 Discovery"],
    copy: "复制会议清单", copied: "会议清单已复制", download: "下载会议清单", restart: "重新准备一份", openDiscovery: "需要更多细节时，打开详细 Discovery", boundary: "完成这份清单后，才决定是否进入更详细的 Discovery、证据或 ROI 工作。",
  },
  en: {
    eyebrow: "TASK / 01 · FREIGHT AUDIT", title: "Prepare the next Freight Audit customer working session.", intro: "In under five minutes, clarify the focus, inputs, and people for the next 45-minute conversation. You will leave with a brief that can be forwarded directly.",
    progress: ["Name the issue", "Confirm the inputs", "Name the room"],
    issueKicker: "STEP ONE / CHOOSE THE LIVE ISSUE", issueTitle: "Which situation is most useful to examine first?", issues: ["Invoice or charge errors", "Duplicate payment", "Contracted-rate variance", "Limited audit coverage"],
    evidenceKicker: "STEP TWO / MINIMUM EVIDENCE PACK", evidenceTitle: "What should the client bring to the working session?", evidenceCopy: "The materials do not need to be complete or cleaned. The first session only confirms that a trail exists and who can explain it.", evidenceItems: ["A small set of recent freight invoices or spend detail", "The related contracted rate, rate table, or charge rule", "One payment, dispute, or exception-handling example"],
    peopleKicker: "STEP THREE / PUT THE RIGHT VOICES IN THE ROOM", peopleTitle: "Who should join the 45-minute session?", peopleCopy: "Start with roles; a complete project team is not needed yet.", peopleItems: ["The person who understands the transport process", "The AP, finance, or freight-audit owner", "If useful: the person who knows the data or systems trail"],
    back: "Back", next: "Continue", build: "Create meeting brief", resultKicker: "YOUR NEXT CUSTOMER WORKING SESSION", resultTitle: "Your Freight Audit Exploration Brief is ready.", resultCopy: "This is not an ROI or a product recommendation. It simply gives the next customer conversation a focus, an evidence pack, and the right roles.",
    focusLabel: "CONVERSATION FOCUS", requestLabel: "ASK THE CLIENT TO BRING", peopleLabel: "INVITE", agendaLabel: "SUGGESTED 45-MINUTE AGENDA", agenda: ["5 min: confirm where the issue occurs and why it matters", "20 min: walk through invoices, rates, and the checking process", "10 min: confirm the information trail and its owners", "10 min: decide whether detailed Discovery is worth opening"],
    copy: "Copy meeting brief", copied: "Meeting brief copied", download: "Download meeting brief", restart: "Prepare another brief", openDiscovery: "Open detailed Discovery when you need more detail", boundary: "Only after this brief is complete should the team decide whether to enter detailed Discovery, evidence, or ROI work.",
  },
  es: {
    eyebrow: "TAREA / 01 · FREIGHT AUDIT", title: "Prepare la próxima sesión de trabajo de Freight Audit.", intro: "En menos de cinco minutos, aclare el foco, los insumos y las personas para la próxima conversación de 45 minutos. Obtendrá un brief que se puede reenviar directamente.",
    progress: ["Nombrar el problema", "Confirmar los insumos", "Nombrar la sala"],
    issueKicker: "PASO UNO / ELIJA EL PROBLEMA ACTUAL", issueTitle: "¿Qué situación conviene examinar primero?", issues: ["Errores de factura o cargos", "Pago duplicado", "Variación de tarifa contratada", "Cobertura de auditoría limitada"],
    evidenceKicker: "PASO DOS / PAQUETE MÍNIMO DE EVIDENCIA", evidenceTitle: "¿Qué debe traer el cliente a la sesión?", evidenceCopy: "Los materiales no tienen que estar completos ni depurados. La primera sesión solo confirma que existe un rastro y quién puede explicarlo.", evidenceItems: ["Un conjunto pequeño de facturas recientes o detalle de gasto", "La tarifa contratada, tabla de tarifas o regla de cargo relacionada", "Un ejemplo de pago, disputa o gestión de excepción"],
    peopleKicker: "PASO TRES / PONGA LAS VOCES ADECUADAS EN LA SALA", peopleTitle: "¿Quién debería participar en la sesión de 45 minutos?", peopleCopy: "Empiece por roles; todavía no hace falta un equipo de proyecto completo.", peopleItems: ["La persona que entiende el proceso de transporte", "El responsable de AP, finanzas o auditoría de flete", "Si es útil: la persona que conoce el rastro de datos o sistemas"],
    back: "Atrás", next: "Continuar", build: "Crear brief de reunión", resultKicker: "SU PRÓXIMA SESIÓN DE TRABAJO CON EL CLIENTE", resultTitle: "Su Freight Audit Exploration Brief está listo.", resultCopy: "No es un ROI ni una recomendación de producto. Solo da a la próxima conversación un foco, un paquete de evidencia y los roles adecuados.",
    focusLabel: "FOCO DE LA CONVERSACIÓN", requestLabel: "PEDIR AL CLIENTE QUE TRAIGA", peopleLabel: "INVITAR", agendaLabel: "AGENDA SUGERIDA DE 45 MINUTOS", agenda: ["5 min: confirmar dónde ocurre el problema y por qué importa", "20 min: revisar facturas, tarifas y proceso de validación", "10 min: confirmar el rastro de información y sus responsables", "10 min: decidir si vale la pena abrir Discovery detallado"],
    copy: "Copiar brief de reunión", copied: "Brief de reunión copiado", download: "Descargar brief de reunión", restart: "Preparar otro brief", openDiscovery: "Abrir Discovery detallado cuando necesite más detalle", boundary: "Solo después de completar este brief el equipo debe decidir si entra en Discovery detallado, evidencia o ROI.",
  },
};

type Props = { language: Language; onOpenDiscovery: () => void };

export default function FreightAuditTask({ language, onOpenDiscovery }: Props) {
  const c = COPY[language];
  const [step, setStep] = useState<Step>("issue");
  const [issueIndex, setIssueIndex] = useState<number | null>(null);
  const [evidence, setEvidence] = useState(() => new Set([0, 1, 2]));
  const [people, setPeople] = useState(() => new Set([0, 1]));
  const [feedback, setFeedback] = useState("");
  const currentIndex = step === "issue" ? 0 : step === "evidence" ? 1 : 2;
  const issue = issueIndex === null ? "" : c.issues[issueIndex];
  const canContinue = step === "issue" ? issueIndex !== null : step === "evidence" ? evidence.size > 0 : people.size > 0;
  const toggle = (set: Set<number>, setter: (next: Set<number>) => void, index: number) => { const next = new Set(set); next.has(index) ? next.delete(index) : next.add(index); setter(next); };
  const selectedEvidence = c.evidenceItems.filter((_, index) => evidence.has(index));
  const selectedPeople = c.peopleItems.filter((_, index) => people.has(index));
  const brief = useMemo(() => `${c.resultKicker}\n\n${c.focusLabel}\n${issue}\n\n${c.requestLabel}\n${selectedEvidence.map((item) => `• ${item}`).join("\n")}\n\n${c.peopleLabel}\n${selectedPeople.map((item) => `• ${item}`).join("\n")}\n\n${c.agendaLabel}\n${c.agenda.map((item) => `• ${item}`).join("\n")}\n\n${c.boundary}`, [c, issue, selectedEvidence, selectedPeople]);
  const next = () => { if (step === "issue") setStep("evidence"); else if (step === "evidence") setStep("people"); else setStep("result"); };
  const back = () => { if (step === "people") setStep("evidence"); else if (step === "evidence") setStep("issue"); };
  const reset = () => { setStep("issue"); setIssueIndex(null); setEvidence(new Set([0, 1, 2])); setPeople(new Set([0, 1])); setFeedback(""); };
  const copyBrief = async () => { try { await navigator.clipboard?.writeText(brief); setFeedback(c.copied); } catch { setFeedback(brief); } };
  const downloadBrief = () => { const blob = new Blob([brief], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "freight-audit-exploration-brief.txt"; link.click(); URL.revokeObjectURL(url); };

  return <section className="freight-task" id="freight-audit-task" aria-labelledby="freight-task-title">
    <div className="freight-task-head"><div><span>{c.eyebrow}</span><h2 id="freight-task-title">{c.title}</h2></div><p>{c.intro}</p></div>
    {step !== "result" && <div className="freight-task-progress" aria-label={c.eyebrow}>{c.progress.map((label, index) => <div key={label} className={index < currentIndex ? "done" : index === currentIndex ? "active" : ""}><i>{index < currentIndex ? <Check size={13} strokeWidth={2.4} /> : String(index + 1).padStart(2, "0")}</i><span>{label}</span></div>)}</div>}
    {step === "issue" && <div className="freight-task-stage"><span>{c.issueKicker}</span><h3>{c.issueTitle}</h3><div className="freight-option-grid">{c.issues.map((item, index) => <button type="button" className={issueIndex === index ? "selected" : ""} onClick={() => setIssueIndex(index)} key={item}><i>{issueIndex === index && <Check size={14} strokeWidth={2.4} />}</i>{item}<ArrowRight size={15} strokeWidth={1.8} /></button>)}</div></div>}
    {step === "evidence" && <div className="freight-task-stage"><span>{c.evidenceKicker}</span><h3>{c.evidenceTitle}</h3><p>{c.evidenceCopy}</p><div className="freight-check-list">{c.evidenceItems.map((item, index) => <button type="button" className={evidence.has(index) ? "selected" : ""} onClick={() => toggle(evidence, setEvidence, index)} key={item}><i>{evidence.has(index) && <Check size={14} strokeWidth={2.4} />}</i>{item}</button>)}</div></div>}
    {step === "people" && <div className="freight-task-stage"><span>{c.peopleKicker}</span><h3>{c.peopleTitle}</h3><p>{c.peopleCopy}</p><div className="freight-check-list">{c.peopleItems.map((item, index) => <button type="button" className={people.has(index) ? "selected" : ""} onClick={() => toggle(people, setPeople, index)} key={item}><i>{people.has(index) && <Check size={14} strokeWidth={2.4} />}</i>{item}</button>)}</div></div>}
    {step !== "result" && <div className="freight-task-actions"><button type="button" className="freight-back" onClick={back} disabled={step === "issue"}><ArrowLeft size={16} strokeWidth={1.8} />{c.back}</button><button type="button" className="freight-next" onClick={next} disabled={!canContinue}>{step === "people" ? c.build : c.next}<ArrowRight size={17} strokeWidth={1.8} /></button></div>}
    {step === "result" && <div className="freight-brief"><div className="freight-brief-head"><FileCheck2 size={21} strokeWidth={1.7} /><div><span>{c.resultKicker}</span><h3>{c.resultTitle}</h3><p>{c.resultCopy}</p></div></div><div className="freight-brief-grid"><div><span>{c.focusLabel}</span><strong>{issue}</strong></div><div><span>{c.requestLabel}</span><ul>{selectedEvidence.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span>{c.peopleLabel}</span><ul>{selectedPeople.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span>{c.agendaLabel}</span><ol>{c.agenda.map((item) => <li key={item}>{item}</li>)}</ol></div></div><p className="freight-boundary">{c.boundary}</p><div className="freight-result-actions"><button type="button" className="freight-next" onClick={copyBrief}><Clipboard size={16} strokeWidth={1.8} />{c.copy}</button><button type="button" className="freight-text-action" onClick={downloadBrief}><Download size={16} strokeWidth={1.8} />{c.download}</button><button type="button" className="freight-text-action" onClick={reset}><RotateCcw size={16} strokeWidth={1.8} />{c.restart}</button><button type="button" className="freight-text-action discovery-link" onClick={onOpenDiscovery}>{c.openDiscovery}<ArrowRight size={16} strokeWidth={1.8} /></button></div>{feedback && <p className="freight-feedback" aria-live="polite">{feedback}</p>}</div>}
  </section>;
}
