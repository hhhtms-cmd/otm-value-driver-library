/* Design reminder: “Decision Archive” — preserve the warm editorial archive, but let a customer solve one question at a time. */
import { useEffect, useState } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import "./layered-workflow.css";

type WorkflowFocus = "optimization" | "audit" | "visibility";
type WorkflowProps = { brandMarkSrc: string; onOpenAdvanced?: () => void; runwayFocus?: WorkflowFocus };

type Topic = { tab: string; question: string; answers: [string, string]; next: [string, string] };
type Copy = { kicker: string; title: string; intro: string; choose: string; questionLabel: string; nextLabel: string; reset: string; topics: Record<WorkflowFocus, Topic> };

const COPY: Record<Language, Copy> = {
  zh: {
    kicker: "把问题想清楚", title: "选一件最想改善的事。", intro: "不需要先准备资料，也不需要算 ROI。选一个主题，回答一个问题，你就会知道下一步该和谁确认。", choose: "我想先弄清", questionLabel: "现在最关键的问题", nextLabel: "你的下一步", reset: "换一个问题",
    topics: {
      optimization: { tab: "计划与装载", question: "你能否看见订单、交期与路线如何被放进同一轮计划？", answers: ["大致能看见", "还看不见／不确定"], next: ["从一条常跑线路开始，和计划同事一起看：哪些订单可以合在一起、哪些装载没有装满。", "先找计划或订单管理同事，确认今天是用什么方式把订单、交期和路线排在一起。"] },
      audit: { tab: "运费与发票", question: "你是否知道发票目前是怎样被审核的？", answers: ["有固定规则或审核流程", "不清楚／各团队做法不同"], next: ["带着一张近期发票样本，和结算或财务同事确认：哪些费用会被核对、哪些可能直接通过。", "先找最了解结算流程的同事，弄清发票是全部审核、抽样审核，还是自动付款。"] },
      visibility: { tab: "可视化与异常", question: "发生延误时，你能否知道哪一票受影响、该由谁处理？", answers: ["大致知道", "通常需要人工追问"], next: ["挑一个最近的延误案例，和运营团队回看：什么时候发现、谁处理、有没有产生加急或客户影响。", "先找负责运输追踪或客户服务的同事，画出一次延误从发现到处理的简单过程。"] }
    }
  },
  en: {
    kicker: "make one question clear", title: "Choose the one thing you most want to improve.", intro: "You do not need to prepare information or calculate ROI first. Choose a topic, answer one question, and you will know who to confirm the next step with.", choose: "I want to clarify", questionLabel: "The key question now", nextLabel: "Your next step", reset: "Choose another question",
    topics: {
      optimization: { tab: "Planning & loads", question: "Can you see how orders, delivery windows, and routes enter the same planning cycle?", answers: ["Mostly yes", "Not yet / not sure"], next: ["Start with one regular lane and review it with a planner: which orders could travel together and which loads are not full.", "First ask a planner or order-management colleague how orders, delivery windows, and routes are brought together today."] },
      audit: { tab: "Freight & invoices", question: "Do you know how freight invoices are reviewed today?", answers: ["There is a consistent rule or process", "Not sure / teams work differently"], next: ["Take one recent invoice to a settlement or finance colleague and confirm which charges are checked and which can pass directly.", "First ask the colleague closest to settlement whether invoices are fully reviewed, sampled, or paid automatically."] },
      visibility: { tab: "Visibility & exceptions", question: "When a shipment is delayed, can you see which shipment is affected and who acts?", answers: ["Mostly yes", "We usually have to chase it manually"], next: ["Use one recent delay with the operations team to review when it was found, who acted, and whether it caused expedite or customer impact.", "First ask the colleague who tracks transport or serves customers to sketch the simple path from a delay being found to it being handled."] }
    }
  },
  es: {
    kicker: "aclare una pregunta", title: "Elija lo que más quiere mejorar.", intro: "No necesita preparar información ni calcular ROI primero. Elija un tema, responda una pregunta y sabrá con quién confirmar el siguiente paso.", choose: "Quiero aclarar", questionLabel: "La pregunta clave ahora", nextLabel: "Su siguiente paso", reset: "Elegir otra pregunta",
    topics: {
      optimization: { tab: "Planificación y cargas", question: "¿Puede ver cómo pedidos, ventanas de entrega y rutas entran en el mismo ciclo de planificación?", answers: ["Más o menos sí", "Aún no / no estoy seguro"], next: ["Empiece con una ruta frecuente y revísela con un planificador: qué pedidos podrían viajar juntos y qué cargas no están completas.", "Pregunte primero a un colega de planificación o gestión de pedidos cómo se reúnen hoy pedidos, ventanas de entrega y rutas."] },
      audit: { tab: "Flete y facturas", question: "¿Sabe cómo se revisan hoy las facturas de flete?", answers: ["Hay una regla o proceso consistente", "No estoy seguro / cada equipo trabaja distinto"], next: ["Lleve una factura reciente a un colega de liquidación o finanzas y confirme qué cargos se revisan y cuáles pasan directamente.", "Pregunte primero al colega más cercano a la liquidación si las facturas se revisan por completo, por muestra o se pagan automáticamente."] },
      visibility: { tab: "Visibilidad y excepciones", question: "Cuando un envío se retrasa, ¿puede ver qué envío está afectado y quién actúa?", answers: ["Más o menos sí", "Normalmente hay que perseguirlo manualmente"], next: ["Use un retraso reciente con el equipo de operaciones para revisar cuándo se detectó, quién actuó y si causó urgencia o impacto al cliente.", "Pregunte primero al colega que sigue el transporte o atiende a clientes para dibujar el camino simple desde detectar un retraso hasta gestionarlo."] }
    }
  }
};

