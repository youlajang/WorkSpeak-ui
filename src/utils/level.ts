/**
 * Maps landing/placement level (ws_placement_level or ws_level) to app numeric level 0–8.
 * L0 = rare, L7 = 실무 가능 수준. Placement result stored as "0".."8".
 */
const WS_PLACEMENT_LEVEL_KEY = "ws_placement_level";
const WS_LEVEL_KEY = "ws_level";

/** 5 self-report tiers → base level 0,2,4,6,8 for placement formula. */
const LANDING_TIER_TO_NUM: Record<string, number> = {
  freeze: 0,
  basic: 2,
  smalltalk: 4,
  meeting: 6,
  present: 8,
};

const DEFAULT_LEVEL = 4;
const MIN_LEVEL = 0;
const MAX_LEVEL = 8;

export function getStoredUserLevel(): number {
  if (typeof window === "undefined") return DEFAULT_LEVEL;
  const raw =
    localStorage.getItem(WS_PLACEMENT_LEVEL_KEY) ?? localStorage.getItem(WS_LEVEL_KEY);
  if (!raw) return DEFAULT_LEVEL;
  const num = parseInt(raw, 10);
  if (num >= MIN_LEVEL && num <= MAX_LEVEL) return num;
  if (LANDING_TIER_TO_NUM[raw] != null) return LANDING_TIER_TO_NUM[raw];
  return DEFAULT_LEVEL;
}

/** System level for promotion/demotion is L1–L8. Use when calling levelPromotion helpers. */
export function getLevelForPromotion(): number {
  return Math.max(1, getStoredUserLevel());
}
