import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import {
  createBanner,
  deleteBanner,
  getBanners,
  uploadFile,
  type Banner,
} from "../api/catalogApi";

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Banner>({
    title: "",
    subTitle: "",
    mediaUrl: "",
    mediaType: "IMAGE",
    sortOrder: 0,
    activeStatus: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const data = await getBanners();
    setBanners(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const folder = file.type.includes("video")
        ? "banner-videos"
        : "banner-images";

      const response = await uploadFile(file, folder);

      console.log("UPLOAD RESPONSE:", response);

      setFormData((prev) => ({
        ...prev,
        mediaUrl: response.fileUrl,
        mediaType: file.type.includes("video") ? "VIDEO" : "IMAGE",
      }));
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await createBanner(formData);
      alert("Banner Added Successfully");

      setFormData({
        title: "",
        subTitle: "",
        mediaUrl: "",
        mediaType: "IMAGE",
        sortOrder: 0,
        activeStatus: true,
      });

      fetchBanners();
    } catch (error) {
      console.error(error);
      alert("Save failed");
    }
  };

  const handleDelete = async (bannerId?: number) => {
    if (!bannerId) return;
    if (!window.confirm("Delete this banner?")) return;

    await deleteBanner(bannerId);
    fetchBanners();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="mb-6 text-3xl font-bold">Banner Management</h1>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="grid grid-cols-2 gap-5">
            <input
              placeholder="Banner Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="rounded-lg border p-3"
            />

            <input
              placeholder="Sub Title"
              value={formData.subTitle}
              onChange={(e) =>
                setFormData({ ...formData, subTitle: e.target.value })
              }
              className="rounded-lg border p-3"
            />

            <select
              value={formData.mediaType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mediaType: e.target.value as "IMAGE" | "VIDEO",
                })
              }
              className="rounded-lg border p-3"
            >
              <option value="IMAGE">IMAGE</option>
              <option value="VIDEO">VIDEO</option>
            </select>

            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: Number(e.target.value),
                })
              }
              className="rounded-lg border p-3"
            />

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleUpload}
              className="col-span-2 rounded-lg border p-3"
            />

            {uploading && <p className="text-orange-500">Uploading...</p>}

            {formData.mediaUrl && (
              <div className="col-span-2">
                {formData.mediaType === "VIDEO" ? (
                  <video src={formData.mediaUrl} controls className="h-52" />
                ) : (
                  <img src={formData.mediaUrl} className="h-52 rounded-xl" />
                )}
              </div>
            )}

            <label className="col-span-2 flex gap-3">
              <input
                type="checkbox"
                checked={formData.activeStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activeStatus: e.target.checked,
                  })
                }
              />
              Active Banner
            </label>

            <button
              onClick={handleSave}
              className="rounded-xl bg-black px-8 py-3 font-semibold text-white"
            >
              Save Banner
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.bannerId} className="rounded-xl border bg-white p-4">
              {banner.mediaType === "VIDEO" ? (
                <video src={banner.mediaUrl} controls className="h-48 w-full" />
              ) : (
                <img
                  src={banner.mediaUrl}
                  className="h-48 w-full rounded-lg object-cover"
                />
              )}

              <h3 className="mt-3 font-bold">{banner.title}</h3>
              <p>{banner.subTitle}</p>

              <button
                onClick={() => handleDelete(banner.bannerId)}
                className="mt-3 rounded bg-red-500 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}