export default function AssessmentWorkflow({ brandMarkSrc, onOpenAdvanced, runwayFocus }: WorkflowProps) {
  const { language } = useLanguage();
  const c = COPY[language];
  const [focus, setFocus] = useState<WorkflowFocus>("optimization");
  const [answer, setAnswer] = useState<number | null>(null);
  const topic = c.topics[focus];

  useEffect(() => { if (runwayFocus) { setFocus(runwayFocus); setAnswer(null); } }, [runwayFocus]);
  const chooseTopic = (next: WorkflowFocus) => { setFocus(next); setAnswer(null); };
  const deeperLabel = language === "zh" ? "深入查看完整工具" : language === "es" ? "Ver el kit completo" : "View the full toolkit";
  const otherLabel = language === "zh" ? "其他运输或贸易问题" : language === "es" ? "Otra pregunta de transporte o comercio" : "Another transport or trade question";

  return <section className="assessment-workflow section-wrap section-anchor" id="workflow">
    <div className="section-lead">
      <div><div className="eyebrow"><img src={brandMarkSrc} alt="" />{c.kicker}</div><h2 className="section-heading">{c.title}</h2></div>
      <p className="section-intro">{c.intro}</p>
    </div>
    <div className="simple-workflow" id="discovery-file">
      <div className="simple-topic-panel">
        <span className="simple-label">{c.choose}</span>
        <div className="simple-topic-tabs">
          {(Object.keys(c.topics) as WorkflowFocus[]).map((key) => <button key={key} className={focus === key ? "active" : ""} onClick={() => chooseTopic(key)}>{c.topics[key].tab}</button>)}
          {onOpenAdvanced && <button className="simple-other-topic" type="button" onClick={onOpenAdvanced}>{otherLabel} ↗</button>}
        </div>
        <div className="simple-question"><span>{c.questionLabel}</span><h3>{topic.question}</h3><div className="simple-answer-grid">{topic.answers.map((item, index) => <button key={item} className={answer === index ? "selected" : ""} onClick={() => setAnswer(index)}><i>{answer === index ? "✓" : ""}</i>{item}</button>)}</div></div>
      </div>
      <div className="simple-next-panel" id="evidence-gate">
        <span className="simple-label">{c.nextLabel}</span>
        {answer === null ? <div className="simple-empty"><p>←</p><strong>{language === "zh" ? "先选一个答案。" : language === "es" ? "Elija una respuesta primero." : "Choose one answer first."}</strong><span>{language === "zh" ? "系统会把复杂的下一步，变成一句你可以马上去做的话。" : language === "es" ? "Convertiremos el siguiente paso complejo en una frase que puede aplicar de inmediato." : "We will turn the complex next step into one sentence you can act on immediately."}</span></div> : <div className="simple-result"><div className="simple-result-mark">→</div><h3>{topic.next[answer]}</h3><p>{language === "zh" ? "这一步做完后，再决定是否值得继续深入。" : language === "es" ? "Cuando termine este paso, decida si vale la pena profundizar." : "After this step, decide whether a deeper exploration is worthwhile."}</p>{onOpenAdvanced && <button className="simple-deeper" type="button" onClick={onOpenAdvanced}>{deeperLabel} ↗</button>}<button onClick={() => setAnswer(null)}>{c.reset}</button></div>}
      </div>
    </div>
  </section>;
}
