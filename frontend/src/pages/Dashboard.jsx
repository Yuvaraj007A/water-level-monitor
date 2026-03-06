import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import TankVisualizer from '../components/TankVisualizer';
import LoadingScreen from '../components/LoadingScreen';
import { Activity, Beaker, Clock, Power, Settings, RefreshCw, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [tankData, setTankData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTogglingMotor, setIsTogglingMotor] = useState(false);

    const fetchTankData = async () => {
        try {
            const { data } = await api.get('/tank');
            setTankData(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch tank data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTankData();
        // Poll every 5 seconds for real-time updates
        const interval = setInterval(fetchTankData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleToggleMotor = async () => {
        if (!tankData || isTogglingMotor) return;
        setIsTogglingMotor(true);
        try {
            const newStatus = tankData.motorStatus === 'ON' ? 'OFF' : 'ON';
            const { data } = await api.post('/tank/motor', { motorStatus: newStatus });
            setTankData(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle motor');
        } finally {
            setIsTogglingMotor(false);
        }
    };

    if (loading && !tankData) {
        return <LoadingScreen />;
    }

    if (error && !tankData) {
        return <div className="bg-red-500/10 border border-red-500 text-red-400 p-6 rounded-xl flex items-center gap-4"><AlertTriangle />{error}</div>;
    }

    const isMotorOn = tankData.motorStatus === 'ON';
    const lastUpdated = new Date(tankData.lastUpdated).toLocaleTimeString();
    const automatedStr = tankData.automationEnabled ? 'Enabled' : 'Disabled';

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl text-primary font-medium mb-1">Welcome, {user?.name}</h2>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Status</h1>
                    <p className="text-gray-400 flex items-center gap-2 mt-1">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Last simulated update: {lastUpdated}
                    </p>
                </div>
                <button
                    onClick={handleToggleMotor}
                    disabled={isTogglingMotor}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isMotorOn ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20 text-white'}`}
                >
                    <Power size={20} className={isTogglingMotor ? 'animate-pulse' : ''} />
                    {isTogglingMotor ? 'Working...' : isMotorOn ? 'TURN MOTOR OFF' : 'TURN MOTOR ON'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Tank View */}
                <div className="lg:col-span-1 glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-200">
                        <Beaker className="text-primary" /> Live Level
                    </h2>
                    <TankVisualizer level={tankData.currentLevel} />
                    <div className="mt-8 text-center bg-surface/50 w-full rounded-xl py-3 border border-white/5">
                        <p className="text-sm text-gray-400 mb-1">Volume</p>
                        <p className="text-2xl font-bold text-white">{tankData.waterVolume} / {tankData.tankCapacityLiters} L</p>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-3 rounded-xl ${isMotorOn ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                <Power size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">Motor State</h3>
                        </div>
                        <p className={`text-3xl mt-2 font-bold ${isMotorOn ? 'text-green-400' : 'text-gray-400'}`}>
                            {tankData.motorStatus}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Currently {isMotorOn ? 'pumping water' : 'idle'}</p>
                    </div>

                    <div className="glass rounded-2xl p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                                <Settings size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">Automation</h3>
                        </div>
                        <p className="text-3xl mt-2 font-bold text-white">{automatedStr}</p>
                        <p className="text-sm text-gray-400 mt-2">Auto ON &lt; 20% | Auto OFF &gt; 95%</p>
                    </div>

                    <div className="glass rounded-2xl p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">Tank Height</h3>
                        </div>
                        <p className="text-3xl mt-2 font-bold text-white">{tankData.tankHeight} cm</p>
                        <p className="text-sm text-gray-400 mt-2">Sensor calibration distance</p>
                    </div>

                    <div className="glass rounded-2xl p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
                                <Clock size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">Total Capacity</h3>
                        </div>
                        <p className="text-3xl mt-2 font-bold text-white">{tankData.tankCapacityLiters} L</p>
                        <p className="text-sm text-gray-400 mt-2">Maximum volume limit</p>
                    </div>
                </div >
            </div >

            {/* ESP32 Integration Details */}
            <div className="glass rounded-2xl p-6 mt-6 border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/20 text-primary rounded-xl">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">ESP32 Configuration Details</h3>
                        <p className="text-sm text-gray-400">Use these details in your ESP32 code for hardware integration</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/10 relative group">
                        <p className="text-sm text-gray-400 mb-1">Tank ID</p>
                        <code className="text-primary font-mono text-lg">{tankData._id}</code>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/10 relative group">
                        <p className="text-sm text-gray-400 mb-1">MQTT Broker</p>
                        <code className="text-green-400 font-mono text-lg break-all">
                            broker.hivemq.com (Port 1883)
                        </code>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
