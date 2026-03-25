import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
    Droplet, 
    Settings, 
    Power, 
    Activity, 
    AlertTriangle, 
    Waves, 
    BarChart3, 
    Plus, 
    Check, 
    X,
    ChevronDown,
    LayoutDashboard,
    Cpu,
    Zap,
    ArrowDown,
    ArrowUp,
    Shield
} from 'lucide-react';
import TankVisualizer from '../components/TankVisualizer';
import LoadingScreen from '../components/LoadingScreen';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [tanks, setTanks] = useState([]);
    const [selectedTankIndex, setSelectedTankIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddTankOpen, setIsAddTankOpen] = useState(false);
    const [newTankName, setNewTankName] = useState('');
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const [config, setConfig] = useState({
        tankHeight: 100,
        tankCapacityLiters: 1000,
        automationEnabled: false,
        lowThreshold: 20,
        highThreshold: 90
    });

    const isConfigOpenRef = useRef(isConfigOpen);
    useEffect(() => {
        isConfigOpenRef.current = isConfigOpen;
    }, [isConfigOpen]);

    const activeTank = tanks[selectedTankIndex];

    const fetchTanks = async () => {
        try {
            const res = await api.get('/tank');
            setTanks(res.data);
            if (res.data.length > 0) {
                const tank = res.data[selectedTankIndex] || res.data[0];
                if (!isConfigOpenRef.current) {
                    setConfig({
                        tankHeight: tank.tankHeight || 100,
                        tankCapacityLiters: tank.tankCapacityLiters || 1000,
                        automationEnabled: tank.automationEnabled ?? true,
                        lowThreshold: tank.lowThreshold || 20,
                        highThreshold: tank.highThreshold || 90
                    });
                }
            }
        } catch (err) {
            setError('Failed to load storage units');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTanks();
        const interval = setInterval(fetchTanks, 5000);
        return () => clearInterval(interval);
    }, [selectedTankIndex]);

    const handleToggleMotor = async () => {
        if (!activeTank) return;
        try {
            const newState = activeTank.motorStatus === 'OFF' ? 'ON' : 'OFF';
            await api.post(`/tank/motor/${activeTank._id}`, { motorStatus: newState });
            fetchTanks();
        } catch (err) {
            alert('Signal transmission failed');
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        if (!activeTank) return;
        try {
            await api.put(`/tank/${activeTank._id}`, config);
            setIsConfigOpen(false);
            fetchTanks();
        } catch (err) {
            alert('Failed to calibrate system');
        }
    };

    const handleAddTank = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tank', { name: newTankName || 'Secondary Tank' });
            setIsAddTankOpen(false);
            setNewTankName('');
            fetchTanks();
        } catch (err) {
            alert('Failed to initialize new unit');
        }
    };

    const copyTankId = () => {
        if (activeTank) {
            navigator.clipboard.writeText(activeTank._id);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    if (loading && tanks.length === 0) return <LoadingScreen />;

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Tank Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="text-primary" /> System Control
                    </h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Cluster Integrity: {tanks.length} active nodes</p>
                </div>

                <div className="flex items-center gap-3 bg-surface/50 p-1.5 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
                    {tanks.map((tank, index) => (
                        <button
                            key={tank._id}
                            onClick={() => setSelectedTankIndex(index)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                selectedTankIndex === index 
                                ? 'bg-primary text-white shadow-lg' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tank.name}
                        </button>
                    ))}
                    <button 
                        onClick={() => setIsAddTankOpen(true)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-primary rounded-xl transition-all border border-dashed border-primary/30"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-2xl flex items-center gap-3 font-bold">
                    <AlertTriangle /> {error}
                </div>
            )}

            {activeTank && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Visualizer */}
                    <div className="lg:col-span-4 glass rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>
                        
                        {/* Tank ID Display */}
                        <div className="absolute top-6 left-6 right-6 flex flex-col gap-1 z-10">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hardware Connector ID</span>
                            <div 
                                onClick={copyTankId}
                                className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 px-3 py-2 rounded-xl cursor-copy hover:bg-white/10 transition-all group"
                            >
                                <code className="text-xs font-mono text-primary truncate max-w-[200px]">{activeTank._id}</code>
                                <div className="text-[9px] font-bold text-gray-500 group-hover:text-white transition-colors">
                                    {copySuccess ? 'COPIED!' : 'COPY'}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-black mb-8 text-white z-10 mt-12">{activeTank.name}</h3>
                        <TankVisualizer level={activeTank.currentLevel} />
                        <div className="mt-8 text-center z-10">
                            <span className="text-6xl font-black text-white">{activeTank.currentLevel}%</span>
                            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">REAL-TIME VOLUME</p>
                        </div>
                    </div>

                    {/* Right Column - Status & Controls */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Motor Control */}
                            <div className="glass rounded-3xl p-8 flex flex-col justify-between group">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Actuator Status</h3>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTank.automationEnabled ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>
                                            {activeTank.automationEnabled ? 'Automatic' : 'Manual'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={`w-3.5 h-3.5 rounded-full animate-pulse ${activeTank.motorStatus === 'ON' ? 'bg-green-500 shadow-green-500/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : 'bg-red-500 shadow-red-500/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]'}`}></div>
                                        <span className={`text-4xl font-black tracking-tighter ${activeTank.motorStatus === 'ON' ? 'text-green-500' : 'text-red-500'}`}>
                                            {activeTank.motorStatus}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Relay interface {activeTank.motorStatus === 'ON' ? 'transmitting' : 'standby'}</p>
                                </div>
                                <button
                                    onClick={handleToggleMotor}
                                    className={`mt-10 w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${
                                        activeTank.motorStatus === 'OFF' 
                                        ? 'bg-primary hover:bg-blue-600 text-white shadow-xl shadow-primary/20' 
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/40'
                                    }`}
                                >
                                    <Power size={24} /> {activeTank.motorStatus === 'OFF' ? 'Engage Motor' : 'Emergency Shutdown'}
                                </button>
                            </div>

                            {/* Detailed Calibration Info */}
                            <div className="glass rounded-3xl p-8 flex flex-col justify-between group cursor-pointer border border-transparent hover:border-primary/30 transition-all" onClick={() => setIsConfigOpen(true)}>
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Unit Calibration</h3>
                                        <Settings size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                                                <Cpu size={12} /> Height
                                            </div>
                                            <p className="text-2xl font-black text-white">{activeTank.tankHeight}<span className="text-xs ml-1 text-gray-400">cm</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                                                <Droplet size={12} /> Capacity
                                            </div>
                                            <p className="text-2xl font-black text-white">{activeTank.tankCapacityLiters}<span className="text-xs ml-1 text-gray-400">L</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                                                <ArrowDown size={12} className="text-red-400" /> Low Trigger
                                            </div>
                                            <p className="text-2xl font-black text-white">{(activeTank.lowThreshold || 20)}<span className="text-xs ml-1 text-gray-400">%</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                                                <ArrowUp size={12} className="text-green-400" /> High Stop
                                            </div>
                                            <p className="text-2xl font-black text-white">{(activeTank.highThreshold || 90)}<span className="text-xs ml-1 text-gray-400">%</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-between text-primary font-black text-xs uppercase tracking-widest bg-primary/5 p-3 rounded-xl border border-primary/5">
                                    Recalibrate Node <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Connection & Network info */}
                        <div className="glass rounded-3xl p-8 overflow-hidden relative group">
                            <div className="absolute right-0 top-0 opacity-5 -translate-y-1/4 translate-x-1/4 group-hover:scale-110 transition-transform duration-700">
                                <Waves size={200} className="text-white" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Node Telemetry Protocols</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase">Sync Status</p>
                                        <p className="text-sm font-black text-white">END-TO-END SECURE</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase">MQTT Channel</p>
                                        <p className="text-sm font-black text-white">UPLINK ACTIVE</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase">Security Layer</p>
                                        <p className="text-sm font-black text-white">AES-READY</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Config Modal */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="fixed inset-0 bg-background/90 backdrop-blur-lg" onClick={() => setIsConfigOpen(false)}></div>
                    <div className="relative glass w-full max-w-xl p-10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/5">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Settings className="text-primary" /> Calibration Interface
                                </h2>
                                <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">Adjusting telemetry for: {activeTank.name}</p>
                            </div>
                            <button onClick={() => setIsConfigOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateConfig} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Structural Height (cm)</label>
                                    <input
                                        type="number"
                                        value={config.tankHeight}
                                        onChange={(e) => setConfig({...config, tankHeight: e.target.value})}
                                        className="w-full bg-surface/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Maximum Capacity (L)</label>
                                    <input
                                        type="number"
                                        value={config.tankCapacityLiters}
                                        onChange={(e) => setConfig({...config, tankCapacityLiters: e.target.value})}
                                        className="w-full bg-surface/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary/20 rounded-xl text-secondary">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <span className="font-black text-white text-lg">Autonomous Logic</span>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Self-regulating motor state</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setConfig({...config, automationEnabled: !config.automationEnabled})}
                                        className={`w-16 h-9 rounded-full transition-all relative shadow-inner ${config.automationEnabled ? 'bg-primary' : 'bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all shadow-md ${config.automationEnabled ? 'left-8' : 'left-1.5'}`}></div>
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-8 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 ml-1">
                                            <ArrowDown size={14} className="text-red-400" />
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LOW THRESHOLD (%)</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={config.lowThreshold}
                                            onChange={(e) => setConfig({...config, lowThreshold: e.target.value})}
                                            className="w-full bg-surface/80 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-xl"
                                        />
                                        <p className="text-[9px] text-gray-600 mt-2 font-bold px-1">Motor initiates at this level</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 ml-1">
                                            <ArrowUp size={14} className="text-green-400" />
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">HIGH STOP (%)</label>
                                        </div>
                                        <input
                                            type="number"
                                            value={config.highThreshold}
                                            onChange={(e) => setConfig({...config, highThreshold: e.target.value})}
                                            className="w-full bg-surface/80 border border-white/10 rounded-2xl py-4 px-5 text-white font-black text-xl"
                                        />
                                        <p className="text-[9px] text-gray-600 mt-2 font-bold px-1">Safety stop at this level</p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Check size={28} /> Confirm Calibration
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Tank Modal */}
            {isAddTankOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="fixed inset-0 bg-background/90 backdrop-blur-lg" onClick={() => setIsAddTankOpen(false)}></div>
                    <div className="relative glass w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-white/5">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Plus className="text-primary" /> Initialize Unit
                                </h2>
                                <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">Scaling system cluster</p>
                            </div>
                            <button onClick={() => setIsAddTankOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTank} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Cluster Descriptor (Name)</label>
                                <input
                                    type="text"
                                    value={newTankName}
                                    onChange={(e) => setNewTankName(e.target.value)}
                                    className="w-full bg-surface/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black placeholder:text-gray-700"
                                    placeholder="e.g. Master Tank Alpha"
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="w-full py-5 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
                                Finalize Core Initialization
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
