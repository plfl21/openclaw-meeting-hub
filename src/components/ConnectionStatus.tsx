import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { checkConnection } from '../lib/api';

export default function ConnectionStatus() {
  const { data: isOnline } = usePolling(checkConnection, 30000);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isOnline
        ? 'bg-success/15 text-success'
        : 'bg-error/15 text-error'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          <span>LIVE</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>OFFLINE</span>
          <span className="w-2 h-2 rounded-full bg-error" />
        </>
      )}
    </div>
  );
}
