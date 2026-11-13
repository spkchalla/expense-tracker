import Dexie from 'dexie';

export const db = new Dexie('PocketLedgerDB');

db.version(1).stores({
  pendingTransactions: '++id, clientTransactionId, userId, occurredAt, createdAt',
  cachedCategories: '++id, userId',
  cachedNeeds: '++id, userId',
});
