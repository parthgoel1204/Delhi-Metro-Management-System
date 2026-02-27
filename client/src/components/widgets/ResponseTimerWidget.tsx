import React, { useState, useEffect } from 'react';
import { Pause, Square } from 'lucide-react';

const ResponseTimerWidget = () => {
    const [seconds, setSeconds] = useState(12 * 60 + 43); // 12:43 starting

    useEffect(() => {
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gradient-to-br from-dmrc-navy to-dmrc-cobalt rounded-3xl p-6 shadow-lg text-white relative overflow-hidden h-full flex flex-col justify-between group">
            {/* Decorative background waves matching the mockup */}
            <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-in-out">
                <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
                    <path d="M0 100 Q 50 150 100 100 T 200 100 T 300 100 T 400 100 L 400 200 L 0 200 Z" fill="rgba(255,255,255,0.1)" />
                    <path d="M0 120 Q 50 170 100 120 T 200 120 T 300 120 T 400 120 L 400 200 L 0 200 Z" fill="rgba(255,255,255,0.05)" />
                    <path d="M0 150 Q 50 200 100 150 T 200 150 T 300 150 T 400 150 L 400 200 L 0 200 Z" fill="rgba(255,255,255,0.15)" />
                </svg>
            </div>

            <div className="relative z-10 mb-4">
                <h3 className="text-sm font-medium text-blue-100">Response Timer</h3>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <span className="text-[2.5rem] font-bold tracking-tight mb-6 tabular-nums drop-shadow-md">
                    {formatTime(seconds)}
                </span>

                <div className="flex gap-4">
                    <button className="h-10 w-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
                        <Pause size={18} fill="currentColor" />
                    </button>
                    <button className="h-10 w-10 bg-red-500 hover:bg-red-400 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg">
                        <Square size={16} fill="currentColor" className="text-white" />
                    </button>
                </div>
            </div>

            <div className="relative z-10 text-center mt-4">
                <span className="text-xs text-blue-100/80 font-medium">Incident: Spill at Rajiv Chowk</span>
            </div>
        </div>
    );
};

export default ResponseTimerWidget;
