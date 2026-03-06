import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-0 left-0 w-screen h-screen z-[999999] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
            {/* Background Ripple Effects */}
            <div className="absolute inset-0 z-0">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{
                            scale: [1, 2, 3],
                            opacity: [0.1, 0.05, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 1,
                            ease: "easeOut",
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-primary/20"
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Water Tank Container */}
                <div className="relative w-24 h-32 md:w-32 md:h-40 border-4 border-white/20 rounded-b-3xl rounded-t-xl overflow-hidden glass shadow-2xl mb-8">
                    {/* Water Filling Animation */}
                    <motion.div
                        initial={{ height: "0%" }}
                        animate={{ height: ["0%", "80%", "75%", "90%", "85%"] }}
                        transition={{
                            duration: 2.5,
                            times: [0, 0.4, 0.6, 0.8, 1],
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 0.5
                        }}
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary to-accent"
                    >
                        {/* Wave effect on top of water */}
                        <motion.div
                            animate={{
                                x: [-10, 10, -10],
                                rotate: [0, 2, -2, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-0 left-0 w-[200%] h-4 bg-white/20 -translate-y-1/2 blur-sm scale-x-150"
                        />
                    </motion.div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <Droplets className="w-8 h-8 md:w-12 md:h-12 text-white/40 animate-pulse" />
                    </div>
                </div>

                {/* Brand Text with Shimmer */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <h2 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-white flex items-center gap-3">
                        HYDRO<span className="text-primary">GUARD</span>
                    </h2>
                    <div className="mt-4 flex justify-center gap-1">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                                className="w-1.5 h-1.5 rounded-full bg-accent"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Industrial/Tech aesthetic lines */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        </motion.div>
    );
};

export default LoadingScreen;
