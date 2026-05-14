import { getCategories, createCategory, updateCategory, deleteCategory } from "@/server/settings/actions";
import { DataTable } from "../data-table";
import { getDictionary } from "@/i18n/dictionaries";

export default async function CategoriesPage() {
  const cats = await getCategories();
  const t = getDictionary("vi");
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{t.settings.categories}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.settings.categoryPageDesc}</p>
      <DataTable
        data={cats}
        columns={[
          { key: "name", label: t.settings.name, type: "text" as const },
          { key: "slug", label: "Slug", type: "text" as const },
          { key: "sortOrder", label: t.settings.sortOrder, type: "number" as const },
        ]}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
    </div>
  );
}
