import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from "@/server/settings/actions";
import { HolidaysUI } from "./holidays-ui";

export default async function HolidaysPage() {
  const holidays = await getHolidays();
  return <HolidaysUI holidays={holidays} createHoliday={createHoliday} updateHoliday={updateHoliday} deleteHoliday={deleteHoliday} />;
}
