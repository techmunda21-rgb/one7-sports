import React, { useState } from 'react';
import {
  Trophy,
  Moon,
  Sun,
  Bell,
  Globe,
  WifiOff,
  User,
  Share2,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Users,
  Code2,
  Bookmark,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { SupportedLanguage } from '../types/cricket';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
    t,
    selectedLanguage,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
    isOffline,
    unreadNotificationCount,
    openModal,
    userProfile,
  } = useCricket();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: Array<{ code: SupportedLanguage; label: string; flag: string }> = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="bg-amber-600/90 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 font-medium tracking-wide">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active • Displaying cached PCL Season 2 scores & summaries</span>
        </div>
      )}

      {/* Main Top Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & League Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('live')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-sky-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-sky-300 to-white bg-clip-text text-transparent">
                  PCL Season 2
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Premier Cricket League • Live Score & Analytics
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setCurrentTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'live'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              🏏 {t('liveMatch')}
            </button>
            <button
              onClick={() => setCurrentTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'leaderboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              👑 {t('leaderboard')}
            </button>
            <button
              onClick={() => setCurrentTab('fanLounge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'fanLounge'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              💬 {t('fanLounge')}
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              ⭐ {t('dashboard')}
            </button>
            <button
              onClick={() => setCurrentTab('offline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'offline'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              📁 {t('offlineSummaries')}
            </button>
          </nav>

          {/* Action Icons: Share, Notifications, Language, Dark Mode, Profile */}
          <div className="flex items-center gap-2">
            {/* Social Share Button */}
            <button
              onClick={() => openModal('SHARE')}
              title={t('shareScorecard')}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => openModal('NOTIFICATIONS')}
              title="Push Notifications"
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all flex items-center gap-1"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="text-xs uppercase font-bold">{selectedLanguage}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                        selectedLanguage === lang.code ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.label}</span>
                      <span>{lang.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>

            {/* API Explorer Icon */}
            <button
              onClick={() => openModal('API_DOCS')}
              title={t('apiDocs')}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all hidden sm:flex"
            >
              <Code2 className="w-4 h-4 text-purple-400" />
            </button>

            {/* Profile & 2FA Status */}
            <button
              onClick={() => openModal('AUTH')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/50"
              />
              <div className="text-left hidden lg:block">
                <div className="text-[11px] font-bold text-slate-200 leading-tight flex items-center gap-1">
                  <span>{userProfile.name}</span>
                  {userProfile.twoFactorEnabled && (
                    <span title="2FA Verified">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono leading-none">
                  {userProfile.authProvider.toUpperCase()}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-[11px] font-semibold">
          <button
            onClick={() => setCurrentTab('live')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'live' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <span>🏏 Live</span>
          </button>
          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'leaderboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <span>👑 Rankings</span>
          </button>
          <button
            onClick={() => setCurrentTab('fanLounge')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'fanLounge' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <span>💬 Lounge</span>
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <span>⭐ My PCL</span>
          </button>
          <button
            onClick={() => setCurrentTab('offline')}
            className={`flex flex-col items-center gap-0.5 ${currentTab === 'offline' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <span>📁 Matches</span>
          </button>
        </div>
      </div>
    </header>
  );
};
