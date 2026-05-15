import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import ProductForm from "../components/forms/ProductForm";
import { deleteProduct, getAllProducts } from "../api/catalogApi";
import type { Product } from "../types/catalog";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId?: number) => {
    if (!productId) return;

    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await deleteProduct(productId);

      if (editingProduct?.productId === productId) {
        setEditingProduct(null);
      }

      await loadProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold">Products</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProductForm
          onSuccess={loadProducts}
          editingProduct={editingProduct}
          onCancelEdit={() => setEditingProduct(null)}
        />

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Saved Products</h2>

          <div className="space-y-4">
            {products.length === 0 ? (
              <p className="text-gray-500">No products found</p>
            ) : (
              products.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-start gap-4 rounded-xl border p-4"
                >
                  <div className="shrink-0">
                    {product.thumbnailImageUrl ? (
                      <img
                        src={product.thumbnailImageUrl}
                        alt={product.itemName}
                        className="h-20 w-20 rounded-xl border bg-gray-100 object-cover"
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
                        {product.itemName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {product.subCategory?.subCategoryName ||
                          "No SubCategory"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{product.slug}</p>

                    {product.shortDescription && (
                      <p className="text-sm text-gray-700">
                        {product.shortDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        Stock: {product.stockCount ?? 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        ₹ {product.salePrice ?? 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {product.activeStatus ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.productId)}
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
