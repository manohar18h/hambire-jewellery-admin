import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CategoriesPage from "./pages/CategoriesPage";
import SubCategoriesPage from "./pages/SubCategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import BannersPage from "./pages/BannersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/subcategories" element={<SubCategoriesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/banners" element={<BannersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
