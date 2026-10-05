export type PlayerRole = 'top_batter' | 'middle_batter' | 'wicket_keeper' | 'all_rounder' | 'fast_bowler' | 'spin_bowler';

export type BattingHand = 'Right-hand bat' | 'Left-hand bat';
export type BowlingStyle = 'Right-arm fast' | 'Left-arm fast' | 'Right-arm off break' | 'Left-arm orthodox' | 'Right-arm leg break' | 'Slow left-arm';

export interface ShotDistribution {
  straight: number;
  covers: number;
  point: number;
  thirdMan: number;
  fineLeg: number;
  squareLeg: number;
  midWicket: number;
  longOn: number;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  teamId: string;
  role: PlayerRole;
  battingHand: BattingHand;
  bowlingStyle: BowlingStyle;
  jerseyNumber: number;
  avatar: string;
  country: string;
  isCaptain?: boolean;
  isKeeper?: boolean;
  stats: {
    matches: number;
    innings: number;
    runs: number;
    highestScore: number;
    highestScoreNotOut: boolean;
    average: number;
    strikeRate: number;
    fifties: number;
    hundreds: number;
    fours: number;
    sixes: number;
    // Bowling stats
    wickets: number;
    oversBowled: number;
    runsConceded: number;
    maidens: number;
    bestBowlingFigures: string;
    bowlingAverage: number;
    bowlingEconomy: number;
    // Fielding
    catches: number;
    stumpings: number;
    mvpPoints: number;
    // Visualizations
    formLast5: number[];
    shotDistribution: ShotDistribution;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  city: string;
  primaryColor: string;
  accentColor: string;
  badgeEmoji: string;
  homeGround: string;
  squadPlayerIds: string[];
  captainId: string;
  keeperId: string;
  standings: {
    played: number;
    won: number;
    lost: number;
    tied: number;
    netRunRate: number;
    points: number;
  };
}

export interface BatterLiveScore {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  status: 'striker' | 'non_striker' | 'yet_to_bat' | 'dismissed' | 'retired';
  battingPosition: number;
  dismissal?: {
    type: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket';
    bowlerId?: string;
    fielderId?: string;
    description: string;
  };
}

export interface BowlerLiveFigures {
  playerId: string;
  overs: number;
  ballsInCurrentOver: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  dots: number;
  economy: number;
  thisOverBalls: Array<{
    text: string;
    runs: number;
    isWicket: boolean;
    isExtra: boolean;
  }>;
}

export type ExtraType = 'none' | 'wide' | 'no_ball' | 'bye' | 'leg_bye';

export interface BallOutcome {
  id: string;
  ballNumber: number;
  overIndex: number;
  ballInOver: number;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsOffBat: number;
  extraRuns: number;
  extraType: ExtraType;
  isLegalBall: boolean;
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket';
  dismissedPlayerId?: string;
  fielderId?: string;
  commentary: string;
  scoreAfterBall: {
    totalRuns: number;
    totalWickets: number;
    oversCompleted: number;
    ballsInOver: number;
  };
  timestamp: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string;
  playerId: string;
}

export interface MatchSummary {
  id: string;
  title: string;
  tournament: string;
  season: string;
  matchNumber: number;
  venue: string;
  date: string;
  teamAId: string;
  teamBId: string;
  toss: {
    winnerTeamId: string;
    decision: 'bat' | 'bowl';
  };
  totalOvers: number;
  innings: 1 | 2;
  currentBattingTeamId: string;
  currentBowlingTeamId: string;
  innings1Score?: {
    teamId: string;
    runs: number;
    wickets: number;
    overs: number;
  };
  targetRuns?: number;
  status: 'live' | 'innings_break' | 'completed';
  result?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  favoriteTeamId: string;
  favoritePlayerId: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  isLoggedIn: boolean;
  authProvider: 'google' | 'email' | 'guest';
  endToEndEncryptionKey: string;
  notificationPreferences: {
    wickets: boolean;
    boundaries: boolean;
    milestones: boolean;
    overEnd: boolean;
    matchThriller: boolean;
    soundEnabled: boolean;
  };
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'wicket' | 'boundary' | 'milestone' | 'over' | 'thriller' | 'result' | 'security';
  timestamp: string;
  read: boolean;
  icon?: string;
}

export interface FanChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'fan' | 'expert' | 'official_scorer' | 'vip';
  teamId?: string;
  message: string;
  timestamp: string;
  reactions: {
    cheer: number;
    fire: number;
    sixer: number;
    applause: number;
  };
  pinned?: boolean;
}

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'ur';
