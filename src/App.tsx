/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { XrayProvider, useXray } from './context/XrayContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InboundsView } from './components/InboundsView';
import { ClientsView } from './components/ClientsView';
import { NodesView } from './components/NodesView';
import { SubscriptionView } from './components/SubscriptionView';
import { XrayConfigView } from './components/XrayConfigView';
import { SettingsView } from './components/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, theme } = useXray();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-[#090d16] text-slate-100'
      }`}
    >
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'inbounds' && <InboundsView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'nodes' && <NodesView />}
          {activeTab === 'subscription' && <SubscriptionView />}
          {activeTab === 'xray' && <XrayConfigView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <XrayProvider>
      <MainLayout />
    </XrayProvider>
  );
}
