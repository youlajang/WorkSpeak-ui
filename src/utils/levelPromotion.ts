/**
 * WorkSpeak Level & Promotion System (v2.0)
 * Level L1–L8. Promotion/demotion based only on Quest scores (rolling 5).
 * XP = ranking only. Credit = in-app currency. No inactivity demotion.
 *
 * Usage after a Quest completes (0–100 score):
 *   const history = [...existingQuestScores, newScore];
 *   const currentLevel = getLevelForPromotion(); // from level.ts (1–8)
 *   const { newLevel, change } = evaluateAfterQuest(currentLevel, history);
 *   // Persist newLevel (e.g. ws_level) and set report.levelChange = change.
 */

export const LEVEL_MIN = 1;
export const LEVEL_MAX = 8;
export const ROLLING_WINDOW_SIZE = 5;

/** Configurable thresholds (scalable). */
export type LevelPromotionConfig = {
  promotionThreshold: number;   // avg(last 5) ≥ this → promote
  demotionThreshold: number;    // avg(last 5) < this → demote (L6–L7 only)
  proEntryAvgThreshold: number; // L7 + avg ≥ this → eligible for Pro exam
  proExamPassScore: number;     // overall ≥ this to pass
  proExamMinSubScore: number;   // no sub-score below this
  proRetryCooldownDays: number;
  allowL8AutoDemote: boolean;   // optional: demote L8 by score (default false)
};

export const DEFAULT_LEVEL_PROMOTION_CONFIG: LevelPromotionConfig = {
  promotionThreshold: 80,
  demotionThreshold: 60,
  proEntryAvgThreshold: 85,
  proExamPassScore: 85,
  proExamMinSubScore: 70,
  proRetryCooldownDays: 30,
  allowL8AutoDemote: false,
};

export type LevelChange = "promoted" | "demoted" | "same";

export type ProExamResult = {
  newLevel: number;   // 7 or 8
  certified: boolean; // true if L8 granted
};

/**
 * Rolling average of the most recent N Quest scores.
 * Uses only the last `windowSize` entries (default 5).
 */
export function calculateRollingAverage(
  questScores: number[],
  windowSize: number = ROLLING_WINDOW_SIZE
): number | null {
  if (questScores.length === 0) return null;
  const window = questScores.slice(-windowSize);
  const sum = window.reduce((a, b) => a + b, 0);
  return sum / window.length;
}

/**
 * Promotion: avg(last 5) ≥ threshold → promote by 1 level.
 * No evaluation if fewer than 5 Quest attempts.
 */
export function checkPromotion(
  currentLevel: number,
  last5Scores: number[],
  config: LevelPromotionConfig = DEFAULT_LEVEL_PROMOTION_CONFIG
): boolean {
  if (last5Scores.length < ROLLING_WINDOW_SIZE) return false;
  if (currentLevel >= LEVEL_MAX) return false;
  const avg = calculateRollingAverage(last5Scores, ROLLING_WINDOW_SIZE);
  return avg != null && avg >= config.promotionThreshold;
}

/**
 * Demotion: L6–L7 only, avg(last 5) < threshold → demote by 1.
 * L1 cannot demote. L8 auto-demote is configurable (default off).
 * No evaluation if fewer than 5 Quest attempts.
 */
export function checkDemotion(
  currentLevel: number,
  last5Scores: number[],
  config: LevelPromotionConfig = DEFAULT_LEVEL_PROMOTION_CONFIG
): boolean {
  if (last5Scores.length < ROLLING_WINDOW_SIZE) return false;
  if (currentLevel <= LEVEL_MIN) return false;
  if (currentLevel === LEVEL_MAX && !config.allowL8AutoDemote) return false;
  if (currentLevel < 6) return false; // L1–L5 no demotion
  const avg = calculateRollingAverage(last5Scores, ROLLING_WINDOW_SIZE);
  return avg != null && avg < config.demotionThreshold;
}

/**
 * Pro entry eligibility: L7 + avg(last 5) ≥ proEntryAvgThreshold.
 * Does not check whether user has applied or passed the exam.
 */
export function checkProEligibility(
  currentLevel: number,
  last5Scores: number[],
  config: LevelPromotionConfig = DEFAULT_LEVEL_PROMOTION_CONFIG
): boolean {
  if (currentLevel !== 7) return false;
  if (last5Scores.length < ROLLING_WINDOW_SIZE) return false;
  const avg = calculateRollingAverage(last5Scores, ROLLING_WINDOW_SIZE);
  return avg != null && avg >= config.proEntryAvgThreshold;
}

/**
 * Process Pro Certification Exam result.
 * Pass: overall ≥ proExamPassScore and no sub-score < proExamMinSubScore → L8, certified.
 * Fail: remain L7, certified false (reattempt after cooldown).
 */
export function processProExamResult(
  passed: boolean,
  overallScore?: number,
  subScores?: number[],
  config: LevelPromotionConfig = DEFAULT_LEVEL_PROMOTION_CONFIG
): ProExamResult {
  if (!passed) {
    return { newLevel: 7, certified: false };
  }
  if (overallScore != null && overallScore < config.proExamPassScore) {
    return { newLevel: 7, certified: false };
  }
  if (subScores?.length) {
    const anyBelow = subScores.some((s) => s < config.proExamMinSubScore);
    if (anyBelow) return { newLevel: 7, certified: false };
  }
  return { newLevel: 8, certified: true };
}

/**
 * Get the last N Quest scores from a full history (e.g. newest-first or oldest-first).
 * Assumes history is ordered by attempt (oldest first); takes last 5.
 */
export function getLastNQuestScores(
  questScoreHistory: number[],
  n: number = ROLLING_WINDOW_SIZE
): number[] {
  return questScoreHistory.slice(-n);
}

/**
 * Evaluate level change after a new Quest is completed.
 * Returns new level and change type. Does not apply Pro exam (handled separately).
 * If fewer than 5 Quests, returns current level and "same".
 */
export function evaluateAfterQuest(
  currentLevel: number,
  questScoreHistory: number[],
  config: LevelPromotionConfig = DEFAULT_LEVEL_PROMOTION_CONFIG
): { newLevel: number; change: LevelChange } {
  const last5 = getLastNQuestScores(questScoreHistory, ROLLING_WINDOW_SIZE);
  if (last5.length < ROLLING_WINDOW_SIZE) {
    return { newLevel: currentLevel, change: "same" };
  }
  if (checkPromotion(currentLevel, last5, config)) {
    return { newLevel: Math.min(LEVEL_MAX, currentLevel + 1), change: "promoted" };
  }
  if (checkDemotion(currentLevel, last5, config)) {
    return { newLevel: Math.max(LEVEL_MIN, currentLevel - 1), change: "demoted" };
  }
  return { newLevel: currentLevel, change: "same" };
}
