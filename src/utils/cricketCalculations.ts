import { ExtraType } from '../types/cricket';

/**
 * Calculates current run rate (CRR)
 */
export function calculateCRR(totalRuns: number, oversCompleted: number, ballsInOver: number): number {
  const totalOvers = oversCompleted + ballsInOver / 6;
  if (totalOvers <= 0) return 0;
  return Number((totalRuns / totalOvers).toFixed(2));
}

/**
 * Calculates required run rate (RRR)
 */
export function calculateRRR(targetRuns: number, currentRuns: number, totalOvers: number, currentOvers: number, ballsInOver: number): number {
  const runsNeeded = targetRuns - currentRuns;
  const ballsRemaining = Math.max(0, totalOvers * 6 - (currentOvers * 6 + ballsInOver));
  if (runsNeeded <= 0) return 0;
  if (ballsRemaining <= 0) return 99.9;
  return Number(((runsNeeded / ballsRemaining) * 6).toFixed(2));
}

/**
 * Projected final score calculation based on current overs and run rate
 */
export function calculateProjectedScore(
  currentRuns: number,
  oversCompleted: number,
  ballsInOver: number,
  totalMatchOvers = 20
): { currentRR: number; runRate8: number; runRate10: number; runRate12: number } {
  const crr = calculateCRR(currentRuns, oversCompleted, ballsInOver);
  const ballsRemaining = Math.max(0, totalMatchOvers * 6 - (oversCompleted * 6 + ballsInOver));
  const oversRemaining = ballsRemaining / 6;

  return {
    currentRR: Math.round(currentRuns + (crr > 0 ? crr * oversRemaining : 8 * oversRemaining)),
    runRate8: Math.round(currentRuns + 8 * oversRemaining),
    runRate10: Math.round(currentRuns + 10 * oversRemaining),
    runRate12: Math.round(currentRuns + 12 * oversRemaining),
  };
}

/**
 * Win probability predictor based on match conditions, wickets in hand, and required rate
 */
export function calculateWinProbability(
  innings: 1 | 2,
  currentRuns: number,
  wickets: number,
  oversCompleted: number,
  ballsInOver: number,
  targetRuns?: number,
  totalOvers = 20
): { teamBattingProb: number; teamBowlingProb: number } {
  if (innings === 1) {
    // 1st innings: baseline 50-50, adjusted by run rate and wickets lost
    const crr = calculateCRR(currentRuns, oversCompleted, ballsInOver);
    const parRate = 8.5; // modern T20 par run rate
    const wicketDeduction = wickets * 4.5;
    const rateAdvantage = (crr - parRate) * 6;
    let battingProb = Math.min(85, Math.max(15, Math.round(50 + rateAdvantage - wicketDeduction)));
    return { teamBattingProb: battingProb, teamBowlingProb: 100 - battingProb };
  } else {
    // 2nd innings chase
    if (!targetRuns) return { teamBattingProb: 50, teamBowlingProb: 50 };
    const runsNeeded = targetRuns - currentRuns;
    const ballsRemaining = Math.max(0, totalOvers * 6 - (oversCompleted * 6 + ballsInOver));

    if (runsNeeded <= 0) return { teamBattingProb: 100, teamBowlingProb: 0 };
    if (ballsRemaining <= 0 || wickets >= 10) return { teamBattingProb: 0, teamBowlingProb: 100 };

    const rrr = (runsNeeded / ballsRemaining) * 6;
    const wicketsInHand = 10 - wickets;

    // Logistic style estimation
    let prob = 50 + (wicketsInHand - 5) * 5 - (rrr - 8.5) * 7;
    prob = Math.min(98, Math.max(2, Math.round(prob)));
    return { teamBattingProb: prob, teamBowlingProb: 100 - prob };
  }
}

/**
 * Formats overs string like "14.3"
 */
export function formatOvers(overs: number, balls: number): string {
  return `${overs}.${balls}`;
}

/**
 * Checks if a ball is a legal delivery (wides and no-balls require a re-bowl)
 */
export function isDeliveryLegal(extraType: ExtraType): boolean {
  return extraType !== 'wide' && extraType !== 'no_ball';
}

/**
 * Generate quick realistic commentary for ball outcome
 */
export function generateCommentary(
  strikerName: string,
  bowlerName: string,
  runsOffBat: number,
  extraType: ExtraType,
  isWicket: boolean,
  wicketType?: string
): string {
  if (isWicket) {
    switch (wicketType) {
      case 'bowled':
        return `OUT! CLEAN BOWLED! ${bowlerName} rattles the timber! Precision yorker crashes into middle stump. ${strikerName} departs!`;
      case 'caught':
        return `OUT! CAUGHT! ${strikerName} tries to muscle it over the ropes, mistimes it, and finds the fielder at deep mid-wicket. Superb grab!`;
      case 'lbw':
        return `OUT! LBW! Trapped right in front! ${bowlerName} appeals loudly and the umpire raises the finger without hesitation!`;
      case 'run_out':
        return `OUT! RUN OUT! Direct hit! Miscommunication between the wickets and ${strikerName} falls short of the crease.`;
      case 'stumped':
        return `OUT! STUMPED! ${strikerName} dances down the pitch, beaten by the dip and turn, and the wicketkeeper whips the bails in a flash!`;
      default:
        return `OUT! A big breakthrough for ${bowlerName}! ${strikerName} has to walk back!`;
    }
  }

  if (extraType === 'wide') {
    return `Wide ball down the leg side from ${bowlerName}. Signal given, extra run conceded.`;
  }
  if (extraType === 'no_ball') {
    return `NO BALL! ${bowlerName} oversteps the crease! Free hit coming up!`;
  }

  if (runsOffBat === 6) {
    const lines = [
      `SIX! Dispatched with supreme authority! ${strikerName} launches it high and handsome into the top tier of the pavilion!`,
      `MAXIMUM! What a shot by ${strikerName}! Swatted over cow corner with pure swagger!`,
      `SIX RUNS! Sits back and clobbers it over long-on! That sounded like a gunshot off the bat!`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  if (runsOffBat === 4) {
    const lines = [
      `FOUR! Pure elegance! ${strikerName} leans into a glorious cover drive that races to the boundary ropes!`,
      `FOUR! Cut away behind point! Pierces the gap with surgical precision!`,
      `FOUR! Pulled ferociously through square leg! No chance for the boundary rider!`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  if (runsOffBat === 1) {
    return `Single taken. ${strikerName} dabs it softly into the covers and rotates the strike.`;
  }

  if (runsOffBat === 2) {
    return `Tucked off the pads into the deep gap, sharp running between wickets earns a comfortable brace.`;
  }

  if (runsOffBat === 3) {
    return `Excellent running! Pierces the gap at deep extra cover and the batters sprint back for a swift three!`;
  }

  return `Dot ball. Good tight length from ${bowlerName}, defended solidly back down the pitch.`;
}
