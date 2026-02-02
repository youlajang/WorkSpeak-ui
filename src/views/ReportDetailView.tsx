// src/views/ReportDetailView.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ReportKind = "quest" | "level_test";
type LevelChange = "promoted" | "demoted" | "same" | "none";
type NextStepType = "practice" | "review" | "retry" | "roadmap";

type TranscriptItem = {
  q: string; // Prompt / Customer
  a: string; // Your answer
  ok: boolean;

  // 개선 필요할 때만 채움
  issue?: string;
  suggestion?: string;
  rewrite?: string; // Better answer (recommended)
};

type Report = {
  id: string;
  stage: number;
  unit: number;
  kind: ReportKind;
  title: string;
  createdAt: string;
  score?: number;
  xpEarned?: number;
  pointsEarned?: number;
  levelChange?: LevelChange;

  summary?: string;
  strengths?: string[];
  improvements?: string[];

  breakdown?: {
    empathy: number;
    clarity: number;
    policy: number;
    tone: number;
  };

  toneAnalysis?: {
    tone: string[];
    clarity: string[];
  };

  transcript?: TranscriptItem[];

  nextStep?: {
    type: NextStepType;
    title: string;
    description: string;
    ctaLabel: string;
    to: string;
  };
};

function formatDateLite(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
function kindLabel(k: ReportKind) {
  return k === "quest" ? "Quest" : "Test";
}
function levelLabel(v?: LevelChange) {
  if (v === "promoted") return "Promoted";
  if (v === "demoted") return "Demoted";
  if (v === "same") return "No change";
  return "—";
}
function clamp01(n: number) {
  return Math.max(0, Math.min(100, n));
}
function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

// ✅ demo data
function useDemoReports(): Report[] {
  return useMemo(
    () => [
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
        summary: "Good policy framing. Add more empathy before constraints.",
        strengths: ["Clear policy framing", "Correct escalation steps", "Good tone"],
        improvements: ["Add empathy line first", "Offer 1 alternative earlier"],
        breakdown: { empathy: 68, clarity: 84, policy: 90, tone: 82 },
        toneAnalysis: {
          tone: [
            "Tone is professional and calm overall.",
            "Good de-escalation language when the customer threatens to complain.",
          ],
          clarity: [
            "Options are clear, but add a short empathy line before stating constraints.",
            "State the single next step first, then alternatives.",
          ],
        },
        transcript: [
          {
            q: "Customer: I want a refund. I bought this last week.",
            a: "Sure — I can help. May I check the receipt or the order number first?",
            ok: true,
          },
          {
            q: "Customer: I don’t have it.",
            a: "No problem. If you have the card you paid with, I can look it up. If not, we can offer store credit based on our policy.",
            ok: false,
            issue: "It jumps into policy/options before acknowledging the customer's frustration.",
            suggestion: "Use empathy → reassurance → next step → alternatives (in that order).",
            rewrite:
              "I understand — no worries. If you have the card you paid with, I can look up the purchase right away. If not, I can explain our refund options, including store credit, based on the policy.",
          },
          {
            q: "Customer: That’s not fair. I’ll complain.",
            a: "I understand. I can call my manager to confirm options for you. Would you like to wait here for a moment?",
            ok: true,
          },
        ],
        nextStep: {
          type: "practice",
          title: "Practice: Missing receipt flow",
          description:
            "Repeat the ‘no receipt’ branch until you can respond in 1–2 calm sentences with empathy first.",
          ctaLabel: "Go practice",
          to: "/practice",
        },
      },
    ],
    []
  );
}

