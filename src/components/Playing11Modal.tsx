import React, { useState } from 'react';
import { X, Users, Award, Shield, User } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

export const Playing11Modal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    battingTeam,
    bowlingTeam,
    batters,
    bowlers,
    playerMap,
    openModal,
  } = useCricket();

  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting');

  if (activeModal !== 'PLAYING_11') return null;

  const currentSelectedTeam = activeTab === 'batting' ? battingTeam : bowlingTeam;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Official Playing XI Lineups</h2>
            <p className="text-xs text-slate-400">PCL Season 2 • Match Rosters & Batting Order</p>
          </div>
        </div>

        {/* Tab switch between Batting Team and Bowling Team */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('batting')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'batting'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{battingTeam.badgeEmoji}</span>
            <span>{battingTeam.name} (Batting)</span>
          </button>
          <button
            onClick={() => setActiveTab('bowling')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'bowling'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{bowlingTeam.badgeEmoji}</span>
            <span>{bowlingTeam.name} (Bowling)</span>
          </button>
        </div>

        {/* Playing 11 Players List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {currentSelectedTeam.squadPlayerIds.map((pid, idx) => {
            const p = playerMap.get(pid);
            if (!p) return null;

            const isCaptain = p.isCaptain;
            const isKeeper = p.isKeeper;

            return (
              <div
                key={pid}
                onClick={() => openModal('PLAYER_STATS', p)}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-slate-500 text-xs">
                    {idx + 1}
                  </span>
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-emerald-400 transition-all"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isCaptain && (
                        <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                          CAPTAIN
                        </span>
                      )}
                      {isKeeper && (
                        <span className="text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded">
                          WK
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="capitalize">{p.role.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{p.battingHand}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {p.stats.runs} Runs <span className="text-slate-500">|</span> {p.stats.wickets} Wkts
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    SR: {p.stats.strikeRate} • Avg: {p.stats.average}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Click any player to inspect career analytics & wagon wheel</span>
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
