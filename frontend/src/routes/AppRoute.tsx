import { Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import DashboardPage from "@/pages/App/DashboardPage";
import TextToImagePage from "@/pages/App/Create/TextToImagePage";
import TextToVideoPage from "@/pages/App/Create/TextToVideoPage";
import ImageToVideoPage from "@/pages/App/Create/ImageToVideoPage";
import SceneEditorPage from "@/pages/App/Editor/SceneEditorPage";
import ProfilePage from "@/pages/App/ProfilePage";
import MarketingRoutes from "./MarketingRoute";

function AppRoutes() {
  return (
    <Routes>
      {MarketingRoutes()}

      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="create/text-to-image" element={<TextToImagePage />} />
        <Route path="create/text-to-video" element={<TextToVideoPage />} />
        <Route path="create/image-to-video" element={<ImageToVideoPage />} />
        <Route path="editor/:projectId" element={<SceneEditorPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<div className="text-foreground p-4">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;
