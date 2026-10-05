import React, { useState, useMemo } from 'react';
import { Trophy, Award, Flame, Zap, Shield, Search, Filter } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { Player } from '../types/cricket';

export const LeaderboardView: React.FC = () => {
  const { players, teams, openModal, t } = useCricket();

  const [activeCategory, setActiveCategory] = useState<'orange' | 'purple' | 'mvp' | 'sixes' | 'strikeRate'>('orange');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorted list based on active category
  const rankedPlayers = useMemo(() => {
    let list = [...players];

    // Filter by team
    if (selectedTeamFilter !== 'all') {
      list = list.filter((p) => p.teamId === selectedTeamFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q));
    }

    // Sorting
    switch (activeCategory) {
      case 'orange':
        return list.sort((a, b) => b.stats.runs - a.stats.runs);
      case 'purple':
        return list.sort((a, b) => b.stats.wickets - a.stats.wickets || a.stats.bowlingEconomy - b.stats.bowlingEconomy);
      case 'mvp':
        return list.sort((a, b) => b.stats.mvpPoints - a.stats.mvpPoints);
      case 'sixes':
        return list.sort((a, b) => b.stats.sixes - a.stats.sixes);
      case 'strikeRate':
        return list
          .filter((p) => p.stats.runs > 50)
          .sort((a, b) => b.stats.strikeRate - a.stats.strikeRate);
      default:
        return list;
    }
  }, [players, activeCategory, selectedTeamFilter, searchQuery]);

  const topPlayer = rankedPlayers[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <span>PCL Season 2 Official Leaderboards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>Player Rankings & Honors</span>
              <Trophy className="w-6 h-6 text-amber-400 inline" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live statistics and rankings updated after every ball and match in the Premier Cricket League.
            </p>
          </div>

          {/* Quick Search & Team Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
              />
            </div>

            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tab Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveCategory('orange')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'orange'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🧢</span>
            <span>Orange Cap (Top Batsman)</span>
          </button>

          <button
            onClick={() => setActiveCategory('purple')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'purple'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🟣</span>
            <span>Purple Cap (Top Bowler)</span>
          </button>

          <button
            onClick={() => setActiveCategory('mvp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'mvp'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>MVP Index</span>
          </button>

          <button
            onClick={() => setActiveCategory('sixes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'sixes'
                ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Maximum Sixes</span>
          </button>

          <button
            onClick={() => setActiveCategory('strikeRate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'strikeRate'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Highest Strike Rate</span>
          </button>
        </div>
      </div>

      {/* Top Cap Spotlight Feature */}
      {topPlayer && (
        <div
          onClick={() => openModal('PLAYER_STATS', topPlayer)}
          className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 rounded-2xl p-5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-amber-400 transition-all shadow-lg group"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={topPlayer.avatar}
                alt={topPlayer.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
              />
              <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg">
                1
              </span>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>Current Leader</span>
                <span>•</span>
                <span>PCL Season 2 Spotlight</span>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                {topPlayer.name}
              </h3>
              <p className="text-xs text-slate-400">
                {teams.find((t) => t.id === topPlayer.teamId)?.name} • #{topPlayer.jerseyNumber}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-6">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {activeCategory === 'orange'
                  ? 'Total Runs'
                  : activeCategory === 'purple'
                  ? 'Total Wickets'
                  : activeCategory === 'mvp'
                  ? 'MVP Points'
                  : activeCategory === 'sixes'
                  ? 'Total Sixes'
                  : 'Strike Rate'}
              </div>
              <div className="text-3xl font-mono font-black text-amber-400">
                {activeCategory === 'orange'
                  ? topPlayer.stats.runs
                  : activeCategory === 'purple'
                  ? topPlayer.stats.wickets
                  : activeCategory === 'mvp'
                  ? topPlayer.stats.mvpPoints
                  : activeCategory === 'sixes'
                  ? topPlayer.stats.sixes
                  : topPlayer.stats.strikeRate}
              </div>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">Click for details →</div>
          </div>
        </div>
      )}

      {/* Main Table Rankings */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4 text-center">Mat</th>
                <th className="py-3 px-4 text-right">Runs</th>
                <th className="py-3 px-4 text-right">HS</th>
                <th className="py-3 px-4 text-right">Avg</th>
                <th className="py-3 px-4 text-right">SR</th>
                <th className="py-3 px-4 text-right">Wkts</th>
                <th className="py-3 px-4 text-right">Econ</th>
                <th className="py-3 px-4 text-right">6s</th>
                <th className="py-3 px-4 text-right font-black">MVP Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rankedPlayers.map((p, idx) => {
                const team = teams.find((t) => t.id === p.teamId);
                const isLeader = idx === 0;

                return (
                  <tr
                    key={p.id}
                    onClick={() => openModal('PLAYER_STATS', p)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {isLeader ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-400">{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.isCaptain && <span className="text-[9px] text-amber-400 font-bold">(C)</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">{p.role.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {team?.badgeEmoji} {team?.shortName}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-400">{p.stats.matches}</td>

                    <td className={`py-3 px-4 text-right font-mono font-bold ${activeCategory === 'orange' ? 'text-amber-400 font-black' : 'text-slate-200'}`}>
                      {p.stats.runs}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {p.stats.highestScore}
                      {p.stats.highestScoreNotOut && '*'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-300">{p.stats.average}</td>

                    <td className={`py-3 px-4 text-right font-mono font-bold ${activeCategory === 'strikeRate' ? 'text-rose-400 font-black' : 'text-sky-400'}`}>
                      {p.stats.strikeRate}
                    </td>

                    <td className={`py-3 px-4 text-right font-mono font-bold ${activeCategory === 'purple' ? 'text-purple-400 font-black' : 'text-slate-300'}`}>
                      {p.stats.wickets}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {p.stats.bowlingEconomy > 0 ? p.stats.bowlingEconomy : '--'}
                    </td>

                    <td className={`py-3 px-4 text-right font-mono font-bold ${activeCategory === 'sixes' ? 'text-sky-400 font-black' : 'text-slate-300'}`}>
                      {p.stats.sixes}
                    </td>

                    <td className={`py-3 px-4 text-right font-mono font-black ${activeCategory === 'mvp' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {p.stats.mvpPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
