import { Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { Cursos } from "../pages/Home";
import { CourseDetails } from "../pages/CourseDetails";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Trilhas } from "../pages/Trilhas";
import { MyProgress } from "../pages/MyProgress";
import { Checkout } from "../pages/Checkout";
import { ManageCategories } from "../pages/admin/ManageCategories";
import { ManageCourses } from "../pages/admin/ManageCourses";
import { ManageModulesAndClasses } from "../pages/admin/ManageModulesAndClasses";
import { ManageTrails } from "../pages/admin/ManageTrails";
import { ManageSubscriptions } from "../pages/admin/ManageSubscriptions";
import { AdminRoute } from "../components/guards/AdminRoute";
import { TrilhaDetails } from "../pages/TrilhaDetails";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cursos" element={<Cursos />} />
      <Route path="/curso/:id" element={<CourseDetails />} />
      <Route path="/trilhas" element={<Trilhas />} />
      <Route path="/trilha/:id" element={<TrilhaDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<MyProgress />} />
      <Route path="/checkout" element={<Checkout />} />
      
      {/* Admin Routes — protegidas pelo AdminRoute */}
      <Route path="/admin/categorias" element={<AdminRoute><ManageCategories /></AdminRoute>} />
      <Route path="/admin/cursos" element={<AdminRoute><ManageCourses /></AdminRoute>} />
      <Route path="/admin/cursos/:id/modulos" element={<AdminRoute><ManageModulesAndClasses /></AdminRoute>} />
      <Route path="/admin/trilhas" element={<AdminRoute><ManageTrails /></AdminRoute>} />
      <Route path="/admin/assinaturas" element={<AdminRoute><ManageSubscriptions /></AdminRoute>} />
    </Routes>
  );
};
