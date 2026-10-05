import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Flame,
  Award,
  Pin,
  Heart,
  Smile,
  BarChart2,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';

export const FanLounge: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    reactToChatMessage,
    fanPoll,
    votePoll,
    userProfile,
    match,
    battingTeam,
    bowlingTeam,
  } = useCricket();

  const [inputMessage, setInputMessage] = useState('');
  const [activeReactionBurst, setActiveReactionBurst] = useState<string | null>(null);

  // Global crowd cheer reaction counters
  const [crowdCheers, setCrowdCheers] = useState({
    cheer: 428,
    fire: 612,
    sixer: 345,
    boom: 198,
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage);
    setInputMessage('');
  };

  const handleCheerBurst = (type: 'cheer' | 'fire' | 'sixer' | 'boom') => {
    setCrowdCheers((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setActiveReactionBurst(type);
    setTimeout(() => setActiveReactionBurst(null), 800);
  };

  const totalPollVotes = fanPoll.options.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <span>PCL Season 2 Community Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>Match Day Fan Lounge</span>
              <MessageSquare className="w-6 h-6 text-sky-400 inline" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Connect with cricket fans globally, share live predictions, celebrate boundaries, and discuss every ball!
            </p>
          </div>

          {/* Live Crowd Cheer Meter */}
          <div className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleCheerBurst('cheer')}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition-all text-xs flex items-center gap-1.5 text-slate-200"
              title="Cheer for team"
            >
              <span>👏</span>
              <span className="font-mono font-bold text-emerald-400">{crowdCheers.cheer}</span>
            </button>
            <button
              onClick={() => handleCheerBurst('fire')}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition-all text-xs flex items-center gap-1.5 text-slate-200"
              title="Pitch is on fire"
            >
              <span>🔥</span>
              <span className="font-mono font-bold text-amber-400">{crowdCheers.fire}</span>
            </button>
            <button
              onClick={() => handleCheerBurst('sixer')}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition-all text-xs flex items-center gap-1.5 text-slate-200"
              title="Sixer chant"
            >
              <span>🏏</span>
              <span className="font-mono font-bold text-sky-400">{crowdCheers.sixer}</span>
            </button>
            <button
              onClick={() => handleCheerBurst('boom')}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition-all text-xs flex items-center gap-1.5 text-slate-200"
              title="Boom Wicket"
            >
              <span>💥</span>
              <span className="font-mono font-bold text-rose-400">{crowdCheers.boom}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Fan Chat Stream */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-col h-[600px] overflow-hidden">
          {/* Lounge Chat Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">
                Live Match Discussion: {battingTeam.shortName} vs {bowlingTeam.shortName}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Posting as: <strong className="text-emerald-400">{userProfile.name}</strong>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-2xl text-xs transition-all ${
                  msg.pinned
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : msg.senderRole === 'official_scorer'
                    ? 'bg-purple-900/20 border border-purple-800/30'
                    : 'bg-slate-950/70 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{msg.senderName}</span>
                      {msg.senderRole === 'official_scorer' && (
                        <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>OFFICIAL SCORER</span>
                        </span>
                      )}
                      {msg.pinned && (
                        <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" />
                          <span>PINNED</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>

                <p className="text-slate-200 text-xs pl-8 leading-relaxed">{msg.message}</p>

                {/* Reaction Actions */}
                <div className="pl-8 mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => reactToChatMessage(msg.id, 'fire')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700/50"
                  >
                    <span>🔥</span>
                    <span className="font-mono text-slate-400">{msg.reactions.fire}</span>
                  </button>
                  <button
                    onClick={() => reactToChatMessage(msg.id, 'cheer')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700/50"
                  >
                    <span>👏</span>
                    <span className="font-mono text-slate-400">{msg.reactions.cheer}</span>
                  </button>
                  <button
                    onClick={() => reactToChatMessage(msg.id, 'sixer')}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700/50"
                  >
                    <span>🏏</span>
                    <span className="font-mono text-slate-400">{msg.reactions.sixer}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Join the discussion... (e.g. What a shot by Rohit!)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Live Match Fan Poll & Fan Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Fan Poll */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold text-amber-400 mb-2">
              <BarChart2 className="w-4 h-4" />
              <span>Live Fan Poll</span>
            </div>

            <h3 className="text-sm font-bold text-white mb-3">{fanPoll.question}</h3>

            <div className="space-y-2.5">
              {fanPoll.options.map((opt) => {
                const percent = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
                const isSelected = fanPoll.userVotedId === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => votePoll(opt.id)}
                    disabled={!!fanPoll.userVotedId}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Background Progress Bar */}
                    <div
                      className="absolute top-0 left-0 bottom-0 bg-emerald-500/15 transition-all duration-700 pointer-events-none"
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative flex items-center justify-between z-10">
                      <span className="font-semibold text-slate-200">{opt.text}</span>
                      <span className="font-mono font-bold text-emerald-400">{percent}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 text-[11px] text-slate-500 text-center font-mono">
              Total {totalPollVotes} votes cast by verified fans
            </div>
          </div>

          {/* PCL Season 2 Community Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Community Highlights</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Welcome to the official <strong>PCL Season 2 Fan Lounge</strong>. Respect fellow supporters, celebrate
              brilliant cricket moments, and enjoy the real-time excitement!
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Moderated by Official PCL League Umpires</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
