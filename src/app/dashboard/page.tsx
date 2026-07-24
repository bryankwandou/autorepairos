import { AutoRepairDashboard } from "@/components/autorepair-dashboard";
import { getDashboard } from "@/lib/autorepair";
export const dynamic="force-dynamic";
export default function DashboardPage(){return <AutoRepairDashboard data={getDashboard()}/>}
