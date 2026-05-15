import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  createProduct,
  getAllSubCategories,
  updateProduct,
  uploadFile,
  addProductImage,
  getProductImages,
  deleteProductImage,
  getAllStockBoxes,
  getStockWeightsByBox,
} from "../../api/catalogApi";
import type {
  Product,
  SubCategory,
  ProductImage,
  StockWeightOption,
} from "../../types/catalog";

type Props = {
  onSuccess?: () => void;
  editingProduct?: Product | null;
  onCancelEdit?: () => void;
};

type ProductFormValues = Omit<Product, "tags" | "searchKeywords"> & {
  tagsInput: string;
  searchKeywordsInput: string;
};

const defaultValues: ProductFormValues = {
  subCategoryId: undefined,
  itemName: "",
  slug: "",
  sku: "",
  productCode: "",
  catalogue: "",
  design: "",
  size: "",
  metal: "",
  purity: "",
  gender: "",
  occasion: "",
  styleType: "",
  collectionName: "",
  shortDescription: "",
  longDescription: "",
  careInstructions: "",
  returnPolicy: "",
  certificationDetails: "",
  metalWeight: undefined,
  grossWeight: undefined,
  netWeight: undefined,
  wastage: undefined,
  makingCharges: undefined,
  stoneWeight: undefined,
  stoneRate: undefined,
  stoneAmount: undefined,

  waxWeight: undefined,
  waxRate: undefined,
  waxAmount: undefined,

  diamondWeight: undefined,
  diamondRate: undefined,
  diamondAmount: undefined,

  bitsWeight: undefined,
  bitsRate: undefined,
  bitsAmount: undefined,

  enamelWeight: undefined,
  enamelRate: undefined,
  enamelAmount: undefined,

  pearlsWeight: undefined,
  pearlsRate: undefined,
  pearlsAmount: undefined,

  otherWeight: undefined,
  otherRate: undefined,
  otherAmount: undefined,

  basePrice: undefined,
  salePrice: undefined,
  discountPercent: undefined,
  totalAmount: undefined,
  stockCount: undefined,
  minOrderQty: 1,
  maxOrderQty: 5,
  activeStatus: true,
  featured: false,
  trending: false,
  bestSeller: false,
  newArrival: false,
  customizable: false,
  availabilityStatus: "IN_STOCK",
  thumbnailImageUrl: "",
  hoverImageUrl: "",
  videoUrl: "",
  sortOrder: 0,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  tagsInput: "",
  searchKeywordsInput: "",
  linkedStockProductId: undefined,
  stockBoxName: "",
  linkedWeight: undefined,
  primaryDisplayProduct: false,
};

