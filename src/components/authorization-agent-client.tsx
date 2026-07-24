"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bot, CheckCircle2, CircleGauge, FileCheck2, LoaderCircle, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import type { AuthorizationRiskResult } from "@/lib/authorization-agent";

const initialForm = {
  diagnosticNotes: "Front brake pads measure 2 mm. Left front rotor has visible scoring. No hydraulic leaks found.",
  lineItemDescription: "Replace front brake pads and rotors",
  customerExplanation: "Replace the front pads and scored rotors, then verify braking operation with a road test.",
  partsEstimate: 438,
  laborEstimate: 252,
};

export function AuthorizationAgentClient() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<AuthorizationRiskResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/authorization-risk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authorization audit failed.");
      setResult(data);
    } catch (auditError) {
      setError(auditError instanceof Error ? auditError.message : "Authorization audit failed.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="staff-page"><div className="shell agent-shell"><header className="staff-heading"><div><span className="eyebrow"><ShieldCheck/> Live Groq agent</span><h1>Authorization Risk Agent</h1><p>Audit a repair line before it reaches the customer. The agent checks evidence, scope clarity, price categories, and customer language without expanding the diagnosis.</p></div></header><section className="agent-grid authorization-grid"><div className="panel agent-input authorization-form"><div><h2>Approval package</h2><p>Use measured facts and one independently approvable repair scope.</p></div><label>Diagnostic evidence<textarea rows={5} value={form.diagnosticNotes} onChange={event=>setForm({...form,diagnosticNotes:event.target.value})}/></label><label>Repair line item<input value={form.lineItemDescription} onChange={event=>setForm({...form,lineItemDescription:event.target.value})}/></label><label>Customer explanation<textarea rows={4} value={form.customerExplanation} onChange={event=>setForm({...form,customerExplanation:event.target.value})}/></label><div className="form-grid"><label>Parts estimate<input type="number" min="0" step="0.01" value={form.partsEstimate} onChange={event=>setForm({...form,partsEstimate:Number(event.target.value)})}/></label><label>Labor estimate<input type="number" min="0" step="0.01" value={form.laborEstimate} onChange={event=>setForm({...form,laborEstimate:Number(event.target.value)})}/></label></div><button className="button button-primary" onClick={runAudit} disabled={loading}>{loading?<LoaderCircle className="spin"/>:<FileCheck2/>}{loading?"Auditing authorization package...":"Run authorization audit"}</button><p className="agent-rule"><AlertTriangle/> This agent advises staff; it never records customer approval.</p>{error&&<div className="auth-error">{error}</div>}</div><div className="panel agent-output"><AnimatePresence mode="wait">{result?<motion.div key="risk-result" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0}}><div className="risk-summary"><div className={`risk-score ${result.decision}`} style={{"--score":`${result.score*3.6}deg`} as React.CSSProperties}><span>{result.score}</span><small>/ 100</small></div><div><span className={`status ${result.decision==="ready"?"approved":"pending"}`}>{result.decision==="ready"?<CheckCircle2/>:<AlertTriangle/>}{result.decision.replaceAll("_"," ")}</span><h2>{result.decision==="ready"?"Ready for staff review":"Revise before customer approval"}</h2><small>{result.model}</small></div></div><ResultList icon={<CircleGauge/>} title="Audit reasons" items={result.reasons}/><ResultList icon={<AlertTriangle/>} title="Missing evidence" items={result.missingEvidence} empty="No missing evidence identified."/><ResultList icon={<MessageCircleQuestion/>} title="Questions to resolve" items={result.customerQuestions} empty="No additional customer questions suggested."/><div className="rewrite-card"><b>Grounded line-item rewrite</b><p>{result.lineItemRewrite||"No rewrite returned."}</p></div></motion.div>:<motion.div key="risk-empty" initial={{opacity:0}} animate={{opacity:1}} className="agent-empty"><Bot/><h2>Authorization risk appears here</h2><p>Every response is generated live through Groq with strict structured output.</p></motion.div>}</AnimatePresence></div></section></div></main>;
}

function ResultList({icon,title,items,empty}:{icon:React.ReactNode;title:string;items:string[];empty?:string}) {
  return <section className="risk-list"><h3>{icon}{title}</h3>{items.length?<ul>{items.map(item=><li key={item}>{item}</li>)}</ul>:<p>{empty}</p>}</section>;
}
