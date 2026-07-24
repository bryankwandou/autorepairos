import test from "node:test";
import assert from "node:assert/strict";
import { approve, canLogWorkAgainst, createLineItem, draftDiagnostic, getWorkOrder, logLabor, logPart, resetDemo, reviewDiagnostic } from "../src/lib/autorepair.ts";
import { enforceGroundingPolicy } from "../src/lib/groq-agent.ts";
import { runAuthorizationRiskAgent, validateAuthorizationRiskInput } from "../src/lib/authorization-agent.ts";

test("complete approval-gated repair workflow",()=>{
  resetDemo();
  assert.equal(canLogWorkAgainst({description:"Pending",approvalStatus:"pending"}).allowed,false);
  assert.equal(logLabor("line-item-1",30).allowed,false);
  assert.equal(logPart("line-item-1","Front rotor",120).allowed,false);

  approve("line-item-1","approve-brake-2048","approved");
  assert.equal(logLabor("line-item-1",30).allowed,true);
  assert.equal(logPart("line-item-1","Front rotor",120).allowed,true);
  assert.equal(getWorkOrder("work-order-1")?.lineItems[0].actual,204);

  const finding=createLineItem("work-order-1",{description:"Replace torn CV boot",explanation:"The boot is split and grease is escaping.",partsEstimate:85,laborEstimate:160});
  assert.equal(finding.approvalStatus,"pending");
  assert.equal(logLabor(finding.id,15).allowed,false);

  const draft=draftDiagnostic("work-order-1","CV boot has a 20 mm split. Grease visible on inner joint. No clicking heard on road test.");
  assert.equal(draft.status,"drafting");
  assert.equal(reviewDiagnostic(draft.id).status,"reviewed");
});

test("grounding policy removes invented severity and repair scope",()=>{const result=enforceGroundingPolicy("Front pads measure 2 mm. No hydraulic leaks found.",{finding:"Pads are dangerously worn",evidence:[],customerExplanation:"Stopping distance may increase",whyItMatters:"Brake failure is possible",recommendedAction:"Replace immediately",approvalReadiness:"ready",ambiguityFlags:[],unsupportedUrgencyDetected:false},"test-model");assert.equal(result.policyAdjusted,true);assert.equal(result.approvalReadiness,"needs_clarification");assert.equal(result.finding,"Front pads measure 2 mm. No hydraulic leaks found.");assert.equal(result.unsupportedUrgencyDetected,false);});

test("authorization risk input rejects vague or invalid approval packages",()=>{
  assert.throws(()=>validateAuthorizationRiskInput({diagnosticNotes:"vague",lineItemDescription:"repair",customerExplanation:"do it",partsEstimate:0,laborEstimate:0}));
  assert.throws(()=>validateAuthorizationRiskInput({diagnosticNotes:"Pads measure exactly 2 mm.",lineItemDescription:"Replace pads",customerExplanation:"Replace measured front brake pads.",partsEstimate:-1,laborEstimate:80}));
});

test("authorization risk agent requests strict structured output",async()=>{
  const previousKey=process.env.GROQ_API_KEY;
  const previousFetch=globalThis.fetch;
  process.env.GROQ_API_KEY="test-key";
  let requestBody:Record<string,unknown>|undefined;
  globalThis.fetch=async(_input,init)=>{
    requestBody=JSON.parse(String(init?.body));
    return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({score:91,decision:"ready",reasons:["Scope is specific."],missingEvidence:[],customerQuestions:[],lineItemRewrite:"Replace front brake pads and rotors based on the supplied measurements."})}}]}),{status:200,headers:{"content-type":"application/json"}});
  };
  try{
    const result=await runAuthorizationRiskAgent({diagnosticNotes:"Front pads measure 2 mm. Rotor has visible scoring.",lineItemDescription:"Replace front brake pads and rotors",customerExplanation:"Replace the front pads and scored rotors.",partsEstimate:438,laborEstimate:252});
    assert.equal(result.decision,"ready");
    assert.equal(result.score,91);
    assert.equal((requestBody?.response_format as {type:string}).type,"json_schema");
  }finally{
    globalThis.fetch=previousFetch;
    if(previousKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=previousKey;
  }
});
