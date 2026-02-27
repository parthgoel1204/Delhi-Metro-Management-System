import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ darkMode, toggleDarkMode }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-200">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 relative rounded-tl-3xl shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.05)] dark:bg-slate-800/50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
