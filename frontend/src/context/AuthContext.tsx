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
            const token = localStorage.getItem('token');
            const storedUsername = localStorage.getItem('username');

            if (token && validateTokenUtil(token)) {
                try {
                    // Verify token with backend
                    await axios.get('https://structures-production.up.railway.app/api/auth/debug', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setIsAuthenticated(true);
                    setUsername(storedUsername);
                } catch (error) {
                    console.error('Token validation failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setIsAuthenticated(false);
                    setUsername(null);
                }
            } else {
                // Clear invalid tokens
                if (token) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setIsAuthenticated(false);
                    setUsername(null);
                }
            }

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