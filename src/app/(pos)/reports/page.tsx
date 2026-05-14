import { ReportsClientWrapper } from "./reports-client";

export default async function ReportsPage() {
  const today = new Date().toISOString().split("T")[0];
  return <ReportsClientWrapper today={today} />;
}
