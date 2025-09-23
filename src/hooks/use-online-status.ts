import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // Initialize with current status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // User came back online after being offline
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Additional check with periodic ping (optional)
    const checkConnectivity = async () => {
      try {
        // Try to fetch a small resource to verify real connectivity
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        const currentlyOnline = response.ok;
        if (currentlyOnline !== isOnline) {
          setIsOnline(currentlyOnline);
          if (!currentlyOnline) {
            setWasOffline(true);
          }
        }
      } catch (error) {
        // Network error, likely offline
        if (isOnline) {
          setIsOnline(false);
          setWasOffline(true);
        }
      }
    };

    // Check connectivity every 30 seconds
    const intervalId = setInterval(checkConnectivity, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, wasOffline]);

  return { 
    isOnline, 
    wasOffline,
    // Helper methods
    isOffline: !isOnline,
    justCameOnline: isOnline && wasOffline
  };
};

// Hook for showing offline banner
export const useOfflineBanner = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setShowReconnectedMessage(false);
    } else if (wasOffline) {
      // Just came back online
      setShowBanner(false);
      setShowReconnectedMessage(true);
      
      // Hide reconnected message after 3 seconds
      const timeout = setTimeout(() => {
        setShowReconnectedMessage(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    } else {
      setShowBanner(false);
      setShowReconnectedMessage(false);
    }
  }, [isOnline, wasOffline]);

  return {
    showOfflineBanner: showBanner,
    showReconnectedMessage,
    isOnline,
  };
};
