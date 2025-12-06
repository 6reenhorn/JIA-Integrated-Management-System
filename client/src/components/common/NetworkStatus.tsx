import React, { useState } from 'react';
import { useNetworkStatus } from '../../hook/useNetworkStatus';
import { RefreshCw, Wifi, WifiOff, CheckCircle2, XCircle } from 'lucide-react';

const NetworkStatus: React.FC = () => {
    const { isOnline, isCheckingConnection, triggerManualSync } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const handleManualSync = async () => {
        setIsSyncing(true);
        setSyncMessage(null);
        try {
            const result = await triggerManualSync();
            if (result.success) {
                setSyncMessage('✅ Sync completed successfully!');
                setTimeout(() => setSyncMessage(null), 3000);
            } else {
                setSyncMessage(`❌ ${result.message}`);
                setTimeout(() => setSyncMessage(null), 5000);
            }
        } catch (error) {
            console.error('Sync error:', error);
            setSyncMessage('❌ Sync failed');
            setTimeout(() => setSyncMessage(null), 5000);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex flex-col gap-2 items-end">
                {/* Main Status Indicator */}
                <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 border border-gray-200">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                        {isCheckingConnection ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="text-sm font-medium text-gray-700">Checking...</span>
                            </>
                        ) : isOnline ? (
                            <>
                                <Wifi className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">Online</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-gray-700">Offline</span>
                            </>
                        )}
                    </div>

                    {/* Manual Sync Button - Always visible when in Electron, disabled when offline */}
                    {window.electronAPI && typeof window.electronAPI.manualSync === 'function' && (
                        <button
                            onClick={handleManualSync}
                            disabled={isSyncing || isCheckingConnection || !isOnline}
                            className="ml-2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 border-l border-gray-200 pl-3"
                            title={!isOnline ? "Connect to internet to sync" : "Manually sync with server now"}
                        >
                            {isSyncing ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Sync Now</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Sync Message Toast */}
                {syncMessage && (
                    <div className={`flex items-center gap-2 bg-white rounded-lg shadow-lg px-4 py-2 border ${
                        syncMessage.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    } animate-in slide-in-from-bottom-2`}>
                        {syncMessage.includes('✅') ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                            syncMessage.includes('✅') ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {syncMessage.replace('✅', '').replace('❌', '').trim()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkStatus;