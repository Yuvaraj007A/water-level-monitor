import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import { AreaChart as AreaIcon, BarChart2, TrendingUp, Calendar, LayoutGrid } from 'lucide-react';

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async (period) => {
        setLoading(true);
        try {
            const response = await api.get(`/analytics/${period}`);

            if (period === 'daily') {
                const formatted = response.data.map(log => ({
                    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    level: log.level,
                }));
                setData(formatted);
            } else {
                const formatted = response.data.map(stat => ({
                    date: stat._id,
                    averageLevel: Math.round(stat.averageLevel),
                    motorRuns: stat.logsCount || 0
                }));
                setData(formatted);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics(activeTab);
    }, [activeTab]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-primary font-black uppercase tracking-widest text-xs mb-2 italic">Performance & Dynamics</h2>
                    <h1 className="text-4xl font-black text-white tracking-tight">System Intelligence</h1>
                    <p className="text-gray-400 mt-2 font-medium">Monitoring volumetric fluctuations and operational cycles.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                    {['daily', 'weekly', 'monthly'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-2.5 rounded-xl text-sm font-black capitalize transition-all ${
                                activeTab === tab 
                                ? 'bg-primary text-white shadow-lg' 
                                : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {/* Visual Data Main Card */}
                <div className="glass rounded-[2.5rem] p-10 group transition-all hover:border-primary/20">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                <TrendingUp size={24} />
                            </div>
                            {activeTab === 'daily' ? 'Current Level Propagation' : `Consolidated Trends (${activeTab})`}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                            <Calendar size={16} /> Data synced UTC
                        </div>
                    </div>
                    
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey={activeTab === 'daily' ? 'time' : 'date'} 
                                    stroke="#475569" 
                                    tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }} 
                                    dy={15}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }} 
                                    dx={-15} 
                                    domain={[0, 100]} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        borderColor: '#334155', 
                                        borderRadius: '1.5rem', 
                                        color: '#f8fafc',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        padding: '1rem'
                                    }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 800 }}
                                />
                                <Area
                                    type="monotone"
                                    name={activeTab === 'daily' ? 'Level (%)' : 'Avg Level (%)'}
                                    dataKey={activeTab === 'daily' ? 'level' : 'averageLevel'}
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorLevel)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Visual Metrics */}
                {activeTab !== 'daily' && (
                    <div className="glass rounded-[2.5rem] p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-accent/20 rounded-2xl text-accent">
                                <BarChart2 size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-white">
                                Operational Throughput
                            </h2>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#475569" 
                                        tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }} 
                                        dy={15}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        stroke="#475569" 
                                        tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }} 
                                        dx={-15} 
                                        allowDecimals={false} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#1e293b', 
                                            borderRadius: '1.5rem',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}
                                        cursor={{ fill: '#ffffff05' }}
                                    />
                                    <Bar 
                                        name="Active Data Nodes" 
                                        dataKey="motorRuns" 
                                        fill="#0ea5e9" 
                                        radius={[12, 12, 4, 4]} 
                                        barSize={40}
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
