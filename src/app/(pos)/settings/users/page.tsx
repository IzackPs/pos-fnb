import { getUsers, getRoles } from "@/server/settings/actions";
import { UsersManager } from "../components";
import { getDictionary } from "@/i18n/dictionaries";

export default async function UsersPage() {
  const users = await getUsers();
  const roles = await getRoles();
  const t = getDictionary("vi");
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.users}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.userPageDesc}</p>
      <UsersManager users={users} roles={roles} />
    </div>
  );
}
