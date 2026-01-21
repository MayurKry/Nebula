import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Component that redirects super admins to the admin panel
 * Place this in your login success flow or as a route guard
 */
export const SuperAdminRedirect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'super_admin') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, navigate]);

    return null;
};
