import { getShifts, createShift, updateShift, deleteShift } from "@/server/settings/actions";
import { DataTable } from "../data-table";
import { getDictionary } from "@/i18n/dictionaries";

export default async function ShiftsPage() {
  const shifts = await getShifts();
  const t = getDictionary("vi");
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.shifts}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.shiftPageDesc}</p>
      <DataTable
        data={shifts}
        columns={[
          { key: "name", label: t.settings.name, type: "text" as const },
          { key: "startTime", label: t.common.startTime || "Giờ bắt đầu", type: "text" as const },
          { key: "endTime", label: t.common.endTime || "Giờ kết thúc", type: "text" as const },
        ]}
        onCreate={createShift}
        onUpdate={updateShift}
        onDelete={deleteShift}
      />
    </div>
  );
}
