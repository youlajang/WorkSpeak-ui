// src/views/reportData.ts
export type ReportKind = "quest" | "level_test";
export type LevelChange = "promoted" | "demoted" | "same" | "none";

export type ReportBreakdown = {
  accuracy: number;       // 0~100
  grammar: number;        // 0~100
  naturalness: number;    // 0~100
  policyFit: number;      // 0~100 (or "context fit")
};

export type Report = {
  id: string;
  stage: number; // 1~8
  unit: number;  // 1~N
  kind: ReportKind;
  title: string;
  createdAt: string; // ISO
  score: number;     // 0~100

  xpEarned?: number;
  pointsEarned?: number;

  // 정책/표기
  levelChange?: LevelChange; // Quest에서만 사용 권장
  pointsStatus?: "awarded" | "capped" | "not_awarded"; // 정책 오해 방지용

  breakdown: ReportBreakdown;

  summary: string;
  strengths: string[];
  improvements: string[];
  transcript: { q: string; a: string; ok: boolean }[];
};

export const STAGES = Array.from({ length: 8 }, (_, i) => i + 1);

// stage별 unit 수 (데모)
export const UNITS_BY_STAGE: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [1, 2, 3, 4],
  3: [1, 2, 3],
  4: [1, 2],
  5: [1, 2, 3],
  6: [1, 2],
  7: [1],
  8: [1],
};

export function kindLabel(k: ReportKind) {
  return k === "quest" ? "Quest" : "Level Test";
}

export function levelLabel(v?: LevelChange) {
  if (v === "promoted") return "Promoted";
  if (v === "demoted") return "Demoted";
  if (v === "same") return "No change";
  return "—";
}

export function formatDateLite(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export const demoReports: Report[] = [
  {
    id: "r1",
    stage: 2,
    unit: 1,
    kind: "quest",
    title: "Returns & Refunds",
    createdAt: "2026-01-28T10:30:00Z",
    score: 82,
    xpEarned: 30,
    pointsEarned: 150,
    levelChange: "same",
    pointsStatus: "awarded",
    breakdown: { accuracy: 84, grammar: 78, naturalness: 80, policyFit: 86 },
    summary: "Good policy framing. Add empathy before constraints.",
    strengths: ["Clear policy framing", "Correct escalation steps", "Professional tone"],
    improvements: ["Add empathy first", "Offer one alternative earlier"],
    transcript: [
      { q: "Customer wants a refund after closing. What do you say?", a: "I’m sorry about that. We’re closed now, but I can help you first thing tomorrow.", ok: true },
      { q: "Customer insists on immediate refund. What next?", a: "I understand. I can’t process it after closing, but I can escalate to my manager tomorrow morning.", ok: true },
      { q: "Customer threatens a bad review. Reply.", a: "That’s not my problem.", ok: false },
    ],
  },
  {
    id: "r2",
    stage: 2,
    unit: 1,
    kind: "quest",
    title: "Busy Shift Phrases",
    createdAt: "2026-01-26T09:10:00Z",
    score: 91,
    xpEarned: 28,
    pointsEarned: 120,
    levelChange: "promoted",
    pointsStatus: "capped",
    breakdown: { accuracy: 92, grammar: 88, naturalness: 90, policyFit: 94 },
    summary: "Excellent clarity. Shorten confirmations a bit.",
    strengths: ["Fast responses", "Polite phrasing", "Clear confirmations"],
    improvements: ["Reduce filler words", "Shorter closings"],
    transcript: [
      { q: "Say ‘One moment please’ naturally.", a: "One moment, please.", ok: true },
      { q: "Customer asks ‘Are you ready yet?’ Reply politely.", a: "Almost! Thanks for waiting.", ok: true },
    ],
  },
  {
    id: "r3",
    stage: 1,
    unit: 3,
    kind: "level_test",
    title: "Stage 1 Checkpoint",
    createdAt: "2026-01-20T08:00:00Z",
    score: 76,
    xpEarned: 120,
    pointsEarned: 0,
    // ✅ Test는 레벨 산정에 반영 X로 가정 → "—"
    levelChange: "none",
    pointsStatus: "not_awarded",
    breakdown: { accuracy: 78, grammar: 72, naturalness: 70, policyFit: 80 },
    summary: "Solid baseline. Focus on tense consistency and greetings.",
    strengths: ["Good comprehension", "Key phrases remembered"],
    improvements: ["Past tense consistency", "Smoother greetings"],
    transcript: [
      { q: "Translate: ‘화요일에 봐’", a: "See you on Tuesday.", ok: true },
      { q: "Translate: ‘How are you yesterday?’ correction", a: "How were you yesterday?", ok: true },
    ],
  },
];

export function getReportById(id: string) {
  return demoReports.find((r) => r.id === id) ?? null;
}
