import { MatchSummary, BatterLiveScore, BowlerLiveFigures, Player, Team } from '../types/cricket';

/**
 * Generates CSV string for the live scorecard
 */
export function generateScorecardCSV(
  match: MatchSummary,
  battingTeam: Team,
  bowlingTeam: Team,
  batters: BatterLiveScore[],
  bowlers: Record<string, BowlerLiveFigures>,
  players: Player[]
): string {
  const playerMap = new Map(players.map((p) => [p.id, p]));

  let csv = `PCL Season 2 Match Scorecard\n`;
  csv += `Match,${match.title}\n`;
  csv += `Venue,${match.venue}\n`;
  csv += `Date,${match.date}\n`;
  csv += `Innings,${match.innings}\n\n`;

  // Batting Section
  csv += `BATTING - ${battingTeam.name}\n`;
  csv += `Batter,Status,Runs,Balls,4s,6s,SR\n`;

  batters.forEach((b) => {
    const p = playerMap.get(b.playerId);
    const name = p ? p.name : b.playerId;
    const status = b.dismissal ? b.dismissal.description : b.status;
    csv += `"${name}","${status}",${b.runs},${b.balls},${b.fours},${b.sixes},${b.strikeRate.toFixed(1)}\n`;
  });

  csv += `\nBOWLING - ${bowlingTeam.name}\n`;
  csv += `Bowler,Overs,Maidens,Runs,Wickets,Dots,Econ\n`;

  Object.values(bowlers).forEach((bw) => {
    const p = playerMap.get(bw.playerId);
    const name = p ? p.name : bw.playerId;
    const oversText = `${bw.overs}.${bw.ballsInCurrentOver}`;
    csv += `"${name}",${oversText},${bw.maidens},${bw.runsConceded},${bw.wickets},${bw.dots},${bw.economy.toFixed(2)}\n`;
  });

  return csv;
}

/**
 * Downloads a string as a text or CSV file in the browser
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an ultra-crisp social share card on a canvas element and returns a data URL
 */
export function renderSocialCardToCanvas(
  canvas: HTMLCanvasElement,
  options: {
    matchTitle: string;
    battingTeamName: string;
    bowlingTeamName: string;
    battingBadge: string;
    bowlingBadge: string;
    totalRuns: number;
    totalWickets: number;
    oversText: string;
    crr: number;
    strikerName: string;
    strikerStats: string;
    nonStrikerName: string;
    nonStrikerStats: string;
    bowlerName: string;
    bowlerStats: string;
    venue: string;
    tournamentTag: string;
    targetInfo?: string;
  }
): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = 1200;
  const height = 630;
  canvas.width = width;
  canvas.height = height;

  // Background Gradient - Deep Sports Stadium Night
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative Pitch Accent line
  ctx.fillStyle = '#10b981';
  ctx.fillRect(0, 0, width, 8);

  // Decorative Glow
  const glow = ctx.createRadialGradient(width - 200, 150, 10, width - 200, 150, 400);
  glow.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Header Bar
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(60, 40, width - 120, 60, 12);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('🏏 PCL SEASON 2', 90, 78);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`•   ${options.venue}   •   LIVE SCORECARD`, 280, 78);

  // Main Match Score Box
  ctx.fillStyle = '#0b1120';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(60, 125, width - 120, 240, 16);
  ctx.fill();
  ctx.stroke();

  // Team vs Team
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${options.battingBadge} ${options.battingTeamName}`, 90, 185);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VS', 90, 230);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${options.bowlingBadge} ${options.bowlingTeamName}`, 90, 280);

  // Huge Score Display on the Right
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 84px "JetBrains Mono", monospace';
  const scoreText = `${options.totalRuns}/${options.totalWickets}`;
  ctx.fillText(scoreText, 640, 220);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 32px "JetBrains Mono", monospace';
  ctx.fillText(`(${options.oversText} OVERS)`, 645, 275);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`CRR: ${options.crr.toFixed(2)}`, 645, 320);

  if (options.targetInfo) {
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`• ${options.targetInfo}`, 780, 320);
  }

  // Active Players Grid Box (Striker, Non-striker, Bowler)
  const colY = 390;
  const colHeight = 160;
  const colW = (width - 120 - 40) / 3;

  // Box 1: Striker
  ctx.fillStyle = '#131d31';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(60, colY, colW, colHeight, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('STRIKER (*)', 85, colY + 36);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(options.strikerName, 85, colY + 76);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText(options.strikerStats, 85, colY + 120);

  // Box 2: Non-Striker
  ctx.fillStyle = '#131d31';
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(60 + colW + 20, colY, colW, colHeight, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NON-STRIKER', 60 + colW + 45, colY + 36);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(options.nonStrikerName, 60 + colW + 45, colY + 76);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText(options.nonStrikerStats, 60 + colW + 45, colY + 120);

  // Box 3: Bowler
  ctx.fillStyle = '#131d31';
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(60 + (colW + 20) * 2, colY, colW, colHeight, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('BOWLER', 60 + (colW + 20) * 2 + 25, colY + 36);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(options.bowlerName, 60 + (colW + 20) * 2 + 25, colY + 76);

  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText(options.bowlerStats, 60 + (colW + 20) * 2 + 25, colY + 120);

  // Footer Tagline
  ctx.fillStyle = '#64748b';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Shared via PCL Season 2 Official App • Real-time Cricket Analytics & Live Scoring', 60, height - 30);

  return canvas.toDataURL('image/png');
}
