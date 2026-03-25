import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplets, Lock, Mail, User, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4 py-10">
            <div className="w-full max-w-md p-10 glass rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px]"></div>
                
                <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="bg-primary/20 p-4 rounded-2xl mb-4 shadow-lg">
                        <Droplets className="text-primary w-10 h-10 fill-primary/20" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create Identity</h2>
                    <p className="text-gray-400 mt-2 text-sm text-center">Join the ecosystem for automated resource control</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl mb-6 flex items-center gap-2 font-bold text-sm">
                        <ShieldCheck size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-surface/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-600"
                                placeholder="Your full name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Identity</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-surface/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-600"
                                placeholder="email@nexus.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Access Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surface/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-600"
                                placeholder="Minimum 6 characters"
                                required minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-primary/20 mt-4 active:scale-95"
                    >
                        Initialize Account
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10 pt-4 border-t border-white/5">
                    <p className="text-sm text-gray-400">
                        Already have access?{' '}
                        <Link to="/login" className="text-primary hover:text-blue-400 font-bold transition-colors">
                            Secure Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
