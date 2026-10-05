import React, { useState } from 'react';
import { X, AlertTriangle, UserCheck } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

export const WicketModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    recordWicket,
    currentStrikerId,
    batters,
    bowlingTeam,
    playerMap,
  } = useCricket();

  const [wicketType, setWicketType] = useState<
    'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket'
  >('caught');
  const [fielderId, setFielderId] = useState<string>('');
  const [nextBatsmanId, setNextBatsmanId] = useState<string>('');

  if (activeModal !== 'WICKET') return null;

  const currentStriker = playerMap.get(currentStrikerId);
  const yetToBatList = batters.filter(
    (b) => b.status === 'yet_to_bat' && b.playerId !== currentStrikerId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordWicket(
      wicketType,
      ['caught', 'run_out', 'stumped'].includes(wicketType) ? fielderId : undefined,
      nextBatsmanId || undefined
    );
    closeModal();
  };

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
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Record Wicket</h2>
            <p className="text-xs text-slate-400">
              Dismissed: <strong className="text-rose-400">{currentStriker?.name}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dismissal Method */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Dismissal Type
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { type: 'bowled', label: 'Bowled' },
                { type: 'caught', label: 'Caught' },
                { type: 'lbw', label: 'LBW' },
                { type: 'run_out', label: 'Run Out' },
                { type: 'stumped', label: 'Stumped' },
                { type: 'hit_wicket', label: 'Hit Wicket' },
              ].map(({ type, label }) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setWicketType(type as any)}
                  className={`py-2 px-2 rounded-xl font-bold border transition-all text-center ${
                    wicketType === type
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fielder Selection (if caught, run out, stumped) */}
          {['caught', 'run_out', 'stumped'].includes(wicketType) && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {wicketType === 'stumped' ? 'Wicket Keeper' : 'Fielder Involved'}
              </label>
              <select
                value={fielderId}
                onChange={(e) => setFielderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select fielder from {bowlingTeam.shortName}...</option>
                {bowlingTeam.squadPlayerIds.map((pid) => {
                  const p = playerMap.get(pid);
                  return (
                    <option key={pid} value={pid}>
                      {p?.name} (#{p?.jerseyNumber})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Next Incoming Batsman */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Next Incoming Batsman</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {yetToBatList.length} batters remaining
              </span>
            </label>
            {yetToBatList.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-amber-400">
                All 10 wickets fallen. Team will be bowled out!
              </div>
            ) : (
              <select
                value={nextBatsmanId}
                onChange={(e) => setNextBatsmanId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Default: Next in batting order ({playerMap.get(yetToBatList[0].playerId)?.name})</option>
                {yetToBatList.map((b) => {
                  const p = playerMap.get(b.playerId);
                  return (
                    <option key={b.playerId} value={b.playerId}>
                      #{b.battingPosition} - {p?.name} ({p?.role.replace('_', ' ')})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Confirm Dismissal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
