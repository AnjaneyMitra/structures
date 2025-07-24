import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { validateToken as validateTokenUtil, getCurrentUsername } from '../utils/authUtils';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    username: string | null;
    login: (token: string, username: string) => void;
    logout: () => void;
    validateToken: (token: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Check if there's a token in localStorage
    const hasToken = !!localStorage.getItem('token');
    
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasToken);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string | null>(getCurrentUsername());

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            console.log('AuthContext: Starting authentication check');
            
            // First check if there are OAuth callback parameters in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const oauthToken = urlParams.get('access_token');
            const oauthUsername = urlParams.get('username');
            
            console.log('AuthContext: OAuth params found:', { 
                hasToken: !!oauthToken, 
                hasUsername: !!oauthUsername 
            });
            
            // If OAuth parameters exist, use them immediately
            if (oauthToken && oauthUsername) {
                console.log('AuthContext: Processing OAuth callback');
                try {
                    // Verify the OAuth token with backend
                    const response = await axios.get('https://structures-production.up.railway.app/api/auth/debug', {
                        headers: { Authorization: `Bearer ${oauthToken}` }
                    });
                    
                    console.log('AuthContext: OAuth token validation successful', response.data);

                    // Store the token and set authentication state
                    localStorage.setItem('token', oauthToken);
                    localStorage.setItem('username', oauthUsername);
                    setIsAuthenticated(true);
                    setUsername(oauthUsername);
                    setIsLoading(false);
                    return;
                } catch (error) {
                    console.error('AuthContext: OAuth token validation failed:', error);
                    // Continue to check localStorage token
                }
            }

            // Check existing token in localStorage
            const token = localStorage.getItem('token');
            const storedUsername = localStorage.getItem('username');
            
            console.log('AuthContext: Checking localStorage token:', { 
                hasToken: !!token, 
                hasUsername: !!storedUsername 
            });

            if (token && validateTokenUtil(token)) {
                try {
                    // Verify token with backend
                    const response = await axios.get('https://structures-production.up.railway.app/api/auth/debug', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    console.log('AuthContext: Token validation successful', response.data);
                    setIsAuthenticated(true);
                    setUsername(storedUsername);
                } catch (error) {
                    console.error('AuthContext: Token validation failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setIsAuthenticated(false);
                    setUsername(null);
                }
            } else {
                console.log('AuthContext: No valid token found');
                // Clear invalid tokens
                if (token) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setIsAuthenticated(false);
                    setUsername(null);
                }
            }

            console.log('AuthContext: Authentication check complete');
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (token: string, username: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        setIsAuthenticated(true);
        setUsername(username);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            username,
            login,
            logout,
            validateToken: validateTokenUtil
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};