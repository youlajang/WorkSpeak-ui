/**
 * Landing placement test items (Learna-style).
 * 1) Difficulty statements (Does this apply? Yes / Partially / No)
 * 2) What to improve (Speaking / Listening / Vocabulary)
 * 3) Vocabulary by level (A1-A2 → B1-B2 → C1-C2)
 * 4) Listen + Speak → level 0–8.
 */

/** One statement: "Does this apply to you?" → Yes / Partially / No */
export type PlacementStatementItem = {
  id: string;
  statementKey: string;
  statementEn: string;
};

/** "Which part do you want to improve?" */
export type PlacementImproveOption = {
  id: string;
  labelKey: string;
  labelEn: string;
};

/** Single word/phrase for "choose words you know" step. */
export type PlacementVocabItem = {
  id: string;
  text: string;
  band: "easy" | "medium" | "hard";
};

/** Option for "where do you have difficulty" step. */
export type PlacementDifficultyOption = {
  id: string;
  labelKey: string;
  labelEn: string;
};

/** Answer per statement */
export type StatementAnswer = "yes" | "partially" | "no";

// —— Learna: "아래 문장이 본인에게 해당되나요?" ——
export const PLACEMENT_STATEMENTS: PlacementStatementItem[] = [
  { id: "s1", statementKey: "landing.statement.listening", statementEn: "I don't understand well when I hear fluent English." },
  { id: "s2", statementKey: "landing.statement.vocabulary", statementEn: "I often get stuck when speaking because I know few words." },
  { id: "s3", statementKey: "landing.statement.grammar", statementEn: "I often make sentences sound awkward when speaking." },
  { id: "s4", statementKey: "landing.statement.production", statementEn: "I understand, but words don't come out well." },
  { id: "s5", statementKey: "landing.statement.natural", statementEn: "I can speak English, but I want to speak more naturally." },
  { id: "s6", statementKey: "landing.statement.movies", statementEn: "I don't understand well when watching English movies." },
];

// —— "어떤 부분을 더 키우고 싶으세요?" ——
export const PLACEMENT_IMPROVE_OPTIONS: PlacementImproveOption[] = [
  { id: "speaking", labelKey: "landing.improve.speaking", labelEn: "Speaking" },
  { id: "listening", labelKey: "landing.improve.listening", labelEn: "Listening" },
  { id: "vocabulary", labelKey: "landing.improve.vocabulary", labelEn: "Vocabulary" },
];

// —— Vocabulary by CEFR (Learna 18, 19, 20). Keep words in English only (no translation) for assessment. ——
export const PLACEMENT_VOCAB_A12: string[] = [
  "laugh", "run", "drink", "sky", "flower", "eat", "listen", "book",
  "chair", "happy", "walk", "sleep", "friend", "family", "car", "play",
  "dog", "dance", "water", "red", "morning", "hello", "thank you", "help",
];
export const PLACEMENT_VOCAB_B12: string[] = [
  "challenge", "disappointment", "concentrate", "recommendation", "responsibility",
  "ambition", "creativity", "abandon", "beyond", "decrease", "emerge", "honesty",
  "maintain", "perception", "similarity", "schedule", "deadline", "feedback",
];
export const PLACEMENT_VOCAB_C12: string[] = [
  "ambiguity", "intricate", "articulate", "ingenuity", "resilience", "absence",
  "introspection", "meticulous", "credibility", "architectural", "cultivate",
  "default", "noble", "residential", "sketch", "align", "scope", "stakeholder",
];

export const PLACEMENT_VOCAB: PlacementVocabItem[] = [
  { id: "v1", text: "Hello / Thank you", band: "easy" },
  { id: "v2", text: "Yes / No / I don’t know", band: "easy" },
  { id: "v3", text: "Can you help me?", band: "easy" },
  { id: "v4", text: "I have a question.", band: "easy" },
  { id: "v5", text: "Could you send me the report?", band: "medium" },
  { id: "v6", text: "I’ll get back to you.", band: "medium" },
  { id: "v7", text: "Let me check.", band: "medium" },
  { id: "v8", text: "No problem. / Sure thing.", band: "medium" },
  { id: "v9", text: "We need to align on the timeline.", band: "hard" },
  { id: "v10", text: "I’ll follow up with the team.", band: "hard" },
  { id: "v11", text: "Could you clarify the scope?", band: "hard" },
  { id: "v12", text: "Let’s circle back after the call.", band: "hard" },
];

