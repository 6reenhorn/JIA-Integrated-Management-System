import { useState, useEffect } from 'react';

declare global {
    interface Window {
        electron?: {
            onOnline: () => void;
            onOffline: () => void;
            manualSync: () => Promise<{ success: boolean; message: string }>;
            isOnline: () => boolean;
        };
    }
}

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(
        window.electron?.isOnline() ?? navigator.onLine
    );

    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 Network: ONLINE');
            setIsOnline(true);
            window.electron?.onOnline();
        };

        const handleOffline = () => {
            console.log('📴 Network: OFFLINE');
            setIsOnline(false);
            window.electron?.onOffline();
        };

        // Listen to browser online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const triggerManualSync = async () => {
        if (!window.electron) return { success: false, message: 'Not in Electron' };
        return await window.electron.manualSync();
    };

    return { isOnline, triggerManualSync };
}