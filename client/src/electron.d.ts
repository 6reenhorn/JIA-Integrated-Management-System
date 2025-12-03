declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      onOnline: () => void;
      onOffline: () => void;
      manualSync: () => Promise<{ success: boolean; message: string }>;
      isOnline: () => boolean;
    };
  }
}

export {};