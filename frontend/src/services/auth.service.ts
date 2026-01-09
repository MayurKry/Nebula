import axiosInstance from "@/api/axiosInstance";
import { TokenStorage } from "@/api/tokenStorage";

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        credits: number;
    };
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: AuthResponse;
        }>('/auth/register', data);

        const { user, accessToken, refreshToken } = response.data.data;

        // Store tokens and user data
        TokenStorage.setAccessToken(accessToken);
        TokenStorage.setRefreshToken(refreshToken);
        TokenStorage.setUser({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            credits: user.credits,
        });

        return response.data.data;
    }

    /**
     * Login user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: AuthResponse;
        }>('/auth/login', data);

        const { user, accessToken, refreshToken } = response.data.data;

        // Store tokens and user data
        TokenStorage.setAccessToken(accessToken);
        TokenStorage.setRefreshToken(refreshToken);
        TokenStorage.setUser({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            credits: user.credits,
        });

        return response.data.data;
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        const refreshToken = TokenStorage.getRefreshToken();

        if (refreshToken) {
            try {
                await axiosInstance.post('/auth/logout', { refreshToken });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear all stored tokens and user data
        TokenStorage.clearTokens();
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<RefreshTokenResponse> {
        const refreshToken = TokenStorage.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: RefreshTokenResponse;
        }>('/auth/refresh', { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update stored tokens
        TokenStorage.setAccessToken(accessToken);
        TokenStorage.setRefreshToken(newRefreshToken);

        return response.data.data;
    }

    /**
     * Get current user from storage
     */
    getCurrentUser() {
        return TokenStorage.getUser();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const accessToken = TokenStorage.getAccessToken();
        const user = TokenStorage.getUser();
        return !!(accessToken && user);
    }
}

export const authService = new AuthService();
export default authService;
