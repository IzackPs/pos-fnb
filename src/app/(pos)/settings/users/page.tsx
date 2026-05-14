import { getUsers, getRoles } from "@/server/settings/actions";
import { UsersManager } from "../components";
import { getServerDictionary } from "@/lib/locale";

export default async function UsersPage() {
  const users = await getUsers();
  const roles = await getRoles();
  const t = await getServerDictionary();
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.users}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.userPageDesc}</p>
      <UsersManager users={users} roles={roles} />
    </div>
  );
}
