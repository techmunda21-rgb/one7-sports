import React from 'react';
import { X, Bell, BellRing, Check, Trash2, Shield, Zap, Award } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

export const NotificationCenterModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    notifications,
    markNotificationsAsRead,
    clearNotifications,
    requestNotificationPermission,
    hasNotificationPermission,
  } = useCricket();

  if (activeModal !== 'NOTIFICATIONS') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">PCL Season 2 Game Alerts</h2>
            <p className="text-xs text-slate-400">Real-time Push Notifications & Match Milestones</p>
          </div>
        </div>

        {/* Native Web Push Permission Banner */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BellRing className={`w-5 h-5 ${hasNotificationPermission ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-xs font-bold text-white">
                {hasNotificationPermission ? 'Native Push Notifications Enabled' : 'Enable Device Push Alerts'}
              </div>
              <div className="text-[10px] text-slate-400">
                {hasNotificationPermission
                  ? 'Active on this browser • Instant alerts on wickets & 6s'
                  : 'Receive background alerts when app is minimized'}
              </div>
            </div>
          </div>

          {!hasNotificationPermission && (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md transition-all"
            >
              Allow Push
            </button>
          )}
        </div>

        {/* Action strip: Mark read / Clear */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800 mb-3 text-slate-400">
          <span>{notifications.length} Alerts in Session</span>
          <div className="flex items-center gap-3">
            <button
              onClick={markNotificationsAsRead}
              className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearNotifications}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No notifications yet. Ball-by-ball milestones and wicket alerts will appear here!
            </div>
          ) : (
            notifications.map((n) => {
              const isWicket = n.type === 'wicket';
              const isBoundary = n.type === 'boundary';
              const isMilestone = n.type === 'milestone';
              const isSecurity = n.type === 'security';

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border text-xs transition-all ${
                    !n.read
                      ? 'bg-slate-950/90 border-slate-700/80'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        isWicket
                          ? 'text-rose-400'
                          : isBoundary
                          ? 'text-sky-400'
                          : isMilestone
                          ? 'text-amber-400'
                          : isSecurity
                          ? 'text-emerald-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {isWicket ? (
                        <Zap className="w-3.5 h-3.5" />
                      ) : isMilestone ? (
                        <Award className="w-3.5 h-3.5" />
                      ) : isSecurity ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                      <span>{n.title}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-5">{n.message}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
