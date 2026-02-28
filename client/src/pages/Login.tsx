import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Train, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password.');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { username, password });
            login({
                ...res.data.user,
                token: res.data.token,
            });
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Login failed. Check your credentials.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dmrc-navy via-dmrc-cobalt to-blue-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
            <div className="w-full max-w-md">

                {/* Logo / Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                        <Train size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">DMRC Housekeeping</h1>
                    <p className="text-blue-200 text-sm">Operations Management System</p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">Sign In</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Use your DMRC credentials to access the portal.</p>

                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt focus:border-transparent transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-dmrc-navy hover:bg-dmrc-cobalt text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Hint for dev */}
                    <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Demo Credentials</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">Admin: <span className="font-mono">admin / admin123</span></p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">Staff: <span className="font-mono">staff_rajiv_chowk / staff123</span></p>
                    </div>

                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
                        New staff member?{' '}
                        <Link to="/register" className="text-dmrc-cobalt hover:underline font-semibold">Create an account →</Link>
                    </p>
                </div>

                <p className="text-center text-blue-200/60 text-xs mt-6">
                    © {new Date().getFullYear()} Delhi Metro Rail Corporation · Housekeeping Division
                </p>
            </div>
        </div>
    );
};

export default Login;
