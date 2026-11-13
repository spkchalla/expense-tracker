import React from 'react';
import { LayoutDashboard, ShieldCheck, Plus, History, BarChart3 } from 'lucide-react';
import './Layout.css';

export function BottomNav({ currentTab, onNavigate, onOpenQuickAdd }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <button
          className={`bottom-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
          aria-label="Dashboard"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          className={`bottom-nav-item ${currentTab === 'needs' ? 'active' : ''}`}
          onClick={() => onNavigate('needs')}
          aria-label="Needs Planner"
        >
          <ShieldCheck size={20} />
          <span>Needs</span>
        </button>

        <div className="bottom-nav-add-wrapper">
          <button
            className="bottom-nav-add-btn"
            onClick={onOpenQuickAdd}
            aria-label="Add Expense"
          >
            <Plus size={24} />
          </button>
        </div>

        <button
          className={`bottom-nav-item ${currentTab === 'transactions' ? 'active' : ''}`}
          onClick={() => onNavigate('transactions')}
          aria-label="Transactions"
        >
          <History size={20} />
          <span>History</span>
        </button>

        <button
          className={`bottom-nav-item ${currentTab === 'reports' ? 'active' : ''}`}
          onClick={() => onNavigate('reports')}
          aria-label="Reports"
        >
          <BarChart3 size={20} />
          <span>Reports</span>
        </button>
      </div>
    </nav>
  );
}
