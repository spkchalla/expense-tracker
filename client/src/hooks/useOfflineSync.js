import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db.js';
import { api } from '../lib/api.js';
import { useOnlineStatus } from './useOnlineStatus.js';

export function useOfflineSync(user) {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const refreshPendingCount = useCallback(async () => {
    if (!user) {
      setPendingCount(0);
      return;
    }
    try {
      const count = await db.pendingTransactions.where('userId').equals(user.id).count();
      setPendingCount(count);
    } catch {
      // IndexedDB might not be available or opened yet
    }
  }, [user]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  const addPendingTransaction = async (txData) => {
    if (!user) throw new Error('Cannot save offline without authenticated user context');
    await db.pendingTransactions.add({
      ...txData,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });
    await refreshPendingCount();
  };

  const syncPending = useCallback(async () => {
    if (!user || !isOnline || isSyncing) return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      const items = await db.pendingTransactions.where('userId').equals(user.id).toArray();
      if (items.length === 0) {
        setIsSyncing(false);
        return { synced: 0 };
      }

      // Format payload for sync endpoint
      const payload = items.map((item) => ({
        type: item.type || 'expense',
        amountPaise: item.amountPaise,
        categoryId: item.categoryId,
        needId: item.needId || null,
        description: item.description || '',
        merchant: item.merchant || '',
        source: item.source || null,
        mealPeriod: item.mealPeriod || null,
        paymentMethod: item.paymentMethod || 'UPI',
        notes: item.notes || '',
        occurredAt: item.occurredAt || item.createdAt,
        clientTransactionId: item.clientTransactionId,
      }));

      const res = await api.syncTransactions(payload);
      if (res && res.success) {
        // Clear synced items
        const itemIds = items.map((i) => i.id);
        await db.pendingTransactions.bulkDelete(itemIds);
        await refreshPendingCount();
      }

      setIsSyncing(false);
      return res;
    } catch (err) {
      console.error('[OfflineSync] Sync failed:', err);
      setSyncError(err.message || 'Sync failed');
      setIsSyncing(false);
    }
  }, [user, isOnline, isSyncing, refreshPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && user && pendingCount > 0) {
      syncPending();
    }
  }, [isOnline, user, pendingCount, syncPending]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncError,
    syncPending,
    addPendingTransaction,
    refreshPendingCount,
  };
}
