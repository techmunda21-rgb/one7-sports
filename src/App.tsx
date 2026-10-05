import React, { useState } from 'react';
import { CricketProvider, useCricket } from './context/CricketContext';
import { Header } from './components/Header';
import { LiveMatchCalculator } from './components/LiveMatchCalculator';
import { LeaderboardView } from './components/LeaderboardView';
import { FanLounge } from './components/FanLounge';
import { PersonalizedDashboard } from './components/PersonalizedDashboard';
import { OfflineSummariesModal } from './components/OfflineSummariesModal';
import { WicketModal } from './components/WicketModal';
import { SelectBowlerModal } from './components/SelectBowlerModal';
import { Playing11Modal } from './components/Playing11Modal';
import { PlayerStatsModal } from './components/PlayerStatsModal';
import { SocialShareModal } from './components/SocialShareModal';
import { AuthModal } from './components/AuthModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { Trophy, ShieldCheck, WifiOff, Bell, Share2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('live');
  const { match, totalRuns, totalWickets, oversCompleted, ballsInCurrentOver, isOffline, openModal } = useCricket();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'live' && <LiveMatchCalculator />}
        {currentTab === 'leaderboard' && <LeaderboardView />}
        {currentTab === 'fanLounge' && <FanLounge />}
        {currentTab === 'dashboard' && <PersonalizedDashboard />}
        {currentTab === 'offline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Cached Match Summaries</h2>
                <p className="text-xs text-slate-400">Offline access for PCL Season 2 fixtures and scorecards</p>
              </div>
              <button
                onClick={() => openModal('OFFLINE_SUMMARIES')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Open Full Archive
              </button>
            </div>
            {/* Direct Trigger */}
            <OfflineSummariesModal />
          </div>
        )}
      </main>

      {/* Persistent Stadium Mini Ticker / Status Bar */}
      <footer className="sticky bottom-0 z-30 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-400">{totalRuns}/{totalWickets}</span>
              <span className="text-slate-400 font-normal">({oversCompleted}.{ballsInCurrentOver} ov)</span>
            </div>
            <span className="text-slate-400 hidden sm:inline">• PCL Season 2 • Match {match.matchNumber}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="hidden md:flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>E2EE 2FA Secure</span>
            </span>
            <button
              onClick={() => openModal('SHARE')}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => openModal('NOTIFICATIONS')}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <WicketModal />
      <SelectBowlerModal />
      <Playing11Modal />
      <PlayerStatsModal />
      <SocialShareModal />
      <AuthModal />
      <OfflineSummariesModal />
      <NotificationCenterModal />
      <ApiDocsModal />
    </div>
  );
};

export default function App() {
  return (
    <CricketProvider>
      <MainContent />
    </CricketProvider>
  );
}
