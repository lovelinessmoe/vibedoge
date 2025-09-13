import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeIndicatorProps {
    isConnected: boolean;
    lastUpdate?: Date;
}

const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({ isConnected, lastUpdate }) => {
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        if (lastUpdate) {
            setShowIndicator(true);
            const timer = setTimeout(() => {
                setShowIndicator(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [lastUpdate]);

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
            {/* 连接状态指示器 */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium backdrop-blur-md border transition-all duration-300 ${
                isConnected 
                    ? 'bg-green-500/20 border-green-400/30 text-green-700' 
                    : 'bg-red-500/20 border-red-400/30 text-red-700'
            }`}>
                {isConnected ? (
                    <>
                        <Wifi className="w-4 h-4" />
                        <span>实时连接</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span>连接断开</span>
                    </>
                )}
            </div>

            {/* 更新提示 */}
            <AnimatePresence>
                {showIndicator && lastUpdate && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>数据已更新</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RealtimeIndicator;