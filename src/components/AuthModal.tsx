import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Fingerprint,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    userProfile,
    updateUserProfile,
    login,
    logout,
    verify2FACode,
    teams,
    players,
  } = useCricket();

  const [emailInput, setEmailInput] = useState(userProfile.email);
  const [provider, setProvider] = useState<'google' | 'email'>('google');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);

  if (activeModal !== 'AUTH') return null;

  const handleStartLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setMfaStep(true);
    setMfaError('');
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      setMfaError('Please enter a valid 6-digit verification code.');
      return;
    }

    const isValid = verify2FACode(mfaCode);
    if (isValid) {
      setMfaSuccess(true);
      login(emailInput, provider);
      setTimeout(() => {
        setMfaStep(false);
        setMfaSuccess(false);
      }, 1000);
    } else {
      setMfaError('Invalid code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">OAuth 2.0 & Fan Security</h2>
            <p className="text-xs text-slate-400">PCL Season 2 Multi-Factor Protected Profile</p>
          </div>
        </div>

        {/* Security & End-to-End Encryption Badge */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 flex items-center gap-3">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-emerald-300">End-to-End Encryption (E2EE) Active</div>
            <div className="text-[10px] text-slate-400 font-mono">
              Key: {userProfile.endToEndEncryptionKey}
            </div>
          </div>
        </div>

        {/* If in MFA Step */}
        {mfaStep ? (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
              <Smartphone className="w-8 h-8 text-sky-400 mx-auto" />
              <h3 className="font-bold text-sm text-white">Multi-Factor Authentication (2FA)</h3>
              <p className="text-xs text-slate-400">
                A 6-digit TOTP authentication code was generated for <strong>{emailInput}</strong>. Enter any 6-digit code
                (e.g. <span className="font-mono text-emerald-400">123456</span>) to verify:
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {mfaError && <p className="text-xs text-rose-400 mt-1.5 text-center">{mfaError}</p>}
              {mfaSuccess && (
                <p className="text-xs text-emerald-400 mt-1.5 text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2FA Verified! Loading profile...</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMfaStep(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
              >
                Verify & Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Profile & Preferences Form */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Fan Display Name
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => updateUserProfile({ name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Account Email (OAuth 2.0)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleStartLogin}
                  className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Verify MFA
                </button>
              </div>
            </div>

            {/* Favorite Franchise */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Favorite Franchise
              </label>
              <select
                value={userProfile.favoriteTeamId}
                onChange={(e) => updateUserProfile({ favoriteTeamId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.badgeEmoji} {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Favorite Star Player */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Favorite Player Spotlight
              </label>
              <select
                value={userProfile.favoritePlayerId}
                onChange={(e) => updateUserProfile({ favoritePlayerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (#{p.jerseyNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Toggles */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Push Alert Preferences
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Wicket Falls Alerts</span>
                  <input
                    type="checkbox"
                    checked={userProfile.notificationPreferences.wickets}
                    onChange={(e) =>
                      updateUserProfile({
                        notificationPreferences: {
                          ...userProfile.notificationPreferences,
                          wickets: e.target.checked,
                        },
                      })
                    }
                    className="accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Boundary & Six Alerts</span>
                  <input
                    type="checkbox"
                    checked={userProfile.notificationPreferences.boundaries}
                    onChange={(e) =>
                      updateUserProfile({
                        notificationPreferences: {
                          ...userProfile.notificationPreferences,
                          boundaries: e.target.checked,
                        },
                      })
                    }
                    className="accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Player Milestone (50s / 100s) Alerts</span>
                  <input
                    type="checkbox"
                    checked={userProfile.notificationPreferences.milestones}
                    onChange={(e) =>
                      updateUserProfile({
                        notificationPreferences: {
                          ...userProfile.notificationPreferences,
                          milestones: e.target.checked,
                        },
                      })
                    }
                    className="accent-emerald-500"
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={logout}
                className="text-xs text-rose-400 hover:underline font-semibold"
              >
                Sign Out
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
