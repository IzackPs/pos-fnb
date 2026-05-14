import { getKaraokePricings, getAreas_list, createKaraokePricing, updateKaraokePricing, deleteKaraokePricing } from "@/server/settings/actions";
import { KaraokePricingManager } from "./karaoke-ui";

export default async function KaraokePage() {
  const [pricings, areas] = await Promise.all([getKaraokePricings(), getAreas_list()]);
  return <KaraokePricingManager pricings={pricings} areas={areas} createKP={createKaraokePricing} updateKP={updateKaraokePricing} deleteKP={deleteKaraokePricing} />;
}
