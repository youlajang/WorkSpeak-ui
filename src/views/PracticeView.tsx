// src/views/PracticeView.tsx
import { useMemo, useState } from "react";
import "../styles/practice.css";

type TimeWindow = "14d" | "90d";
type WeaknessLayer = "Mechanics" | "Function" | "Context";
type Exam = "IELTS" | "CELPIP";

type WeaknessItem = {
  id: string;
  title: string;
  layer: WeaknessLayer;
  hint: string;
  accuracy: number; // 0~100 (lower = weaker)
  estMin: number;
};

type GoalStep = {
  id: string;
  title: string;
  desc: string;
  status: "done" | "next" | "locked";
  estMin: number;
};

type ExamPreset = { exam: Exam; presets: string[] };

type WorkCategory = {
  id: string;
  title: string;
  subtitle: string;
  chips: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function badgeForAccuracy(acc: number) {
  if (acc <= 55) return { label: "Very weak", tone: "danger" as const };
  if (acc <= 75) return { label: "Needs practice", tone: "warn" as const };
  return { label: "Stable", tone: "ok" as const };
}

function layerLabel(layer: WeaknessLayer) {
  if (layer === "Mechanics") return "Mechanics";
  if (layer === "Function") return "Function";
  return "Context";
}

export default function PracticeView() {
  const userLevel = 3;

  // Profile-driven: only show selected industries
  const [myIndustries, setMyIndustries] = useState<string[]>([
    "Café",
    "Retail",
    "Office · Tech/IT",
  ]);

  // Weakness settings
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("90d");
  const [showAllWeak, setShowAllWeak] = useState(false);
  // Roadmap popup
  const [showRoadmapPopup, setShowRoadmapPopup] = useState(false);

  // Test goal
  const [goalExam, setGoalExam] = useState<Exam>("IELTS");
  const [goalPreset, setGoalPreset] = useState<string>("6.5");

  // ---- Mock weakness data ----
  const weakness14: WeaknessItem[] = [
    {
      id: "w1",
      title: "Sentence starters",
      layer: "Function",
      hint: "Openers & first sentence patterns (reduce pauses).",
      accuracy: 48,
      estMin: 5,
    },
    {
      id: "w2",
      title: "Numbers & dates (listening)",
      layer: "Context",
      hint: "Prices/time slots recognition + confirmation phrases.",
      accuracy: 52,
      estMin: 6,
    },
    {
      id: "w3",
      title: "Polite requests",
      layer: "Function",
      hint: "Could/Would + softeners (would you mind… / if possible…).",
      accuracy: 60,
      estMin: 7,
    },
  ];

  const weakness90: WeaknessItem[] = [
    {
      id: "w4",
      title: "Prepositions (in/on/at)",
      layer: "Mechanics",
      hint: "Time/location phrases under speed are inconsistent.",
      accuracy: 58,
      estMin: 7,
    },
    {
      id: "w5",
      title: "Past vs Present",
      layer: "Mechanics",
      hint: "Tense selection gets shaky in storytelling.",
      accuracy: 63,
      estMin: 8,
    },
    {
      id: "w6",
      title: "Problem → solution flow",
      layer: "Function",
      hint: "Structure: problem → impact → options → recommendation.",
      accuracy: 70,
      estMin: 8,
    },
  ];

  const weaknesses = timeWindow === "14d" ? weakness14 : weakness90;

  const sortedWeak = useMemo(() => {
    return [...weaknesses].sort((a, b) => a.accuracy - b.accuracy);
  }, [weaknesses]);

  const topWeakness = sortedWeak[0];
  const weaknessToShow = showAllWeak ? sortedWeak : sortedWeak.slice(0, 3);

  // ---- TODAY recommendation (always 1, strongest) ----
  const todayRec = useMemo(() => {
    const w = topWeakness;
    if (!w) {
      return {
        title: "Your best drill today",
        reason: "Auto-picked from your recent mistakes",
        estMin: 7,
        layer: "Function" as WeaknessLayer,
        impact: "High impact",
        score: 92,
      };
    }
    const urgency = clamp(100 - w.accuracy, 10, 95);
    return {
      title: w.title,
      reason: `Auto-picked from your last ${
        timeWindow === "14d" ? "14 days" : "90 days"
      } mistakes · ${layerLabel(w.layer)}`,
      estMin: w.estMin,
      layer: w.layer,
      impact: w.accuracy <= 60 ? "High impact" : "Good focus",
      score: urgency,
    };
  }, [topWeakness, timeWindow]);

  // ---- Exam presets ----
  const examPresets: ExamPreset[] = [
    { exam: "IELTS", presets: ["5.5", "6.5", "7.0+"] },
    { exam: "CELPIP", presets: ["7", "9", "10+"] },
  ];

  // ---- Goal steps (demo) ----
  const goalSteps: GoalStep[] = useMemo(() => {
    const base: Omit<GoalStep, "status">[] = [
      {
        id: "s1",
        title: "Stop the pauses",
        desc: "Openers + 1st sentence templates (fast start).",
        estMin: 8,
      },
      {
        id: "s2",
        title: "Answer structure",
        desc: "Opinion → reason → example (+2 connectors).",
        estMin: 10,
      },
      {
        id: "s3",
        title: "Paraphrase basics",
        desc: "Synonyms + re-phrasing + pattern changes.",
        estMin: 10,
      },
      {
        id: "s4",
        title: "Time-box speaking",
        desc: "30s prep → 60–90s speak under timer.",
        estMin: 12,
      },
      {
        id: "s5",
        title: "Exam-style challenge",
        desc:
          goalExam === "IELTS"
            ? "Long-turn + follow-ups (discussion)."
            : "CELPIP: opinion + difficult situation under mic timer.",
        estMin: 12,
      },
    ];

    // Demo status: 1 done, 1 next, rest locked
    return base.map((s, idx) => {
      if (idx === 0) return { ...s, status: "done" as const };
      if (idx === 1) return { ...s, status: "next" as const };
      return { ...s, status: "locked" as const };
    });
  }, [goalExam]);

  const progress = useMemo(() => {
    const total = goalSteps.length;
    const done = goalSteps.filter((s) => s.status === "done").length;
    const pct = Math.round((done / total) * 100);
    const next = goalSteps.find((s) => s.status === "next") ?? goalSteps[0];
    return { total, done, pct, next };
  }, [goalSteps]);

  // ---- Work categories ----
  const allWorkCats: WorkCategory[] = [
    {
      id: "cafe",
      title: "Café",
      subtitle: "Orders, allergies, complaints, closing",
      chips: ["Order taking", "Recommendations", "Complaints", "Payment"],
    },
    {
      id: "retail",
      title: "Retail",
      subtitle: "Stock, size, returns, upsell",
      chips: ["Returns", "Stock check", "Policies", "Upsell"],
    },
    {
      id: "office-tech",
      title: "Office · Tech/IT",
      subtitle: "Status update, meetings, blockers",
      chips: ["Updates", "Scheduling", "Clarifying", "Escalation"],
    },
    {
      id: "office-fin",
      title: "Office · Finance",
      subtitle: "Documents, policy, customer guidance",
      chips: ["Policy", "Documents", "Explaining", "Risk tone"],
    },
    {
      id: "construction",
      title: "Field · Construction",
      subtitle: "Safety, instructions, reporting issues",
      chips: ["Safety", "Instructions", "Site issues", "Coordination"],
    },
    {
      id: "logistics",
      title: "Field · Logistics",
      subtitle: "Delays, routing, damaged items",
      chips: ["Delays", "Handover", "Damages", "Tracking"],
    },
    {
      id: "healthcare",
      title: "Healthcare",
      subtitle: "Clinic talk, reassurance, basic intake",
      chips: ["Check-in", "Symptoms", "Insurance", "Reassurance"],
    },
    {
      id: "immigration",
      title: "Immigration Interview",
      subtitle: "Plans, documents, clarifying questions",
      chips: ["Self intro", "Plans", "Rules", "Clarify politely"],
    },
  ];

  const myWorkCats = useMemo(() => {
    return allWorkCats.filter((c) => myIndustries.includes(c.title));
  }, [myIndustries]);

  // ---- actions ----
  const onStartToday = () => alert(`Start today: ${todayRec.title}`);

  const onStartWeaknessSet = () =>
    alert(
      `Start weakness set (${timeWindow}): ${sortedWeak
        .slice(0, 3)
        .map((w) => w.title)
        .join(", ")}`
    );
  const onStartWeakness = (w: WeaknessItem) => alert(`Start: ${w.title}`);

  const onStartExamPractice = () =>
    alert(`Start exam practice: ${goalExam} ${goalPreset}`);

  const onStartWork = (c: WorkCategory) => alert(`Start work: ${c.title}`);

  const onEditIndustries = () => {
    // demo toggle
    const next =
      myIndustries[0] === "Café"
        ? ["Healthcare", "Immigration Interview", "Office · Finance"]
        : ["Café", "Retail", "Office · Tech/IT"];
    setMyIndustries(next);
  };

  return (
    <div className="pPage">
      {/* Header */}
      <div className="ws-topbar" style={{ paddingLeft: 6, paddingRight: 6 }}>
        <div>
          <h1 className="ws-title">Practice Hub</h1>
          <div className="ws-sub">
            Level <b>{userLevel}</b> · Personalized daily plan
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="ws-btn ws-btn-outline ws-btn-sm" onClick={() => alert("History")} type="button">
            History
          </button>
          <button className="ws-btn ws-btn-outline ws-btn-sm" onClick={() => alert("Settings")} type="button">
            Settings
          </button>
        </div>
      </div>

      {/* 1) TODAY — strongest */}
      <section className="pHero pHeroPrimary">
        <div className="pHeroLeft">
          <div className="pHeroKicker">
            <span className="pKNum pKNumHero">1</span>
            <span className="pHeroKickerText">TODAY (DO THIS FIRST)</span>
          </div>

          <div className="pHeroTitleRow">
            <div className="pHeroTitle">{todayRec.title}</div>
            <span className="pScore" title="Priority score">
              {todayRec.score}
            </span>
            <span
              className="pInfoIcon"
              title="We picked this because it's your top weakness in the selected window."
              style={{ cursor: "help", fontSize: "14px", opacity: 0.6, marginLeft: "8px" }}
            >
              ℹ️
            </span>
          </div>

          <div className="pHeroDesc">{todayRec.reason}</div>

          <div className="ws-heroMeta">
            <span className="ws-metaPill">⏱ {todayRec.estMin} min</span>
            <span className="ws-metaPill">{todayRec.impact}</span>
            <span className="ws-chip">{layerLabel(todayRec.layer)}</span>
          </div>
        </div>

        <div className="pHeroRight">
          <button className="ws-btn ws-btn-primary ws-btn-hero" onClick={onStartToday} type="button">
            Start now
          </button>
        </div>
      </section>

      <main className="pStack">
        {/* 2) WEAKNESS */}
        <section className="ws-card pCardSecondary">
          <div className="ws-cardTitleRow">
            <div>
              <div className="pKicker">
                <span className="pKNum">2</span>
                <span>WEAKNESS</span>
              </div>
              <div className="ws-cardTitle">Fix My Weakness</div>
              <div className="ws-sub">Auto-collected mistakes → short set → repeat.</div>
            </div>

            <div className="pTopRight">
              <div className="pSegment" aria-label="Time window">
                <button
                  className={"pSegBtn " + (timeWindow === "14d" ? "isActive" : "")}
                  onClick={() => setTimeWindow("14d")}
                  type="button"
                >
                  14d
                </button>
                <button
                  className={"pSegBtn " + (timeWindow === "90d" ? "isActive" : "")}
                  onClick={() => setTimeWindow("90d")}
                  type="button"
                >
                  90d
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                <button className="ws-btn ws-btn-secondary ws-btn-sm" onClick={onStartWeaknessSet} type="button">
                  Start weakness set
                </button>
                <button
                  className="pViewAllLink"
                  onClick={() => setShowAllWeak((v) => !v)}
                  type="button"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--muted)",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  {showAllWeak ? "Show less" : "View all"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div className="pWeakList">
              {weaknessToShow.map((w) => {
                const badge = badgeForAccuracy(w.accuracy);
                const urgency = clamp(100 - w.accuracy, 5, 95);
                return (
                  <div key={w.id} className="pWeakItem">
                    <div className="pWeakMain">
                      <div className="pWeakRow">
                        <div className="pWeakName">{w.title}</div>
                        <span className={"pBadge " + `tone-${badge.tone}`}>{badge.label}</span>
                        <span className="ws-chip">{layerLabel(w.layer)}</span>
                        <span className="ws-muted">{w.estMin} min</span>
                      </div>
                      <div className="ws-sub" style={{ marginTop: 4, marginBottom: 10 }}>{w.hint}</div>

                      <div className="pBar">
                        <div className="pBarTrack">
                          <div className="pBarFill" style={{ width: `${urgency}%` }} />
                        </div>
                        <div className="pBarLabel">Urgency</div>
                      </div>
                    </div>

                    <div className="pWeakActions">
                      <button className="ws-btn ws-btn-tertiary ws-btn-sm" onClick={() => onStartWeakness(w)} type="button">
                        Practice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3) TEST PREP — exam first (left), process (right) */}
        <section className="ws-card pCardTertiary">
          <div className="ws-cardTitleRow">
            <div>
              <div className="pKicker">
                <span className="pKNum">3</span>
                <span>TEST PREP</span>
              </div>
              <div className="ws-cardTitle">Choose exam → see your plan</div>
              <div className="ws-sub">
                Pick your target first. Your next step updates automatically.
              </div>
            </div>

            <div className="pTopRight">
              <span className="ws-muted">
                Current target: <b>{goalExam}</b> · <b>{goalPreset}</b>
              </span>
              <button className="ws-btn ws-btn-secondary ws-btn-sm" onClick={onStartExamPractice} type="button">
                Start exam practice
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div className="pTwoCol">
              {/* Left: Select exam */}
              <div className="pPanel">
                <div className="ws-cardTitle">Exam target</div>
                <div className="ws-sub" style={{ marginTop: 4 }}>Select your exam and score preset.</div>

                <div className="pFormRow">
                  <div className="pField">
                    <div className="ws-muted" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Exam</div>
                    <div className="pSelectWrap">
                      <select
                        className="pSelect"
                        value={goalExam}
                        onChange={(e) => {
                          const ex = e.target.value as Exam;
                          setGoalExam(ex);
                          const presets =
                            examPresets.find((x) => x.exam === ex)?.presets ?? [];
                          setGoalPreset(presets[0] ?? "");
                        }}
                      >
                        <option value="IELTS">IELTS</option>
                        <option value="CELPIP">CELPIP</option>
                      </select>
                    </div>
                  </div>

                  <div className="pField">
                    <div className="ws-muted" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Target</div>
                    <div className="pPresetRow">
                      {(examPresets.find((x) => x.exam === goalExam)?.presets ?? []).map(
                        (p) => (
                          <button
                            key={p}
                            className={"pPresetBtn " + (goalPreset === p ? "isActive" : "")}
                            onClick={() => setGoalPreset(p)}
                            type="button"
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="pExamMini">
                  <div className="ws-cardTitle" style={{ fontSize: 14, marginBottom: 10 }}>
                    {goalExam === "IELTS" ? "IELTS General (Speaking)" : "CELPIP (Speaking)"}
                  </div>

                  <div className="pExamChips">
                    {goalExam === "IELTS" ? (
                      <>
                        <span className="ws-chip">Long-turn</span>
                        <span className="ws-chip">Follow-ups</span>
                        <span className="ws-chip">Paraphrase</span>
                        <span className="ws-chip">Listening gist</span>
                      </>
                    ) : (
                      <>
                        <span className="ws-chip">6 speaking types</span>
                        <span className="ws-chip">Mic + timer</span>
                        <span className="ws-chip">Difficult situations</span>
                        <span className="ws-chip">Clear openings</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Process */}
              <div className="pPanel">
                <div className="pProgressTop">
                  <div className="ws-cardTitle">
                    Your plan <span className="ws-muted">({progress.done}/{progress.total})</span>
                  </div>
                  <div className="pProgressPct">{progress.pct}%</div>
                </div>

                <div className="pProgressTrack">
                  <div className="pProgressFill" style={{ width: `${progress.pct}%` }} />
                </div>

                <div className="pNextCard">
                  <div className="pNextTag">NEXT STEP</div>
                  <div className="pNextTitle">{progress.next?.title ?? "Next step"}</div>
                  <div className="pNextDesc">{progress.next?.desc ?? "—"}</div>
                  <div className="ws-heroMeta" style={{ marginTop: 10 }}>
                    <span className="ws-metaPill">⏱ {progress.next?.estMin ?? 10} min</span>
                  </div>
                  <button
                    className="pRoadmapLink"
                    onClick={() => setShowRoadmapPopup(true)}
                    type="button"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "8px 0 0 0",
                      marginTop: "8px",
                      textAlign: "left",
                    }}
                  >
                    View roadmap →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4) WORK PRACTICE */}
        <section className="ws-card pCardQuaternary">
          <div className="ws-cardTitleRow">
            <div>
              <div className="pKicker">
                <span className="pKNum">4</span>
                <span>WORK PRACTICE</span>
              </div>
              <div className="ws-cardTitle">Work scenarios</div>
              <div className="ws-sub">Only your selected industries.</div>
            </div>

            <div className="pTopRight">
              <span className="ws-muted">
                Showing <b>{myWorkCats.length}</b>
              </span>
              <button className="ws-btn ws-btn-utility" onClick={onEditIndustries} type="button">
                Edit
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {myWorkCats.length === 0 ? (
              <div className="pEmpty">
                <div className="ws-cardTitle">Choose your industries</div>
                <div className="ws-sub" style={{ marginTop: 8 }}>
                  Add 3–5 industries you want to practice most.
                </div>
                <button className="ws-btn ws-btn-secondary ws-btn-sm" onClick={onEditIndustries} type="button">
                  Choose industries
                </button>
              </div>
            ) : (
              <div className="pWorkGrid">
                {myWorkCats.map((c) => (
                  <div key={c.id} className="pWorkCard">
                    <div className="pWorkTop">
                      <div className="pWorkTitle">{c.title}</div>
                      <div className="pWorkSub">{c.subtitle}</div>
                    </div>

                    <div className="pWorkChips">
                      {c.chips.slice(0, 4).map((ch) => (
                        <span key={ch} className="ws-chip">
                          {ch}
                        </span>
                      ))}
                    </div>

                    <div className="pWorkBottom">
                      <button className="ws-btn ws-btn-tertiary ws-btn-sm" onClick={() => onStartWork(c)} type="button">
                        Start practice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Roadmap Popup */}
      {showRoadmapPopup && (
        <>
          <div
            className="ws-storeOverlay"
            onClick={() => setShowRoadmapPopup(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
          />
          <div
            className="ws-storeModal"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              zIndex: 1001,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="ws-cardTitle" style={{ margin: 0 }}>Your Exam Roadmap</h2>
              <button
                onClick={() => setShowRoadmapPopup(false)}
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: "0",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            <div className="ws-sub" style={{ marginBottom: "20px" }}>
              Your step-by-step plan for {goalExam} {goalPreset}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {goalSteps.map((step, idx) => (
                <div
                  key={step.id}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: step.status === "done" ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--panel)",
                    opacity: step.status === "locked" ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        background: step.status === "done" ? "var(--primary)" : step.status === "next" ? "var(--primary)" : "var(--pill)",
                        color: step.status === "done" || step.status === "next" ? "var(--primary-contrast)" : "var(--muted)",
                        fontSize: "12px",
                        fontWeight: 900,
                      }}
                    >
                      {step.status === "done" ? "✓" : idx + 1}
                    </span>
                    <div className="ws-cardTitle" style={{ fontSize: "14px", margin: 0 }}>
                      {step.title}
                    </div>
                  </div>
                  <div className="ws-sub" style={{ marginTop: "4px", fontSize: "12px" }}>{step.desc}</div>
                  <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="ws-metaPill">⏱ {step.estMin} min</span>
                    {step.status === "done" && <span className="ws-chip" style={{ fontSize: "11px" }}>Completed</span>}
                    {step.status === "next" && <span className="ws-chip" style={{ fontSize: "11px", background: "var(--primary)", color: "var(--primary-contrast)" }}>Next</span>}
                    {step.status === "locked" && <span className="ws-chip" style={{ fontSize: "11px" }}>Locked</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
