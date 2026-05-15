import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import SubCategoryForm from "../components/forms/SubCategoryForm";
import { deleteSubCategory, getAllSubCategories } from "../api/catalogApi";
import type { SubCategory } from "../types/catalog";

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);

  const loadAllSubCategories = async () => {
    try {
      const data = await getAllSubCategories();
      setSubCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const data = await getAllSubCategories();
        console.log("Fetched subcategories:", data);
        setSubCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubCategories();
  }, []);

  const handleDelete = async (subCategoryId?: number) => {
    if (!subCategoryId) return;

    const ok = window.confirm("Delete this sub category?");
    if (!ok) return;

    try {
      await deleteSubCategory(subCategoryId);

      if (editingSubCategory?.subCategoryId === subCategoryId) {
        setEditingSubCategory(null);
      }

      await loadAllSubCategories();
    } catch (error) {
      console.error(error);
      alert("Failed to delete sub category");
    }
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold">Sub Categories</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SubCategoryForm
          onSuccess={loadAllSubCategories}
          editingSubCategory={editingSubCategory}
          onCancelEdit={() => setEditingSubCategory(null)}
        />

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Saved Sub Categories</h2>

          <div className="space-y-4">
            {subCategories.length === 0 ? (
              <p className="text-gray-500">No sub categories found</p>
            ) : (
              subCategories.map((sub) => (
                <div
                  key={sub.subCategoryId}
                  className="flex items-start gap-4 rounded-xl border p-4"
                >
                  <div className="shrink-0">
                    {sub.imageUrl ? (
                      <img
                        src={sub.imageUrl}
                        alt={sub.subCategoryName}
                        className="h-20 w-20 rounded-xl border bg-gray-100 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-gray-100 text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {sub.subCategoryName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {sub.category?.categoryName || "No Category"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{sub.slug}</p>

                    {sub.description && (
                      <p className="text-sm text-gray-700">{sub.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        Sort: {sub.sortOrder ?? 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {sub.activeStatus ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {sub.featured ? "Featured" : "Normal"}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setEditingSubCategory(sub)}
                        className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sub.subCategoryId)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
