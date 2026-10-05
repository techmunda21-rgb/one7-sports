import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Share2, Copy, Check, Twitter, MessageCircle } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { renderSocialCardToCanvas } from '../utils/exportUtils';
import { formatOvers } from '../utils/cricketCalculations';

export const SocialShareModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    match,
    battingTeam,
    bowlingTeam,
    totalRuns,
    totalWickets,
    oversCompleted,
    ballsInCurrentOver,
    crr,
    currentStrikerId,
    currentNonStrikerId,
    currentBowlerId,
    batters,
    bowlers,
    playerMap,
  } = useCricket();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const striker = playerMap.get(currentStrikerId);
  const nonStriker = playerMap.get(currentNonStrikerId);
  const bowler = playerMap.get(currentBowlerId);

  const strikerLive = batters.find((b) => b.playerId === currentStrikerId);
  const nonStrikerLive = batters.find((b) => b.playerId === currentNonStrikerId);
  const bowlerLive = bowlers[currentBowlerId];

  useEffect(() => {
    if (activeModal !== 'SHARE' || !canvasRef.current) return;

    const dataUrl = renderSocialCardToCanvas(canvasRef.current, {
      matchTitle: match.title,
      battingTeamName: battingTeam.name,
      bowlingTeamName: bowlingTeam.name,
      battingBadge: battingTeam.badgeEmoji,
      bowlingBadge: bowlingTeam.badgeEmoji,
      totalRuns,
      totalWickets,
      oversText: formatOvers(oversCompleted, ballsInCurrentOver),
      crr,
      strikerName: striker?.name || 'Striker',
      strikerStats: `${strikerLive?.runs || 0} (${strikerLive?.balls || 0}b, ${strikerLive?.fours || 0}x4, ${strikerLive?.sixes || 0}x6, SR ${strikerLive?.strikeRate || 0})`,
      nonStrikerName: nonStriker?.name || 'Non-Striker',
      nonStrikerStats: `${nonStrikerLive?.runs || 0} (${nonStrikerLive?.balls || 0}b, SR ${nonStrikerLive?.strikeRate || 0})`,
      bowlerName: bowler?.name || 'Bowler',
      bowlerStats: `${bowlerLive?.wickets || 0}/${bowlerLive?.runsConceded || 0} (${formatOvers(bowlerLive?.overs || 0, bowlerLive?.ballsInCurrentOver || 0)} ov, Econ ${bowlerLive?.economy || 0})`,
      venue: match.venue,
      tournamentTag: 'PCL Season 2',
      targetInfo: match.innings === 2 && match.targetRuns ? `Need ${Math.max(0, match.targetRuns - totalRuns)} runs to win` : undefined,
    });

    setCardDataUrl(dataUrl);
  }, [
    activeModal,
    match,
    battingTeam,
    bowlingTeam,
    totalRuns,
    totalWickets,
    oversCompleted,
    ballsInCurrentOver,
    crr,
    strikerLive,
    nonStrikerLive,
    bowlerLive,
  ]);

  if (activeModal !== 'SHARE') return null;

  const matchSummaryText = `🏏 PCL Season 2 Live Score Update!
${battingTeam.badgeEmoji} ${battingTeam.name} vs ${bowlingTeam.badgeEmoji} ${bowlingTeam.name}
📊 Score: ${totalRuns}/${totalWickets} in ${formatOvers(oversCompleted, ballsInCurrentOver)} overs (CRR: ${crr.toFixed(2)})
⭐ On Strike: ${striker?.name} ${strikerLive?.runs}* (${strikerLive?.balls})
🔥 Bowler: ${bowler?.name} ${bowlerLive?.wickets}/${bowlerLive?.runsConceded}
Venue: ${match.venue}
Watch live on PCL Season 2 Official App! #PCLSeason2 #Cricket`;

  const handleDownload = () => {
    if (!cardDataUrl) return;
    const a = document.createElement('a');
    a.href = cardDataUrl;
    a.download = `PCL2_${battingTeam.shortName}_${totalRuns}-${totalWickets}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(matchSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PCL Season 2 Live Match Scorecard',
          text: matchSummaryText,
          url: window.location.href,
        });
      } catch (err) {
        console.warn('Web Share cancelled or failed:', err);
      }
    } else {
      handleCopyText();
    }
  };

  const handleTwitterShare = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(matchSummaryText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Social Share & Highlight Card</h2>
            <p className="text-xs text-slate-400">Generate high-res cards for Instagram, X, WhatsApp & Telegram</p>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="my-3 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex justify-center">
          <canvas ref={canvasRef} className="w-full max-w-xl h-auto block" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopyText}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
          >
            <Twitter className="w-4 h-4" />
            <span>Post to X</span>
          </button>

          <button
            onClick={handleWebShare}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Web Share</span>
          </button>
        </div>

        {/* Share text preview */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Text Caption Preview:</div>
          <p className="text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
            {matchSummaryText}
          </p>
        </div>
      </div>
    </div>
  );
};
