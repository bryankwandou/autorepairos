import { notFound } from "next/navigation";
import { ApprovalClient } from "@/components/approval-client";
import { getApproval } from "@/lib/autorepair";
export default async function ApprovalPage({params}:{params:Promise<{token:string}>}){const {token}=await params;const bundle=getApproval(token);if(!bundle)notFound();return <ApprovalClient order={bundle.workOrder} item={bundle.lineItem}/>}
