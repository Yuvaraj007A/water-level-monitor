import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplets, LogOut, BarChart2, LayoutDashboard, User, Menu, ShieldCheck } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'Admin';
    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-white/5 px-6 py-4 mb-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 text-2xl font-black tracking-tight text-white group">
                        <div className="bg-primary/20 p-2.5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                            <Droplets className="text-primary fill-primary/20" size={28} />
                        </div>
                        HydroGuard
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-2 md:gap-8">
                            <div className="hidden lg:flex items-center gap-6">
                                {isAdmin ? (
                                    <Link 
                                        to="/admin" 
                                        className={`flex items-center gap-2 font-bold transition-all px-4 py-2 rounded-xl ${isActive('/admin') ? 'bg-primary/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <ShieldCheck size={20} /> Admin Control
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            to="/dashboard" 
                                            className={`flex items-center gap-2 font-bold transition-all px-4 py-2 rounded-xl ${isActive('/dashboard') ? 'bg-primary/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <LayoutDashboard size={20} /> Dashboard
                                        </Link>
                                        <Link 
                                            to="/analytics" 
                                            className={`flex items-center gap-2 font-bold transition-all px-4 py-2 rounded-xl ${isActive('/analytics') ? 'bg-primary/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <BarChart2 size={20} /> Analytics
                                        </Link>
                                    </>
                                )}
                            </div>
                            
                            <div className="h-8 w-px bg-white/10 hidden lg:block"></div>
                            
                            <div className="flex items-center gap-4 relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 bg-surface/80 border border-white/10 hover:border-white/20 hover:bg-surface transition-all text-white px-2 py-1.5 rounded-full pr-4"
                                >
                                    <div className="bg-primary flex items-center justify-center w-9 h-9 rounded-full text-white font-black text-sm shadow-xl shadow-primary/30">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-xs font-black text-white leading-none">{user.name}</p>
                                        <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{user.role}</p>
                                    </div>
                                    <Menu size={16} className="text-gray-400" />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-3 w-64 bg-surface/95 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-xl overflow-hidden py-3 z-50 transform origin-top-right transition-all">
                                            <div className="px-5 py-4 border-b border-white/5 mb-2">
                                                <p className="text-sm font-black text-white truncate">{user.name}</p>
                                                <p className="text-xs font-bold text-gray-500 truncate mt-1">{user.email}</p>
                                            </div>
                                            
                                            <div className="lg:hidden">
                                                {isAdmin ? (
                                                    <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all">
                                                        <ShieldCheck size={18} /> Admin Control
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all">
                                                            <LayoutDashboard size={18} /> Dashboard
                                                        </Link>
                                                        <Link to="/analytics" onClick={() => setIsDropdownOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all">
                                                            <BarChart2 size={18} /> Analytics
                                                        </Link>
                                                    </>
                                                )}
                                                <div className="h-px bg-white/5 my-2"></div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    setIsProfileModalOpen(true);
                                                }}
                                                className="w-full text-left px-5 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all"
                                            >
                                                <User size={18} className="text-primary" /> Edit Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-5 py-3 text-sm font-bold text-red-400 hover:bg-red-400/10 flex items-center gap-3 transition-all"
                                            >
                                                <LogOut size={18} /> Physical Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="px-6 py-2.5 text-gray-400 hover:text-white font-bold transition-all text-sm">Sign In</Link>
                            <Link to="/register" className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-600 font-black shadow-xl shadow-primary/20 transition-all text-sm">Register</Link>
                        </div>
                    )}
                </div>
            </nav>
            {isProfileModalOpen && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />}
        </>
    );
};

export default Navbar;
