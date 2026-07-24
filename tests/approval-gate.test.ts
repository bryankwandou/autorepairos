import test from "node:test";
import assert from "node:assert/strict";
import { approve, canLogWorkAgainst, createLineItem, draftDiagnostic, getWorkOrder, logLabor, logPart, resetDemo, reviewDiagnostic } from "../src/lib/autorepair.ts";
import { enforceGroundingPolicy } from "../src/lib/groq-agent.ts";

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
