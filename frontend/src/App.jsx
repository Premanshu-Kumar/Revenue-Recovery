import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { AIAssistantModal } from './components/layout/AIAssistantModal';
import { SimulationModal } from './components/layout/SimulationModal';
import { Navbar, DarkHeroSection } from './components/hero/DarkHeroSection';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { AIAgentWorkspacePage } from './pages/AIAgentWorkspacePage';
import { CustomersPage } from './pages/CustomersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReceivablesPage } from './pages/ReceivablesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';

import { api } from './api/client';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: 'cfo',
    name: 'Premanshu Kumar',
    role: 'CFO • Razorpay FinTech',
    email: 'cfo@recoverai.demo',
    avatar: 'PK',
  });
  const [currentView, setCurrentView] = useState('landing'); // Default to 1st page ('landing')
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [postLoginRedirect, setPostLoginRedirect] = useState('overview');

  const handleSelectCase = (caseId) => {
    setSelectedCaseId(caseId);
    setCurrentView('agent');
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset RecoverAI to the canonical demo dataset (1,000 cases including ABC Technologies)?')) {
      setIsResetting(true);
      try {
        await api.resetDemo();
        setRefreshKey((k) => k + 1);
        setCurrentView('overview');
      } catch (e) {
        console.error(e);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleNavigateFromLanding = (targetView) => {
    if (targetView === 'landing') {
      setCurrentView('landing');
      return;
    }
    if (targetView === 'login' || targetView === 'identity') {
      setPostLoginRedirect('overview');
      setCurrentView('login');
      return;
    }
    if (!isAuthenticated) {
      setPostLoginRedirect(targetView);
      setCurrentView('login');
    } else {
      setCurrentView(targetView);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView(postLoginRedirect || 'overview');
    setPostLoginRedirect('overview');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPostLoginRedirect('overview');
    setCurrentView('login');
  };

  // 1. First Appearance: Launch Executive Platform (Hero Section)
  if (currentView === 'landing') {
    return (
      <div className="text-slate-800 min-h-screen font-['Manrope'] select-none">
        <Navbar
          onToggleView={handleNavigateFromLanding}
          currentView={currentView}
          onOpenLogin={() => {
            setPostLoginRedirect('overview');
            setCurrentView('login');
          }}
          isAuthenticated={isAuthenticated}
        />
        <DarkHeroSection
          onOpenApp={() => handleNavigateFromLanding('overview')}
          onNavigateState={handleNavigateFromLanding}
          isAuthenticated={isAuthenticated}
        />
      </div>
    );
  }

  // 2. Second View: Executive Login Page
  if (currentView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // Guard: If not authenticated, ensure user logs in before accessing main platform
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div
      className="flex text-slate-800 min-h-screen font-['Manrope'] selection:bg-blue-100 selection:text-blue-900"
      style={{
        background: 'radial-gradient(120% 120% at 50% -10%, #ffffff 0%, #f4f6fb 40%, #e8edf5 100%)'
      }}
    >
      {/* Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
        pendingApprovalsCount={3}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Soft daylight decorative atmospheric background glows for glass refraction */}
        <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-200/25 rounded-full blur-[140px] pointer-events-none -z-0" />
        <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none -z-0" />
        <div className="fixed top-1/3 left-1/3 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[150px] pointer-events-none -z-0" />

        <TopNav
          currentUser={currentUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenSimulation={() => setIsSimulationOpen(true)}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          onLogout={handleLogout}
          onNavigate={setCurrentView}
        />

        <main className="flex-1 overflow-y-auto bg-transparent relative z-10" key={refreshKey}>
          {currentView === 'overview' && (
            <DashboardPage
              onSelectCase={handleSelectCase}
              onNavigate={setCurrentView}
            />
          )}

          {(currentView === 'opportunities' || currentView === 'cases') && (
            <OpportunitiesPage onSelectCase={handleSelectCase} />
          )}

          {currentView === 'agent' && (
            <AIAgentWorkspacePage
              selectedCaseId={selectedCaseId}
              onCaseChange={setSelectedCaseId}
            />
          )}

          {currentView === 'customers' && (
            <CustomersPage
              onSelectCustomer={() => {}}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentView === 'payments' && (
            <PaymentsPage onSelectCase={handleSelectCase} />
          )}

          {currentView === 'receivables' && (
            <ReceivablesPage onSelectCase={handleSelectCase} />
          )}

          {currentView === 'campaigns' && (
            <CampaignsPage />
          )}

          {currentView === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentView === 'audit' && (
            <AuditTrailPage onSelectCase={handleSelectCase} />
          )}

          {currentView === 'integrations' && (
            <IntegrationsPage />
          )}

          {currentView === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Modals & Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={handleSelectCase}
      />

      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onSelectCase={handleSelectCase}
      />

      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onSimulationComplete={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
