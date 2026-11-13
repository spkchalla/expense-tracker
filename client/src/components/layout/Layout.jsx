import React from 'react';
import { Navbar } from './Navbar.jsx';
import { BottomNav } from './BottomNav.jsx';
import { OfflineBanner } from './OfflineBanner.jsx';
import './Layout.css';

export function Layout({
  children,
  currentTab,
  onNavigate,
  onOpenQuickAdd,
  offlineSync,
}) {
  return (
    <div className="layout-root">
      <Navbar
        currentTab={currentTab}
        onNavigate={onNavigate}
        offlineSync={offlineSync}
      />
      <OfflineBanner offlineSync={offlineSync} />
      <main className="layout-main page-container">{children}</main>
      <BottomNav
        currentTab={currentTab}
        onNavigate={onNavigate}
        onOpenQuickAdd={onOpenQuickAdd}
      />
    </div>
  );
}
