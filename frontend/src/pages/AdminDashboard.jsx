import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, 
    Droplets, 
    Zap, 
    Search, 
    Trash2, 
    User as UserIcon, 
    ShieldCheck, 
    Activity,
    UsersRound,
    AlertCircle,
    ServerCrash
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTanks: 0,
        activeMotors: 0
    });
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAdminData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setUsersData(usersRes.data);
        } catch (err) {
            console.error('Administrative access error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('CRITICAL ACTION: Are you sure you want to terminate this user node and all associated telemetry data?')) {
            try {
                await api.delete(`/admin/user/${userId}`);
                fetchAdminData();
            } catch (err) {
                alert('Privilege violation: Failed to terminate node.');
            }
        }
    };

    const filteredUsers = usersData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingScreen />;

    return (
        <div className="space-y-12 pb-20">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-accent font-black uppercase tracking-[0.2em] text-xs mb-3 flex items-center gap-2">
                        <ShieldCheck size={14} /> Root System Oversight
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">System Statistics</h1>
                    <p className="text-gray-500 mt-3 font-medium text-lg">Centralized telemetry and node management hub.</p>
                </div>
                
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Filter User Nodes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-bold placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass group hover:border-primary/50 transition-all rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all"></div>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-4 bg-primary/20 rounded-3xl text-primary shadow-inner">
                            <UsersRound size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">User Nodes</p>
                            <h3 className="text-5xl font-black text-white mt-1">{stats.totalUsers}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass group hover:border-accent/50 transition-all rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-all"></div>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-4 bg-accent/20 rounded-3xl text-accent shadow-inner">
                            <Droplets size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Total Tanks</p>
                            <h3 className="text-5xl font-black text-white mt-1">{stats.totalTanks}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass group hover:border-green-500/50 transition-all rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/10 rounded-full blur-[80px] group-hover:bg-green-500/20 transition-all"></div>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-4 bg-green-500/20 rounded-3xl text-green-500 shadow-inner">
                            <Zap size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Active Flows</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-5xl font-black text-white">{stats.activeMotors}</h3>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Node Management Table */}
            <div className="glass rounded-[3rem] overflow-hidden">
                <div className="px-10 py-8 border-b border-white/5 bg-white/2 space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">Active Nodes</h3>
                    <p className="text-gray-500 font-medium">Real-time telemetry from distributed user access points.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface/30">
                            <tr>
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Operator Node</th>
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Infrastructure</th>
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Telemetry</th>
                                <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Access Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-bold">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-white/5 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                                <UserIcon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-white text-lg font-black">{user.name}</p>
                                                <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="px-4 py-2 bg-surface/50 border border-white/5 rounded-xl text-primary flex items-center gap-2">
                                                <Droplets size={16} /> <span className="text-white">{user.tanks?.length || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            {user.tanks?.length > 0 ? (
                                                <div className="space-y-2">
                                                    {user.tanks.slice(0, 2).map(tank => (
                                                        <div key={tank._id} className="flex items-center gap-3 text-xs">
                                                            <div className="w-20 h-2 bg-surface/80 rounded-full overflow-hidden border border-white/5">
                                                                <div 
                                                                    className="h-full bg-primary" 
                                                                    style={{ width: `${tank.currentLevel}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-gray-400">{tank.currentLevel}%</span>
                                                        </div>
                                                    ))}
                                                    {user.tanks.length > 2 && (
                                                        <p className="text-[10px] text-gray-600">+{user.tanks.length - 2} more units</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 italic text-sm">Offline</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button 
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/40 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="px-10 py-32 text-center">
                        <ServerCrash className="mx-auto text-gray-700 mb-6" size={64} />
                        <h4 className="text-2xl font-black text-gray-600 mb-2">No Nodes Found</h4>
                        <p className="text-gray-500 font-medium">Clear search filter to view all operational nodes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
