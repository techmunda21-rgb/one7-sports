import React from 'react';
import { Star, Shield, Trophy, Activity, Bell, ChevronRight, TrendingUp } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

export const PersonalizedDashboard: React.FC = () => {
  const { userProfile, updateUserProfile, teams, players, playerMap, openModal } = useCricket();

  const favoriteTeam = teams.find((t) => t.id === userProfile.favoriteTeamId) || teams[0];
  const favoritePlayer = playerMap.get(userProfile.favoritePlayerId) || players[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <span>Personalized Fan Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>Welcome Back, {userProfile.name}</span>
              <Star className="w-6 h-6 text-amber-400 fill-amber-400 inline" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tracking your favorite franchise <strong className="text-emerald-400">{favoriteTeam.name}</strong> and key
              performances in PCL Season 2.
            </p>
          </div>

          {/* Quick Team / Player Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={userProfile.favoriteTeamId}
              onChange={(e) => updateUserProfile({ favoriteTeamId: e.target.value })}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  ⭐ {t.name}
                </option>
              ))}
            </select>

            <select
              value={userProfile.favoritePlayerId}
              onChange={(e) => updateUserProfile({ favoritePlayerId: e.target.value })}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  👤 {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Favorite Team Spotlight Card */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{favoriteTeam.badgeEmoji}</span>
              <div>
                <h3 className="text-lg font-black text-white">{favoriteTeam.name}</h3>
                <p className="text-xs text-slate-400">{favoriteTeam.homeGround}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Rank #{teams.indexOf(favoriteTeam) + 1}
            </span>
          </div>

          {/* Standings Numbers */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Played</div>
              <div className="font-mono text-xl font-bold text-white mt-0.5">
                {favoriteTeam.standings.played}
              </div>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Won</div>
              <div className="font-mono text-xl font-bold text-emerald-400 mt-0.5">
                {favoriteTeam.standings.won}
              </div>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Lost</div>
              <div className="font-mono text-xl font-bold text-rose-400 mt-0.5">
                {favoriteTeam.standings.lost}
              </div>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Points</div>
              <div className="font-mono text-xl font-bold text-amber-400 mt-0.5">
                {favoriteTeam.standings.points}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Net Run Rate (NRR)</span>
            <span className="font-mono font-bold text-emerald-400">{favoriteTeam.standings.netRunRate > 0 ? `+${favoriteTeam.standings.netRunRate}` : favoriteTeam.standings.netRunRate}</span>
          </div>

          {/* Key Squad Members */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-2">
              Key Starters in Playing 11
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {favoriteTeam.squadPlayerIds.slice(0, 4).map((pid) => {
                const p = playerMap.get(pid);
                return (
                  <div
                    key={pid}
                    onClick={() => openModal('PLAYER_STATS', p)}
                    className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <img src={p?.avatar} alt={p?.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="truncate">
                      <div className="font-bold text-slate-200 truncate">{p?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p?.stats.runs} Runs</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Favorite Player Spotlight Card */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={favoritePlayer.avatar}
                alt={favoritePlayer.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-400/50 shadow-md"
              />
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <span>{favoritePlayer.name}</span>
                  {favoritePlayer.isCaptain && <span className="text-[10px] text-amber-400 font-bold">(C)</span>}
                </h3>
                <p className="text-xs text-slate-400">
                  #{favoritePlayer.jerseyNumber} • {teams.find((t) => t.id === favoritePlayer.teamId)?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal('PLAYER_STATS', favoritePlayer)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
            >
              <span>View Stats</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stats Matrix */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Runs</div>
              <div className="font-mono text-xl font-bold text-emerald-400 mt-0.5">
                {favoritePlayer.stats.runs}
              </div>
              <div className="text-[10px] text-slate-500">SR: {favoritePlayer.stats.strikeRate}</div>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Wickets</div>
              <div className="font-mono text-xl font-bold text-rose-400 mt-0.5">
                {favoritePlayer.stats.wickets}
              </div>
              <div className="text-[10px] text-slate-500">Econ: {favoritePlayer.stats.bowlingEconomy || '--'}</div>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">MVP Index</div>
              <div className="font-mono text-xl font-bold text-amber-400 mt-0.5">
                {favoritePlayer.stats.mvpPoints}
              </div>
              <div className="text-[10px] text-slate-500">Ranked Top 5</div>
            </div>
          </div>

          {/* Recent Form Pill Tracker */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Recent Form in PCL Season 2</span>
            </div>
            <div className="flex items-center gap-2">
              {favoritePlayer.stats.formLast5.map((score, i) => (
                <div
                  key={i}
                  className="flex-1 py-1.5 text-center font-mono font-bold text-xs bg-slate-900 border border-slate-700/60 rounded-lg text-slate-200"
                >
                  {score}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
