import { Route } from 'react-router-dom';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import SuperAdminDashboard from '@/pages/SuperAdmin/SuperAdminDashboard';
import TenantListPage from '@/pages/SuperAdmin/TenantListPage';
import TenantDetailPage from '@/pages/SuperAdmin/TenantDetailPage';
import FeatureManagementPage from '@/pages/SuperAdmin/FeatureManagementPage';
import FinancialsPage from '@/pages/SuperAdmin/FinancialsPage';

// Observability Pages
import AnalyticsPage from '@/pages/SuperAdmin/Observability/AnalyticsPage';
import LogsPage from '@/pages/SuperAdmin/Observability/LogsPage';
import ErrorsPage from '@/pages/SuperAdmin/Observability/ErrorsPage';
import CampaignsPage from '@/pages/SuperAdmin/Observability/CampaignsPage';
import SupportPage from '@/pages/SuperAdmin/Observability/SupportPage';
import ProfilePage from '@/pages/SuperAdmin/ProfilePage';

const SuperAdminRoutes = () => (
    <Route element={<SuperAdminLayout />}>
        <Route path='/admin/dashboard' element={<SuperAdminDashboard />} />
        <Route path='/admin/profile' element={<ProfilePage />} />
        <Route path='/admin/tenants' element={<TenantListPage />} />
        <Route path='/admin/tenants/:id' element={<TenantDetailPage />} />
        <Route path='/admin/features' element={<FeatureManagementPage />} />
        <Route path='/admin/financials' element={<FinancialsPage />} />

        {/* Observability */}
        <Route path='/admin/observability/analytics' element={<AnalyticsPage />} />
        <Route path='/admin/observability/logs' element={<LogsPage />} />
        <Route path='/admin/observability/errors' element={<ErrorsPage />} />
        <Route path='/admin/observability/campaigns' element={<CampaignsPage />} />
        <Route path='/admin/observability/support' element={<SupportPage />} />
    </Route>
);

export default SuperAdminRoutes;