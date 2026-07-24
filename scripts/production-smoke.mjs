const baseUrl=(process.env.SMOKE_BASE_URL||"https://autorepairos.vercel.app").replace(/\/$/,"");
let cookie="";

function assert(condition,message){if(!condition)throw new Error(message)}
async function request(path,{method="GET",body,auth=true}={}){
  const response=await fetch(baseUrl+path,{method,headers:{...(body?{"content-type":"application/json"}:{}),...(auth&&cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined,redirect:"manual"});
  const text=await response.text();
  let data={};try{data=text?JSON.parse(text):{}}catch{data={text}}
  return{response,data};
}
function passed(name,detail=""){console.log(`✓ ${name}${detail?` — ${detail}`:""}`)}

console.log(`AutoRepairOS production smoke: ${baseUrl}`);

const root=await request("/",{auth:false});assert(root.response.status===200,"Public landing page failed");passed("public landing",String(root.response.status));
const status=await request("/api/system/status",{auth:false});assert(status.response.status===200&&status.data.status==="operational","System status failed");passed("system proof API",status.data.commit?.slice(0,12));
const unauth=await request("/api/dashboard",{auth:false});assert(unauth.response.status===401,"Dashboard did not reject unauthenticated access");passed("staff API protection","401");

const login=await request("/api/auth/login",{method:"POST",auth:false,body:{email:"advisor@autorepairos.app",password:"repair123"}});assert(login.response.status===200,"Demo login failed");const setCookie=login.response.headers.getSetCookie?.()[0]||login.response.headers.get("set-cookie");assert(setCookie,"Login did not return a session cookie");cookie=setCookie.split(";")[0];passed("signed staff login","200");
const reset=await request("/api/demo/reset",{method:"POST"});assert(reset.response.status===200,"Demo reset failed");passed("deterministic demo reset");

const diagnostic=await request("/api/ai/diagnostic-agent",{method:"POST",body:{notes:"Front brake pads measure 2 mm. Left front rotor has visible scoring. No hydraulic leaks found."}});assert(diagnostic.response.status===200,"Diagnostic agent failed");assert(diagnostic.data.unsupportedUrgencyDetected===false,"Diagnostic agent retained unsupported urgency");passed("live diagnostic agent",diagnostic.data.approvalReadiness);

const risk=await request("/api/ai/authorization-risk",{method:"POST",body:{diagnosticNotes:"Front brake pads measure 2 mm. Left front rotor has visible scoring. No hydraulic leaks found.",lineItemDescription:"Replace front brake pads and rotors",customerExplanation:"Replace the front pads and scored rotors, then verify braking operation with a road test.",partsEstimate:438,laborEstimate:252}});assert(risk.response.status===200,"Authorization risk agent failed");assert(["ready","needs_revision","blocked"].includes(risk.data.decision),"Authorization agent returned an invalid decision");passed("live authorization agent",`${risk.data.decision} ${risk.data.score}/100`);

const blocked=await request("/api/line-items/line-item-1/log-work",{method:"POST",body:{type:"labor",minutes:15}});assert(blocked.response.status===409,"Pending labor was not blocked");passed("pending labor hard block","409");
const approval=await request("/api/line-items/line-item-1/approve",{method:"POST",auth:false,body:{token:"approve-brake-2048",decision:"approved"}});assert(approval.response.status===200,"Customer approval failed");passed("customer token approval","200");
const labor=await request("/api/line-items/line-item-1/log-work",{method:"POST",body:{type:"labor",minutes:15}});assert(labor.response.status===201,"Approved labor was not accepted");const part=await request("/api/line-items/line-item-1/log-work",{method:"POST",body:{type:"parts",partName:"Smoke test rotor",actualCost:1}});assert(part.response.status===201,"Approved part was not accepted");passed("approved labor and parts","201");

const finding=await request("/api/work-orders/work-order-1/line-items",{method:"POST",body:{description:"Inspect and replace torn CV boot",explanation:"A 20 mm split is visible in the boot and grease is visible at the inner joint.",partsEstimate:85,laborEstimate:160}});assert(finding.response.status===201,"New repair scope failed");const findingBlocked=await request(`/api/line-items/${finding.data.id}/log-work`,{method:"POST",body:{type:"labor",minutes:15}});assert(findingBlocked.response.status===409,"New scope did not require fresh approval");passed("mid-repair reapproval gate","409");

const draft=await request("/api/diagnostics/draft",{method:"POST",body:{workOrderId:"work-order-1",notes:"CV boot has a 20 mm split. Grease is visible on the inner joint. No clicking heard on road test."}});assert(draft.response.status===201,"Diagnostic draft failed");const review=await request(`/api/diagnostics/${draft.data.id}/review`,{method:"POST"});assert(review.response.status===200&&review.data.status==="reviewed","Diagnostic review failed");passed("diagnostic draft and review","reviewed");

const proofs=await request("/api/verification/proofs",{auth:false});assert(proofs.response.status===200&&proofs.data.proofs?.length>0,"Devnet proof API failed");assert(proofs.data.proofs[0].network==="devnet","Proof is not devnet");passed("verified Solana devnet proof",`slot ${proofs.data.proofs[0].slot}`);

console.log("All production MVP workflows passed.");
