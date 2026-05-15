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
  createSubCategory,
  getCategories,
  updateSubCategory,
  uploadFile,
} from "../../api/catalogApi";
import type { Category, SubCategory } from "../../types/catalog";

type Props = {
  onSuccess?: () => void;
  editingSubCategory?: SubCategory | null;
  onCancelEdit?: () => void;
};

const defaultValues: SubCategory = {
  categoryId: undefined,
  subCategoryName: "",
  slug: "",
  description: "",
  imageUrl: "",
  bannerImageUrl: "",
  mobileBannerImageUrl: "",
  iconImageUrl: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  sortOrder: 0,
  activeStatus: true,
  featured: false,
};

export default function SubCategoryForm({
  onSuccess,
  editingSubCategory,
  onCancelEdit,
}: Props) {
  const { control, handleSubmit, reset, setValue } = useForm<SubCategory>({
    defaultValues,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingMobileBanner, setUploadingMobileBanner] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const [imagePreview, setImagePreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [mobileBannerPreview, setMobileBannerPreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const mobileBannerInputRef = useRef<HTMLInputElement | null>(null);
  const iconInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingSubCategory) {
      reset({
        ...defaultValues,
        ...editingSubCategory,
        categoryId:
          editingSubCategory.category?.categoryId ||
          editingSubCategory.categoryId,
      });

      setImagePreview(editingSubCategory.imageUrl || "");
      setBannerPreview(editingSubCategory.bannerImageUrl || "");
      setMobileBannerPreview(editingSubCategory.mobileBannerImageUrl || "");
      setIconPreview(editingSubCategory.iconImageUrl || "");
    } else {
      reset(defaultValues);
      clearFileInputs();
      clearPreviews();
    }
  }, [editingSubCategory, reset]);

  const handleUpload = async (
    file: File,
    field:
      | "imageUrl"
      | "bannerImageUrl"
      | "mobileBannerImageUrl"
      | "iconImageUrl",
    type: "image" | "banner" | "mobileBanner" | "icon",
  ) => {
    try {
      const localPreviewUrl = URL.createObjectURL(file);

      if (type === "image") {
        setUploadingImage(true);
        setImagePreview(localPreviewUrl);
      }

      if (type === "banner") {
        setUploadingBanner(true);
        setBannerPreview(localPreviewUrl);
      }

      if (type === "mobileBanner") {
        setUploadingMobileBanner(true);
        setMobileBannerPreview(localPreviewUrl);
      }

      if (type === "icon") {
        setUploadingIcon(true);
        setIconPreview(localPreviewUrl);
      }

      const response = await uploadFile(file, "subcategories");

      setValue(field, response.fileUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    } finally {
      if (type === "image") setUploadingImage(false);
      if (type === "banner") setUploadingBanner(false);
      if (type === "mobileBanner") setUploadingMobileBanner(false);
      if (type === "icon") setUploadingIcon(false);
    }
  };

  const clearFileInputs = () => {
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (bannerInputRef.current) bannerInputRef.current.value = "";
    if (mobileBannerInputRef.current) mobileBannerInputRef.current.value = "";
    if (iconInputRef.current) iconInputRef.current.value = "";
  };

  const clearPreviews = () => {
    setImagePreview("");
    setBannerPreview("");
    setMobileBannerPreview("");
    setIconPreview("");
  };

  const onSubmit = async (data: SubCategory) => {
    try {
      if (!data.categoryId) {
        alert("Please select a category");
        return;
      }

      const payload: SubCategory = {
        ...data,
        category: { categoryId: data.categoryId },
      };

      if (editingSubCategory?.subCategoryId) {
        await updateSubCategory(editingSubCategory.subCategoryId, payload);
        alert("Sub category updated successfully");
      } else {
        await createSubCategory(data.categoryId, payload);
        alert("Sub category created successfully");
      }

      reset(defaultValues);
      clearFileInputs();
      clearPreviews();
      onSuccess?.();
      onCancelEdit?.();
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save sub category";
      alert(message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        {editingSubCategory ? "Edit Sub Category" : "Create Sub Category"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    {...field}
                    label="Category"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value as string | number;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="subCategoryName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Sub Category Name" fullWidth />
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
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                />
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

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Image URL"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            />
            <Box sx={{ mt: 1 }}>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                style={{ width: "100%", color: "#1976d2" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "imageUrl", "image");
                }}
              />
            </Box>
            {uploadingImage && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Uploading image...
              </Typography>
            )}
            {imagePreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={imagePreview}
                  alt="SubCategory"
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

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="bannerImageUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Banner Image URL"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            />
            <Box sx={{ mt: 1 }}>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                style={{ width: "100%", color: "#1976d2" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "bannerImageUrl", "banner");
                }}
              />
            </Box>
            {uploadingBanner && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Uploading banner...
              </Typography>
            )}
            {bannerPreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={bannerPreview}
                  alt="Banner"
                  style={{
                    width: "100%",
                    maxWidth: 220,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="mobileBannerImageUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mobile Banner URL"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            />
            <Box sx={{ mt: 1 }}>
              <input
                ref={mobileBannerInputRef}
                type="file"
                accept="image/*"
                style={{ width: "100%", color: "#1976d2" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUpload(file, "mobileBannerImageUrl", "mobileBanner");
                  }
                }}
              />
            </Box>
            {uploadingMobileBanner && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Uploading mobile banner...
              </Typography>
            )}
            {mobileBannerPreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={mobileBannerPreview}
                  alt="Mobile Banner"
                  style={{
                    width: 90,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="iconImageUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Icon Image URL"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            />
            <Box sx={{ mt: 1 }}>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                style={{ width: "100%", color: "#1976d2" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, "iconImageUrl", "icon");
                }}
              />
            </Box>
            {uploadingIcon && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Uploading icon...
              </Typography>
            )}
            {iconPreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={iconPreview}
                  alt="Icon"
                  style={{
                    width: 90,
                    height: 90,
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
              name="activeStatus"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Active"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button type="submit" variant="contained">
                {editingSubCategory
                  ? "Update Sub Category"
                  : "Save Sub Category"}
              </Button>

              {editingSubCategory && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    reset(defaultValues);
                    clearFileInputs();
                    clearPreviews();
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