export default function ReportDetailView() {
  const nav = useNavigate();
  const { id } = useParams();
  const [showNeedsWorkOnly, setShowNeedsWorkOnly] = useState(false);

  const reports = useDemoReports();
  const report = useMemo(() => reports.find((r) => r.id === id), [reports, id]);

  if (!report) {
    return (
      <section>
        <div className="ws-topbar" style={{ paddingLeft: 6, paddingRight: 6 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <button
              className="ws-btn ws-btn-outline ws-btn-sm"
              type="button"
              onClick={() => nav("/reports")}
              style={{ height: 40, width: 44, padding: 0, borderRadius: 14, fontWeight: 900 }}
              aria-label="Back"
              title="Back"
            >
              &lt;
            </button>

            <div>
              <h1 className="ws-title">Report</h1>
              <div className="ws-sub">This report could not be found.</div>
            </div>
          </div>
        </div>

        <section className="ws-card" style={{ marginTop: 12 }}>
          <div className="ws-sub">Try going back to the reports list.</div>
        </section>
      </section>
    );
  }

  const kindClass = report.kind === "quest" ? "is-quest" : "is-test";
  const b = report.breakdown;
  const breakdownAvg = b ? avg([b.empathy, b.clarity, b.policy, b.tone]) : undefined;

  const transcriptAll = report.transcript ?? [];
  const transcriptVisible = transcriptAll.filter((t) => (showNeedsWorkOnly ? !t.ok : true));

  return (
    <section>
      {/* Header */}
      <div className="ws-topbar" style={{ paddingLeft: 6, paddingRight: 6 }}>
        <div style={{ minWidth: 0, display: "flex", alignItems: "flex-end", gap: 10 }}>
          {/* ✅ back button on LEFT next to title */}
          <button
            className="ws-btn ws-btn-outline ws-btn-sm"
            type="button"
            onClick={() => nav("/reports")}
            style={{ height: 40, width: 44, padding: 0, borderRadius: 14, fontWeight: 900 }}
            aria-label="Back"
            title="Back"
          >
            &lt;
          </button>

          <div style={{ minWidth: 0 }}>
            <h1 className="ws-title" style={{ marginBottom: 2 }}>
              Report
            </h1>
            <div className="ws-sub" style={{ marginTop: 6 }}>
              <span className={`ws-kindTag ${kindClass}`} style={{ marginRight: 8 }}>
                {kindLabel(report.kind)}
              </span>
              <span style={{ fontWeight: 900 }}>{report.title}</span>
            </div>
          </div>
        </div>

        {/* right action = next step CTA */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {report.nextStep && (
            <button
              className="ws-btn ws-btn-primary ws-btn-sm"
              type="button"
              onClick={() => nav(report.nextStep!.to)}
              style={{ height: 40 }}
            >
              {report.nextStep.ctaLabel}
            </button>
          )}
        </div>
      </div>

      {/* Overview (1-column) */}
      <section className="ws-card" style={{ marginTop: 12 }}>
        <div className="ws-cardTitleRow">
          <div className="ws-cardTitle">Overview</div>
          <div className="ws-pill">{formatDateLite(report.createdAt)}</div>
        </div>

        <div className="ws-rdOverviewRow">
          <div className="ws-rdOverviewLeft">
            <div className="ws-rdMetaRow">
              <span className="ws-pillMini">{`Stage ${report.stage}`}</span>
              <span className="ws-pillMini">{`Unit ${report.unit}`}</span>
              <span className={`ws-levelBadge ${report.levelChange ?? "none"}`}>{levelLabel(report.levelChange)}</span>
            </div>

            <div className="ws-rdRewardsRow">
              {typeof report.xpEarned === "number" && <div className="ws-pill">⭐ {report.xpEarned} XP</div>}
              {typeof report.pointsEarned === "number" && <div className="ws-pill">💎 {report.pointsEarned} P</div>}
              {typeof breakdownAvg === "number" && <div className="ws-pill">Eval avg: {breakdownAvg}</div>}
            </div>
          </div>

          {typeof report.score === "number" && (
            <div className="ws-rdScoreBox" title="Score">
              <div className="ws-rdScoreNum">{report.score}</div>
              <div className="ws-rdScoreLabel">Score</div>
            </div>
          )}
        </div>

        {report.summary && (
          <div style={{ marginTop: 12 }}>
            <div className="ws-rdSectionLabel">Summary</div>
            <div className="ws-rdBodyText">{report.summary}</div>
          </div>
        )}
      </section>

      {/* ✅ 2-column row: Evaluation breakdown | Coach notes */}
      <section className="ws-rdTwoCol" style={{ marginTop: 12 }}>
        {/* Evaluation breakdown */}
        <section className="ws-card">
          <div className="ws-cardTitleRow">
            <div className="ws-cardTitle">Evaluation breakdown</div>
            <div className="ws-pill">Text-based</div>
          </div>

          {!report.breakdown ? (
            <div className="ws-sub" style={{ marginTop: 10 }}>
              No breakdown data.
            </div>
          ) : (
            <div className="ws-rdBreakList">
              {([
                ["Empathy", report.breakdown.empathy],
                ["Clarity", report.breakdown.clarity],
                ["Policy", report.breakdown.policy],
                ["Tone", report.breakdown.tone],
              ] as const).map(([label, value]) => (
                <div key={label} className="ws-rdBreakItem">
                  <div className="ws-rdBreakTop">
                    <div className="ws-rdBreakLabel">{label}</div>
                    <div className="ws-rdBreakScore">{clamp01(value)}</div>
                  </div>
                  <div className="ws-rdBreakBar">
                    <div className="ws-rdBreakFill" style={{ width: `${clamp01(value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ws-sub" style={{ marginTop: 10 }}>
            Note: written answers only (no pronunciation/audio engine).
          </div>
        </section>

        {/* Coach notes */}
        <section className="ws-card">
          <div className="ws-cardTitleRow">
            <div className="ws-cardTitle">Coach notes</div>
            <div className="ws-pill">{report.kind === "quest" ? "Performance" : "Checkpoint"}</div>
          </div>

          <div className="ws-rdNotesGrid" style={{ marginTop: 10 }}>
            <div className="ws-rdNotesPanel">
              <div className="ws-rdNotesTitle">Strengths</div>
              {report.strengths?.length ? (
                <ul className="ws-rdList">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="ws-sub">—</div>
              )}
            </div>

            <div className="ws-rdNotesPanel">
              <div className="ws-rdNotesTitle">Improvements</div>
              {report.improvements?.length ? (
                <ul className="ws-rdList">
                  {report.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="ws-sub">—</div>
              )}
            </div>
          </div>

          {report.toneAnalysis && (
            <div className="ws-sub" style={{ marginTop: 12 }}>
              <b>Tone/Clarity tip:</b> Empathy first → one clear next step → alternatives.
            </div>
          )}
        </section>
      </section>

      {/* Tone & clarity analysis (텍스트 기반) */}
      {report.toneAnalysis && (
        <section className="ws-card" style={{ marginTop: 12 }}>
          <div className="ws-cardTitleRow">
            <div className="ws-cardTitle">Tone & clarity analysis</div>
            <div className="ws-pill">Text-based</div>
          </div>

          <div className="ws-rdToneGrid" style={{ marginTop: 10 }}>
            <div className="ws-rdNotesPanel">
              <div className="ws-rdNotesTitle">Tone</div>
              <ul className="ws-rdList">
                {report.toneAnalysis.tone.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="ws-rdNotesPanel">
              <div className="ws-rdNotesTitle">Clarity</div>
              <ul className="ws-rdList">
                {report.toneAnalysis.clarity.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Transcript (메인) */}
      <section className="ws-card" style={{ marginTop: 12 }}>
        <div className="ws-cardTitleRow">
          <div className="ws-cardTitle">Transcript</div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              className="ws-btn ws-btn-outline ws-btn-sm"
              style={{ height: 36 }}
              onClick={() => setShowNeedsWorkOnly((v) => !v)}
            >
              {showNeedsWorkOnly ? "Show all" : "Show only needs work"}
            </button>
            <div className="ws-pill">{transcriptVisible.length} items</div>
          </div>
        </div>

        {!transcriptVisible.length ? (
          <div className="ws-sub" style={{ paddingTop: 8 }}>
            No transcript available.
          </div>
        ) : (
          <div className="ws-rdTranscriptList">
            {transcriptVisible.map((t, idx) => {
              const hasFix = !t.ok && (t.issue || t.suggestion || t.rewrite);
              return (
                <div key={idx} className={`ws-rdQaCard ${t.ok ? "is-ok" : "is-bad"}`}>
                  <div className="ws-rdQaTop">
                    <div className="ws-rdQaIndex">Q{idx + 1}</div>

                    <span className={`ws-rdStatus ${t.ok ? "ok" : "bad"}`}>
                      {t.ok ? "Great" : "Needs improvement"}
                    </span>
                  </div>

                  <div className="ws-rdQaBlock">
                    <div className="ws-rdQaLabel">Prompt / Customer</div>
                    <div className="ws-rdQaText">{t.q}</div>
                  </div>

                  <div className="ws-rdQaBlock">
                    <div className="ws-rdQaLabel">Your answer</div>
                    <div className="ws-rdQaText">{t.a}</div>
                  </div>

                  {/* ✅ Fix guidance (구분 확실히) */}
                  {hasFix && (
                    <div className="ws-rdFixWrap">
                      {(t.issue || t.suggestion) && (
                        <div className="ws-rdFixPanel">
                          <div className="ws-rdFixTitle">What to fix</div>
                          {t.issue && <div className="ws-rdFixText">{t.issue}</div>}
                          {t.suggestion && <div className="ws-rdFixText">{t.suggestion}</div>}
                        </div>
                      )}

                      {t.rewrite && (
                        <div className="ws-rdBetterPanel">
                          <div className="ws-rdBetterTitle">Better answer (recommended)</div>
                          <div className="ws-rdBetterText">{t.rewrite}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended next step (눈에 띄는 히어로 카드) */}
      {report.nextStep && (
        <section className="ws-nextStepHero" style={{ marginTop: 14 }}>
          <div className="ws-nextStepHeroTop">
            <div>
              <div className="ws-nextStepEyebrow">NEXT STEP</div>
              <div className="ws-nextStepTitle">{report.nextStep.title}</div>
              <div className="ws-nextStepDesc">{report.nextStep.description}</div>
            </div>

            <div className="ws-nextStepActions">
              <button className="ws-btn ws-btn-primary" type="button" onClick={() => nav(report.nextStep!.to)}>
                {report.nextStep.ctaLabel}
              </button>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
