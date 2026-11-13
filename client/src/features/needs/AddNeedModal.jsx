import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { api } from '../../lib/api.js';
import { rupeesToPaise, paiseToRupees } from '../../lib/formatters.js';

export function AddNeedModal({
  isOpen,
  onClose,
  categories = [],
  editingNeed = null,
  onSuccess,
}) {
  const [name, setName] = useState('');
  const [monthlyReserveRupees, setMonthlyReserveRupees] = useState('');
  const [openingBalanceRupees, setOpeningBalanceRupees] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingNeed) {
      setName(editingNeed.name || '');
      setMonthlyReserveRupees(
        editingNeed.monthlyReserveAmountPaise
          ? String(paiseToRupees(editingNeed.monthlyReserveAmountPaise))
          : ''
      );
      setOpeningBalanceRupees(
        editingNeed.openingBalancePaise
          ? String(paiseToRupees(editingNeed.openingBalancePaise))
          : '0'
      );
      setCategoryId(editingNeed.categoryId?._id || editingNeed.categoryId || '');
      setFrequency(editingNeed.frequency || 'monthly');
      setNotes(editingNeed.notes || '');
    } else {
      setName('');
      setMonthlyReserveRupees('');
      setOpeningBalanceRupees('0');
      setCategoryId('');
      setFrequency('monthly');
      setNotes('');
    }
    setError('');
  }, [editingNeed, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name for this Need');
      return;
    }

    const parsedTarget = parseFloat(monthlyReserveRupees);
    if (isNaN(parsedTarget) || parsedTarget < 0) {
      setError('Please enter a valid monthly reserve target in INR');
      return;
    }

    const parsedOpening = parseFloat(openingBalanceRupees) || 0;

    const payload = {
      name: name.trim(),
      monthlyReserveAmountPaise: rupeesToPaise(parsedTarget),
      openingBalancePaise: rupeesToPaise(parsedOpening),
      categoryId: categoryId || null,
      frequency,
      notes: notes.trim(),
    };

    try {
      setLoading(true);
      let res;
      if (editingNeed) {
        res = await api.updateNeed(editingNeed._id, payload);
      } else {
        res = await api.createNeed(payload);
      }
      if (res && res.success) {
        onClose();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to save Need');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingNeed ? 'Edit Reserve Need' : 'Create Reserve Need'}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-banner" style={{ marginBottom: 'var(--space-3)' }}>
            {error}
          </div>
        )}

        <Input
          label="Need Name"
          placeholder="e.g. Laundry, Haircut, Transport, Phone Recharge"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Monthly Reserve Target (INR)"
          type="number"
          step="any"
          min="0"
          placeholder="e.g. 1500"
          prefix="₹"
          value={monthlyReserveRupees}
          onChange={(e) => setMonthlyReserveRupees(e.target.value)}
          helperText="The explicit amount you want to set aside every month for this need."
          required
        />

        {!editingNeed && (
          <Input
            label="Opening Virtual Balance (Optional)"
            type="number"
            step="any"
            placeholder="0"
            prefix="₹"
            value={openingBalanceRupees}
            onChange={(e) => setOpeningBalanceRupees(e.target.value)}
            helperText="Starting balance already set aside in your tracker fund."
          />
        )}

        <Select
          label="Category (Optional)"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">None / General</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="Obligation Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
          <option value="irregular">Irregular / Ad-hoc</option>
        </Select>

        <Input
          label="Notes (Optional)"
          placeholder="e.g. 3 loads per week, ₹120 each"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} style={{ flex: 2 }}>
            {editingNeed ? 'Save Changes' : 'Create Need'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
