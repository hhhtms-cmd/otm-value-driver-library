/* Design reminder: Fit is an exploration signal, never a product recommendation or buying score. */
import { useState } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import "./otm-fit-scale.css";

export type OtmFitStage = "clarify" | "explore" | "assess";
type ScaleCopy = { labels: Record<OtmFitStage, string>; descriptions: Record<OtmFitStage, string>; note: string };

const SCALE_COPY: Record<Language, ScaleCopy> = {
  zh: { labels: { clarify: "先把问题说清楚", explore: "值得做小范围探索", assess: "已具备深入评估条件" }, descriptions: { clarify: "先聚焦一个真实的运输问题，再判断是否值得讨论 OTM。", explore: "你已经看见一个可探索的起点；下一步是与团队确认事实。", assess: "问题、基础信息和参与人已具备，可以进入更深入的评估。" }, note: "这是探索信号，不是购买建议，也不代表 ROI 或实施准备度。" },
  en: { labels: { clarify: "Clarify the problem first", explore: "Worth a small exploration", assess: "Conditions support deeper assessment" }, descriptions: { clarify: "Focus on one real transport issue before deciding whether OTM is worth discussing.", explore: "You can see a credible starting point; the next step is to confirm facts with your team.", assess: "The issue, basic information, and people are in view, so a deeper assessment is reasonable." }, note: "This is an exploration signal, not a buying recommendation, ROI result, or implementation-readiness score." },
  es: { labels: { clarify: "Aclare primero el problema", explore: "Vale una exploración pequeña", assess: "Las condiciones permiten una evaluación más profunda" }, descriptions: { clarify: "Enfoque un problema de transporte real antes de decidir si vale la pena hablar de OTM.", explore: "Hay un punto de partida creíble; el siguiente paso es confirmar hechos con su equipo.", assess: "El problema, la información básica y las personas están a la vista, por lo que una evaluación más profunda tiene sentido." }, note: "Esta es una señal de exploración, no una recomendación de compra, resultado ROI ni puntuación de preparación." },
};

export function OtmFitScale({ stage, language, compact = false }: { stage: OtmFitStage; language: Language; compact?: boolean }) {
  const copy = SCALE_COPY[language];
  const steps: OtmFitStage[] = ["clarify", "explore", "assess"];
  const activeIndex = steps.indexOf(stage);
  return <div className={`otm-fit-scale ${compact ? "compact" : ""}`} aria-label={copy.labels[stage]}>
    <div className="fit-scale-track">{steps.map((item, index) => <div className={`fit-scale-step ${index <= activeIndex ? "reached" : ""} ${item === stage ? "current" : ""}`} key={item}><i /><span>{copy.labels[item]}</span></div>)}</div>
    <div className="fit-scale-result"><strong>{copy.labels[stage]}</strong><p>{copy.descriptions[stage]}</p></div>
    {!compact && <small>{copy.note}</small>}
  </div>;
}

type QuickCopy = { eyebrow: string; title: string; intro: string; questions: string[]; yes: string; no: string; check: string; full: string; fullNote: string };
const QUICK_COPY: Record<Language, QuickCopy> = {
  zh: { eyebrow: "OTM 适配度刻度", title: "你现在最适合走到哪一步？", intro: "只用三个简单问题，判断现在是先说清问题、做小范围探索，还是可以深入评估。", questions: ["你们现在有一个想改善的真实运输问题吗？", "你们能指出一条运输流、区域或具体案例吗？", "业务和数据／系统同事能一起参加一次短讨论吗？"], yes: "是", no: "还不确定", check: "查看我的探索位置", full: "做完整适配度探索", fullNote: "完整探索会用六个问题解释为什么处在这个位置。" },
  en: { eyebrow: "OTM fit scale", title: "Which step fits your situation now?", intro: "Use three simple questions to see whether to clarify the problem, run a small exploration, or move into deeper assessment.", questions: ["Do you have a real transport issue you want to improve?", "Can you name one transport flow, region, or concrete example?", "Can a business colleague and a data or systems colleague join a short discussion?"], yes: "Yes", no: "Not sure yet", check: "See my exploration position", full: "Take the full fit exploration", fullNote: "The full exploration uses six questions to explain why you are at this position." },
  es: { eyebrow: "Escala de adecuación OTM", title: "¿Qué paso encaja con su situación actual?", intro: "Use tres preguntas sencillas para ver si debe aclarar el problema, realizar una exploración pequeña o pasar a una evaluación profunda.", questions: ["¿Tiene un problema de transporte real que quiere mejorar?", "¿Puede nombrar un flujo, región o ejemplo concreto de transporte?", "¿Pueden participar en una conversación corta una persona de negocio y otra de datos o sistemas?"], yes: "Sí", no: "Aún no estoy seguro", check: "Ver mi posición de exploración", full: "Hacer la exploración completa", fullNote: "La exploración completa usa seis preguntas para explicar por qué está en esta posición." },
};

export function OtmFitQuickCheck() {
  const { language } = useLanguage();
  const copy = QUICK_COPY[language];
  const [answers, setAnswers] = useState<Array<boolean | null>>([null, null, null]);
  const complete = answers.every((answer) => answer !== null);
  const yesCount = answers.filter(Boolean).length;
  const stage: OtmFitStage = yesCount <= 1 ? "clarify" : yesCount === 2 ? "explore" : "assess";
  const update = (index: number, value: boolean) => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? value : answer));
  return <section className="fit-quick-check section-wrap section-anchor" id="otm-fit">
    <div className="fit-quick-head"><div><div className="eyebrow">{copy.eyebrow}</div><h2>{copy.title}</h2></div><p>{copy.intro}</p></div>
    <div className="fit-quick-body"><div className="fit-question-list">{copy.questions.map((question, index) => <div className="fit-question" key={question}><span>{question}</span><div><button type="button" className={answers[index] === true ? "selected" : ""} onClick={() => update(index, true)}>{copy.yes}</button><button type="button" className={answers[index] === false ? "selected" : ""} onClick={() => update(index, false)}>{copy.no}</button></div></div>)}</div>
      <div className="fit-quick-result">{complete ? <><OtmFitScale stage={stage} language={language} compact /><a href="/client-brief">{copy.full} <b>→</b></a><p>{copy.fullNote}</p></> : <><i>→</i><strong>{copy.check}</strong><span>{language === "zh" ? "回答三个问题后，这里会显示你的探索位置。" : language === "es" ? "Responda las tres preguntas y aquí verá su posición de exploración." : "Answer all three questions and your exploration position will appear here."}</span></>}</div>
    </div>
  </section>;
}
