import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Train, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface Station { id: number; name: string; line: string; }

const Register = () => {
    const [form, setForm] = useState({ full_name: '', username: '', password: '', confirm_password: '', station_id: '' });
    const [stations, setStations] = useState<Station[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/stations').then(res => setStations(res.data || [])).catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (!form.station_id) { setError('Please select your assigned station.'); return; }
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', {
                username: form.username,
                password: form.password,
                full_name: form.full_name,
                station_id: parseInt(form.station_id),
            });
            login({ ...res.data.user, token: res.data.token });
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-dmrc-navy via-dmrc-cobalt to-blue-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                        <Train size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
                    <p className="text-blue-200 text-sm">Register as DMRC Housekeeping Staff</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                        All self-registered accounts are assigned the <span className="font-semibold text-amber-600">Staff</span> role.
                        Admin accounts are managed by the database administrator only.
                    </p>

                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { key: 'full_name', label: 'Full Name', placeholder: 'e.g. Rahul Sharma', type: 'text' },
                            { key: 'username', label: 'Username', placeholder: 'e.g. rahul_rjvk', type: 'text' },
                        ].map(({ key, label, placeholder, type }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                                <input type={type} value={form[key as keyof typeof form]} onChange={set(key as keyof typeof form)}
                                    placeholder={placeholder} required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt focus:border-transparent transition" />
                            </div>
                        ))}

                        {/* Station Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assigned Station</label>
                            <select value={form.station_id} onChange={set('station_id')} required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt focus:border-transparent transition">
                                <option value="">Select your station...</option>
                                {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.line})</option>)}
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                                    placeholder="Min. 6 characters" required
                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt focus:border-transparent transition" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                            <input type="password" value={form.confirm_password} onChange={set('confirm_password')}
                                placeholder="Re-enter password" required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt focus:border-transparent transition" />
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full bg-dmrc-navy hover:bg-dmrc-cobalt text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                            {isLoading ? (
                                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating account...</>
                            ) : 'Create Staff Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-dmrc-cobalt hover:underline font-semibold">Sign in</Link>
                    </p>
                </div>

                <p className="text-center text-blue-200/60 text-xs mt-6">
                    © {new Date().getFullYear()} Delhi Metro Rail Corporation · Housekeeping Division
                </p>
            </div>
        </div>
    );
};

export default Register;
