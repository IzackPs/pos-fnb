import { getSystemModules } from "@/server/settings/actions";
import { PosLayoutClient } from "./pos-layout-client";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const modules = await getSystemModules();
  const enabledModules = new Set(modules.filter(m => m.enabled).map(m => m.name));
  return <PosLayoutClient enabledModules={enabledModules}>{children}</PosLayoutClient>;
}
