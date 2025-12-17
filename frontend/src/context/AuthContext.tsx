import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type LoginRequest, type RegisterRequest } from '@/services/auth.service';
import { TokenStorage } from '@/api/tokenStorage';
import type { User } from '@/types/user.types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedUser = TokenStorage.getUser();
                const accessToken = TokenStorage.getAccessToken();

                if (storedUser && accessToken) {
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                TokenStorage.clearTokens();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);
            const userData = {
                id: response.user.id,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                name: `${response.user.firstName} ${response.user.lastName}`,
                email: response.user.email,
                role: response.user.role,
            };
            setUser(userData);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            const userData = {
                id: response.user.id,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                name: `${response.user.firstName} ${response.user.lastName}`,
                email: response.user.email,
                role: response.user.role,
            };
            setUser(userData);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            setUser(null);
            TokenStorage.clearTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const isAuthenticated = !!user && !!TokenStorage.getAccessToken();

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
