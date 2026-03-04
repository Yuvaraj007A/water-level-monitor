import React from 'react';

const TankVisualizer = ({ level = 0 }) => {
    // Determine color based on level
    const getColor = () => {
        if (level > 50) return { primary: '#22c55e', secondary: '#16a34a' }; // Green
        if (level > 20) return { primary: '#eab308', secondary: '#ca8a04' }; // Yellow
        return { primary: '#ef4444', secondary: '#dc2626' }; // Red
    };

    const { primary, secondary } = getColor();

    return (
        <div className="relative flex flex-col items-center justify-center p-6">
            <div className="relative w-48 h-64 border-4 border-gray-600 rounded-t-lg rounded-b-xl overflow-hidden bg-surface shadow-2xl overflow-hidden z-10 glass">
                {/* Background measurement lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 opacity-20 pointer-events-none z-0">
                    {[100, 75, 50, 25, 0].map(mark => (
                        <div key={mark} className="flex items-center w-full">
                            <span className="text-xs text-white w-6">{mark}%</span>
                            <div className="h-px bg-white flex-1 mx-1 border-dashed border-t border-white/50"></div>
                        </div>
                    ))}
                </div>

                {/* Water Level Fill Indicator */}
                <div
                    className="absolute bottom-0 w-full transition-all duration-1000 ease-in-out z-10"
                    style={{
                        height: `${level}%`,
                        background: `linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`,
                    }}
                >
                    {/* Waves Animation */}
                    <div className="absolute top-0 left-0 w-[200%] h-8 -mt-4 opacity-50 waveform waveform-1" style={{ backgroundColor: primary }}></div>
                    <div className="absolute top-0 left-0 w-[200%] h-8 -mt-3 opacity-30 waveform waveform-2" style={{ backgroundColor: secondary }}></div>
                </div>
            </div>

            {/* Current Level Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none drop-shadow-lg">
                <span className="text-4xl font-extrabold text-white bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                    {level}%
                </span>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .waveform {
          mask-image: radial-gradient(12px at bottom, transparent 96%, black 100%);
          mask-size: 24px 100%;
          border-top-left-radius: 50%;
          border-top-right-radius: 50%;
        }
        .waveform-1 {
          animation: wave 4s infinite linear;
        }
        .waveform-2 {
          animation: wave 6s infinite linear reverse;
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
        </div>
    );
};

export default TankVisualizer;