export const PLACEMENT_DIFFICULTY_OPTIONS: PlacementDifficultyOption[] = [
  { id: "listening", labelKey: "landing.difficulty.listening", labelEn: "Understanding fast speech" },
  { id: "meetings", labelKey: "landing.difficulty.meetings", labelEn: "Speaking in meetings" },
  { id: "smalltalk", labelKey: "landing.difficulty.smalltalk", labelEn: "Small talk & casual chat" },
  { id: "pronunciation", labelKey: "landing.difficulty.pronunciation", labelEn: "Pronunciation" },
  { id: "vocabulary", labelKey: "landing.difficulty.vocabulary", labelEn: "Vocabulary & expressions" },
  { id: "emails", labelKey: "landing.difficulty.emails", labelEn: "Writing emails" },
  { id: "calls", labelKey: "landing.difficulty.calls", labelEn: "Phone / video calls" },
  { id: "presentations", labelKey: "landing.difficulty.presentations", labelEn: "Presentations" },
];

/** From selected vocab IDs (legacy), return band. */
export function getVocabBandFromSelection(selectedIds: string[]): number {
  const items = PLACEMENT_VOCAB.filter((it) => selectedIds.includes(it.id));
  if (items.some((it) => it.band === "hard")) return 2;
  if (items.some((it) => it.band === "medium")) return 1;
  return 0;
}

/** From A12/B12/C12 selected words: any C12 → 2, any B12 → 1, else 0. */
export function getVocabBandFromCEFR(_selectedA: string[], selectedB: string[], selectedC: string[]): number {
  if (selectedC.length > 0) return 2;
  if (selectedB.length > 0) return 1;
  return 0;
}

export type PlacementListenItem = {
  id: string;
  band: "easy" | "medium" | "hard";
  sentence: string;
  tokens: string[];
};

export type PlacementSpeakItem = {
  id: string;
  band: "easy" | "medium" | "hard";
  sentence: string;
};

export const PLACEMENT_LISTEN: PlacementListenItem[] = [
  {
    id: "listen-easy",
    band: "easy",
    sentence: "I have a job interview tomorrow.",
    tokens: ["I", "have", "a", "job", "interview", "tomorrow."],
  },
  {
    id: "listen-medium",
    band: "medium",
    sentence: "Could you send me the report by Friday?",
    tokens: ["Could", "you", "send", "me", "the", "report", "by", "Friday?"],
  },
  {
    id: "listen-hard",
    band: "hard",
    sentence: "We need to align on the timeline before the client call.",
    tokens: ["We", "need", "to", "align", "on", "the", "timeline", "before", "the", "client", "call."],
  },
];

export const PLACEMENT_SPEAK: PlacementSpeakItem[] = [
  { id: "speak-easy", band: "easy", sentence: "Yes, I can do that." },
  { id: "speak-medium", band: "medium", sentence: "I'll get back to you by end of day." },
  { id: "speak-hard", band: "hard", sentence: "Let me check with the team and confirm by tomorrow." },
];

/** Band index 0 = easy (L0–L2), 1 = medium (L3–L5), 2 = hard (L6–L8). */
export function getBandFromListenSpeakResults(
  listenCorrect: [boolean, boolean, boolean],
  speakDone: [boolean, boolean, boolean]
): number {
  if (listenCorrect[2] && speakDone[2]) return 2; // hard
  if (listenCorrect[1] && speakDone[1]) return 1; // medium
  if (listenCorrect[0] && speakDone[0]) return 0; // easy
  return 0; // default to easy band
}

/** Self-report tier → offset within band (0, 1, or 2). */
export const TIER_TO_OFFSET: Record<string, number> = {
  freeze: 0,
  basic: 0,
  smalltalk: 1,
  meeting: 1,
  present: 2,
};

/**
 * Final placement level 0–8.
 * bandFromTasks = listen+speak band (0,1,2). vocabBand can nudge; difficultyIds stored for UX only.
 */
export function resolvePlacementLevel(
  bandFromTasks: number,
  selfReportTier: string,
  vocabBand?: number
): number {
  const offset = TIER_TO_OFFSET[selfReportTier] ?? 1;
  let band = bandFromTasks;
  if (vocabBand != null && vocabBand > bandFromTasks) band = Math.min(2, bandFromTasks + 1);
  if (vocabBand != null && vocabBand < bandFromTasks) band = Math.max(0, bandFromTasks - 1);
  const level = band * 3 + Math.min(2, offset);
  return Math.max(0, Math.min(8, level));
}
