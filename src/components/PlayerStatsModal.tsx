import React, { useEffect, useRef } from 'react';
import { X, Award, Shield, Activity, Target, Flame } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { Player } from '../types/cricket';

export const PlayerStatsModal: React.FC = () => {
  const { activeModal, closeModal, modalData, teams } = useCricket();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const player: Player | null = modalData;

  // Draw the Cricket Wagon Wheel on HTML5 Canvas
  useEffect(() => {
    if (!player || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 320;
    const height = 320;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 130;

    // 1. Draw Field Boundary Oval (Cricket Ground)
    ctx.clearRect(0, 0, width, height);

    // Outfield Grass gradient
    const grassGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    grassGrad.addColorStop(0, '#064e3b'); // Dark emerald green
    grassGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = grassGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Boundary Rope ring
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 30-yard Inner Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.52, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pitch Rectangle in Center
    ctx.fillStyle = '#b45309'; // Pitch clay amber
    ctx.fillRect(centerX - 8, centerY - 24, 16, 48);

    // Stumps & Crease lines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(centerX - 5, centerY - 20, 10, 1.5);
    ctx.fillRect(centerX - 5, centerY + 20, 10, 1.5);

    // 2. Draw Shot Distribution Spokes & Arcs
    const dist = player.stats.shotDistribution;
    const zones = [
      { label: 'Straight', value: dist.straight, angle: -Math.PI / 2, color: '#38bdf8' },
      { label: 'Covers', value: dist.covers, angle: -Math.PI / 4, color: '#34d399' },
      { label: 'Point', value: dist.point, angle: 0, color: '#fbbf24' },
      { label: 'Third Man', value: dist.thirdMan, angle: Math.PI / 4, color: '#f43f5e' },
      { label: 'Fine Leg', value: dist.fineLeg, angle: (3 * Math.PI) / 4, color: '#a855f7' },
      { label: 'Square Leg', value: dist.squareLeg, angle: Math.PI, color: '#ec4899' },
      { label: 'Mid Wicket', value: dist.midWicket, angle: -(3 * Math.PI) / 4, color: '#10b981' },
      { label: 'Long On', value: dist.longOn, angle: -Math.PI / 2 - 0.35, color: '#06b6d4' },
    ];

    zones.forEach((zone) => {
      const length = Math.min(radius - 12, (zone.value / 25) * (radius - 20) + 35);
      const endX = centerX + Math.cos(zone.angle) * length;
      const endY = centerY + Math.sin(zone.angle) * length;

      // Shot Trajectory Ray
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Shot Impact Marker Dot
      ctx.beginPath();
      ctx.arc(endX, endY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = zone.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Percentage / Count Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      const labelX = centerX + Math.cos(zone.angle) * (length + 10);
      const labelY = centerY + Math.sin(zone.angle) * (length + 10);
      ctx.fillText(`${zone.value}%`, labelX, labelY);
    });
  }, [player]);

  if (activeModal !== 'PLAYER_STATS' || !player) return null;

  const team = teams.find((t) => t.id === player.teamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-slate-800">
          <div className="relative">
            <img
              src={player.avatar}
              alt={player.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-xl"
            />
            <span className="absolute -bottom-2 -right-2 bg-slate-950 text-white font-mono font-black text-xs px-2 py-0.5 rounded-full border border-slate-700">
              #{player.jerseyNumber}
            </span>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {team?.badgeEmoji} {team?.name}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md capitalize">
                {player.role.replace('_', ' ')}
              </span>
              {player.isCaptain && (
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  Captain
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-white">{player.name}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {player.country} • {player.battingHand} • {player.bowlingStyle}
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-bold">PCL Impact MVP</div>
            <div className="font-mono text-2xl font-black text-amber-400">{player.stats.mvpPoints} pts</div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="py-4">
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>PCL Season 2 Official Statistics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Runs</div>
              <div className="font-mono text-xl font-black text-emerald-400 mt-0.5">
                {player.stats.runs}
              </div>
              <div className="text-[10px] text-slate-500">{player.stats.innings} Innings</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Strike Rate</div>
              <div className="font-mono text-xl font-black text-sky-400 mt-0.5">
                {player.stats.strikeRate}
              </div>
              <div className="text-[10px] text-slate-500">Average: {player.stats.average}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">High Score</div>
              <div className="font-mono text-xl font-black text-white mt-0.5">
                {player.stats.highestScore}
                {player.stats.highestScoreNotOut && '*'}
              </div>
              <div className="text-[10px] text-slate-500">
                100s: {player.stats.hundreds} • 50s: {player.stats.fifties}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Boundaries</div>
              <div className="font-mono text-xl font-black text-purple-400 mt-0.5">
                {player.stats.fours + player.stats.sixes}
              </div>
              <div className="text-[10px] text-slate-500">
                4s: {player.stats.fours} • 6s: {player.stats.sixes}
              </div>
            </div>

            {/* Bowling Figures row */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Wickets</div>
              <div className="font-mono text-xl font-black text-rose-400 mt-0.5">
                {player.stats.wickets}
              </div>
              <div className="text-[10px] text-slate-500">{player.stats.oversBowled} Overs</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Economy</div>
              <div className="font-mono text-xl font-black text-amber-400 mt-0.5">
                {player.stats.bowlingEconomy > 0 ? player.stats.bowlingEconomy : '--'}
              </div>
              <div className="text-[10px] text-slate-500">
                Best: {player.stats.bestBowlingFigures !== '0/0' ? player.stats.bestBowlingFigures : '--'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Fielding</div>
              <div className="font-mono text-xl font-black text-slate-200 mt-0.5">
                {player.stats.catches}
              </div>
              <div className="text-[10px] text-slate-500">
                Catches • {player.stats.stumpings} Stumpings
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Matches</div>
              <div className="font-mono text-xl font-black text-white mt-0.5">
                {player.stats.matches}
              </div>
              <div className="text-[10px] text-slate-500">PCL Season 2</div>
            </div>
          </div>
        </div>

        {/* Wagon Wheel & Recent Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 border-t border-slate-800">
          {/* Interactive Wagon Wheel Canvas */}
          <div className="md:col-span-7 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Career Wagon Wheel (Shot Zones)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">360° Radial</span>
            </div>

            <div className="flex justify-center my-1">
              <canvas
                ref={canvasRef}
                className="rounded-full shadow-lg border-2 border-slate-800/80 max-w-[280px] max-h-[280px]"
              />
            </div>

            <div className="text-[10px] text-slate-400 flex flex-wrap justify-center gap-2 mt-2 font-mono">
              <span className="text-sky-400">● Straight {player.stats.shotDistribution.straight}%</span>
              <span className="text-emerald-400">● Covers {player.stats.shotDistribution.covers}%</span>
              <span className="text-amber-400">● Point {player.stats.shotDistribution.point}%</span>
              <span className="text-purple-400">● Mid-Wkt {player.stats.shotDistribution.midWicket}%</span>
            </div>
          </div>

          {/* Form Guide & Season Breakdown */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Recent Form (Last 5 Innings)</span>
              </h4>

              <div className="flex items-center justify-between gap-1.5 pt-1">
                {player.stats.formLast5.map((score, i) => (
                  <div
                    key={i}
                    className={`flex-1 py-2 px-1 text-center rounded-xl font-mono font-bold text-xs ${
                      score >= 50
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : score >= 25
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div>{score}</div>
                    <div className="text-[8px] text-slate-500 font-sans font-normal">M-{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-2">
                PCL Season 2 League Highlights
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Ranked in Top Tier for boundaries per innings</li>
                <li>Key performer in death overs (overs 16-20)</li>
                <li>Consistent fielding rating with {player.stats.catches} grabs</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close Card
          </button>
        </div>
      </div>
    </div>
  );
};
