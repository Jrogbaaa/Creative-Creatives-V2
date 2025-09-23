'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineBanner } from '@/hooks/use-online-status';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { showOfflineBanner, showReconnectedMessage } = useOfflineBanner();

  return (
    <AnimatePresence>
      {showOfflineBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] bg-orange-500 text-white px-4 py-2 text-sm font-medium shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-center space-x-2 max-w-7xl mx-auto">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may not work properly.</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </motion.div>
      )}
      
      {showReconnectedMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] bg-green-500 text-white px-4 py-2 text-sm font-medium shadow-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-center space-x-2 max-w-7xl mx-auto">
            <Wifi className="w-4 h-4" />
            <span>You're back online! All features are now available.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
