import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Protected Route wrapper — redirects to /login if no authenticated user
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

function AppRoutes() {
    const [darkMode, setDarkMode] = useState(() => {
        if (localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return true;
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(prev => !prev);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<div className="p-8"><h1 className="text-2xl font-bold dark:text-white">Tasks</h1></div>} />
                <Route path="calendar" element={<div className="p-8"><h1 className="text-2xl font-bold dark:text-white">Calendar</h1></div>} />
                <Route path="analytics" element={<div className="p-8"><h1 className="text-2xl font-bold dark:text-white">Analytics</h1></div>} />
                <Route path="team" element={<div className="p-8"><h1 className="text-2xl font-bold dark:text-white">Team Deployment</h1></div>} />
            </Route>
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
