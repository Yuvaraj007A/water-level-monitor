import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import { Calendar, BarChart2, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (period) => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/${period}`);

      // Formatting data for Recharts
      if (period === 'daily') {
        const formatted = response.data.map(log => ({
          time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          level: log.level,
        }));
        setData(formatted);
      } else {
        const formatted = response.data.map(stat => ({
          date: stat._id, // already formatted as YYYY-MM-DD
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Water Usage Analytics</h1>
          <p className="text-gray-400 mt-1">Visualize your consumption and motor activity</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface/80 p-1 rounded-xl glass">
          {['daily', 'weekly', 'monthly'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Main Chart */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-200">
              <TrendingUp className="text-primary" />
              {activeTab === 'daily' ? 'Water Level Today' : `Average Water Level (${activeTab})`}
            </h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey={activeTab === 'daily' ? 'time' : 'date'} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} dy={10} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} dx={-10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    name={activeTab === 'daily' ? 'Current Level (%)' : 'Average Level (%)'}
                    dataKey={activeTab === 'daily' ? 'level' : 'averageLevel'}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={activeTab === 'daily' ? false : { r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#22d3ee' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart (Only for weekly/monthly showing motor activity) */}
          {activeTab !== 'daily' && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-200">
                <BarChart2 className="text-secondary" />
                Motor Activity Frequency
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} dy={10} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} dx={-10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Legend />
                    <Bar name="Motor Data Points" dataKey="motorRuns" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
