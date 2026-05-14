import { getAreas, createArea, updateArea, deleteArea, createTable, updateTable, deleteTable } from "@/server/settings/actions";
import { AreasManager } from "../components-areas";
import { getDictionary } from "@/i18n/dictionaries";

export default async function AreasPage() {
  const areas = await getAreas();
  const t = getDictionary("vi");
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.sidebar.areasTables}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.areaPageDesc}</p>
      <AreasManager
        areas={areas}
        createArea={createArea}
        updateArea={updateArea}
        deleteArea={deleteArea}
        createTable={createTable}
        updateTable={updateTable}
        deleteTable={deleteTable}
      />
    </div>
  );
}
