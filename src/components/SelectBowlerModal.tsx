import React from 'react';
import { X, Target } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { formatOvers } from '../utils/cricketCalculations';

export const SelectBowlerModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    changeBowler,
    currentBowlerId,
    bowlingTeam,
    bowlers,
    playerMap,
  } = useCricket();

  if (activeModal !== 'SELECT_BOWLER') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Select Next Bowler</h2>
            <p className="text-xs text-slate-400">
              Bowling Attack for <strong className="text-sky-400">{bowlingTeam.name}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {bowlingTeam.squadPlayerIds.map((pid) => {
            const p = playerMap.get(pid);
            const figures = bowlers[pid];
            const isCurrent = pid === currentBowlerId;
            const oversText = figures ? formatOvers(figures.overs, figures.ballsInCurrentOver) : '0.0';
            const wickets = figures?.wickets || 0;
            const runs = figures?.runsConceded || 0;
            const econ = figures?.economy || 0;

            return (
              <div
                key={pid}
                onClick={() => {
                  changeBowler(pid);
                  closeModal();
                }}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 ring-1 ring-sky-500/50'
                    : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/80 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p?.avatar}
                    alt={p?.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <span>{p?.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-sky-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                          BOWLED LAST
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{p?.bowlingStyle}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-rose-400">
                    {wickets}/{runs}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {oversText} ov • {econ} econ
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
