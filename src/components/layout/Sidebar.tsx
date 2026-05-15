import { LayoutDashboard, Folder, Package, Layers } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-black text-white min-h-screen p-6">
      <h1 className="text-xl font-bold mb-10">Hambire Admin</h1>

      <nav className="flex flex-col gap-4 text-sm">
        <Link to="/" className="flex items-center gap-2 hover:text-yellow-400">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to="/categories"
          className="flex items-center gap-2 hover:text-yellow-400"
        >
          <Folder size={18} />
          Categories
        </Link>

        <Link
          to="/subcategories"
          className="flex items-center gap-2 hover:text-yellow-400"
        >
          <Layers size={18} />
          Sub Categories
        </Link>

        <Link
          to="/products"
          className="flex items-center gap-2 hover:text-yellow-400"
        >
          <Package size={18} />
          Products
        </Link>
      </nav>
    </aside>
  );
}
