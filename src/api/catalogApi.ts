import api from "./axios";
import type {
  Category,
  SubCategory,
  Product,
  ProductImage,
  StockWeightOption,
  ProductWeightOption,
} from "../types/catalog";

type UploadResponse = {
  fileUrl: string;
};

export type ProductImageRequest = {
  imageUrl: string;
  s3Key?: string;
  altText?: string;
  imageType?: string;
  primaryImage?: boolean;
  sortOrder?: number;
};

export const addProductImage = async (
  productId: number,
  payload: ProductImageRequest,
): Promise<ProductImage> => {
  const res = await api.post(
    `/admin/catalog/products/${productId}/images`,
    payload,
  );
  return res.data;
};

export const getProductImages = async (
  productId: number,
): Promise<ProductImage[]> => {
  const res = await api.get(`/admin/catalog/products/${productId}/images`);
  return res.data;
};

export const deleteProductImage = async (imageId: number): Promise<void> => {
  await api.delete(`/admin/catalog/product-images/${imageId}`);
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get("/admin/catalog/categories");
  return res.data;
};

export const createCategory = async (payload: Category): Promise<Category> => {
  const res = await api.post("/admin/catalog/categories", payload);
  return res.data;
};

export const updateCategory = async (
  categoryId: number,
  payload: Category,
): Promise<Category> => {
  const res = await api.put(`/admin/catalog/categories/${categoryId}`, payload);
  return res.data;
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  await api.delete(`/admin/catalog/categories/${categoryId}`);
};

export const uploadFile = async (
  file: File,
  folder = "categories",
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/admin/catalog/upload?folder=${folder}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
};

export const getSubCategoriesByCategory = async (
  categoryId: number,
): Promise<SubCategory[]> => {
  const res = await api.get(
    `/admin/catalog/categories/${categoryId}/subcategories`,
  );
  return res.data;
};

export const createSubCategory = async (
  categoryId: number,
  payload: SubCategory,
): Promise<SubCategory> => {
  const res = await api.post(
    `/admin/catalog/categories/${categoryId}/subcategories`,
    payload,
  );
  return res.data;
};
export const getAllSubCategories = async (): Promise<SubCategory[]> => {
  const res = await api.get("/admin/catalog/subcategories");
  return res.data;
};

export const updateSubCategory = async (
  subCategoryId: number,
  payload: SubCategory,
): Promise<SubCategory> => {
  const res = await api.put(
    `/admin/catalog/subcategories/${subCategoryId}`,
    payload,
  );
  return res.data;
};
export const deleteSubCategory = async (
  subCategoryId: number,
): Promise<void> => {
  await api.delete(`/admin/catalog/subcategories/${subCategoryId}`);
};
export const getAllProducts = async (): Promise<Product[]> => {
  const res = await api.get("/admin/catalog/products");
  return res.data;
};
export const createProduct = async (
  subCategoryId: number,
  payload: Product,
): Promise<Product> => {
  const res = await api.post(
    `/admin/catalog/subcategories/${subCategoryId}/products`,
    payload,
  );
  return res.data;
};

export const updateProduct = async (
  productId: number,
  payload: Product,
): Promise<Product> => {
  const res = await api.put(`/admin/catalog/products/${productId}`, payload);
  return res.data;
};
export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/admin/catalog/products/${productId}`);
};
export const getAllStockBoxes = async (): Promise<string[]> => {
  const res = await api.get("/admin/catalog/stock-boxes");
  return res.data;
};

export const getStockWeightsByBox = async (
  stockBox: string,
): Promise<StockWeightOption[]> => {
  const res = await api.get("/admin/catalog/stock-boxes/weights", {
    params: { stockBox },
  });
  return res.data;
};
