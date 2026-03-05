import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Activity, Smartphone, BarChart3, ChevronRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import WaterBackground from '../components/Landing/WaterBackground';

const Landing = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        },
    };

    const features = [
        {
            icon: <Activity className="w-8 h-8 text-primary" />,
            title: "Real-Time Monitoring",
            description: "Get instantaneous updates on your water levels with precision-calibrated sensor data streaming directly to your dashboard."
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-accent" />,
            title: "Advanced Analytics",
            description: "Visualize historical consumption patterns and predict future usage with our intuitive, interactive charting engine."
        },
        {
            icon: <Smartphone className="w-8 h-8 text-blue-400" />,
            title: "IoT Connectivity",
            description: "Seamlessly integrates with ESP32 and ultra-sonic sensors for a robust, industrial-grade monitoring solution."
        },
        {
            icon: <Droplets className="w-8 h-8 text-primary" />,
            title: "Resource Efficiency",
            description: "Optimize your water management and prevent overflows with automated threshold alerts and smart notifications."
        }
    ];

    return (
        <div className="relative min-h-[90vh] overflow-hidden">
            <WaterBackground />

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center pt-20 pb-16 text-center max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-accent inline-flex items-center gap-2"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    Next-Gen Water Management
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
                >
                    Control Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Fluids</span> With Precision
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl"
                >
                    HydroGuard is the world's most sophisticated water level monitoring ecosystem. Powered by IoT and real-time analytics, it transforms how you manage your essential resources.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 items-center justify-center"
                >
                    <Link
                        to="/register"
                        className="group relative px-8 py-4 bg-primary rounded-2xl font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        Get Started Now
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl font-semibold text-white transition-all flex items-center gap-2"
                    >
                        Sign In to Dashboard
                    </Link>
                </motion.div>
            </section>

            {/* Features Grid */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-20 mt-10"
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="group p-8 rounded-3xl bg-surface/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all hover:bg-surface/60 overflow-hidden relative"
                    >
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                        <div className="mb-6 p-3 bg-white/5 rounded-2xl inline-block group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </motion.section>

            {/* Detailed Description Section */}
            <section className="relative z-10 py-20 px-6 border-t border-white/5 bg-background/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-lg bg-primary/20 text-primary-light text-xs font-bold uppercase tracking-widest border border-primary/30">
                            Why HydroGuard?
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">
                            A Complete <span className="text-primary italic">Intelligence Layer</span> For Your Infrastructure
                        </h2>
                        <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                            <p>
                                Traditional float switches and manual checks are relics of the past. HydroGuard brings industrial-grade automation to your home or facility with a plug-and-play IoT solution.
                            </p>
                            <p>
                                Our system uses ultrasonic wave-based measurement to determine volume with 99.8% accuracy. This data is transmitted securely to our cloud-native platform, where complex algorithms process it to provide you with insights you actually care about—like leakage detection, overflow prevention, and usage forecasting.
                            </p>
                        </div>

                        <div className="mt-10 flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">99%</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Accuracy Rate</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">&lt; 1s</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Latency Range</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-white">24/7</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Uptime Monitoring</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl glass p-1">
                            <div className="w-full h-[400px] bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center group overflow-hidden">
                                <div className="relative w-48 h-64 bg-surface/80 rounded-3xl border-2 border-white/20 p-2 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute bottom-0 left-0 w-full bg-primary/40 animate-pulse" style={{ height: '65%' }}>
                                        <div className="absolute top-0 w-full h-1 bg-white/40 blur-sm"></div>
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                                        <Droplets className="w-12 h-12 mb-2 animate-bounce" />
                                        <span className="text-2xl font-bold">65%</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Live Level</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating cards */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-6 p-4 glass rounded-2xl shadow-xl w-40"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] uppercase font-bold text-gray-400">Sensor Active</span>
                            </div>
                            <div className="text-lg font-bold">ESP32-TX4</div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 -left-6 p-4 glass rounded-2xl shadow-xl w-48"
                        >
                            <div className="text-[10px] uppercase font-bold text-accent mb-1 tracking-tighter">Weekly Consumption</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">1,240</span>
                                <span className="text-xs text-gray-400">Liters</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer / CTA */}
            <footer className="relative z-10 py-12 text-center border-t border-white/5">
                <p className="text-gray-500 text-sm">
                    &copy; 2026 HydroGuard Systems. Engineered for precision and efficiency.
                </p>
            </footer>
        </div>
    );
};

export default Landing;
