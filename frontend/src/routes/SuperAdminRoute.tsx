import { Route } from 'react-router-dom';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import SuperAdminDashboard from '@/pages/SuperAdmin/SuperAdminDashboard';
import TenantListPage from '@/pages/SuperAdmin/TenantListPage';
import TenantDetailPage from '@/pages/SuperAdmin/TenantDetailPage';
import FeatureManagementPage from '@/pages/SuperAdmin/FeatureManagementPage';
import FinancialsPage from '@/pages/SuperAdmin/FinancialsPage';

const SuperAdminRoutes = () => (
    <Route element={<SuperAdminLayout />}>
        <Route path='/admin/dashboard' element={<SuperAdminDashboard />} />
        <Route path='/admin/tenants' element={<TenantListPage />} />
        <Route path='/admin/tenants/:id' element={<TenantDetailPage />} />
        <Route path='/admin/features' element={<FeatureManagementPage />} />
        <Route path='/admin/financials' element={<FinancialsPage />} />
    </Route>
);

export default SuperAdminRoutes;