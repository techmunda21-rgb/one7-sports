import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Player,
  Team,
  MatchSummary,
  BatterLiveScore,
  BowlerLiveFigures,
  BallOutcome,
  ExtraType,
  UserProfile,
  PushNotification,
  FanChatMessage,
  SupportedLanguage,
} from '../types/cricket';
import { TEAMS, PLAYERS, INITIAL_MATCH, INITIAL_RECENT_MATCHES } from '../data/mockCricketData';
import {
  calculateCRR,
  calculateRRR,
  calculateProjectedScore,
  calculateWinProbability,
  isDeliveryLegal,
  generateCommentary,
} from '../utils/cricketCalculations';
import { TRANSLATIONS } from '../utils/translations';

interface CricketContextType {
  // Master Data
  teams: Team[];
  players: Player[];
  playerMap: Map<string, Player>;
  selectedLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isOffline: boolean;

  // Live Match State
  match: MatchSummary;
  battingTeam: Team;
  bowlingTeam: Team;
  batters: BatterLiveScore[];
  bowlers: Record<string, BowlerLiveFigures>;
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  ballsInCurrentOver: number;
  crr: number;
  rrr?: number;
  projectedScores: { currentRR: number; runRate8: number; runRate10: number; runRate12: number };
  winProbability: { teamBattingProb: number; teamBowlingProb: number };
  ballHistory: BallOutcome[];
  thisOverSummary: string[];
  fallOfWickets: Array<{ wicket: number; score: number; over: string; batsmanName: string }>;

