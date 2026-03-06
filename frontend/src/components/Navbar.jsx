import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplet, LogOut, BarChart2, LayoutDashboard, User, Menu } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white group">
                        <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
                            <Droplet className="text-accent" size={24} />
                        </div>
                        HydroGuard
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link to="/dashboard" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                                <LayoutDashboard size={18} /> <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            <Link to="/analytics" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                                <BarChart2 size={18} /> <span className="hidden sm:inline">Analytics</span>
                            </Link>
                            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                            <div className="flex items-center gap-4 relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 bg-surface/50 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all text-gray-300 hover:text-white px-2 py-1.5 rounded-full"
                                >
                                    <Menu size={20} className="ml-1" />
                                    <div className="bg-primary flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm shadow-inner shadow-black/20">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsDropdownOpen(false)}
                                        ></div>
                                        <div className="absolute top-full right-0 mt-3 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 z-50 transform origin-top-right transition-all">
                                            <div className="px-4 py-3 border-b border-white/10 mb-2">
                                                <p className="text-sm text-white font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    setIsProfileModalOpen(true);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                                            >
                                                <User size={16} className="text-primary" /> Edit Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                            >
                                                <LogOut size={16} className="text-red-500" /> Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/" className="px-5 py-2 text-gray-300 hover:text-white font-medium transition-colors">Home</Link>
                            <Link to="/login" className="px-5 py-2 text-gray-300 hover:text-white font-medium transition-colors">Login</Link>
                            <Link to="/register" className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/20 transition-all">Sign Up</Link>
                        </div>
                    )}
                </div>
            </nav>
            {isProfileModalOpen && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />}
        </>
    );
};

export default Navbar;
