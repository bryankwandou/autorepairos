"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle2, ExternalLink, GitCommitHorizontal, GitFork, Radio, Server, ShieldCheck, Wallet } from "lucide-react";

type Proof = { signature:string; publicKey:string; slot:number; confirmedAt:string; memo:string; network:"devnet" };
type Status = {
  status:"operational";
  productionUrl:string;
  repositoryUrl:string;
  commit:string;
  environment:string;
  region:string;
  checkedAt:string;
  ai:{configured:boolean;provider:string;model:string;agents:string[]};
  solana:{network:"devnet";rpcConfigured:boolean;verifiedProofs:number;latestProof:Proof|null};
  controls:Record<string,boolean>;
};

const labels:Record<string,string>={customerApprovalGate:"Customer approval hard gate",staffSessionProtection:"Signed staff session",serverSideDevnetVerification:"Server-side devnet verification",midRepairReapproval:"Fresh approval for added scope"};

export function SystemProofClient({status}:{status:Status}) {
  const proof=status.solana.latestProof;
  return <main className="proof-console"><div className="shell proof-console-shell"><motion.header initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="proof-hero"><div><span className="eyebrow"><Radio/> Public system proof</span><h1>Trust the controls. Verify the evidence.</h1><p>AutoRepairOS exposes its production identity, live AI configuration, authorization controls, and confirmed Solana devnet record without exposing secrets.</p></div><div className="operational"><i/><span>Production operational</span><small>Checked {new Date(status.checkedAt).toLocaleString()}</small></div></motion.header><section className="proof-console-grid"><ProofCard icon={<Server/>} eyebrow="Deployment" title="Production is public"><Fact label="Environment" value={`${status.environment} · ${status.region}`}/><Fact label="Build commit" value={status.commit.slice(0,12)} icon={<GitCommitHorizontal/>}/><a className="proof-link" href={status.productionUrl} target="_blank" rel="noreferrer">Open production <ExternalLink/></a></ProofCard><ProofCard icon={<Bot/>} eyebrow="AI runtime" title={status.ai.configured?"Groq agents configured":"AI configuration missing"}><Fact label="Provider" value={status.ai.provider}/><Fact label="Model" value={status.ai.model}/>{status.ai.agents.map(agent=><div className="proof-check" key={agent}><CheckCircle2/>{agent}</div>)}</ProofCard><ProofCard icon={<ShieldCheck/>} eyebrow="Authorization" title="Guardrails enforced">{Object.entries(status.controls).map(([key,enabled])=><div className="proof-check" key={key}>{enabled?<CheckCircle2/>:<Radio/>}{labels[key]||key}</div>)}</ProofCard><ProofCard icon={<Wallet/>} eyebrow="Solana devnet" title={`${status.solana.verifiedProofs} verified proof${status.solana.verifiedProofs===1?"":"s"}`} wide>{proof?<><Fact label="Wallet" value={`${proof.publicKey.slice(0,10)}...${proof.publicKey.slice(-10)}`}/><Fact label="Confirmed slot" value={String(proof.slot)}/><Fact label="Memo" value={proof.memo}/><a className="proof-link" href={`https://explorer.solana.com/tx/${proof.signature}?cluster=devnet`} target="_blank" rel="noreferrer">Verify transaction on explorer <ExternalLink/></a></>:<p>No signed proof is available.</p>}</ProofCard></section><motion.footer initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.25}} className="proof-footer"><GitFork/><div><b>Public source repository</b><span>Inspect implementation and deployment history.</span></div><a className="button button-secondary" href={status.repositoryUrl} target="_blank" rel="noreferrer">Open GitHub <ExternalLink/></a></motion.footer></div></main>;
}

function ProofCard({icon,eyebrow,title,children,wide=false}:{icon:React.ReactNode;eyebrow:string;title:string;children:React.ReactNode;wide?:boolean}) {
  return <motion.article className={`panel proof-console-card${wide?" proof-console-wide":""}`} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}}><div className="proof-card-icon">{icon}</div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><div className="proof-card-body">{children}</div></motion.article>;
}

function Fact({label,value,icon}:{label:string;value:string;icon?:React.ReactNode}) {
  return <div className="proof-fact"><span>{label}</span><b>{icon}{value}</b></div>;
}
