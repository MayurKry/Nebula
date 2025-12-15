import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import DashboardPage from "@/pages/App/DashboardPage";
import TextToImagePage from "@/pages/App/Create/TextToImagePage";
import TextToVideoPage from "@/pages/App/Create/TextToVideoPage";
import ImageToVideoPage from "@/pages/App/Create/ImageToVideoPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="create/text-to-image" element={<TextToImagePage />} />
        <Route path="create/text-to-video" element={<TextToVideoPage />} />
        <Route path="create/image-to-video" element={<ImageToVideoPage />} />
        <Route index element={<Navigate to="/app/dashboard" replace />} />
      </Route>
      <Route path="*" element={<div className="text-white">404</div>} />
    </Routes>
  );
}

export default AppRoutes;
