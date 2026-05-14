import { getPrintTemplates, getPrinters_list, createPrintTemplate, updatePrintTemplate, deletePrintTemplate } from "@/server/settings/actions";
import { PrintTemplatesManager } from "../components-templates";
import { getServerDictionary } from "@/lib/locale";

export default async function PrintTemplatesPage() {
  const [templates, printers] = await Promise.all([getPrintTemplates(), getPrinters_list()]);
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.printTemplate.title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.templatePageDesc}</p>
      <PrintTemplatesManager
        templates={templates}
        printers={printers}
        createTemplate={createPrintTemplate}
        updateTemplate={updatePrintTemplate}
        deleteTemplate={deletePrintTemplate}
      />
    </div>
  );
}
