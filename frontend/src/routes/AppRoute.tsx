import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoute";
import { useEffect, useState } from "react";
import SuperAdminRoutes from "./SuperAdminRoute";
import UserRoutes from "./UserRoute";
import { useAppSelector } from "@/slice/hook";

// Marketing pages
import MarketingLayout from "@/layouts/MarketingLayout";
import Home from "@/pages/Marketing/Home";
import Products from "@/pages/Marketing/Products";
import UseCases from "@/pages/Marketing/UseCases";
import Models from "@/pages/Marketing/Models";
import Resources from "@/pages/Marketing/Resources";
import Pricing from "@/pages/Marketing/Pricing";
import Research from "@/pages/Marketing/Research";
import Company from "@/pages/Marketing/Company";
import Contact from "@/pages/Marketing/Contact";

// App pages (MVP-1)
import DashboardPage from "@/pages/App/DashboardPage";
import AssetLibraryPage from "@/pages/App/AssetLibraryPage";

// Creation Layer (MVP-2)
import TextToImagePage from "@/pages/App/Create/TextToImagePage";
import TextToVideoPage from "@/pages/App/Create/TextToVideoPage";
import ImageToVideoPage from "@/pages/App/Create/ImageToVideoPage";

import { GenerationProvider } from "@/components/generation/GenerationContext";

function AppRoutes() {
  const user = useAppSelector((state) => state.auth.user);
  const [navigateRoute, setNavigateRoute] = useState("/login");

  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "superAdmin":
        setNavigateRoute("/superAdminDashboard");
        break;
      case "user":
        setNavigateRoute("/userDashboard");
        break;
      default:
        setNavigateRoute("/login");
    }
  }, [user]);

  const renderRoleRoutes = () => {
    if (!user) return null;

    switch (user.role) {
      case "superAdmin":
        return SuperAdminRoutes();
      case "user":
        return UserRoutes();
      default:
        return null;
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <GenerationProvider>
      <Routes>
        {/* Marketing Routes - Always accessible */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/models" element={<Models />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/research" element={<Research />} />
          <Route path="/company" element={<Company />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* App Routes - MVP-1 (accessible for demo) */}
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/assets" element={<AssetLibraryPage />} />

        {/* Creation Layer - MVP-2 */}
        <Route path="/app/create/text-to-image" element={<TextToImagePage />} />
        <Route path="/app/create/text-to-video" element={<TextToVideoPage />} />
        <Route path="/app/create/image-to-video" element={<ImageToVideoPage />} />

        {/* Auth Routes - Always accessible */}
        {PublicRoutes()}

        {/* Auth & Dashboard Routes */}
        {isAuthenticated ? (
          <>
            {renderRoleRoutes()}
            {/* Redirect dashboard paths to correct dashboard */}
            <Route path="/dashboard" element={<Navigate to={navigateRoute} replace />} />
          </>
        ) : null}
      </Routes>
    </GenerationProvider>
  );
}

export default AppRoutes;



