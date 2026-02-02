import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type RangeKey = "7d" | "30d";
type TabKey = "overview" | "activity" | "vocabulary";

type MetricKey = "accuracy" | "pace" | "silence_ratio" | "stability";

type Metric = {
  key: MetricKey;
  label: string;
  unitLabel: string; // "%", "wpm", "/100"
  current: number;
  prev: number;
  trend: number[]; // 0..100 scale for drawing
  higherIsBetter: boolean;
  infoTitle: string;
  infoBody: string;
  practiceType: "accuracy_drill" | "pace_drill" | "silence_drill" | "stability_routine";
};

type Coverage = {
  unitsCount: number;
  promptsCount: number;
  minutes: number;
};

type Practice = {
  id: string;
  title: string;
  durationMin: number;
  goal: string;
  steps: string[];
  practiceType: Metric["practiceType"];
  metricKey: MetricKey;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function delta(current: number, prev: number) {
  return current - prev;
}

function formatDelta(d: number) {
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(1)}`;
}

function improvementDelta(m: Metric) {
  const d = delta(m.current, m.prev);
  return m.higherIsBetter ? d : -d;
}

function severityScore(m: Metric) {
  const normalized = m.higherIsBetter ? m.current : 100 - m.current;
  return clamp(normalized, 0, 100);
}

function pickWeakest(metrics: Metric[]) {
  let weakest = metrics[0];
  let weakestScore = severityScore(weakest);
  for (const m of metrics) {
    const s = severityScore(m);
    if (s < weakestScore) {
      weakest = m;
      weakestScore = s;
    }
  }
  return weakest;
}

function pickMostDropped(metrics: Metric[]) {
  let worst = metrics[0];
  let worstDelta = improvementDelta(worst);
  for (const m of metrics) {
    const d = improvementDelta(m);
    if (d < worstDelta) {
      worst = m;
      worstDelta = d;
    }
  }
  return worst;
}

/** --------- Charts (Sparkline + labels) --------- */
function Sparkline({
  data,
  width = 160,
  height = 44,
  strokeWidth = 2,
}: {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
}) {
  const pad = 6;
  const n = Math.max(2, data.length);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);

  const pts = data.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / (n - 1);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg className="ws-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline className="ws-sparkLine" fill="none" strokeWidth={strokeWidth} points={pts.join(" ")} />
    </svg>
  );
}

function ChartWithLabels({
  data,
  leftLabel,
  midLabel,
  rightLabel,
  compact = false,
}: {
  data: number[];
  leftLabel: string;
  midLabel: string;
  rightLabel: string;
  compact?: boolean;
}) {
  const w = compact ? 120 : 160;
  const h = compact ? 30 : 44;

  return (
    <div className="ws-chartBox" style={compact ? { marginTop: 8 } : undefined}>
      <div className="ws-chartInner" style={compact ? { height: 32 } : undefined}>
        <Sparkline data={data} width={w} height={h} strokeWidth={2} />
      </div>
      <div className="ws-chartLabels" style={compact ? { fontSize: 11, opacity: 0.7, marginTop: 6 } : undefined}>
        <span>{leftLabel}</span>
        <span>{midLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function MiniBars({ values, height = 34 }: { values: number[]; height?: number }) {
  const width = 160;
  const gap = 4;
  const n = Math.max(1, values.length);
  const barW = (width - gap * (n - 1)) / n;

  return (
    <svg className="ws-minibars" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const x = i * (barW + gap);
        const h = v ? height : Math.max(3, height * 0.18);
        const y = height - h;
        return <rect key={i} className="ws-bar" x={x} y={y} width={barW} height={h} rx={6} />;
      })}
    </svg>
  );
}

function ScorePill({
  value,
  deltaValue,
  suffix = "",
  higherIsBetter = true,
  hint = "",
}: {
  value: number;
  deltaValue: number;
  suffix?: string;
  higherIsBetter?: boolean;
  hint?: string;
}) {
  const improved = higherIsBetter ? deltaValue >= 0 : deltaValue <= 0;
  const dir = improved ? "up" : "down";
  return (
    <div className="ws-scorePill">
      <div className="ws-scoreMain">
        {Number.isFinite(value) ? value.toFixed(0) : "-"}
        {suffix}
      </div>
      <div className={`ws-scoreDelta ${dir}`}>
        {improved ? "▲" : "▼"} {formatDelta(Math.abs(deltaValue))}
      </div>
      {hint ? <div className="ws-scoreHint">{hint}</div> : null}
    </div>
  );
}

function InfoTip({ title, body }: { title: string; body: string }) {
  return (
    <span className="ws-info" tabIndex={0} aria-label={`${title}. ${body}`}>
      i
      <span className="ws-infoPop">
        <div className="ws-infoTitle">{title}</div>
        <div className="ws-infoBody">{body}</div>
      </span>
    </span>
  );
}

/** --------- Activity: Heatmap (simple) --------- */
type HeatCell = { level: 0 | 1 | 2 | 3 | 4; dateKey: string };
function YearHeatmap({ cells, weeks = 16 }: { cells: HeatCell[]; weeks?: number }) {
  const total = weeks * 7;
  const slice = cells.slice(-total);

  return (
    <div className="ws-heatWrap">
      <div className="ws-heatLegend">
        <span className="ws-heatLess">Less</span>
        <span className="ws-heatDots">
          <span className="ws-heatDot l0" />
          <span className="ws-heatDot l1" />
          <span className="ws-heatDot l2" />
          <span className="ws-heatDot l3" />
          <span className="ws-heatDot l4" />
        </span>
        <span className="ws-heatMore">More</span>
      </div>

      <div className="ws-heatGrid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
        {Array.from({ length: weeks }).map((_, w) => {
          const col = slice.slice(w * 7, w * 7 + 7);
          return (
            <div key={w} className="ws-heatCol">
              {col.map((c, idx) => (
                <div key={`${c.dateKey}-${idx}`} className={`ws-heatCell l${c.level}`} title={c.dateKey} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** --------- Activity: stacked bars --------- */
type StackDay = {
  label: string;
  session: number;
  review: number;
  quest: number;
  aiPractice: number;
};
function StackedBars({ data }: { data: StackDay[] }) {
  return (
    <div className="ws-stackWrap">
      <div className="ws-stackLegend">
        <span className="ws-tag s1">Session</span>
        <span className="ws-tag s2">Quick Review</span>
        <span className="ws-tag s3">Quest</span>
        <span className="ws-tag s4">AI Practice</span>
      </div>

      <div className="ws-stackGrid">
        {data.map((d) => {
          const total = d.session + d.review + d.quest + d.aiPractice || 1;
          const s1 = (d.session / total) * 100;
          const s2 = (d.review / total) * 100;
          const s3 = (d.quest / total) * 100;
          const s4 = (d.aiPractice / total) * 100;

          return (
            <div key={d.label} className="ws-stackItem">
              <div className="ws-stackBar">
                <div className="ws-stackSeg s1" style={{ height: `${s1}%` }} />
                <div className="ws-stackSeg s2" style={{ height: `${s2}%` }} />
                <div className="ws-stackSeg s3" style={{ height: `${s3}%` }} />
                <div className="ws-stackSeg s4" style={{ height: `${s4}%` }} />
              </div>
              <div className="ws-stackLabel">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** --------- Vocabulary (phrase-based; no test needed) --------- */
type VocabSummary = {
  phrasesKnownTotal: number;
  newPhrasesInRange: number;
  retentionRate: number;
  recentNewPhrases: { text: string; topic: string }[];
};

async function generatePractice(metric: Metric): Promise<Practice> {
  switch (metric.practiceType) {
    case "accuracy_drill":
      return {
        id: "prac_accuracy_01",
        metricKey: metric.key,
        practiceType: metric.practiceType,
        title: "Accuracy Drill",
        durationMin: 4,
        goal: "Improve correctness with short prompt repeats.",
        steps: ["Do 6 short prompts.", "Mark 1 mistake per prompt.", "Repeat once fixing that mistake."],
      };
    case "pace_drill":
      return {
        id: "prac_pace_01",
        metricKey: metric.key,
        practiceType: metric.practiceType,
        title: "Pace Control",
        durationMin: 4,
        goal: "Keep a steady speaking speed.",
        steps: ["Answer 6 prompts at steady tempo.", "If rushing: pause 0.5s between sentences.", "Repeat hardest 2."],
      };
    case "silence_drill":
      return {
        id: "prac_silence_01",
        metricKey: metric.key,
        practiceType: metric.practiceType,
        title: "Reduce Pauses",
        durationMin: 4,
        goal: "Reduce long pauses with a simple structure.",
        steps: ["Rule: 1 sentence + 1 detail.", "No silence > 2 seconds.", "Repeat hardest 2."],
      };
    default:
      return {
        id: "prac_stability_01",
        metricKey: metric.key,
        practiceType: metric.practiceType,
        title: "Stability Routine",
        durationMin: 5,
        goal: "Reduce day-to-day swings with a consistent routine.",
        steps: ["Warm up 3 easy prompts.", "Main 6 prompts.", "Repeat hardest 2 prompts."],
      };
  }
}

export default function StatsView() {
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeKey>("7d");
  const [tab, setTab] = useState<TabKey>("overview");
  const [busy, setBusy] = useState(false);

  /** ---- Sample data (replace with API) ---- */
  const coverageByRange: Record<RangeKey, Coverage> = {
    "7d": { unitsCount: 4, promptsCount: 68, minutes: 42 },
    "30d": { unitsCount: 12, promptsCount: 310, minutes: 196 },
  };

  const activity7 = [1, 1, 0, 1, 1, 0, 1];
  const streakDays = 12;

  const dateLabels7 = { left: "Jan 22", mid: "Jan 25", right: "Jan 28" };
  const dateLabels30 = { left: "Dec 30", mid: "Jan 14", right: "Jan 28" };
  const labels = range === "7d" ? dateLabels7 : dateLabels30;

  const speakingScoreByRange = {
    "7d": { current: 74.0, prev: 70.6, trend: [62, 64, 66, 69, 71, 73, 74] },
    "30d": { current: 72.0, prev: 69.5, trend: [60, 61, 62, 64, 65, 66, 67, 68, 69, 70, 71, 72] },
  } as const;

  const metricsByRange: Record<RangeKey, Metric[]> = {
    "7d": [
      {
        key: "accuracy",
        label: "Accuracy",
        unitLabel: "%",
        current: 78.0,
        prev: 74.5,
        trend: [66, 68, 70, 73, 75, 77, 78],
        higherIsBetter: true,
        infoTitle: "What is Accuracy?",
        infoBody: "Correctness rate based on your speaking prompt outcomes in the selected period.",
        practiceType: "accuracy_drill",
      },
      {
        key: "pace",
        label: "Pace",
        unitLabel: "wpm",
        current: 122,
        prev: 116,
        trend: [52, 55, 58, 61, 63, 66, 68],
        higherIsBetter: true,
        infoTitle: "What is Pace?",
        infoBody: "Average speaking speed (words per minute). Chart shows the trend over days.",
        practiceType: "pace_drill",
      },
      {
        key: "silence_ratio",
        label: "Silence Ratio",
        unitLabel: "%",
        current: 41.0,
        prev: 38.0,
        trend: [32, 35, 36, 40, 42, 41, 41],
        higherIsBetter: false,
        infoTitle: "What is Silence Ratio?",
        infoBody: "Portion of time you were silent during speaking attempts. Lower is better.",
        practiceType: "silence_drill",
      },
      {
        key: "stability",
        label: "Stability",
        unitLabel: "/100",
        current: 56.0,
        prev: 53.5,
        trend: [45, 60, 48, 62, 50, 58, 56],
        higherIsBetter: true,
        infoTitle: "What is Stability?",
        infoBody: "Consistency of your daily speaking performance. Based on day-to-day variation.",
        practiceType: "stability_routine",
      },
    ],
    "30d": [
      {
        key: "accuracy",
        label: "Accuracy",
        unitLabel: "%",
        current: 76.0,
        prev: 72.0,
        trend: [60, 61, 63, 64, 66, 67, 69, 70, 72, 73, 75, 76],
        higherIsBetter: true,
        infoTitle: "What is Accuracy?",
        infoBody: "Correctness rate based on your speaking prompt outcomes in the selected period.",
        practiceType: "accuracy_drill",
      },
      {
        key: "pace",
        label: "Pace",
        unitLabel: "wpm",
        current: 118,
        prev: 112,
        trend: [50, 51, 53, 54, 55, 57, 58, 60, 62, 64, 66],
        higherIsBetter: true,
        infoTitle: "What is Pace?",
        infoBody: "Average speaking speed (words per minute). Chart shows the trend over days.",
        practiceType: "pace_drill",
      },
      {
        key: "silence_ratio",
        label: "Silence Ratio",
        unitLabel: "%",
        current: 39.0,
        prev: 42.0,
        trend: [46, 45, 43, 42, 41, 40, 39],
        higherIsBetter: false,
        infoTitle: "What is Silence Ratio?",
        infoBody: "Portion of time you were silent during speaking attempts. Lower is better.",
        practiceType: "silence_drill",
      },
      {
        key: "stability",
        label: "Stability",
        unitLabel: "/100",
        current: 57.0,
        prev: 54.0,
        trend: [48, 50, 52, 55, 53, 56, 58, 55, 57],
        higherIsBetter: true,
        infoTitle: "What is Stability?",
        infoBody: "Consistency of your daily speaking performance. Based on day-to-day variation.",
        practiceType: "stability_routine",
      },
    ],
  };

  // Activity tab samples
  const heatCells = useMemo<HeatCell[]>(() => {
    const days = 7 * 16;
    const out: HeatCell[] = [];
    for (let i = 0; i < days; i++) {
      const lvl = (i % 11 === 0 ? 0 : (i * 3) % 5) as 0 | 1 | 2 | 3 | 4;
      out.push({ level: lvl, dateKey: `Day ${i + 1}` });
    }
    return out;
  }, []);

  const stackWeek: StackDay[] = [
    { label: "Mon", session: 40, review: 20, quest: 25, aiPractice: 15 },
    { label: "Tue", session: 60, review: 10, quest: 10, aiPractice: 20 },
    { label: "Wed", session: 0, review: 0, quest: 0, aiPractice: 0 },
    { label: "Thu", session: 45, review: 15, quest: 15, aiPractice: 25 },
    { label: "Fri", session: 35, review: 25, quest: 10, aiPractice: 30 },
    { label: "Sat", session: 0, review: 0, quest: 0, aiPractice: 0 },
    { label: "Sun", session: 50, review: 15, quest: 20, aiPractice: 15 },
  ];

  // Vocabulary tab (phrase-based)
  const vocabByRange: Record<RangeKey, VocabSummary> = {
    "7d": {
      phrasesKnownTotal: 420,
      newPhrasesInRange: 28,
      retentionRate: 71.0,
      recentNewPhrases: [
        { text: "handle a refund", topic: "Customer service" },
        { text: "I'm on it.", topic: "Work" },
        { text: "Could you clarify that?", topic: "Communication" },
        { text: "I'll get back to you.", topic: "Follow-up" },
      ],
    },
    "30d": {
      phrasesKnownTotal: 860,
      newPhrasesInRange: 112,
      retentionRate: 68.0,
      recentNewPhrases: [
        { text: "That works for me.", topic: "Scheduling" },
        { text: "Let's double-check.", topic: "Work" },
        { text: "I appreciate it.", topic: "Polite tone" },
        { text: "I'll take care of it.", topic: "Responsibility" },
      ],
    },
  };

  const coverage = coverageByRange[range];
  const speakingScore = speakingScoreByRange[range];
  const metrics = metricsByRange[range];
  const weakest = useMemo(() => pickWeakest(metrics), [metrics]);
  const mostDropped = useMemo(() => pickMostDropped(metrics), [metrics]);

  const practiceDaysCount = activity7.reduce((a, b) => a + b, 0);

  const summaryLine = useMemo(() => {
    if (weakest.key === mostDropped.key) return `Your biggest opportunity is ${weakest.label}.`;
    return `Weakest: ${weakest.label}. Biggest drop: ${mostDropped.label}.`;
  }, [weakest, mostDropped]);

  async function startPractice(metric: Metric) {
    setBusy(true);
    try {
      const practice = await generatePractice(metric);
      navigate("/practice", { state: { practice } });
    } finally {
      setBusy(false);
    }
  }

  const vocab = vocabByRange[range];

  return (
    <div className="ws-statsPage">
      {/* Header */}
      <header className="ws-statsHeader">
        <div className="ws-titleBlock">
          <div className="ws-title">Stats</div>
          <div className="ws-subtitle">Overview · {range === "7d" ? "Last 7 days" : "Last 30 days"}</div>
        </div>

        <div className="ws-rangeToggle" role="tablist" aria-label="range toggle">
          <button className={`ws-toggleBtn ${range === "7d" ? "active" : ""}`} onClick={() => setRange("7d")}>
            7D
          </button>
          <button className={`ws-toggleBtn ${range === "30d" ? "active" : ""}`} onClick={() => setRange("30d")}>
            30D
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="ws-tabs" role="tablist" aria-label="stats tabs">
        <button className={`ws-tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
          Overview
        </button>
        <button className={`ws-tab ${tab === "activity" ? "active" : ""}`} onClick={() => setTab("activity")}>
          Activity
        </button>
        <button className={`ws-tab ${tab === "vocabulary" ? "active" : ""}`} onClick={() => setTab("vocabulary")}>
          Vocabulary
        </button>
      </div>

      {/* Content */}
      {tab === "overview" && (
        <>
          <section className="ws-hero">
            {/* Main */}
            <div className="ws-heroCard">
              <div className="ws-heroTop">
                <div>
                  <div className="ws-heroLabel">Speaking Score</div>
                  <div className="ws-heroExplain">
                    {range === "7d" ? "7-day average" : "30-day average"} · based on <b>{coverage.promptsCount}</b>{" "}
                    speaking prompts
                  </div>
                </div>

                <ScorePill value={speakingScore.current} deltaValue={delta(speakingScore.current, speakingScore.prev)} />
              </div>

              <div className="ws-heroChartRow">
                <ChartWithLabels
                  data={speakingScore.trend}
                  leftLabel={labels.left}
                  midLabel={labels.mid}
                  rightLabel={labels.right}
                />
              </div>

              <div className="ws-activityPills">
                <div className="ws-pill">
                  <div className="ws-pillTop">Units</div>
                  <div className="ws-pillVal">{coverage.unitsCount}</div>
                </div>
                <div className="ws-pill">
                  <div className="ws-pillTop">Prompts</div>
                  <div className="ws-pillVal">{coverage.promptsCount}</div>
                </div>
                <div className="ws-pill">
                  <div className="ws-pillTop">Minutes</div>
                  <div className="ws-pillVal">{coverage.minutes}</div>
                </div>
              </div>

              <div className="ws-headline">{summaryLine}</div>
            </div>

            {/* Side */}
            <div className="ws-heroSide">
              <div className="ws-miniCard">
                <div className="ws-miniTop">
                  <div className="ws-miniLabel">🔥 Streak</div>
                  <div className="ws-miniValue">{streakDays} days</div>
                </div>
                <div className="ws-miniSub">
                  Last 7 days: <b>{practiceDaysCount}/7</b>
                </div>
                <div className="ws-miniBars">
                  <MiniBars values={activity7} height={34} />
                </div>
              </div>

              {/* Weak spot (NO CHART) */}
              <div className="ws-miniCard">
                <div className="ws-miniTop">
                  <div className="ws-miniLabel">
                    Weak spot <InfoTip title={weakest.infoTitle} body={weakest.infoBody} />
                  </div>
                  <div className="ws-miniValue">{weakest.label}</div>
                </div>

                <div className="ws-miniMetricLine">
                  <span className="ws-miniMetricVal">
                    {weakest.key === "pace"
                      ? `${weakest.current.toFixed(0)} ${weakest.unitLabel}`
                      : weakest.key === "stability"
                      ? `${weakest.current.toFixed(0)} / 100`
                      : `${weakest.current.toFixed(0)}${weakest.unitLabel}`}
                  </span>
                  <span className={`ws-miniDelta ${improvementDelta(weakest) >= 0 ? "up" : "down"}`}>
                    {improvementDelta(weakest) >= 0 ? "▲" : "▼"} {Math.abs(improvementDelta(weakest)).toFixed(1)}
                  </span>
                </div>

                <button className="ws-primaryBtn" onClick={() => startPractice(weakest)} disabled={busy}>
                  {busy ? "Starting..." : "Start practice"}
                </button>
                <button className="ws-secondaryBtn" onClick={() => navigate("/reports")}>
                  See details
                </button>
              </div>
            </div>
          </section>

          {/* Key metrics: 4-column WITH compact charts + smaller cards */}
          <section className="ws-metrics">
            <div className="ws-sectionTitle">Key metrics</div>

            <div
              className="ws-metricGrid4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 12,
                alignItems: "stretch",
              }}
            >
              {metrics.map((m) => {
                const d = improvementDelta(m);
                const improved = d >= 0;

                const valueText =
                  m.key === "pace"
                    ? `${m.current.toFixed(0)} ${m.unitLabel}`
                    : m.key === "stability"
                    ? `${m.current.toFixed(0)} / 100`
                    : `${m.current.toFixed(0)}${m.unitLabel}`;

                return (
                  <div
                    key={m.key}
                    className="ws-miniMetricCard"
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      minWidth: 0,
                    }}
                  >
                    <div className="ws-miniMetricTop" style={{ marginBottom: 6 }}>
                      <div className="ws-miniMetricLabel" style={{ fontSize: 12, fontWeight: 600 }}>
                        {m.label} <InfoTip title={m.infoTitle} body={m.infoBody} />
                      </div>

                      <div className={`ws-miniMetricDelta ${improved ? "up" : "down"}`} style={{ fontSize: 12 }}>
                        {improved ? "▲" : "▼"} {Math.abs(d).toFixed(1)}
                      </div>
                    </div>

                    <div className="ws-miniMetricValueRow" style={{ marginBottom: 6 }}>
                      <div className="ws-miniMetricValue" style={{ fontSize: 18, fontWeight: 700 }}>
                        {valueText}
                      </div>
                    </div>

                    <ChartWithLabels
                      data={m.trend}
                      leftLabel={labels.left}
                      midLabel={labels.mid}
                      rightLabel={labels.right}
                      compact
                    />

                    <button
                      className="ws-inlineBtn"
                      style={{ marginTop: 10, width: "100%", padding: "10px 12px", borderRadius: 12 }}
                      onClick={() => startPractice(m)}
                      disabled={busy}
                    >
                      Practice
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <footer className="ws-footerNote">
            Reports are stored for up to 1 year. Stats is a summary for the selected period.
          </footer>
        </>
      )}

      {tab === "activity" && (
        <>
          <section className="ws-panel">
            <div className="ws-panelTitle">Learning consistency</div>
            <div className="ws-panelSub">A quick view of your recent weeks. Stronger color means more speaking activity.</div>
            <div className="ws-panelBody">
              <YearHeatmap cells={heatCells} weeks={16} />
            </div>
          </section>

          <section className="ws-panel">
            <div className="ws-panelTitle">Study mix (last 7 days)</div>
            <div className="ws-panelSub">What you practiced each day — optimized for speaking-first learning.</div>
            <div className="ws-panelBody">
              <StackedBars data={stackWeek} />
            </div>
          </section>

          <section className="ws-panel">
            <div className="ws-panelTitle">Study time trend</div>
            <div className="ws-panelSub">Track time spent in speaking-related activities.</div>
            <div className="ws-panelBody">
              <ChartWithLabels
                data={range === "7d" ? [10, 22, 0, 18, 26, 0, 20] : [8, 12, 10, 22, 18, 24, 16, 20, 14, 18, 22]}
                leftLabel={labels.left}
                midLabel={labels.mid}
                rightLabel={labels.right}
              />
            </div>
          </section>

          <footer className="ws-footerNote">Tip: Consistency beats intensity — streak + steady practice is the fastest path.</footer>
        </>
      )}

      {tab === "vocabulary" && (
        <>
          <section className="ws-panel">
            <div className="ws-panelTitle">Vocabulary (phrase-based)</div>
            <div className="ws-panelSub">
              We don’t run vocabulary tests. This tracks the phrases you learned from sessions and how well you retain them.
            </div>

            <div className="ws-vocabKpis">
              <div className="ws-vocabCard">
                <div className="ws-vocabLabel">Phrases learned</div>
                <div className="ws-vocabValue">{vocab.phrasesKnownTotal.toLocaleString()}</div>
                <div className="ws-vocabHint">Cumulative phrases from completed sessions</div>
              </div>

              <div className="ws-vocabCard">
                <div className="ws-vocabLabel">New phrases</div>
                <div className="ws-vocabValue">{vocab.newPhrasesInRange.toLocaleString()}</div>
                <div className="ws-vocabHint">First seen in the selected period</div>
              </div>

              <div className="ws-vocabCard">
                <div className="ws-vocabLabel">
                  Retention{" "}
                  <InfoTip
                    title="What is Retention?"
                    body="How often you successfully reused/recalled learned phrases in later practice. Proxy metric (no vocab test)."
                  />
                </div>
                <div className="ws-vocabValue">{vocab.retentionRate.toFixed(0)}%</div>
                <div className="ws-vocabHint">Based on repeated use across sessions/practice</div>
              </div>
            </div>
          </section>

          <section className="ws-panel">
            <div className="ws-panelTitle">Recently learned phrases</div>
            <div className="ws-panelSub">Fast review list — perfect for quick speaking warm-ups.</div>

            <div className="ws-phraseList">
              {vocab.recentNewPhrases.map((p, idx) => (
                <div key={idx} className="ws-phraseRow">
                  <div className="ws-phraseMain">
                    <div className="ws-phraseText">{p.text}</div>
                    <div className="ws-phraseMeta">{p.topic}</div>
                  </div>
                  <button
                    className="ws-inlineBtn"
                    onClick={() => navigate("/practice", { state: { mode: "phrase_review", phrase: p } })}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </section>

          <footer className="ws-footerNote">
            Vocabulary here is “what you can say” — learned phrases + repeated use, not a test score.
          </footer>
        </>
      )}
    </div>
  );
}
