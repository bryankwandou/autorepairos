"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bot, Check, ExternalLink, FilePlus2, PackagePlus, Wrench } from "lucide-react";
import type { WorkOrderView } from "@/lib/autorepair";

const usd=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"});

export function WorkOrderClient({initial}:{initial:WorkOrderView}){
  const[order,setOrder]=useState(initial);
  const[notice,setNotice]=useState("");
  const[forms,setForms]=useState<"finding"|"diagnostic"|null>(null);
  async function refresh(){const response=await fetch("/api/work-orders/"+order.id,{cache:"no-store"});if(response.ok)setOrder(await response.json())}
  async function labor(id:string){const response=await fetch("/api/line-items/"+id+"/log-work",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"labor",minutes:30})});const result=await response.json();setNotice(response.ok?"30 labor minutes logged against approved work.":result.reason||result.message);await refresh()}
  async function part(id:string,formData:FormData){const response=await fetch("/api/line-items/"+id+"/log-work",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"parts",partName:formData.get("partName"),actualCost:Number(formData.get("actualCost"))})});const result=await response.json();setNotice(response.ok?"Part cost logged against approved work.":result.reason||result.message);if(response.ok)await refresh()}
  async function finding(formData:FormData){const response=await fetch("/api/work-orders/"+order.id+"/line-items",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(formData))});const result=await response.json();setNotice(response.ok?"New scope created with its own pending approval.":result.message);if(response.ok){setForms(null);await refresh()}}
  async function diagnostic(formData:FormData){const response=await fetch("/api/diagnostics/draft",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workOrderId:order.id,notes:formData.get("notes")})});const result=await response.json();setNotice(response.ok?"Grounded draft created and held for review.":result.message);if(response.ok){setForms(null);await refresh()}}
  async function review(id:string){await fetch("/api/diagnostics/"+id+"/review",{method:"POST"});await refresh()}

  return <main className="staff-page"><div className="shell staff-shell">
    <Link className="back" href="/dashboard"><ArrowLeft/> Back to work orders</Link>
    <header className="staff-heading"><div><span className="eyebrow">{order.displayId} | {order.status.replaceAll("_"," ")}</span><h1>{order.vehicle}</h1><p>{order.customer} | {order.mileage.toLocaleString()} miles | Advisor {order.advisor}</p></div><div className="actions"><button className="button button-secondary" onClick={()=>setForms("diagnostic")}><Bot/> Draft diagnostic</button><button className="button button-primary" onClick={()=>setForms("finding")}><FilePlus2/> Add new finding</button></div></header>
    {notice&&<div className="notice"><Check/>{notice}</div>}
    {forms==="finding"&&<form className="panel form" action={finding}><h2>New mid-repair finding</h2><p>This creates a fresh pending line item.</p><input name="description" required placeholder="Repair description"/><textarea name="explanation" required placeholder="Customer-facing explanation"/><div className="form-grid"><input name="partsEstimate" type="number" min="0" step="0.01" placeholder="Parts estimate"/><input name="laborEstimate" type="number" min="0" step="0.01" placeholder="Labor estimate"/></div><button className="button button-primary">Create gated item</button></form>}
    {forms==="diagnostic"&&<form className="panel form" action={diagnostic}><h2>Technician findings</h2><textarea name="notes" required rows={5} placeholder="Enter measured findings, observed conditions, and codes."/><button className="button button-primary"><Bot/> Draft grounded summary</button></form>}
    <div className="workspace"><section><div className="panel-head"><div><h2>Estimate line items</h2><p>Customer decisions apply independently.</p></div></div><div className="line-items">{order.lineItems.map(item=><article className={item.overage?"line-item overage":"line-item"} key={item.id}><div className="line-top"><span className={"status "+item.approvalStatus}>{item.approvalStatus}</span><b>{usd.format(item.estimated)}</b></div><h3>{item.description}</h3><p>{item.explanation}</p><div className="costs"><div><small>Actual</small><b>{usd.format(item.actual)}</b></div><div><small>Estimate</small><b>{usd.format(item.estimated)}</b></div><div><small>Variance</small><b>{usd.format(item.variance)}</b></div></div><div className="actions"><button className="button button-secondary button-small" onClick={()=>labor(item.id)}><Wrench/> Log 30 min</button><Link className="button button-ghost button-small" href={"/approve/"+item.token} target="_blank">Customer view <ExternalLink/></Link></div><form className="part-form" action={formData=>part(item.id,formData)}><input name="partName" required placeholder="Part name"/><input name="actualCost" type="number" min="0.01" step="0.01" required placeholder="Actual cost"/><button className="button button-secondary button-small"><PackagePlus/> Log part</button></form></article>)}</div></section>
      <aside><section className="panel"><h2>Customer concern</h2><p>{order.concern}</p><dl><div><dt>Technician</dt><dd>{order.technician}</dd></div><div><dt>VIN</dt><dd>{order.vin}</dd></div></dl></section><section className="panel"><h2>Diagnostic drafts</h2>{order.diagnostics.map(item=><article className="diagnostic" key={item.id}><span className={"status "+item.status}>{item.status}</span><b>{item.summary}</b>{item.status==="drafting"&&<button className="button button-secondary button-small" onClick={()=>review(item.id)}>Mark reviewed</button>}</article>)}</section></aside>
    </div>
  </div></main>
}
