import { notFound } from "next/navigation";
import { WorkOrderClient } from "@/components/work-order-client";
import { getWorkOrder } from "@/lib/autorepair";
export default async function WorkOrderPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const order=getWorkOrder(id);if(!order)notFound();return <WorkOrderClient initial={order}/>}
