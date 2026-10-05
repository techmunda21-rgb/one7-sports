import React, { useState } from 'react';
import {
  RotateCcw,
  Repeat,
  Shield,
  Zap,
  TrendingUp,
  Activity,
  Flame,
  Award,
  ChevronRight,
  Info,
  Layers,
  ArrowRightLeft,
  FileSpreadsheet,
  Save,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { formatOvers } from '../utils/cricketCalculations';
import { generateScorecardCSV, downloadFile } from '../utils/exportUtils';

export const LiveMatchCalculator: React.FC = () => {
  const {
    t,
    match,
    battingTeam,
    bowlingTeam,
    batters,
    bowlers,
    currentStrikerId,
    currentNonStrikerId,
    currentBowlerId,
    totalRuns,
    totalWickets,
    oversCompleted,
    ballsInCurrentOver,
    crr,
    rrr,
    projectedScores,
    winProbability,
    ballHistory,
    thisOverSummary,
    fallOfWickets,
    playerMap,
    recordBall,
    undoLastBall,
    rotateStrike,
    openModal,
    saveMatchSummaryOffline,
    switchInnings,
  } = useCricket();

  const [extraCustomOpen, setExtraCustomOpen] = useState(false);
  const [selectedExtraType, setSelectedExtraType] = useState<'wide' | 'no_ball' | 'bye' | 'leg_bye'>('wide');
  const [extraRunsInput, setExtraRunsInput] = useState<number>(1);

  const striker = playerMap.get(currentStrikerId);
  const nonStriker = playerMap.get(currentNonStrikerId);
  const bowler = playerMap.get(currentBowlerId);

  const strikerLive = batters.find((b) => b.playerId === currentStrikerId);
  const nonStrikerLive = batters.find((b) => b.playerId === currentNonStrikerId);
  const bowlerLive = bowlers[currentBowlerId];

  const handleExtraSubmit = () => {
    recordBall(0, selectedExtraType, extraRunsInput);
    setExtraCustomOpen(false);
  };

  const handleExportCSV = () => {
    const csvData = generateScorecardCSV(
      match,
      battingTeam,
      bowlingTeam,
      batters,
      bowlers,
      Array.from(playerMap.values())
    );
    downloadFile(csvData, `PCL2_${battingTeam.shortName}_vs_${bowlingTeam.shortName}_Scorecard.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Match Banner & Venue Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle Pitch Grass glow accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-500" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <span>{match.tournament}</span>
              <span>•</span>
              <span>Match {match.matchNumber}</span>
              <span>•</span>
              <span className="text-slate-400">{match.venue}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>{battingTeam.badgeEmoji} {battingTeam.name}</span>
              <span className="text-slate-500 font-normal text-sm">vs</span>
              <span>{bowlingTeam.badgeEmoji} {bowlingTeam.name}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Toss: <strong className="text-slate-300">{battingTeam.name}</strong> won toss and chose to bat first
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openModal('PLAYING_11')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Full Playing XI</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
              title="Export Scorecard as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={saveMatchSummaryOffline}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
              title="Cache current match state offline"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Offline</span>
            </button>
          </div>
        </div>

        {/* Big Stadium Live Score Display */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-950/70 p-4 sm:p-6 rounded-xl border border-slate-800/80">
          {/* Main Score Column */}
          <div className="lg:col-span-5 flex items-baseline gap-3">
            <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white">
              {totalRuns}
              <span className="text-rose-500">/{totalWickets}</span>
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-300">
                ({formatOvers(oversCompleted, ballsInCurrentOver)} / {match.totalOvers} ov)
              </span>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                {battingTeam.shortName} Innings {match.innings}
              </span>
            </div>
          </div>

          {/* Rates & Target Column */}
          <div className="lg:col-span-4 flex items-center gap-6 sm:gap-8 text-xs border-y lg:border-y-0 lg:border-x border-slate-800 py-3 lg:py-0 lg:px-6">
            <div>
              <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                {t('crr')} (Run Rate)
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400">{crr.toFixed(2)}</div>
            </div>

            {match.innings === 2 && match.targetRuns && (
              <>
                <div>
                  <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    {t('rrr')} (Required)
                  </div>
                  <div className="text-xl font-mono font-bold text-amber-400">{rrr?.toFixed(2) || '--'}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Target</div>
                  <div className="text-xl font-mono font-bold text-white">{match.targetRuns}</div>
                </div>
              </>
            )}

            {match.innings === 1 && (
              <div>
                <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  Projected (at CRR)
                </div>
                <div className="text-xl font-mono font-bold text-sky-400">{projectedScores.currentRR}</div>
              </div>
            )}
          </div>

          {/* Live Win Predictor Column */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-sky-400">{battingTeam.shortName} {winProbability.teamBattingProb}%</span>
              <span className="text-slate-400 text-[10px]">Win Predictor</span>
              <span className="text-rose-400">{winProbability.teamBowlingProb}% {bowlingTeam.shortName}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${winProbability.teamBattingProb}%` }}
              />
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                style={{ width: `${winProbability.teamBowlingProb}%` }}
              />
            </div>
          </div>
        </div>

        {/* Target summary banner in 2nd innings */}
        {match.innings === 2 && match.targetRuns && (
          <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
            <span className="font-semibold">
              🎯 {battingTeam.name} need {Math.max(0, match.targetRuns - totalRuns)} runs in{' '}
              {Math.max(0, match.totalOvers * 6 - (oversCompleted * 6 + ballsInCurrentOver))} balls to win.
            </span>
          </div>
        )}
      </div>

      {/* Grid: Active Batters, Current Bowler & This Over Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Batting Pair (Striker & Non-Striker) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">
                  Active Batting Pair
                </span>
                <span className="text-slate-500 text-xs">({battingTeam.shortName})</span>
              </div>
              <button
                onClick={rotateStrike}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
                title="Swap Strike between batters"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('rotateStrike')}</span>
              </button>
            </div>

            {/* Striker Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border-2 border-emerald-500/40 relative overflow-hidden mb-3">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wider">
                  ON STRIKE *
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => openModal('PLAYER_STATS', striker)}
                >
                  <img
                    src={striker?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={striker?.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-400/50 group-hover:ring-emerald-400 transition-all"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span>{striker?.name}</span>
                      {striker?.isCaptain && <span className="text-[10px] text-amber-400 font-bold">(C)</span>}
                    </h3>
                    <p className="text-xs text-slate-400">
                      #{striker?.jerseyNumber} • {striker?.battingHand}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-white">
                    {strikerLive?.runs || 0}{' '}
                    <span className="text-sm font-normal text-slate-400">({strikerLive?.balls || 0})</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    4s: <strong className="text-slate-200">{strikerLive?.fours || 0}</strong> • 6s:{' '}
                    <strong className="text-slate-200">{strikerLive?.sixes || 0}</strong> • SR:{' '}
                    <strong className="text-emerald-400">{strikerLive?.strikeRate || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => openModal('PLAYER_STATS', striker)}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>View Wagon Wheel & Season Stats</span>
                </button>
                <span className="text-[11px] text-slate-500 font-medium">Click to inspect</span>
              </div>
            </div>

            {/* Non-Striker Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 relative">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => openModal('PLAYER_STATS', nonStriker)}
                >
                  <img
                    src={nonStriker?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={nonStriker?.name}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-sky-400 transition-all"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                      <span>{nonStriker?.name}</span>
                      {nonStriker?.isKeeper && <span className="text-[10px] text-sky-400 font-bold">(WK)</span>}
                    </h3>
                    <p className="text-xs text-slate-400">
                      #{nonStriker?.jerseyNumber} • {nonStriker?.battingHand}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-slate-200">
                    {nonStrikerLive?.runs || 0}{' '}
                    <span className="text-sm font-normal text-slate-500">({nonStrikerLive?.balls || 0})</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    4s: <strong className="text-slate-300">{nonStrikerLive?.fours || 0}</strong> • 6s:{' '}
                    <strong className="text-slate-300">{nonStrikerLive?.sixes || 0}</strong> • SR:{' '}
                    <strong className="text-slate-300">{nonStrikerLive?.strikeRate || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Batting Order Overview (Dismissed / Yet to bat) */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-3 flex items-center justify-between">
              <span>Playing XI Batting Lineup</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {totalWickets} wickets down • {11 - totalWickets} wickets in hand
              </span>
            </h3>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {batters.map((b) => {
                const p = playerMap.get(b.playerId);
                const isOut = b.status === 'dismissed';
                const isCurrent = b.status === 'striker' || b.status === 'non_striker';

                return (
                  <div
                    key={b.playerId}
                    onClick={() => openModal('PLAYER_STATS', p)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : isOut
                        ? 'bg-slate-950/40 text-slate-500 line-through'
                        : 'bg-slate-950/20 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-slate-500 font-mono text-[11px]">{b.battingPosition}.</span>
                      <span className="font-semibold">{p?.name || b.playerId}</span>
                      {b.status === 'striker' && (
                        <span className="text-[9px] font-bold text-emerald-400 px-1 py-0.2 bg-emerald-500/20 rounded">
                          STRIKE
                        </span>
                      )}
                    </div>

                    <div className="text-right font-mono">
                      {isOut ? (
                        <span className="text-rose-400 text-[11px] no-underline">
                          {b.dismissal?.description || 'OUT'} - {b.runs} ({b.balls})
                        </span>
                      ) : isCurrent ? (
                        <span className="font-bold text-white">
                          {b.runs}* ({b.balls})
                        </span>
                      ) : (
                        <span className="text-slate-500">Yet to bat</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bowler Details, Scorer Control Pad & Over Timeline */}
        <div className="lg:col-span-5 space-y-4">
          {/* Current Bowler Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs uppercase tracking-wider font-extrabold text-rose-400">
                {t('bowler')}
              </span>
              <button
                onClick={() => openModal('SELECT_BOWLER')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <span>Change Bowler</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => openModal('PLAYER_STATS', bowler)}
              >
                <img
                  src={bowler?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                  alt={bowler?.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500/50 group-hover:ring-rose-400 transition-all"
                />
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                    {bowler?.name}
                  </h3>
                  <p className="text-xs text-slate-400">{bowler?.bowlingStyle}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-2xl font-black text-rose-400">
                  {bowlerLive?.wickets || 0}
                  <span className="text-base text-slate-300">
                    /{bowlerLive?.runsConceded || 0}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Overs:{' '}
                  <strong className="text-slate-200">
                    {formatOvers(bowlerLive?.overs || 0, bowlerLive?.ballsInCurrentOver || 0)}
                  </strong>{' '}
                  • Econ: <strong className="text-rose-400">{bowlerLive?.economy || 0}</strong>
                </div>
              </div>
            </div>

            {/* This Over Timeline Display */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{t('thisOver')}</span>
                <span className="font-mono text-slate-400">
                  {ballsInCurrentOver}/6 legal deliveries
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 min-h-[48px] overflow-x-auto">
                {thisOverSummary.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Beginning of new over...</span>
                ) : (
                  thisOverSummary.map((ball, i) => {
                    const isWicket = ball === 'W';
                    const isSix = ball === '6';
                    const isFour = ball === '4';
                    const isDot = ball === '0';
                    const isExtra = ball.includes('WD') || ball.includes('NB') || ball.includes('B');

                    return (
                      <span
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-md transition-all ${
                          isWicket
                            ? 'bg-rose-500 text-white animate-pulse'
                            : isSix
                            ? 'bg-purple-600 text-white'
                            : isFour
                            ? 'bg-sky-500 text-slate-950'
                            : isDot
                            ? 'bg-slate-800 text-slate-400'
                            : isExtra
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {ball}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Scorer Ball-by-Ball Control Keypad */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase tracking-wider font-extrabold text-white">
                  {t('ballOutcome')}
                </span>
              </div>
              <button
                onClick={undoLastBall}
                disabled={ballHistory.length === 0}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1 border border-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Revert previous delivery"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('undo')}</span>
              </button>
            </div>

            {/* Quick Scoring Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => recordBall(0)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-base hover:scale-105 active:scale-95 transition-all border border-slate-700/80 shadow-md"
              >
                0 <span className="text-[10px] block font-sans text-slate-400 font-normal">Dot</span>
              </button>
              <button
                onClick={() => recordBall(1)}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
              >
                1 <span className="text-[10px] block font-sans text-emerald-200 font-normal">Single</span>
              </button>
              <button
                onClick={() => recordBall(2)}
                className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                2 <span className="text-[10px] block font-sans text-emerald-200 font-normal">Two</span>
              </button>
              <button
                onClick={() => recordBall(3)}
                className="p-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-mono font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                3 <span className="text-[10px] block font-sans text-emerald-200 font-normal">Three</span>
              </button>

              <button
                onClick={() => recordBall(4)}
                className="p-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-md shadow-sky-500/25"
              >
                4 <span className="text-[10px] block font-sans text-slate-900 font-bold">FOUR!</span>
              </button>
              <button
                onClick={() => recordBall(6)}
                className="p-3 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-mono font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-500/30"
              >
                6 <span className="text-[10px] block font-sans text-purple-200 font-bold">SIX!</span>
              </button>
              <button
                onClick={() => openModal('WICKET')}
                className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-lg hover:scale-105 active:scale-95 transition-all col-span-2 shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <span>OUT (W)</span>
                <span className="text-xs bg-rose-700 px-2 py-0.5 rounded font-sans font-semibold">Wicket</span>
              </button>
            </div>

            {/* Extras Row */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => recordBall(0, 'wide', 1)}
                className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 transition-all text-center"
              >
                +1 WD (Wide)
              </button>
              <button
                onClick={() => recordBall(0, 'no_ball', 1)}
                className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 transition-all text-center"
              >
                +1 NB (No Ball)
              </button>
              <button
                onClick={() => recordBall(0, 'bye', 1)}
                className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all text-center"
              >
                +1 B (Bye)
              </button>
              <button
                onClick={() => recordBall(0, 'leg_bye', 1)}
                className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all text-center"
              >
                +1 LB (Leg Bye)
              </button>
            </div>

            {/* Custom Extra Toggle */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setExtraCustomOpen(!extraCustomOpen)}
                className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Need custom runs / boundary off no-ball?</span>
              </button>
              {match.innings === 1 && (
                <button
                  onClick={switchInnings}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  End Innings & Switch
                </button>
              )}
            </div>

            {/* Custom Extra Dialog */}
            {extraCustomOpen && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Select Extra Type & Runs:</div>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {(['wide', 'no_ball', 'bye', 'leg_bye'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedExtraType(type)}
                      className={`p-1.5 rounded-lg font-medium capitalize ${
                        selectedExtraType === type ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs text-slate-400">Total Runs conceded:</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={extraRunsInput}
                    onChange={(e) => setExtraRunsInput(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs text-center font-mono font-bold text-white"
                  />
                  <button
                    onClick={handleExtraSubmit}
                    className="flex-1 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Add Delivery
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projected Scores & Live Commentary Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Projected Score Matrix */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-sky-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{t('projectedScore')} (20 Overs Matrix)</span>
          </h3>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">At Current RR</div>
              <div className="font-mono text-xl font-bold text-emerald-400 mt-1">{projectedScores.currentRR}</div>
              <div className="text-[10px] text-slate-500">CRR {crr.toFixed(1)}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">At 8 RPO</div>
              <div className="font-mono text-xl font-bold text-white mt-1">{projectedScores.runRate8}</div>
              <div className="text-[10px] text-slate-500">Standard</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">At 10 RPO</div>
              <div className="font-mono text-xl font-bold text-amber-400 mt-1">{projectedScores.runRate10}</div>
              <div className="text-[10px] text-slate-500">Accelerated</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">At 12 RPO</div>
              <div className="font-mono text-xl font-bold text-rose-400 mt-1">{projectedScores.runRate12}</div>
              <div className="text-[10px] text-slate-500">Death Overs</div>
            </div>
          </div>
        </div>

        {/* Live Ball-by-Ball Commentary Stream */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Live Ball-by-Ball Commentary</span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">Real-time PCL feed</span>
          </h3>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {ballHistory.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 italic">
                Commentary updates will flow here ball-by-ball. Start scoring above!
              </div>
            ) : (
              ballHistory.slice(0, 10).map((b) => (
                <div key={b.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="text-emerald-400 font-bold">
                      {formatOvers(b.overIndex, b.ballInOver)} ov
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Score: {b.scoreAfterBall.totalRuns}/{b.scoreAfterBall.totalWickets}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans">{b.commentary}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
