import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
    id: number;
    username: string;
    full_name: string;
    role: 'admin' | 'staff';
    station_id: number | null;
    station_name: string | null;
    token: string;
}

interface AuthContextType {
    user: AuthUser | null;
    selectedStationId: number | null;
    setSelectedStation: (id: number | null) => void;
    login: (user: AuthUser) => void;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

    // Restore session from localStorage on app load
    useEffect(() => {
        const stored = localStorage.getItem('dmrc_user');
        if (stored) {
            try {
                const parsed: AuthUser = JSON.parse(stored);
                setUser(parsed);
                // Staff are locked to their station
                if (parsed.role === 'staff' && parsed.station_id) {
                    setSelectedStationId(parsed.station_id);
                }
            } catch {
                localStorage.removeItem('dmrc_user');
            }
        }
    }, []);

    const login = (userData: AuthUser) => {
        setUser(userData);
        localStorage.setItem('dmrc_user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        if (userData.role === 'staff' && userData.station_id) {
            setSelectedStationId(userData.station_id);
        }
    };

    const logout = () => {
        setUser(null);
        setSelectedStationId(null);
        localStorage.removeItem('dmrc_user');
        localStorage.removeItem('token');
    };

    const setSelectedStation = (id: number | null) => {
        // Only admins can change the station filter
        if (user?.role === 'admin') {
            setSelectedStationId(id);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            selectedStationId,
            setSelectedStation,
            login,
            logout,
            isAdmin: user?.role === 'admin',
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthContext;
