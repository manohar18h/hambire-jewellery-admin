import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import CategoryForm from "../components/forms/CategoryForm";
import { deleteCategory, getCategories } from "../api/catalogApi";
import type { Category } from "../types/catalog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (!ignore) {
          console.log("Fetched categories:", data);
          setCategories(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();

    return () => {
      ignore = true;
    };
  }, []);
  const handleDelete = async (categoryId?: number) => {
    if (!categoryId) return;

    const ok = window.confirm("Delete this category?");
    if (!ok) return;

    try {
      await deleteCategory(categoryId);

      if (editingCategory?.categoryId === categoryId) {
        setEditingCategory(null);
      }

      await loadCategories();
    } catch (error) {
      console.error(error);
      alert("Failed to delete category");
    }
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CategoryForm
          onSuccess={loadCategories}
          editingCategory={editingCategory}
          onCancelEdit={() => setEditingCategory(null)}
        />

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Saved Categories</h2>

          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories found</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="flex items-start gap-4 rounded-xl border p-4"
                >
                  <div className="shrink-0">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.categoryName}
                        className="h-24 w-24 rounded-xl border bg-gray-100 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-gray-100 text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {cat.categoryName}
                      </h3>
                      <span className="text-sm text-gray-500">{cat.metal}</span>
                    </div>

                    <p className="text-sm text-gray-600">{cat.slug}</p>

                    {cat.description && (
                      <p className="text-sm text-gray-700">{cat.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        Sort: {cat.sortOrder ?? 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {cat.activeStatus ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {cat.featured ? "Featured" : "Normal"}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.categoryId)}
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
