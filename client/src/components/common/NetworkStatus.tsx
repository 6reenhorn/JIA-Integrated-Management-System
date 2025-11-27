import React, { useState } from 'react';
import { useNetworkStatus } from '../../hook/useNetworkStatus';

const NetworkStatus: React.FC = () => {
    const { isOnline, triggerManualSync } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            const result = await triggerManualSync();
            if (result.success) {
                alert('✅ Sync completed successfully!');
            } else {
                alert(`❌ Sync failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Sync error:', error);
            alert('❌ Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 border border-gray-200">
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>

                {/* Manual Sync Button (only show when online) */}
                {isOnline && (
                    <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                        {isSyncing ? (
                            <>
                                <svg
                                    className="animate-spin h-3 w-3"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span>Syncing...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Sync</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default NetworkStatus;