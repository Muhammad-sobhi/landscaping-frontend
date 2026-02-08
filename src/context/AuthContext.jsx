import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        // This will help us identify if multiple providers exist
        console.log("AUTH_PROVIDER_INSTANTIATED_ID:", Math.random().toString(36).substr(2, 9));
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false); // This re-renders the App and hides the Sidebar
    // No window.location.replace needed if App.jsx handles the redirect
};

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth hook used outside of AuthProvider");
    }
    return context;
};