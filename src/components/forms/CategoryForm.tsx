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
  createCategory,
  updateCategory,
  uploadFile,
} from "../../api/catalogApi";
import type { Category } from "../../types/catalog";

const defaultValues: Category = {
  metal: "GOLD",
  categoryName: "",
  slug: "",
  description: "",
  imageUrl: "",
  bannerImageUrl: "",
  mobileBannerImageUrl: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  sortOrder: 0,
  activeStatus: true,
  featured: false,
};

type Props = {
  onSuccess?: () => void;
  editingCategory?: Category | null;
  onCancelEdit?: () => void;
};

export default function CategoryForm({
  onSuccess,
  editingCategory,
  onCancelEdit,
}: Props) {
  const { control, handleSubmit, reset, setValue } = useForm<Category>({
    defaultValues,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingMobileBanner, setUploadingMobileBanner] = useState(false);

  const [imagePreview, setImagePreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [mobileBannerPreview, setMobileBannerPreview] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const mobileBannerInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (
    file: File,
    field: "imageUrl" | "bannerImageUrl" | "mobileBannerImageUrl",
    type: "image" | "banner" | "mobileBanner",
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

      const response = await uploadFile(file, "categories");

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
    }
  };

  const clearFileInputs = () => {
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (bannerInputRef.current) bannerInputRef.current.value = "";
    if (mobileBannerInputRef.current) mobileBannerInputRef.current.value = "";
  };

  const clearPreviews = () => {
    setImagePreview("");
    setBannerPreview("");
    setMobileBannerPreview("");
  };

  useEffect(() => {
    if (editingCategory) {
      reset({
        ...defaultValues,
        ...editingCategory,
      });

      setImagePreview(editingCategory.imageUrl || "");
      setBannerPreview(editingCategory.bannerImageUrl || "");
      setMobileBannerPreview(editingCategory.mobileBannerImageUrl || "");
    } else {
      reset(defaultValues);
      clearFileInputs();
      clearPreviews();
    }
  }, [editingCategory, reset]);

  const onSubmit = async (data: Category) => {
    try {
      if (editingCategory?.categoryId) {
        await updateCategory(editingCategory.categoryId, data);
        alert("Category updated successfully");
      } else {
        await createCategory(data);
        alert("Category created successfully");
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
        "Failed to save category";
      alert(message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        {editingCategory ? "Edit Category" : "Create Category"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="metal"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Metal</InputLabel>
                  <Select {...field} label="Metal">
                    <MenuItem value="GOLD">GOLD</MenuItem>
                    <MenuItem value="SILVER">SILVER</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="categoryName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Category Name" fullWidth />
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
                  alt="Category Preview"
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
                  alt="Banner Preview"
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
                  alt="Mobile Banner Preview"
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
              <Button type="submit" variant="contained" color="primary">
                {editingCategory ? "Update Category" : "Save Category"}
              </Button>

              {editingCategory && (
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