  // Scoring Actions
  recordBall: (runsOffBat: number, extraType?: ExtraType, extraRuns?: number) => void;
  recordWicket: (type: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket', fielderId?: string, nextBatsmanId?: string) => void;
  undoLastBall: () => void;
  rotateStrike: () => void;
  changeBowler: (bowlerId: string) => void;
  setStrikerManual: (batsmanId: string) => void;
  setNonStrikerManual: (batsmanId: string) => void;
  switchInnings: () => void;
  resetMatch: () => void;

  // Modals & Panels
  activeModal: string | null;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
  modalData: any;

  // Notifications
  notifications: PushNotification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  hasNotificationPermission: boolean;

  // Fan Chat & Lounge
  chatMessages: FanChatMessage[];
  sendChatMessage: (text: string) => void;
  reactToChatMessage: (messageId: string, reaction: 'cheer' | 'fire' | 'sixer' | 'applause') => void;
  fanPoll: { question: string; options: Array<{ id: string; text: string; votes: number }>; userVotedId?: string };
  votePoll: (optionId: string) => void;

  // User & Security Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  login: (email: string, provider: 'google' | 'email' | 'guest') => void;
  logout: () => void;
  verify2FACode: (code: string) => boolean;

  // Offline and Recent Matches
  recentMatches: typeof INITIAL_RECENT_MATCHES;
  saveMatchSummaryOffline: () => void;
}

const CricketContext = createContext<CricketContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_MATCH = 'pcl_season2_live_match_state_v1';
const LOCAL_STORAGE_KEY_PROFILE = 'pcl_season2_user_profile_v1';
const LOCAL_STORAGE_KEY_THEME = 'pcl_season2_theme_mode_v1';
const LOCAL_STORAGE_KEY_LANG = 'pcl_season2_language_v1';
const LOCAL_STORAGE_KEY_SAVED_MATCHES = 'pcl_season2_saved_matches_v1';

export const CricketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Base Data
  const [teams] = useState<Team[]>(TEAMS);
  const [players] = useState<Player[]>(PLAYERS);
  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    if (saved) return saved === 'dark';
    return true; // Default dark stadium theme
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LANG) as SupportedLanguage;
    return saved || 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, lang);
  };

  const t = (key: keyof typeof TRANSLATIONS['en']): string => {
    const dict = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  // Offline detection
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif-welcome',
      title: '🏆 Welcome to PCL Season 2!',
      message: 'Live match underway at Wankhede: Mumbai Thunderbolts vs Bengaluru Blasters!',
      type: 'thriller',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    },
  ]);

  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasNotificationPermission(granted);
      if (granted) {
        dispatchPushNotification({
          title: '🔔 Push Notifications Active',
          message: 'You will receive real-time boundary, wicket & milestone alerts for PCL Season 2!',
          type: 'thriller',
        });
      }
      return granted;
    } catch {
      return false;
    }
  };

  const dispatchPushNotification = (notif: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: PushNotification = {
      ...notif,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 30)]);

    // Trigger browser native Notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`PCL S2: ${notif.title}`, {
          body: notif.message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Native notification suppressed:', err);
      }
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      id: 'usr-pcl2-guest',
      name: 'Cricket Connoisseur',
      email: 'fan@pclcricket.org',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      favoriteTeamId: 'team-mtb',
      favoritePlayerId: 'p-rohit',
      twoFactorEnabled: false,
      isLoggedIn: true,
      authProvider: 'guest',
      endToEndEncryptionKey: 'E2EE-ECDH-SHA256:ACTIVE',
      notificationPreferences: {
        wickets: true,
        boundaries: true,
        milestones: true,
        overEnd: true,
        matchThriller: true,
        soundEnabled: true,
      },
    };
  });

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(next));
      return next;
    });
  };

  const login = (email: string, provider: 'google' | 'email' | 'guest') => {
    const name = email.split('@')[0];
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    updateUserProfile({
      email,
      name: capitalized || 'Cricket Fan',
      isLoggedIn: true,
      authProvider: provider,
      twoFactorEnabled: true,
    });
    dispatchPushNotification({
      title: '🔐 Secure Session Verified',
      message: `Signed in as ${email} with OAuth 2.0 & End-to-End Encryption active.`,
      type: 'security',
    });
  };

  const logout = () => {
    updateUserProfile({
      name: 'Guest Fan',
      email: 'guest@pcl.local',
      isLoggedIn: false,
      authProvider: 'guest',
    });
  };

  const verify2FACode = (code: string): boolean => {
    // 6-digit simulation
    if (code.trim().length === 6) {
      dispatchPushNotification({
        title: '🛡️ 2FA Verification Successful',
        message: 'Your biometric / TOTP token has been securely validated.',
        type: 'security',
      });
      return true;
    }
    return false;
  };

  // Recent Matches Cache
  const [recentMatches, setRecentMatches] = useState(INITIAL_RECENT_MATCHES);

  // Live Match Initialization
  const [match, setMatch] = useState<MatchSummary>(INITIAL_MATCH);

  // Batting Team & Bowling Team objects
  const battingTeam = teams.find((t) => t.id === match.currentBattingTeamId) || teams[0];
  const bowlingTeam = teams.find((t) => t.id === match.currentBowlingTeamId) || teams[1];

  // Batting Lineup (Playing XI)
  const initialBatters: BatterLiveScore[] = useMemo(() => {
    return battingTeam.squadPlayerIds.map((playerId, idx) => ({
      playerId,
      runs: idx === 0 ? 42 : idx === 1 ? 31 : 0,
      balls: idx === 0 ? 25 : idx === 1 ? 18 : 0,
      fours: idx === 0 ? 5 : idx === 1 ? 3 : 0,
      sixes: idx === 0 ? 2 : idx === 1 ? 1 : 0,
      strikeRate: idx === 0 ? 168.0 : idx === 1 ? 172.2 : 0,
      status: idx === 0 ? 'striker' : idx === 1 ? 'non_striker' : 'yet_to_bat',
      battingPosition: idx + 1,
    }));
  }, [battingTeam]);

  const initialBowlers: Record<string, BowlerLiveFigures> = useMemo(() => {
    const figures: Record<string, BowlerLiveFigures> = {};
    bowlingTeam.squadPlayerIds.forEach((playerId) => {
      figures[playerId] = {
        playerId,
        overs: 0,
        ballsInCurrentOver: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        dots: 0,
        economy: 0,
        thisOverBalls: [],
      };
    });

    // Populate active bowler Mohammed Siraj with initial spell
    const sirajId = 'p-siraj';
    if (figures[sirajId]) {
      figures[sirajId] = {
        playerId: sirajId,
        overs: 2,
        ballsInCurrentOver: 2,
        maidens: 0,
        runsConceded: 18,
        wickets: 0,
        wides: 1,
        noBalls: 0,
        dots: 5,
        economy: 7.71,
        thisOverBalls: [
          { text: '1', runs: 1, isWicket: false, isExtra: false },
          { text: '4', runs: 4, isWicket: false, isExtra: false },
        ],
      };
    }
    return figures;
  }, [bowlingTeam]);

  // Live calculation state
  const [batters, setBatters] = useState<BatterLiveScore[]>(initialBatters);
  const [bowlers, setBowlers] = useState<Record<string, BowlerLiveFigures>>(initialBowlers);
  const [currentStrikerId, setCurrentStrikerId] = useState<string>(battingTeam.squadPlayerIds[0]);
  const [currentNonStrikerId, setCurrentNonStrikerId] = useState<string>(battingTeam.squadPlayerIds[1]);
  const [currentBowlerId, setCurrentBowlerId] = useState<string>('p-siraj');

  const [totalRuns, setTotalRuns] = useState<number>(76);
  const [totalWickets, setTotalWickets] = useState<number>(0);
  const [oversCompleted, setOversCompleted] = useState<number>(7);
  const [ballsInCurrentOver, setBallsInCurrentOver] = useState<number>(2);

  const [ballHistory, setBallHistory] = useState<BallOutcome[]>([]);
  const [thisOverSummary, setThisOverSummary] = useState<string[]>(['1', '4']);
  const [fallOfWickets, setFallOfWickets] = useState<Array<{ wicket: number; score: number; over: string; batsmanName: string }>>([]);

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = (modal: string, data?: any) => {
    setActiveModal(modal);
    setModalData(data || null);
  };
  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Run rates & projections
  const crr = useMemo(
    () => calculateCRR(totalRuns, oversCompleted, ballsInCurrentOver),
    [totalRuns, oversCompleted, ballsInCurrentOver]
  );

  const rrr = useMemo(() => {
    if (match.innings === 2 && match.targetRuns) {
      return calculateRRR(match.targetRuns, totalRuns, match.totalOvers, oversCompleted, ballsInCurrentOver);
    }
    return undefined;
  }, [match.innings, match.targetRuns, totalRuns, match.totalOvers, oversCompleted, ballsInCurrentOver]);

  const projectedScores = useMemo(
    () => calculateProjectedScore(totalRuns, oversCompleted, ballsInCurrentOver, match.totalOvers),
    [totalRuns, oversCompleted, ballsInCurrentOver, match.totalOvers]
  );

  const winProbability = useMemo(
    () => calculateWinProbability(match.innings, totalRuns, totalWickets, oversCompleted, ballsInCurrentOver, match.targetRuns, match.totalOvers),
    [match.innings, totalRuns, totalWickets, oversCompleted, ballsInCurrentOver, match.targetRuns, match.totalOvers]
  );

  // Fan Chat & Lounge State
  const [chatMessages, setChatMessages] = useState<FanChatMessage[]>([
    {
      id: 'msg-1',
      senderName: 'RohitNation',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      senderRole: 'fan',
      teamId: 'team-mtb',
      message: 'Rohit Sharma looking in prime touch! That pull shot in over 4 was pure vintage hitman! 🏏💥',
      timestamp: '2 mins ago',
      reactions: { cheer: 14, fire: 22, sixer: 18, applause: 9 },
    },
    {
      id: 'msg-2',
      senderName: 'RCB_Forever',
      senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      senderRole: 'expert',
      teamId: 'team-bbl',
      message: 'Need Siraj to bowl tight yorkers right now. Wankhede pitch has true bounce!',
      timestamp: '1 min ago',
      reactions: { cheer: 8, fire: 5, sixer: 3, applause: 12 },
    },
    {
      id: 'msg-3',
      senderName: 'PCL Official Scorer',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      senderRole: 'official_scorer',
      message: '📊 Milestone check: Rohit Sharma needs 8 more runs to reach his 4th half-century of PCL Season 2!',
      timestamp: 'Just now',
      reactions: { cheer: 45, fire: 32, sixer: 28, applause: 50 },
      pinned: true,
    },
  ]);

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: FanChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: userProfile.name,
      senderAvatar: userProfile.avatar,
      senderRole: 'fan',
      teamId: userProfile.favoriteTeamId,
      message: text.trim(),
      timestamp: 'Just now',
      reactions: { cheer: 1, fire: 1, sixer: 0, applause: 0 },
    };
    setChatMessages((prev) => [newMsg, ...prev]);

    // Simulated responsive cheer message from fellow fans
    setTimeout(() => {
      const reactions = [
        'Awesome observation! Let\'s go PCL S2! 🔥',
        'Crucial moment in the match right here! 🏏',
        'Boundary or wicket incoming on the next ball, mark my words!',
      ];
      const botMsg: FanChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderName: 'ArenaFan_' + Math.floor(100 + Math.random() * 900),
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        senderRole: 'fan',
        message: reactions[Math.floor(Math.random() * reactions.length)],
        timestamp: 'Just now',
        reactions: { cheer: 2, fire: 3, sixer: 1, applause: 2 },
      };
      setChatMessages((prev) => [botMsg, ...prev]);
    }, 2500);
  };

  const reactToChatMessage = (messageId: string, reaction: 'cheer' | 'fire' | 'sixer' | 'applause') => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: {
              ...msg.reactions,
              [reaction]: msg.reactions[reaction] + 1,
            },
          };
        }
        return msg;
      })
    );
  };

  const [fanPoll, setFanPoll] = useState({
    question: 'Who will hit the most sixes in this match?',
    options: [
      { id: 'opt-1', text: 'Rohit Sharma (MTB)', votes: 142 },
      { id: 'opt-2', text: 'Virat Kohli (BBL)', votes: 189 },
      { id: 'opt-3', text: 'Glenn Maxwell (BBL)', votes: 76 },
      { id: 'opt-4', text: 'Suryakumar Yadav (MTB)', votes: 114 },
    ],
    userVotedId: undefined as string | undefined,
  });

  const votePoll = (optionId: string) => {
    if (fanPoll.userVotedId) return;
    setFanPoll((prev) => ({
      ...prev,
      userVotedId: optionId,
      options: prev.options.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)),
    }));
  };

  // Helper to trigger confetti
  const triggerCelebration = (type: 'boundary' | 'six' | 'milestone' | 'win') => {
    try {
      if (type === 'six') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#10b981'],
        });
      } else if (type === 'milestone' || type === 'win') {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#6366f1'],
        });
      }
    } catch (e) {
      console.warn('Confetti animation error:', e);
    }
  };

  // Switch Strike between current striker and non-striker
  const rotateStrike = () => {
    const temp = currentStrikerId;
    setCurrentStrikerId(currentNonStrikerId);
    setCurrentNonStrikerId(temp);
  };

  const setStrikerManual = (batsmanId: string) => {
    setCurrentStrikerId(batsmanId);
  };

  const setNonStrikerManual = (batsmanId: string) => {
    setCurrentNonStrikerId(batsmanId);
  };

  const changeBowler = (bowlerId: string) => {
    setCurrentBowlerId(bowlerId);
  };

  // Record a standard ball (or extra)
  const recordBall = (runsOffBat: number, extraType: ExtraType = 'none', extraRuns = 0) => {
    const isLegal = isDeliveryLegal(extraType);
    const totalBallRuns = runsOffBat + extraRuns;

    const striker = playerMap.get(currentStrikerId);
    const bowler = playerMap.get(currentBowlerId);
    const strikerName = striker ? striker.shortName : 'Striker';
    const bowlerName = bowler ? bowler.shortName : 'Bowler';

    const commentary = generateCommentary(strikerName, bowlerName, runsOffBat, extraType, false);

    // 1. Update Batters State
    let prevRuns = 0;
    setBatters((prev) =>
      prev.map((b) => {
        if (b.playerId === currentStrikerId) {
          prevRuns = b.runs;
          const newRuns = b.runs + runsOffBat;
          const newBalls = extraType === 'wide' ? b.balls : b.balls + 1;
          const newFours = runsOffBat === 4 ? b.fours + 1 : b.fours;
          const newSixes = runsOffBat === 6 ? b.sixes + 1 : b.sixes;
          const newSr = newBalls > 0 ? (newRuns / newBalls) * 100 : 0;
          return {
            ...b,
            runs: newRuns,
            balls: newBalls,
            fours: newFours,
            sixes: newSixes,
            strikeRate: Number(newSr.toFixed(1)),
          };
        }
        return b;
      })
    );

    // Milestone check (individual 50 or 100)
    if (prevRuns < 50 && prevRuns + runsOffBat >= 50) {
      triggerCelebration('milestone');
      dispatchPushNotification({
        title: `🎖️ FIFTY FOR ${strikerName.toUpperCase()}!`,
        message: `${strikerName} brings up a sensational half-century in PCL Season 2 with that stroke!`,
        type: 'milestone',
      });
    } else if (prevRuns < 100 && prevRuns + runsOffBat >= 100) {
      triggerCelebration('milestone');
      dispatchPushNotification({
        title: `💯 CENTURY FOR ${strikerName.toUpperCase()}!`,
        message: `Take a bow! Magnificent hundred for ${strikerName} at ${match.venue}!`,
        type: 'milestone',
      });
    }

    // Boundary Alerts
    if (runsOffBat === 4) {
      triggerCelebration('boundary');
      dispatchPushNotification({
        title: `💥 CRACKING FOUR!`,
        message: `${strikerName} strikes a boundary off ${bowlerName}! Score moves to ${totalRuns + totalBallRuns}`,
        type: 'boundary',
      });
    } else if (runsOffBat === 6) {
      triggerCelebration('six');
      dispatchPushNotification({
        title: `🚀 HUGE SIX! MAXIMUM!`,
        message: `${strikerName} sends it soaring into the stands off ${bowlerName}!`,
        type: 'boundary',
      });
    }

    // 2. Update Bowler State
    setBowlers((prev) => {
      const currentB = prev[currentBowlerId] || {
        playerId: currentBowlerId,
        overs: 0,
        ballsInCurrentOver: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        dots: 0,
        economy: 0,
        thisOverBalls: [],
      };

      const newRunsConceded = currentB.runsConceded + totalBallRuns;
      let newWides = currentB.wides;
      let newNoBalls = currentB.noBalls;
      let newDots = currentB.dots;

      if (extraType === 'wide') newWides += 1;
      if (extraType === 'no_ball') newNoBalls += 1;
      if (totalBallRuns === 0) newDots += 1;

      let newBallsInCurrentOver = currentB.ballsInCurrentOver;
      let newOvers = currentB.overs;

      if (isLegal) {
        newBallsInCurrentOver += 1;
        if (newBallsInCurrentOver === 6) {
          newOvers += 1;
          newBallsInCurrentOver = 0;
        }
      }

      const totalBowledOvers = newOvers + newBallsInCurrentOver / 6;
      const econ = totalBowledOvers > 0 ? newRunsConceded / totalBowledOvers : 0;

      const ballRepresentation =
        extraType === 'wide'
          ? `${extraRuns > 1 ? extraRuns : ''}WD`
          : extraType === 'no_ball'
          ? `${runsOffBat > 0 ? runsOffBat : ''}NB`
          : extraType === 'bye'
          ? `${extraRuns}B`
          : extraType === 'leg_bye'
          ? `${extraRuns}LB`
          : runsOffBat.toString();

      return {
        ...prev,
        [currentBowlerId]: {
          ...currentB,
          overs: newOvers,
          ballsInCurrentOver: newBallsInCurrentOver,
          runsConceded: newRunsConceded,
          wides: newWides,
          noBalls: newNoBalls,
          dots: newDots,
          economy: Number(econ.toFixed(2)),
          thisOverBalls: [
            ...currentB.thisOverBalls,
            { text: ballRepresentation, runs: totalBallRuns, isWicket: false, isExtra: !isLegal },
          ],
        },
      };
    });

    // 3. Update Match Score & Over Counts
    const newTotalRuns = totalRuns + totalBallRuns;
    setTotalRuns(newTotalRuns);

    let nextOversCompleted = oversCompleted;
    let nextBallsInOver = ballsInCurrentOver;
    let overJustFinished = false;

    if (isLegal) {
      if (ballsInCurrentOver + 1 === 6) {
        nextOversCompleted += 1;
        nextBallsInOver = 0;
        overJustFinished = true;
      } else {
        nextBallsInOver += 1;
      }
    }

    setOversCompleted(nextOversCompleted);
    setBallsInCurrentOver(nextBallsInOver);

    // 4. Over timeline text
    const ballText =
      extraType === 'wide'
        ? `${extraRuns > 1 ? extraRuns : ''}WD`
        : extraType === 'no_ball'
        ? `${runsOffBat > 0 ? runsOffBat : ''}NB`
        : extraType === 'bye'
        ? `${extraRuns}B`
        : extraType === 'leg_bye'
        ? `${extraRuns}LB`
        : runsOffBat.toString();

    setThisOverSummary((prev) => [...prev, ballText]);

    // 5. Strike Rotation Rules
    // Strike rotates if runs off bat / running is odd (1, 3)
    if (runsOffBat % 2 !== 0 || (extraType !== 'none' && extraRuns % 2 !== 0)) {
      rotateStrike();
    }

    // Strike also rotates at end of over (6 legal balls)
    if (overJustFinished) {
      rotateStrike();
      setThisOverSummary([]);

      // Over summary notification
      dispatchPushNotification({
        title: `🏁 Over ${nextOversCompleted} Completed`,
        message: `${battingTeam.shortName} are ${newTotalRuns}/${totalWickets} after ${nextOversCompleted} overs. CRR: ${(
          newTotalRuns / nextOversCompleted
        ).toFixed(2)}`,
        type: 'over',
      });

      // Prompt to choose next bowler
      openModal('SELECT_BOWLER');
    }

    // 6. Record Ball Outcome
    const outcome: BallOutcome = {
      id: `ball-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ballNumber: ballHistory.length + 1,
      overIndex: nextOversCompleted,
      ballInOver: nextBallsInOver,
      strikerId: currentStrikerId,
      nonStrikerId: currentNonStrikerId,
      bowlerId: currentBowlerId,
      runsOffBat,
      extraRuns,
      extraType,
      isLegalBall: isLegal,
      isWicket: false,
      commentary,
      scoreAfterBall: {
        totalRuns: newTotalRuns,
        totalWickets,
        oversCompleted: nextOversCompleted,
        ballsInOver: nextBallsInOver,
      },
      timestamp: Date.now(),
    };

    setBallHistory((prev) => [outcome, ...prev]);

    // Check target chased in 2nd innings
    if (match.innings === 2 && match.targetRuns && newTotalRuns >= match.targetRuns) {
      triggerCelebration('win');
      dispatchPushNotification({
        title: `🏆 ${battingTeam.name.toUpperCase()} WIN!`,
        message: `${battingTeam.name} chased down ${match.targetRuns} runs to win Match ${match.matchNumber} of PCL Season 2!`,
        type: 'result',
      });
      setMatch((prev) => ({ ...prev, status: 'completed', result: `${battingTeam.name} won by ${10 - totalWickets} wickets` }));
    }
  };

  // Record a Wicket
  const recordWicket = (
    type: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket',
    fielderId?: string,
    nextBatsmanId?: string
  ) => {
    const dismissedBatsmanId = currentStrikerId;
    const dismissedBatter = playerMap.get(dismissedBatsmanId);
    const bowler = playerMap.get(currentBowlerId);
    const fielder = fielderId ? playerMap.get(fielderId) : undefined;

    const batsmanName = dismissedBatter ? dismissedBatter.shortName : 'Batsman';
    const bowlerName = bowler ? bowler.shortName : 'Bowler';
    const fielderName = fielder ? fielder.shortName : '';

    let dismissalDesc = '';
    if (type === 'bowled') dismissalDesc = `b ${bowlerName}`;
    else if (type === 'caught') dismissalDesc = `c ${fielderName || 'sub'} b ${bowlerName}`;
    else if (type === 'lbw') dismissalDesc = `lbw b ${bowlerName}`;
    else if (type === 'run_out') dismissalDesc = `run out (${fielderName || 'direct'})`;
    else if (type === 'stumped') dismissalDesc = `st ${fielderName || 'keeper'} b ${bowlerName}`;
    else dismissalDesc = `hit wicket b ${bowlerName}`;

    const commentary = generateCommentary(batsmanName, bowlerName, 0, 'none', true, type);

    // 1. Mark dismissed batter in playing 11
    setBatters((prev) =>
      prev.map((b) => {
        if (b.playerId === dismissedBatsmanId) {
          return {
            ...b,
            status: 'dismissed',
            balls: b.balls + 1,
            strikeRate: b.balls + 1 > 0 ? Number(((b.runs / (b.balls + 1)) * 100).toFixed(1)) : 0,
            dismissal: {
              type,
              bowlerId: currentBowlerId,
              fielderId,
              description: dismissalDesc,
            },
          };
        }
        return b;
      })
    );

    // 2. Select next batsman from Playing 11 yet to bat
    const availableYetToBat = batters.filter((b) => b.status === 'yet_to_bat' && b.playerId !== dismissedBatsmanId);
    const incomingId = nextBatsmanId || (availableYetToBat.length > 0 ? availableYetToBat[0].playerId : '');

    if (incomingId) {
      setBatters((prev) =>
        prev.map((b) => {
          if (b.playerId === incomingId) {
            return { ...b, status: 'striker' };
          }
          return b;
        })
      );
      setCurrentStrikerId(incomingId);
    }

    // 3. Update Bowler Figures (all dismissals except run out count towards bowler's tally)
    setBowlers((prev) => {
      const currentB = prev[currentBowlerId] || {
        playerId: currentBowlerId,
        overs: 0,
        ballsInCurrentOver: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        dots: 0,
        economy: 0,
        thisOverBalls: [],
      };

      const newWickets = type !== 'run_out' ? currentB.wickets + 1 : currentB.wickets;
      let newBallsInCurrentOver = currentB.ballsInCurrentOver + 1;
      let newOvers = currentB.overs;

      if (newBallsInCurrentOver === 6) {
        newOvers += 1;
        newBallsInCurrentOver = 0;
      }

      const totalBowledOvers = newOvers + newBallsInCurrentOver / 6;
      const econ = totalBowledOvers > 0 ? currentB.runsConceded / totalBowledOvers : 0;

      return {
        ...prev,
        [currentBowlerId]: {
          ...currentB,
          wickets: newWickets,
          overs: newOvers,
          ballsInCurrentOver: newBallsInCurrentOver,
          dots: currentB.dots + 1,
          economy: Number(econ.toFixed(2)),
          thisOverBalls: [
            ...currentB.thisOverBalls,
            { text: 'W', runs: 0, isWicket: true, isExtra: false },
          ],
        },
      };
    });

    // 4. Update match total wickets & overs
    const newTotalWickets = totalWickets + 1;
    setTotalWickets(newTotalWickets);

    let nextOversCompleted = oversCompleted;
    let nextBallsInOver = ballsInCurrentOver;
    let overJustFinished = false;

    if (ballsInCurrentOver + 1 === 6) {
      nextOversCompleted += 1;
      nextBallsInOver = 0;
      overJustFinished = true;
    } else {
      nextBallsInOver += 1;
    }

    setOversCompleted(nextOversCompleted);
    setBallsInCurrentOver(nextBallsInOver);
    setThisOverSummary((prev) => [...prev, 'W']);

    // Fall of wicket tracking
    setFallOfWickets((prev) => [
      ...prev,
      {
        wicket: newTotalWickets,
        score: totalRuns,
        over: `${nextOversCompleted}.${nextBallsInOver}`,
        batsmanName,
      },
    ]);

    // Dispatch Push Notification for Wicket
    dispatchPushNotification({
      title: `⚡ WICKET! ${batsmanName.toUpperCase()} GONE!`,
      message: `${commentary} Score: ${totalRuns}/${newTotalWickets} (${nextOversCompleted}.${nextBallsInOver} ov)`,
      type: 'wicket',
    });

    // Record ball outcome
    const outcome: BallOutcome = {
      id: `ball-w-${Date.now()}`,
      ballNumber: ballHistory.length + 1,
      overIndex: nextOversCompleted,
      ballInOver: nextBallsInOver,
      strikerId: dismissedBatsmanId,
      nonStrikerId: currentNonStrikerId,
      bowlerId: currentBowlerId,
      runsOffBat: 0,
      extraRuns: 0,
      extraType: 'none',
      isLegalBall: true,
      isWicket: true,
      wicketType: type,
      dismissedPlayerId: dismissedBatsmanId,
      fielderId,
      commentary,
      scoreAfterBall: {
        totalRuns,
        totalWickets: newTotalWickets,
        oversCompleted: nextOversCompleted,
        ballsInOver: nextBallsInOver,
      },
      timestamp: Date.now(),
    };

    setBallHistory((prev) => [outcome, ...prev]);

    // Over finished check
    if (overJustFinished) {
      rotateStrike();
      setThisOverSummary([]);
      openModal('SELECT_BOWLER');
    }

    // Check All Out
    if (newTotalWickets >= 10) {
      dispatchPushNotification({
        title: `🚨 ALL OUT! Innings Concluded`,
        message: `${battingTeam.name} bowled out for ${totalRuns} in ${nextOversCompleted}.${nextBallsInOver} overs.`,
        type: 'result',
      });
      if (match.innings === 1) {
        switchInnings();
      } else {
        setMatch((prev) => ({
          ...prev,
          status: 'completed',
          result: `${bowlingTeam.name} won by ${match.targetRuns! - 1 - totalRuns} runs`,
        }));
      }
    }
  };

  // Undo Last Ball
  const undoLastBall = () => {
    if (ballHistory.length === 0) return;
    const [lastBall, ...rest] = ballHistory;
    setBallHistory(rest);

    // Restore match score
    setTotalRuns(lastBall.scoreAfterBall.totalRuns - (lastBall.runsOffBat + lastBall.extraRuns));
    if (lastBall.isWicket) {
      setTotalWickets((prev) => Math.max(0, prev - 1));
      setFallOfWickets((prev) => prev.slice(0, -1));
    }

    // Restore overs
    if (lastBall.isLegalBall) {
      if (ballsInCurrentOver === 0) {
        setOversCompleted((prev) => Math.max(0, prev - 1));
        setBallsInCurrentOver(5);
      } else {
        setBallsInCurrentOver((prev) => Math.max(0, prev - 1));
      }
    }

    // Trim this over summary
    setThisOverSummary((prev) => prev.slice(0, -1));

    // Revert Batter
    setBatters((prev) =>
      prev.map((b) => {
        if (b.playerId === lastBall.strikerId) {
          const ballsDeduction = lastBall.extraType === 'wide' ? 0 : 1;
          const restoredRuns = Math.max(0, b.runs - lastBall.runsOffBat);
          const restoredBalls = Math.max(0, b.balls - ballsDeduction);
          return {
            ...b,
            runs: restoredRuns,
            balls: restoredBalls,
            fours: lastBall.runsOffBat === 4 ? Math.max(0, b.fours - 1) : b.fours,
            sixes: lastBall.runsOffBat === 6 ? Math.max(0, b.sixes - 1) : b.sixes,
            strikeRate: restoredBalls > 0 ? Number(((restoredRuns / restoredBalls) * 100).toFixed(1)) : 0,
            status: lastBall.isWicket ? 'striker' : b.status,
            dismissal: lastBall.isWicket ? undefined : b.dismissal,
          };
        }
        return b;
      })
    );

    // Revert Bowler
    setBowlers((prev) => {
      const b = prev[lastBall.bowlerId];
      if (!b) return prev;
      return {
        ...prev,
        [lastBall.bowlerId]: {
          ...b,
          runsConceded: Math.max(0, b.runsConceded - (lastBall.runsOffBat + lastBall.extraRuns)),
          wickets: lastBall.isWicket && lastBall.wicketType !== 'run_out' ? Math.max(0, b.wickets - 1) : b.wickets,
          thisOverBalls: b.thisOverBalls.slice(0, -1),
        },
      };
    });

    dispatchPushNotification({
      title: '↩️ Ball Undone',
      message: 'Scorer successfully reverted the previous delivery entry.',
      type: 'over',
    });
  };

  // Switch Innings
  const switchInnings = () => {
    const target = totalRuns + 1;
    setMatch((prev) => ({
      ...prev,
      innings: 2,
      currentBattingTeamId: prev.currentBowlingTeamId,
      currentBowlingTeamId: prev.currentBattingTeamId,
      innings1Score: {
        teamId: prev.currentBattingTeamId,
        runs: totalRuns,
        wickets: totalWickets,
        overs: Number(`${oversCompleted}.${ballsInCurrentOver}`),
      },
      targetRuns: target,
      status: 'live',
    }));

    // Reset scores for 2nd innings
    setTotalRuns(0);
    setTotalWickets(0);
    setOversCompleted(0);
    setBallsInCurrentOver(0);
    setBallHistory([]);
    setThisOverSummary([]);
    setFallOfWickets([]);

    // Initialize batting lineup for team B
    const newBattingTeam = teams.find((t) => t.id === match.currentBowlingTeamId) || teams[1];
    const newBowlingTeam = teams.find((t) => t.id === match.currentBattingTeamId) || teams[0];

    const newBatters = newBattingTeam.squadPlayerIds.map((pid, idx) => ({
      playerId: pid,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      status: idx === 0 ? ('striker' as const) : idx === 1 ? ('non_striker' as const) : ('yet_to_bat' as const),
      battingPosition: idx + 1,
    }));
    setBatters(newBatters);
    setCurrentStrikerId(newBattingTeam.squadPlayerIds[0]);
    setCurrentNonStrikerId(newBattingTeam.squadPlayerIds[1]);

    const newBowlers: Record<string, BowlerLiveFigures> = {};
    newBowlingTeam.squadPlayerIds.forEach((pid) => {
      newBowlers[pid] = {
        playerId: pid,
        overs: 0,
        ballsInCurrentOver: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        dots: 0,
        economy: 0,
        thisOverBalls: [],
      };
    });
    setBowlers(newBowlers);
    setCurrentBowlerId(newBowlingTeam.squadPlayerIds[7] || newBowlingTeam.squadPlayerIds[0]); // Premier fast bowler

    dispatchPushNotification({
      title: `🏏 Innings Break Complete! Target: ${target}`,
      message: `${newBattingTeam.name} need ${target} runs from 20 overs to win!`,
      type: 'thriller',
    });
  };

  const resetMatch = () => {
    setMatch(INITIAL_MATCH);
    setTotalRuns(0);
    setTotalWickets(0);
    setOversCompleted(0);
    setBallsInCurrentOver(0);
    setBallHistory([]);
    setThisOverSummary([]);
    setFallOfWickets([]);
    setBatters(
      battingTeam.squadPlayerIds.map((pid, idx) => ({
        playerId: pid,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        status: idx === 0 ? 'striker' : idx === 1 ? 'non_striker' : 'yet_to_bat',
        battingPosition: idx + 1,
      }))
    );
    setCurrentStrikerId(battingTeam.squadPlayerIds[0]);
    setCurrentNonStrikerId(battingTeam.squadPlayerIds[1]);
  };

  const saveMatchSummaryOffline = () => {
    const summary = {
      id: `match-offline-${Date.now()}`,
      matchNumber: match.matchNumber,
      teams: `${battingTeam.name} vs ${bowlingTeam.name}`,
      date: new Date().toISOString().split('T')[0],
      venue: match.venue,
      result: `${battingTeam.shortName} ${totalRuns}/${totalWickets} (${oversCompleted}.${ballsInCurrentOver})`,
      playerOfTheMatch: `${playerMap.get(currentStrikerId)?.name || 'Striker'}`,
      topScorer: `${playerMap.get(currentStrikerId)?.name || 'Striker'} - ${batters.find((b) => b.playerId === currentStrikerId)?.runs || 0} runs`,
      bestBowler: `${playerMap.get(currentBowlerId)?.name || 'Bowler'} - ${bowlers[currentBowlerId]?.wickets || 0}/${bowlers[currentBowlerId]?.runsConceded || 0}`,
      teamAScore: `${battingTeam.shortName} ${totalRuns}/${totalWickets}`,
      teamBScore: `Yet to chase`,
    };

    setRecentMatches((prev) => [summary, ...prev]);
    localStorage.setItem(LOCAL_STORAGE_KEY_SAVED_MATCHES, JSON.stringify([summary, ...recentMatches]));
    dispatchPushNotification({
      title: '💾 Match Saved for Offline Access',
      message: 'Match summary, playing XI scores and figures are now accessible without internet.',
      type: 'over',
    });
  };

  return (
    <CricketContext.Provider
      value={{
        teams,
        players,
        playerMap,
        selectedLanguage,
        setLanguage,
        t,
        isDarkMode,
        toggleDarkMode,
        isOffline,

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

        recordBall,
        recordWicket,
        undoLastBall,
        rotateStrike,
        changeBowler,
        setStrikerManual,
        setNonStrikerManual,
        switchInnings,
        resetMatch,

        activeModal,
        openModal,
        closeModal,
        modalData,

        notifications,
        unreadNotificationCount,
        markNotificationsAsRead,
        clearNotifications,
        requestNotificationPermission,
        hasNotificationPermission,

        chatMessages,
        sendChatMessage,
        reactToChatMessage,
        fanPoll,
        votePoll,

        userProfile,
        updateUserProfile,
        login,
        logout,
        verify2FACode,

        recentMatches,
        saveMatchSummaryOffline,
      }}
    >
      {children}
    </CricketContext.Provider>
  );
};

export const useCricket = () => {
  const context = useContext(CricketContext);
  if (!context) {
    throw new Error('useCricket must be used within a CricketProvider');
  }
  return context;
};
