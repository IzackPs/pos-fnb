import { getSystemModules } from "@/server/settings/actions";
import { ModulesClient } from "./modules-client";

export default async function ModulesPage() {
  const modules = await getSystemModules();
  return <ModulesClient modules={modules} />;
}
