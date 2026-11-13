import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { api } from '../../lib/api.js';
import { rupeesToPaise, generateUUID } from '../../lib/formatters.js';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import './Transactions.css';

export function QuickAddModal({
  isOpen,
  onClose,
  categories = [],
  needs = [],
  onSuccess,
  offlineSync,
}) {
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [needId, setNeedId] = useState('');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [source, setSource] = useState('');
  const [mealPeriod, setMealPeriod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentlyUsedCategoryIds, setRecentlyUsedCategoryIds] = useState([]);

  // Load recently used categories from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pocket_ledger_recent_categories') || '[]');
      setRecentlyUsedCategoryIds(saved);
    } catch {
      // Ignore
    }
  }, [isOpen]);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0]._id);
    }
  }, [categories, categoryId]);

  const resetForm = () => {
    setAmountStr('');
    setDescription('');
    setMerchant('');
    setSource('');
    setMealPeriod('');
    setNeedId('');
    setError('');
    setShowMoreDetails(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedRupees = parseFloat(amountStr);
    if (!amountStr || isNaN(parsedRupees) || parsedRupees <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    const amountPaise = rupeesToPaise(parsedRupees);
    const clientTransactionId = generateUUID();

    const transactionPayload = {
      type: 'expense',
      amountPaise,
      categoryId,
      needId: needId || null,
      description: description.trim(),
      merchant: merchant.trim(),
      source: source || null,
      mealPeriod: mealPeriod || null,
      paymentMethod,
      clientTransactionId,
      occurredAt: new Date().toISOString(),
    };

    // Update recently used categories
    try {
      const updated = [categoryId, ...recentlyUsedCategoryIds.filter((id) => id !== categoryId)].slice(0, 4);
      setRecentlyUsedCategoryIds(updated);
      localStorage.setItem('pocket_ledger_recent_categories', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    try {
      setLoading(true);

      if (!offlineSync.isOnline) {
        // Save to IndexedDB
        await offlineSync.addPendingTransaction(transactionPayload);
        handleClose();
        if (onSuccess) onSuccess({ ...transactionPayload, isOffline: true });
        return;
      }

      const res = await api.createTransaction(transactionPayload);
      if (res && res.success) {
        handleClose();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      // If network failed, fall back to offline queue
      if (err.isNetworkError) {
        await offlineSync.addPendingTransaction(transactionPayload);
        handleClose();
        if (onSuccess) onSuccess({ ...transactionPayload, isOffline: true });
      } else {
        setError(err.message || 'Failed to save transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const isCanteenCategory = selectedCategory?.name?.toLowerCase().includes('canteen') ||
    selectedCategory?.name?.toLowerCase().includes('meal');
  const isQuickCommerceCategory = selectedCategory?.name?.toLowerCase().includes('quick') ||
    selectedCategory?.name?.toLowerCase().includes('commerce') ||
    selectedCategory?.name?.toLowerCase().includes('grocery');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Expense">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-banner" style={{ marginBottom: 'var(--space-3)' }}>
            {error}
          </div>
        )}

        {/* Big Amount Input */}
        <div className="amount-input-container">
          <span className="amount-symbol">₹</span>
          <input
            type="number"
            step="any"
            min="0.01"
            placeholder="0"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="amount-input font-mono"
            autoFocus
            required
          />
        </div>

        {/* Quick Category Chips */}
        {recentlyUsedCategoryIds.length > 0 && (
          <div className="quick-chips-row">
            <span className="text-xs text-muted">Recent:</span>
            {recentlyUsedCategoryIds.map((id) => {
              const cat = categories.find((c) => c._id === id);
              if (!cat) return null;
              return (
                <button
                  type="button"
                  key={id}
                  className={`chip ${categoryId === id ? 'chip-active' : ''}`}
                  onClick={() => setCategoryId(id)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Category Selector */}
        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.countsTowardFlexibleBudget ? '(Flexible)' : ''}
            </option>
          ))}
        </Select>

        {/* Link to Need */}
        <Select
          label="Link to Reserve Need (Optional)"
          value={needId}
          onChange={(e) => setNeedId(e.target.value)}
          helperText={
            needId
              ? 'Paid from this Need’s virtual fund. Excluded from flexible spend.'
              : 'Leave unlinked for discretionary spending.'
          }
        >
          <option value="">None (Discretionary / General Expense)</option>
          {needs.map((n) => (
            <option key={n._id} value={n._id}>
              {n.name} (Reserve: ₹{(n.monthlyReserveAmountPaise / 100).toFixed(0)}/mo)
            </option>
          ))}
        </Select>

        {/* Contextual Helpers based on Category */}
        {isCanteenCategory && (
          <div className="button-group-row">
            <span className="text-xs text-secondary">Meal:</span>
            {['Breakfast', 'Lunch', 'Dinner', 'Late Night'].map((p) => (
              <button
                type="button"
                key={p}
                className={`tag-btn ${mealPeriod === p ? 'tag-btn-active' : ''}`}
                onClick={() => setMealPeriod(mealPeriod === p ? '' : p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {isQuickCommerceCategory && (
          <div className="button-group-row">
            <span className="text-xs text-secondary">Platform:</span>
            {['Blinkit', 'Instamart', 'Zepto', 'Other'].map((s) => (
              <button
                type="button"
                key={s}
                className={`tag-btn ${source === s ? 'tag-btn-active' : ''}`}
                onClick={() => setSource(source === s ? '' : s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Expandable Optional Details */}
        <div style={{ margin: 'var(--space-2) 0' }}>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-secondary"
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            style={{ padding: '4px 0' }}
          >
            <span>{showMoreDetails ? 'Hide extra details' : '+ Add merchant, description, notes'}</span>
            {showMoreDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showMoreDetails && (
          <div className="more-details-panel">
            <Input
              label="Merchant / Shop / Canteen"
              placeholder="e.g. Canteen 2, Nescafe, Local Chemist"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />

            <Input
              label="Description / Items"
              placeholder="e.g. Bread omelette + tea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        )}

        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={handleClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={Check}
            style={{ flex: 2 }}
          >
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
