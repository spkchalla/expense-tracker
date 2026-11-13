import React from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import './Layout.css';

export function OfflineBanner({ offlineSync }) {
  const { isOnline, pendingCount, isSyncing, syncPending, syncError } = offlineSync;

  if (isOnline && pendingCount === 0 && !syncError) {
    return null;
  }

  return (
    <div className={`offline-banner ${!isOnline ? 'offline-state' : 'sync-state'}`}>
      <div className="container flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff size={16} />
          ) : syncError ? (
            <AlertCircle size={16} className="text-danger" />
          ) : (
            <RefreshCw size={16} className={isSyncing ? 'btn-spinner' : ''} />
          )}

          <span className="text-xs">
            {!isOnline
              ? `You are offline. ${pendingCount > 0 ? `${pendingCount} expense(s) saved locally.` : 'New entries will be queued.'}`
              : syncError
              ? `Sync error: ${syncError}`
              : `${pendingCount} offline expense(s) pending sync.`}
          </span>
        </div>

        {isOnline && pendingCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={syncPending}
            isLoading={isSyncing}
          >
            Sync now
          </Button>
        )}
      </div>
    </div>
  );
}
