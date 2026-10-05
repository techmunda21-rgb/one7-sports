import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

export const ApiDocsModal: React.FC = () => {
  const { activeModal, closeModal } = useCricket();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (activeModal !== 'API_DOCS') return null;

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/matches/live',
      title: 'Get Real-Time Match Scorecard',
      description: 'Returns the current live ball-by-ball score, active playing 11 batters, bowler figures, and projected scores.',
      curl: `curl -X GET "https://api.pcl-cricket.org/v1/matches/live?matchId=m-pcl2-01" \\
  -H "Authorization: Bearer pcl_live_sec_key_2026"`,
      response: `{
  "status": "success",
  "data": {
    "matchId": "m-pcl2-01",
    "battingTeam": "Mumbai Thunderbolts",
    "totalRuns": 76,
    "wickets": 0,
    "overs": "7.2",
    "crr": 10.36,
    "projectedScore": 207,
    "striker": { "id": "p-rohit", "runs": 42, "balls": 25, "sr": 168.0 },
    "nonStriker": { "id": "p-ishan", "runs": 31, "balls": 18, "sr": 172.2 },
    "bowler": { "id": "p-siraj", "figures": "0/18", "overs": "2.2", "economy": 7.71 }
  }
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/scores/calculate',
      title: 'Calculate Live Ball Outcome & Strike Rotation',
      description: 'Calculates the updated match score, CRR, RRR, strike rotation, and individual player stats after a delivery.',
      curl: `curl -X POST "https://api.pcl-cricket.org/v1/scores/calculate" \\
  -H "Content-Type: application/json" \\
  -d '{"runsOffBat": 4, "extraType": "none", "strikerId": "p-rohit", "bowlerId": "p-siraj"}'`,
      response: `{
  "status": "success",
  "result": {
    "runsAdded": 4,
    "isBoundary": true,
    "strikerNextRuns": 46,
    "strikeRotated": false,
    "newCRR": 10.91,
    "commentary": "FOUR! Rohit leans into a glorious cover drive that races to the ropes!"
  }
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/players/{id}/stats',
      title: 'Get Comprehensive Player Analytics & Wagon Wheel',
      description: 'Fetches player career statistics, season averages, form guide, and radial shot zone distributions.',
      curl: `curl -X GET "https://api.pcl-cricket.org/v1/players/p-rohit/stats"`,
      response: `{
  "player": {
    "id": "p-rohit",
    "name": "Rohit Sharma",
    "role": "top_batter",
    "runs": 382,
    "strikeRate": 164.65,
    "average": 54.57,
    "shotDistribution": {
      "straight": 18, "covers": 22, "point": 12, "midWicket": 20
    }
  }
}`,
    },
    {
      method: 'GET',
      path: '/api/v1/leaderboard',
      title: 'Get PCL Season 2 Player Rankings',
      description: 'Returns top run-scorers (Orange Cap), wicket-takers (Purple Cap), and MVP impact rankings.',
      curl: `curl -X GET "https://api.pcl-cricket.org/v1/leaderboard?category=orange&limit=10"`,
      response: `{
  "category": "orange_cap",
  "rankings": [
    { "rank": 1, "name": "Virat Kohli", "runs": 432, "sr": 156.52 },
    { "rank": 2, "name": "Rohit Sharma", "runs": 382, "sr": 164.65 }
  ]
}`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">PCL Season 2 Developer API Explorer</h2>
            <p className="text-xs text-slate-400">
              RESTful Endpoints for Live Scoring, Player Stats & Leaderboard Sync
            </p>
          </div>
        </div>

        {/* Endpoints Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-black text-[10px] px-2 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono font-bold text-white text-xs">{ep.path}</span>
                </div>
                <button
                  onClick={() => handleCopy(ep.curl, idx)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedIndex === idx ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-200">{ep.title}</h4>
                <p className="text-slate-400 text-[11px]">{ep.description}</p>
              </div>

              {/* Terminal Snippet */}
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>cURL Request:</span>
                </div>
                <pre className="whitespace-pre">{ep.curl}</pre>
              </div>

              {/* Sample Response */}
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">
                  Sample JSON 200 OK:
                </div>
                <pre className="whitespace-pre">{ep.response}</pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