export default function ProductForm({
  onSuccess,
  editingProduct,
  onCancelEdit,
}: Props) {
  const { control, handleSubmit, reset, setValue } = useForm<ProductFormValues>(
    {
      defaultValues,
    },
  );

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [hoverPreview, setHoverPreview] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const hoverInputRef = useRef<HTMLInputElement | null>(null);

  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [stockBoxes, setStockBoxes] = useState<string[]>([]);
  const [stockWeights, setStockWeights] = useState<StockWeightOption[]>([]);
  const [selectedQty, setSelectedQty] = useState<number | null>(null);
  const [activeLocked, setActiveLocked] = useState(false);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const data = await getAllSubCategories();
        setSubCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubCategories();
  }, []);

  useEffect(() => {
    const fetchStockBoxes = async () => {
      try {
        const data = await getAllStockBoxes();
        setStockBoxes(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStockBoxes();
  }, []);

  const loadWeightsByStockBox = async (stockBox: string) => {
    try {
      if (!stockBox) {
        setStockWeights([]);
        setSelectedQty(null);
        setActiveLocked(false);
        return;
      }

      console.log("Loading weights for stock box:", stockBox);

      const data = await getStockWeightsByBox(stockBox);

      console.log("Weights response:", data);

      setStockWeights(data);
    } catch (error) {
      console.error("Failed to load stock weights:", error);
      setStockWeights([]);
      setSelectedQty(null);
      setActiveLocked(false);
    }
  };

  useEffect(() => {
    const loadEditData = async () => {
      if (editingProduct) {
        const formData = {
          ...defaultValues,
          ...editingProduct,
          subCategoryId:
            editingProduct.subCategory?.subCategoryId ||
            editingProduct.subCategoryId,
          tagsInput: (editingProduct.tags || []).join(", "),
          searchKeywordsInput: (editingProduct.searchKeywords || []).join(", "),
        };

        reset(formData);

        if (editingProduct.stockBoxName) {
          try {
            const weights = await getStockWeightsByBox(
              editingProduct.stockBoxName,
            );
            setStockWeights(weights);

            const matchedWeight = editingProduct.linkedStockProductId
              ? weights.find(
                  (w) =>
                    w.stockProductId === editingProduct.linkedStockProductId,
                )
              : null;

            if (matchedWeight) {
              setSelectedQty(matchedWeight.qty);
              const outOfStock = matchedWeight.qty <= 0;
              setActiveLocked(outOfStock);
              if (outOfStock) {
                setValue("activeStatus", false);
              }
            } else {
              setSelectedQty(null);
              setActiveLocked(false);
            }
          } catch (error) {
            console.error(error);
            setStockWeights([]);
            setSelectedQty(null);
            setActiveLocked(false);
          }
        } else {
          setStockWeights([]);
          setSelectedQty(null);
          setActiveLocked(false);
        }

        setThumbnailPreview(editingProduct.thumbnailImageUrl || "");
        setHoverPreview(editingProduct.hoverImageUrl || "");

        if (editingProduct.productId) {
          try {
            const imgs = await getProductImages(editingProduct.productId);
            setGalleryImages(imgs);
          } catch (error) {
            console.error(error);
            setGalleryImages([]);
          }
        }
      } else {
        reset(defaultValues);
        setThumbnailPreview("");
        setHoverPreview("");
        setGalleryImages([]);
        setStockWeights([]);
        setSelectedQty(null);
        setActiveLocked(false);

        if (thumbInputRef.current) thumbInputRef.current.value = "";
        if (hoverInputRef.current) hoverInputRef.current.value = "";
        if (galleryInputRef.current) galleryInputRef.current.value = "";
      }
    };

    loadEditData();
  }, [editingProduct, reset]);

  const handleUpload = async (
    file: File,
    field: "thumbnailImageUrl" | "hoverImageUrl",
    type: "thumb" | "hover",
  ) => {
    try {
      const localPreview = URL.createObjectURL(file);

      if (type === "thumb") {
        setUploadingThumb(true);
        setThumbnailPreview(localPreview);
      } else {
        setUploadingHover(true);
        setHoverPreview(localPreview);
      }

      const response = await uploadFile(file, "products");
      setValue(field, response.fileUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    } finally {
      if (type === "thumb") setUploadingThumb(false);
      if (type === "hover") setUploadingHover(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (!editingProduct?.productId) {
      alert("Please save product first, then upload gallery images.");
      return;
    }

    try {
      setUploadingGallery(true);

      const uploadedImages: ProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const uploadRes = await uploadFile(file, "products");

        const savedImage = await addProductImage(editingProduct.productId, {
          imageUrl: uploadRes.fileUrl,
          s3Key: uploadRes.fileUrl,
          altText: editingProduct.itemName || "Product image",
          imageType: "GALLERY",
          primaryImage: false,
          sortOrder: galleryImages.length + i,
        });

        uploadedImages.push(savedImage);
      }

      setGalleryImages((prev) => [...prev, ...uploadedImages]);
    } catch (error: any) {
      console.error("Gallery upload error:", error);
      console.error("Response data:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Gallery image upload failed";

      alert(message);
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  };

  const handleDeleteGalleryImage = async (imageId?: number) => {
    if (!imageId) return;

    try {
      await deleteProductImage(imageId);
      setGalleryImages((prev) => prev.filter((img) => img.imageId !== imageId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete image");
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (!data.subCategoryId) {
        alert("Please select sub category");
        return;
      }
      if (!data.stockBoxName) {
        alert("Please select stock box");
        return;
      }

      if (!data.linkedStockProductId) {
        alert("Please select weight");
        return;
      }
      const payload: Product = {
        ...data,
        subCategory: {
          subCategoryId: data.subCategoryId,
        },
        tags: data.tagsInput
          ? data.tagsInput
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          : [],
        searchKeywords: data.searchKeywordsInput
          ? data.searchKeywordsInput
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          : [],
      };

      if (editingProduct?.productId) {
        await updateProduct(editingProduct.productId, payload);
        alert("Product updated successfully");
      } else {
        await createProduct(data.subCategoryId, payload);
        alert("Product created successfully");
      }

      reset(defaultValues);
      setThumbnailPreview("");
      setHoverPreview("");

      if (thumbInputRef.current) thumbInputRef.current.value = "";
      if (hoverInputRef.current) hoverInputRef.current.value = "";

      onSuccess?.();
      onCancelEdit?.();
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save product";
      alert(message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        {editingProduct ? "Edit Product" : "Create Product"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="subCategoryId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Sub Category</InputLabel>
                  <Select
                    {...field}
                    label="Sub Category"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value as string | number;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  >
                    <MenuItem value="">Select Sub Category</MenuItem>
                    {subCategories.map((sub) => (
                      <MenuItem
                        key={sub.subCategoryId}
                        value={sub.subCategoryId}
                      >
                        {sub.subCategoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="stockBoxName"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Stock Box</InputLabel>
                  <Select
                    {...field}
                    label="Stock Box"
                    value={field.value ?? ""}
                    onChange={async (e) => {
                      const stockBox = e.target.value as string;
                      console.log("Selected stock box:", stockBox);
                      field.onChange(stockBox);

                      setValue("linkedStockProductId", undefined);
                      setValue("linkedWeight", undefined);
                      setSelectedQty(null);
                      setActiveLocked(false);
                      setStockWeights([]);

                      console.log("Selected stock box:", stockBox);

                      await loadWeightsByStockBox(stockBox);
                    }}
                  >
                    <MenuItem value="">Select Stock Box</MenuItem>
                    {stockBoxes.map((box) => (
                      <MenuItem key={box} value={box}>
                        {box}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="linkedStockProductId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Weight</InputLabel>
                  <Select
                    {...field}
                    label="Weight"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value as string | number;
                      const stockProductId =
                        value === "" ? undefined : Number(value);
                      field.onChange(stockProductId);

                      const selected = stockWeights.find(
                        (w) => w.stockProductId === stockProductId,
                      );

                      if (selected) {
                        setValue("linkedWeight", selected.weight);
                        setSelectedQty(selected.qty);

                        const outOfStock = selected.qty <= 0;
                        setActiveLocked(outOfStock);

                        if (outOfStock) {
                          setValue("activeStatus", false);
                          setValue("availabilityStatus", "OUT_OF_STOCK");
                        } else {
                          setValue("availabilityStatus", "IN_STOCK");
                        }
                      } else {
                        setValue("linkedWeight", undefined);
                        setSelectedQty(null);
                        setActiveLocked(false);
                      }
                    }}
                  >
                    <MenuItem value="">Select Weight</MenuItem>
                    {stockWeights.map((option) => (
                      <MenuItem
                        key={option.stockProductId}
                        value={option.stockProductId}
                      >
                        {option.weight} g{" "}
                        {option.size ? `- ${option.size}` : ""} ({option.qty}{" "}
                        Qty)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Available Qty"
              fullWidth
              value={selectedQty ?? ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="linkedWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Linked Weight"
                  fullWidth
                  value={field.value ?? ""}
                  InputProps={{ readOnly: true }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="itemName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Product Name" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Slug" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="SKU" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="productCode"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Product Code" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="catalogue"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Catalogue" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="design"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Design" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="size"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Size" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="metal"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Metal" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="purity"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Purity" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Gender" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="occasion"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Occasion" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="styleType"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Style Type" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="collectionName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Collection Name" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Short Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="longDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Long Description"
                  fullWidth
                  multiline
                  rows={4}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="careInstructions"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Care Instructions"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="returnPolicy"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Return Policy"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="certificationDetails"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Certification Details" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              Weight & Charges
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="metalWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Metal Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="grossWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Gross Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="netWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Net Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="wastage"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Wastage"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="makingCharges"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Making Charges"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="stoneWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Stone Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="stoneRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Stone Rate"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="stoneAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Stone Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="waxWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Wax Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="waxRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Wax Rate"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="waxAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Wax Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="diamondWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Diamond Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="diamondRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Diamond Rate"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="diamondAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Diamond Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="bitsWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Bits Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="bitsRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Bits Rate"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="bitsAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Bits Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="enamelWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Enamel Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="enamelRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Enamel Rate"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="enamelAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Enamel Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="pearlsWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pearls Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="pearlsRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pearls Rate"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="pearlsAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pearls Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="otherWeight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Other Weight"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="otherRate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Other Rate"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="otherAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Other Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              Pricing & Stock
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="basePrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Base Price"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="salePrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sale Price"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="discountPercent"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Discount %"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="totalAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Total Amount"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="stockCount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Stock Count"
                  type="number"
                  fullWidth
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="minOrderQty"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Min Order Qty"
                  type="number"
                  fullWidth
                  value={field.value ?? 1}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 1 : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="maxOrderQty"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Max Order Qty"
                  type="number"
                  fullWidth
                  value={field.value ?? 5}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 5 : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="availabilityStatus"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Availability Status" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="sortOrder"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sort Order"
                  type="number"
                  fullWidth
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              Images
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="thumbnailImageUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Thumbnail URL"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            />

            <Box sx={{ mt: 1 }}>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                style={{ width: "100%", color: "#1976d2" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "thumbnailImageUrl", "thumb");
                }}
              />
            </Box>

            {uploadingThumb && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Uploading thumbnail...
              </Typography>
            )}

            {thumbnailPreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="hoverImageUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Hover Image URL"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            />

            <Box sx={{ mt: 1 }}>
              <input
                ref={hoverInputRef}
                type="file"
                accept="image/*"
                style={{ width: "100%", color: "#1976d2" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "hoverImageUrl", "hover");
                }}
              />
            </Box>

            {uploadingHover && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Uploading hover image...
              </Typography>
            )}

            {hoverPreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={hoverPreview}
                  alt="Hover"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
              Gallery Images
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            {!editingProduct?.productId ? (
              <Typography variant="body2" color="text.secondary">
                Save product first, then upload multiple gallery images.
              </Typography>
            ) : (
              <>
                <Box sx={{ mt: 1 }}>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ width: "100%", color: "#1976d2" }}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleGalleryUpload(files);
                      }
                    }}
                  />
                </Box>

                {uploadingGallery && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Uploading gallery images...
                  </Typography>
                )}

                {galleryImages.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {galleryImages.map((img) => (
                      <Box
                        key={img.imageId}
                        sx={{
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          p: 1,
                          textAlign: "center",
                        }}
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.altText || "Gallery"}
                          style={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />

                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          {img.imageType || "GALLERY"}
                        </Typography>

                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteGalleryImage(img.imageId)}
                          sx={{ mt: 1 }}
                        >
                          Delete
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              SEO
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="videoUrl"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Video URL" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="metaTitle"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Meta Title" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="metaDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Meta Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="metaKeywords"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Meta Keywords" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="tagsInput"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tags (comma separated)"
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="searchKeywordsInput"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Search Keywords (comma separated)"
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              Flags
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="activeStatus"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      disabled={activeLocked}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Active"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Featured"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="trending"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Trending"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="bestSeller"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Best Seller"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="newArrival"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="New Arrival"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="customizable"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Customizable"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="primaryDisplayProduct"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Primary Display Product"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button type="submit" variant="contained">
                {editingProduct ? "Update Product" : "Save Product"}
              </Button>

              {editingProduct && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    reset(defaultValues);
                    setThumbnailPreview("");
                    setHoverPreview("");

                    if (thumbInputRef.current) thumbInputRef.current.value = "";
                    if (hoverInputRef.current) hoverInputRef.current.value = "";

                    onCancelEdit?.();
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
