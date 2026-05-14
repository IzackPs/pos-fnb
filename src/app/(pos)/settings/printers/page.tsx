import { getPrinters, getAreas_list, createPrinter, updatePrinter, deletePrinter } from "@/server/settings/actions";
import { PrintersManager } from "../components-printers";
import { getServerDictionary } from "@/lib/locale";

export default async function PrintersPage() {
  const [printers, areas] = await Promise.all([getPrinters(), getAreas_list()]);
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.printer.title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.printerPageDesc}</p>
      <PrintersManager
        printers={printers}
        areas={areas}
        createPrinter={createPrinter}
        updatePrinter={updatePrinter}
        deletePrinter={deletePrinter}
      />
    </div>
  );
}
