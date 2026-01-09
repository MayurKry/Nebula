import { Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import DashboardPage from "@/pages/App/DashboardPage";
import TextToImagePage from "@/pages/App/Create/TextToImagePage";
import TextToVideoPage from "@/pages/App/Create/TextToVideoPage";
import TextToAudioPage from "@/pages/App/Create/TextToAudioPage";
import ImageToVideoPage from "@/pages/App/Create/ImageToVideoPage";
import AIVoicesPage from "@/pages/App/Create/AIVoicesPage";

import ProfilePage from "@/pages/App/ProfilePage";
import CampaignWizardPage from "@/pages/App/CampaignWizardPage";
import JobHistoryPage from "@/pages/App/JobHistoryPage";
import SettingsPage from "@/pages/App/SettingsPage";
import ActivityLogPage from "@/pages/App/ActivityLogPage";
import LibraryPage from "@/pages/App/LibraryPage";
import PaymentPage from "@/pages/App/PaymentPage";
import NotFoundPage from "@/pages/Shared/NotFoundPage";
import MarketingRoutes from "./MarketingRoute";
import PublicRoutes from "./PublicRoute";

function AppRoutes() {
  return (
    <Routes>
      {MarketingRoutes()}
      {PublicRoutes()}

      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="create/text-to-image" element={<TextToImagePage />} />
        <Route path="create/text-to-video" element={<TextToVideoPage />} />
        <Route path="create/text-to-audio" element={<TextToAudioPage />} />
        <Route path="create/image-to-video" element={<ImageToVideoPage />} />
        <Route path="create/ai-voices" element={<AIVoicesPage />} />
        <Route path="editor/:projectId" element={<TextToVideoPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="campaign" element={<CampaignWizardPage />} />
        <Route path="history" element={<JobHistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="activity" element={<ActivityLogPage />} />
      </Route>


      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
