import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to monitor network status and provide sync functionality
 * @returns {Object} Network status and sync functions
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(() => {
        // Check if we're in Electron and the API is available
        if (window.electronAPI && typeof window.electronAPI.isOnline === 'function') {
            try {
                return window.electronAPI.isOnline();
            } catch (error) {
                console.warn('Error calling electronAPI.isOnline:', error);
            }
        }
        // Fallback to browser API
        return navigator.onLine;
    });

    const [isCheckingConnection, setIsCheckingConnection] = useState(false);

    // Check actual server connectivity (not just browser online status)
    const checkServerConnection = useCallback(async (): Promise<boolean> => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

            const response = await fetch('http://localhost:3001/health', {
                method: 'GET',
                signal: controller.signal,
                cache: 'no-cache',
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            // Network error or timeout
            return false;
        }
    }, []);

    // Enhanced online/offline handlers
    useEffect(() => {
        const handleOnline = async () => {
            console.log('🌐 Network: Browser reports ONLINE');
            setIsCheckingConnection(true);
            
            // Verify actual server connectivity
            const serverReachable = await checkServerConnection();
            
            if (serverReachable) {
                console.log('✅ Server is reachable');
                setIsOnline(true);
                // Notify Electron if available
                if (window.electronAPI && typeof window.electronAPI.onOnline === 'function') {
                    try {
                        window.electronAPI.onOnline();
                    } catch (error) {
                        console.warn('Error calling electronAPI.onOnline:', error);
                    }
                }
            } else {
                console.log('⚠️ Browser online but server unreachable');
                setIsOnline(false);
            }
            
            setIsCheckingConnection(false);
        };

        const handleOffline = () => {
            console.log('📴 Network: Browser reports OFFLINE');
            setIsOnline(false);
            // Notify Electron if available
            if (window.electronAPI && typeof window.electronAPI.onOffline === 'function') {
                try {
                    window.electronAPI.onOffline();
                } catch (error) {
                    console.warn('Error calling electronAPI.onOffline:', error);
                }
            }
        };

        // Listen to browser online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial connection check
        const initialCheck = async () => {
            if (navigator.onLine) {
                setIsCheckingConnection(true);
                const serverReachable = await checkServerConnection();
                setIsOnline(serverReachable);
                setIsCheckingConnection(false);
            }
        };
        initialCheck();

        // Periodic connection check (every 30 seconds)
        const connectionCheckInterval = setInterval(async () => {
            if (navigator.onLine && !isCheckingConnection) {
                setIsCheckingConnection(true);
                const serverReachable = await checkServerConnection();
                setIsOnline(serverReachable);
                setIsCheckingConnection(false);
            }
        }, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(connectionCheckInterval);
        };
    }, [checkServerConnection, isCheckingConnection]);

    const triggerManualSync = useCallback(async () => {
        if (!window.electronAPI || typeof window.electronAPI.manualSync !== 'function') {
            return { success: false, message: 'Not in Electron environment or sync not available' };
        }
        
        try {
            const result = await window.electronAPI.manualSync();
            return result;
        } catch (error: any) {
            console.error('Manual sync error:', error);
            return { success: false, message: error?.message || 'Sync failed' };
        }
    }, []);

    return { 
        isOnline, 
        isCheckingConnection,
        triggerManualSync 
    };
}