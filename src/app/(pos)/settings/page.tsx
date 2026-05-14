import { getGeneralConfig, updateGeneralConfig } from "@/server/settings/actions";
import { GeneralConfigForm } from "./form";
import { getDictionary } from "@/i18n/dictionaries";

export default async function GeneralConfigPage() {
  const config = await getGeneralConfig();
  const t = getDictionary("vi");
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2">{t.settings.generalConfig}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.generalPageDesc}</p>
      <GeneralConfigForm config={config} action={updateGeneralConfig} />
    </div>
  );
}
