import React from 'react';
import { X, WifiOff, Download, Upload, CheckCircle2, Trophy, Calendar, MapPin } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { downloadFile } from '../utils/exportUtils';

export const OfflineSummariesModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    recentMatches,
    isOffline,
    match,
    totalRuns,
    totalWickets,
    oversCompleted,
    ballsInCurrentOver,
    batters,
    bowlers,
    teams,
  } = useCricket();

  if (activeModal !== 'OFFLINE_SUMMARIES') return null;

  const handleExportFullJSON = () => {
    const backupData = {
      app: 'PCL Season 2 Official Backup',
      exportDate: new Date().toISOString(),
      currentLiveMatch: {
        match,
        score: { totalRuns, totalWickets, overs: `${oversCompleted}.${ballsInCurrentOver}` },
        batters,
        bowlers,
      },
      completedMatches: recentMatches,
      teams,
    };
    downloadFile(
      JSON.stringify(backupData, null, 2),
      `PCL_Season2_Complete_Backup_${Date.now()}.json`,
      'application/json'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Offline Match Summaries & Data Backup</h2>
            <p className="text-xs text-slate-400">
              Cached locally for offline stadiums and flight mode access
            </p>
          </div>
        </div>

        {/* Status banner */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}
            />
            <span className="font-semibold text-slate-300">
              Storage Engine: IndexedDB & LocalStorage (3 Cached Matches)
            </span>
          </div>
          <button
            onClick={handleExportFullJSON}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Backup</span>
          </button>
        </div>

        {/* Summaries list */}
        <div className="space-y-3">
          {recentMatches.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Match {m.matchNumber}</span>
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{m.date}</span>
                </span>
              </div>

              <h3 className="font-bold text-base text-white mb-1">{m.teams}</h3>

              <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-3 my-2">
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-md">
                  {m.teamAScore}
                </span>
                <span className="text-slate-500">vs</span>
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-md">
                  {m.teamBScore}
                </span>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-amber-300 font-semibold mb-2">
                🏆 {m.result}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  Player of the Match: <strong className="text-slate-200">{m.playerOfTheMatch}</strong>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{m.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
