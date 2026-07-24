export type DiagnosticAgentResult={finding:string;evidence:string[];customerExplanation:string;whyItMatters:string;recommendedAction:string;approvalReadiness:"ready"|"needs_clarification";ambiguityFlags:string[];unsupportedUrgencyDetected:boolean;model:string};

const urgencyTerms=/\b(critical|dangerous|unsafe|immediately|catastrophic|life-threatening)\b/gi;

export async function runDiagnosticAgent(notes:string):Promise<DiagnosticAgentResult>{
  const apiKey=process.env.GROQ_API_KEY;
  if(!apiKey)throw new Error("GROQ_API_KEY is not configured.");
  const model=process.env.GROQ_MODEL||"openai/gpt-oss-120b";
  const response=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify({model,temperature:.1,response_format:{type:"json_object"},messages:[{role:"system",content:"You are AutoRepairOS Diagnostic Agent. Convert raw automotive technician notes into factual customer-facing language. Never invent measurements, causes, failures, severity, urgency, safety claims, parts, or recommendations not supported by the notes. Return only JSON with keys finding, evidence (array), customerExplanation, whyItMatters, recommendedAction, approvalReadiness (ready or needs_clarification), ambiguityFlags (array), unsupportedUrgencyDetected (boolean). If evidence is insufficient, say so and use needs_clarification."},{role:"user",content:"Raw technician notes:\n"+notes}]}),cache:"no-store"});
  if(!response.ok)throw new Error("Groq agent request failed with status "+response.status+".");
  const payload=await response.json();
  const parsed=JSON.parse(payload.choices?.[0]?.message?.content||"{}");
  const rawUrgency=new Set((notes.match(urgencyTerms)||[]).map((term:string)=>term.toLowerCase()));
  const outputText=JSON.stringify(parsed);
  const introduced=(outputText.match(urgencyTerms)||[]).some((term:string)=>!rawUrgency.has(term.toLowerCase()));
  return {finding:String(parsed.finding||""),evidence:Array.isArray(parsed.evidence)?parsed.evidence.map(String):[],customerExplanation:String(parsed.customerExplanation||""),whyItMatters:String(parsed.whyItMatters||""),recommendedAction:String(parsed.recommendedAction||""),approvalReadiness:parsed.approvalReadiness==="ready"?"ready":"needs_clarification",ambiguityFlags:Array.isArray(parsed.ambiguityFlags)?parsed.ambiguityFlags.map(String):[],unsupportedUrgencyDetected:Boolean(parsed.unsupportedUrgencyDetected)||introduced,model};
}
