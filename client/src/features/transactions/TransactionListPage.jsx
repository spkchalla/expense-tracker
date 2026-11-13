import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatINR, formatShortDate, formatFullDateTime } from '../../lib/formatters.js';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  Search,
  Download,
  Filter,
  Trash2,
  Edit2,
  ShoppingBag,
  Zap,
  Utensils,
  Receipt,
  WifiOff,
} from 'lucide-react';
import './Transactions.css';

export function TransactionListPage({
  categories = [],
  needs = [],
  onOpenQuickAdd,
}) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedNeedFilter, setSelectedNeedFilter] = useState(''); // '', 'need', 'flexible'
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Selected for edit / view modal
  const [selectedTx, setSelectedTx] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAmountRupees, setEditAmountRupees] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editNeedId, setEditNeedId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('UPI');

  const fetchTransactions = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 25,
          search: search.trim() || undefined,
          categoryId: selectedCategory || undefined,
          source: selectedSource || undefined,
          monthStr: selectedMonth || undefined,
        };

        if (selectedNeedFilter === 'need') {
          params.needId = { $ne: null }; // handled by server or filtered
        } else if (selectedNeedFilter === 'flexible') {
          params.needId = 'none';
        }

        const res = await api.getTransactions(params);
        if (res && res.success) {
          setTransactions(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    },
    [search, selectedCategory, selectedNeedFilter, selectedSource, selectedMonth]
  );

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const blob = await api.exportTransactionsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pocket_ledger_transactions_${selectedMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (txId) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.deleteTransaction(txId);
      setSelectedTx(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to delete transaction');
    }
  };

  const handleStartEdit = (tx) => {
    setSelectedTx(tx);
    setEditAmountRupees(String(tx.amountPaise / 100));
    setEditCategoryId(tx.categoryId?._id || tx.categoryId || '');
    setEditNeedId(tx.needId?._id || tx.needId || '');
    setEditDescription(tx.description || '');
    setEditMerchant(tx.merchant || '');
    setEditPaymentMethod(tx.paymentMethod || 'UPI');
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedTx) return;

    const parsedRupees = parseFloat(editAmountRupees);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await api.updateTransaction(selectedTx._id, {
        amountPaise: Math.round(parsedRupees * 100),
        categoryId: editCategoryId,
        needId: editNeedId || null,
        description: editDescription.trim(),
        merchant: editMerchant.trim(),
        paymentMethod: editPaymentMethod,
      });
      setIsEditing(false);
      setSelectedTx(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to update transaction');
    }
  };

  return (
    <div className="container">
      {/* Title & CSV Export */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h2 className="text-xl" style={{ fontWeight: 700 }}>
            Transaction History
          </h2>
          <p className="text-xs text-secondary">
            {pagination.total} recorded expense(s)
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={Download}
          isLoading={exporting}
          onClick={handleExportCsv}
        >
          Export CSV
        </Button>
      </div>

      {/* Filter Controls */}
      <Card className="filter-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="filters-grid">
          <Input
            placeholder="Search description, shop, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<Search size={14} />}
          />

          <div className="filters-subgrid">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              value={selectedNeedFilter}
              onChange={(e) => setSelectedNeedFilter(e.target.value)}
            >
              <option value="">All Types (Flexible & Need)</option>
              <option value="flexible">Flexible Spending Only</option>
              <option value="need">Need-Related Only</option>
            </Select>

            <Select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="">All Platforms</option>
              <option value="Blinkit">Blinkit</option>
              <option value="Instamart">Instamart</option>
              <option value="Zepto">Zepto</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* List */}
      {loading && transactions.length === 0 ? (
        <LoadingSpinner text="Loading transactions..." />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Transactions Found"
          description="No expenses match your active filter criteria."
          actionText="Add an Expense"
          onAction={onOpenQuickAdd}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="tx-row-card"
              onClick={() => handleStartEdit(tx)}
            >
              <div className="flex items-center gap-3">
                <div className="recent-tx-icon">
                  {tx.source ? (
                    <Zap size={16} />
                  ) : tx.mealPeriod ? (
                    <Utensils size={16} />
                  ) : (
                    <ShoppingBag size={16} />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="tx-row-title">
                      {tx.merchant || tx.description || tx.categoryId?.name || 'Expense'}
                    </span>
                    {tx.source && <span className="source-tag">{tx.source}</span>}
                    {tx.mealPeriod && <span className="meal-tag">{tx.mealPeriod}</span>}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted" style={{ marginTop: 2 }}>
                    <span>{formatFullDateTime(tx.occurredAt)}</span>
                    <span>•</span>
                    <span>{tx.categoryId?.name}</span>
                    {tx.needId && (
                      <Badge size="sm" variant="need">
                        {tx.needId?.name || 'Need'}
                      </Badge>
                    )}
                  </div>

                  {tx.description && tx.merchant && (
                    <p className="text-xs text-secondary" style={{ marginTop: 2 }}>
                      {tx.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="recent-tx-amount-col">
                <span className="font-mono text-sm" style={{ fontWeight: 600 }}>
                  {formatINR(tx.amountPaise)}
                </span>
                <span className="text-xs text-muted">{tx.paymentMethod || 'UPI'}</span>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-4)' }}>
              <Button
                size="sm"
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchTransactions(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-secondary font-mono">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={pagination.page >= 1 && pagination.page >= pagination.totalPages}
                onClick={() => fetchTransactions(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit / Detail Modal */}
      {isEditing && selectedTx && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Expense"
        >
          <form onSubmit={handleSaveEdit}>
            <Input
              label="Amount (INR)"
              type="number"
              step="any"
              min="0.01"
              prefix="₹"
              value={editAmountRupees}
              onChange={(e) => setEditAmountRupees(e.target.value)}
              required
            />

            <Select
              label="Category"
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Linked Need (Optional)"
              value={editNeedId}
              onChange={(e) => setEditNeedId(e.target.value)}
              helperText="If linked to a Need, deducted from its fund and excluded from flexible spending."
            >
              <option value="">None (Discretionary)</option>
              {needs.map((n) => (
                <option key={n._id} value={n._id}>
                  {n.name}
                </option>
              ))}
            </Select>

            <Input
              label="Merchant / Shop"
              value={editMerchant}
              onChange={(e) => setEditMerchant(e.target.value)}
            />

            <Input
              label="Description / Items"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <Select
              label="Payment Method"
              value={editPaymentMethod}
              onChange={(e) => setEditPaymentMethod(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </Select>

            <div
              className="flex items-center justify-between"
              style={{ marginTop: 'var(--space-4)', gap: 'var(--space-2)' }}
            >
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDelete(selectedTx._id)}
              >
                Delete
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
