import AdminLayout from "../components/layout/AdminLayout";

export default function Dashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Total Categories</h2>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Total Products</h2>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-sm text-gray-500">Active Products</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </AdminLayout>
  );
}
