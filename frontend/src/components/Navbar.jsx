import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplet, LogOut, BarChart2, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
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
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 hidden md:inline">Welcome, <span className="text-white font-medium">{user.name}</span></span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-4 py-2 rounded-lg transition-colors font-medium border border-red-500/10"
                            >
                                <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                            </button>
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
    );
};

export default Navbar;
