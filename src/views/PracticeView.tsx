// src/views/PracticeView.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDialog } from "../context/DialogContext";
import { getStoredUserLevel } from "../utils/level";
import "../styles/practice.css";

const STORE_OWNED_KEY = "ws-store-credits-owned";
const TEST_AREA_PRODUCT_ID = "perm_test_area";

function hasTestAreaUnlocked(): boolean {
  try {
    const raw = localStorage.getItem(STORE_OWNED_KEY);
    if (!raw) return false;
    const owned = JSON.parse(raw) as Record<string, { enabled?: boolean }>;
    return owned[TEST_AREA_PRODUCT_ID]?.enabled === true;
  } catch {
    return false;
  }
}

type TimeWindow = "14d" | "90d";
type WeaknessLayer = "Mechanics" | "Function" | "Context";
type Exam = "IELTS" | "CELPIP";

type WeaknessItem = {
  id: string;
  titleKey: string;
  layer: WeaknessLayer;
  hintKey: string;
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
  subKey: string;
  chipKeys: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function badgeForAccuracy(acc: number) {
  if (acc <= 55) return { labelKey: "veryWeak", tone: "danger" as const };
  if (acc <= 75) return { labelKey: "needsPractice", tone: "warn" as const };
  return { labelKey: "stable", tone: "ok" as const };
}

function layerLabelKey(layer: WeaknessLayer): string {
  if (layer === "Mechanics") return "mechanics";
  if (layer === "Function") return "function";
  return "context";
}

export default function PracticeView() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dialog = useDialog();
  const userLevel = getStoredUserLevel();
  const hasTestArea = hasTestAreaUnlocked();

  // Profile-driven: only show selected industries
  const [myIndustries, setMyIndustries] = useState<string[]>([
    "Café",
    "Retail",
    "Office · Tech/IT",
  ]);

  // Weakness settings
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("90d");
  const [showAllWeak, setShowAllWeak] = useState(false);
  // Study Settings modal (session-level only)
  const [studySettingsOpen, setStudySettingsOpen] = useState(false);
  const STUDY_DAILY_KEY = "ws_study_daily_min";
  const STUDY_INTENSITY_KEY = "ws_study_intensity";
  const STUDY_WEAKNESS_REPEAT_KEY = "ws_study_weakness_repeat";
  const [dailyMinutes, setDailyMinutes] = useState<10 | 20 | 30>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(STUDY_DAILY_KEY) : null;
    if (v === "10" || v === "20" || v === "30") return Number(v) as 10 | 20 | 30;
    return 20;
  });
  const [intensity, setIntensity] = useState<"light" | "standard" | "intensive">(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(STUDY_INTENSITY_KEY) : null;
    if (v === "light" || v === "standard" || v === "intensive") return v;
    return "standard";
  });
  const [weaknessAutoRepeat, setWeaknessAutoRepeat] = useState(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(STUDY_WEAKNESS_REPEAT_KEY) : null;
    return v !== "off";
  });
  const saveStudySettings = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STUDY_DAILY_KEY, String(dailyMinutes));
    localStorage.setItem(STUDY_INTENSITY_KEY, intensity);
    localStorage.setItem(STUDY_WEAKNESS_REPEAT_KEY, weaknessAutoRepeat ? "on" : "off");
  };
  // Roadmap popup
  const [showRoadmapPopup, setShowRoadmapPopup] = useState(false);

  // Test goal
  const [goalExam, setGoalExam] = useState<Exam>("IELTS");
  const [goalPreset, setGoalPreset] = useState<string>("6.5");

  // ---- Mock weakness data (title/hint via practice.weakTitle_*, practice.weakHint_*) ----
  const weakness14: WeaknessItem[] = [
    { id: "w1", titleKey: "weakTitle_w1", layer: "Function", hintKey: "weakHint_w1", accuracy: 48, estMin: 5 },
    { id: "w2", titleKey: "weakTitle_w2", layer: "Context", hintKey: "weakHint_w2", accuracy: 52, estMin: 6 },
    { id: "w3", titleKey: "weakTitle_w3", layer: "Function", hintKey: "weakHint_w3", accuracy: 60, estMin: 7 },
  ];

  const weakness90: WeaknessItem[] = [
    { id: "w4", titleKey: "weakTitle_w4", layer: "Mechanics", hintKey: "weakHint_w4", accuracy: 58, estMin: 7 },
    { id: "w5", titleKey: "weakTitle_w5", layer: "Mechanics", hintKey: "weakHint_w5", accuracy: 63, estMin: 8 },
    { id: "w6", titleKey: "weakTitle_w6", layer: "Function", hintKey: "weakHint_w6", accuracy: 70, estMin: 8 },
  ];

  const weaknesses = timeWindow === "14d" ? weakness14 : weakness90;

  const sortedWeak = useMemo(() => {
    return [...weaknesses].sort((a, b) => a.accuracy - b.accuracy);
  }, [weaknesses]);

  const topWeakness = sortedWeak[0];
  const weaknessToShow = showAllWeak ? sortedWeak : sortedWeak.slice(0, 3);

  // ---- TODAY recommendation (always 1, strongest); text via t() when rendering ----
  const todayRec = useMemo(() => {
    const w = topWeakness;
    if (!w) {
      return {
        titleKey: "bestDrillToday",
        reasonKey: "autoPickedRecent",
        estMin: 7,
        layer: "Function" as WeaknessLayer,
        impactKey: "highImpact",
        score: 92,
      };
    }
    const urgency = clamp(100 - w.accuracy, 10, 95);
    return {
      titleKey: w.titleKey,
      reasonKey: "autoPickedDays" as const,
      reasonDays: timeWindow === "14d" ? 14 : 90,
      estMin: w.estMin,
      layer: w.layer,
      impactKey: w.accuracy <= 60 ? "highImpact" : "goodFocus",
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

  // ---- Work categories (subtitle/chips via practice.workSub_*, practice.workChip_*) ----
  const allWorkCats: WorkCategory[] = [
    { id: "cafe", title: "Café", subKey: "workSub_cafe", chipKeys: ["workChip_cafe_1", "workChip_cafe_2", "workChip_cafe_3", "workChip_cafe_4"] },
    { id: "retail", title: "Retail", subKey: "workSub_retail", chipKeys: ["workChip_retail_1", "workChip_retail_2", "workChip_retail_3", "workChip_retail_4"] },
    { id: "office-tech", title: "Office · Tech/IT", subKey: "workSub_office-tech", chipKeys: ["workChip_office-tech_1", "workChip_office-tech_2", "workChip_office-tech_3", "workChip_office-tech_4"] },
    { id: "office-fin", title: "Office · Finance", subKey: "workSub_office-fin", chipKeys: ["workChip_office-fin_1", "workChip_office-fin_2", "workChip_office-fin_3", "workChip_office-fin_4"] },
    { id: "construction", title: "Field · Construction", subKey: "workSub_construction", chipKeys: ["workChip_construction_1", "workChip_construction_2", "workChip_construction_3", "workChip_construction_4"] },
    { id: "logistics", title: "Field · Logistics", subKey: "workSub_logistics", chipKeys: ["workChip_logistics_1", "workChip_logistics_2", "workChip_logistics_3", "workChip_logistics_4"] },
    { id: "healthcare", title: "Healthcare", subKey: "workSub_healthcare", chipKeys: ["workChip_healthcare_1", "workChip_healthcare_2", "workChip_healthcare_3", "workChip_healthcare_4"] },
    { id: "immigration", title: "Immigration Interview", subKey: "workSub_immigration", chipKeys: ["workChip_immigration_1", "workChip_immigration_2", "workChip_immigration_3", "workChip_immigration_4"] },
  ];

  const myWorkCats = useMemo(() => {
    return allWorkCats.filter((c) => myIndustries.includes(c.title));
  }, [myIndustries]);

  // Work scenarios: shuffle chip order per category when refresh is clicked (so "other" scenarios show)
  const [workScenarioRefreshSeed, setWorkScenarioRefreshSeed] = useState(0);
  const shuffledWorkCats = useMemo(() => {
    return myWorkCats.map((c) => ({
      ...c,
      chipKeys: shuffleArray([...c.chipKeys]),
    }));
  }, [myWorkCats, workScenarioRefreshSeed]);

  // ---- actions ----
  const onStartToday = () => dialog.alert(`Start today: ${t(`practice.${todayRec.titleKey}`)}`);

  const onStartWeaknessSet = () =>
    dialog.alert(
      `Start weakness set (${timeWindow}): ${sortedWeak
        .slice(0, 3)
        .map((w) => t(`practice.${w.titleKey}`))
        .join(", ")}`
    );
  const onStartWeakness = (w: WeaknessItem) => dialog.alert(`Start: ${t(`practice.${w.titleKey}`)}`);

  const onStartExamPractice = () =>
    dialog.alert(`Start exam practice: ${goalExam} ${goalPreset}`);

  const onStartWork = (c: WorkCategory) => dialog.alert(`Start work: ${c.title}`);

  const onEditIndustries = () => {
    // demo toggle (e.g. from empty state "Choose industries")
    const next =
      myIndustries[0] === "Café"
        ? ["Healthcare", "Immigration Interview", "Office · Finance"]
        : ["Café", "Retail", "Office · Tech/IT"];
    setMyIndustries(next);
  };

  const onRefreshWorkScenarios = () => {
    setWorkScenarioRefreshSeed((s) => s + 1);
  };

  return (
    <div className="pPage">
      {/* Header */}
      <div className="ws-topbar" style={{ paddingLeft: 6, paddingRight: 6 }}>
        <div>
          <h1 className="ws-title">Practice Hub</h1>
          <div className="ws-sub">
            Level {userLevel} · Personalized daily plan
          </div>
        </div>

        <div className="pTopbarActions">
          <div className="pSegment pSegmentTopbar" aria-label="Time window">
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
          <button
            type="button"
            className="pTopbarIconBtn"
            onClick={() => nav("/profile/stats")}
            title="View detailed statistics"
            aria-label="View detailed statistics"
          >
            📊
          </button>
          <button
            type="button"
            className="pTopbarIconBtn"
            onClick={() => setStudySettingsOpen(true)}
            title="Learning preferences"
            aria-label="Learning preferences"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 1) TODAY — strongest */}
      <section className="pHero pHeroPrimary">
        <div className="pHeroLeft">
          <div className="pHeroKicker">
            <span className="pKNum pKNumHero">1</span>
            <span className="pHeroKickerText">{t("practice.todayFirst")}</span>
          </div>

          <div className="pHeroTitleRow">
            <div className="pHeroTitle">{t(`practice.${todayRec.titleKey}`)}</div>
            <span className="pScore" title="Number of wrong answers">
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

          <div className="pHeroDesc">
            {todayRec.reasonKey === "autoPickedRecent"
              ? t("practice.autoPickedRecent")
              : t("practice.autoPickedDays", { days: todayRec.reasonDays, layer: t(`practice.${layerLabelKey(todayRec.layer)}`) })}
          </div>

          <div className="ws-heroMeta">
            <span className="ws-metaPill">⏱ {todayRec.estMin} min</span>
            <span className="ws-metaPill">{t(`practice.${todayRec.impactKey}`)}</span>
            <span className="ws-chip">{t(`practice.${layerLabelKey(todayRec.layer)}`)}</span>
          </div>
        </div>

        <div className="pHeroRight">
          <button className="ws-btn ws-btn-primary ws-btn-hero" onClick={onStartToday} type="button">
            {t("practice.startNow")}
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
              <div className="ws-cardTitle">{t("practice.weakness")}</div>
              <div className="ws-sub">{t("practice.weaknessDesc")}</div>
            </div>

            <div className="pTopRight">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                <button className="ws-btn ws-btn-secondary ws-btn-sm" onClick={onStartWeaknessSet} type="button">
                  {t("practice.startWeaknessSet")}
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
                  {showAllWeak ? t("practice.showLess") : t("practice.viewAll")}
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
                        <div className="pWeakName">{t(`practice.${w.titleKey}`)}</div>
                        <span className={"pBadge " + `tone-${badge.tone}`}>{t(`practice.${badge.labelKey}`)}</span>
                        <span className="ws-chip">{t(`practice.${layerLabelKey(w.layer)}`)}</span>
                        <span className="ws-muted">{w.estMin} min</span>
                      </div>
                      <div className="ws-sub" style={{ marginTop: 4, marginBottom: 10 }}>{t(`practice.${w.hintKey}`)}</div>

                      <div className="pBar">
                        <div className="pBarTrack">
                          <div className="pBarFill" style={{ width: `${urgency}%` }} />
                        </div>
                        <div className="pBarLabel">{t("practice.urgency")}</div>
                      </div>
                    </div>

                    <div className="pWeakActions">
                      <button className="ws-btn ws-btn-tertiary ws-btn-sm" onClick={() => onStartWeakness(w)} type="button">
                        {t("practice.practice")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3) TEST PREP — 구매 시에만 표시 (스토어 영구 상품 perm_test_area) */}
        {hasTestArea ? (
          <section className="ws-card pCardTertiary">
            <div className="ws-cardTitleRow">
              <div>
                <div className="pKicker">
                  <span className="pKNum">3</span>
                  <span>TEST PREP</span>
                </div>
                <div className="ws-cardTitle">{t("practice.testPrepTitle")}</div>
                <div className="ws-sub">
                  {t("practice.testPrepTitle")}
                </div>
              </div>

              <div className="pTopRight">
                <span className="ws-muted">
                  {t("practice.currentTarget")} <b>{goalExam}</b> · <b>{goalPreset}</b>
                </span>
                <button className="ws-btn ws-btn-secondary ws-btn-sm" onClick={onStartExamPractice} type="button">
                  {t("practice.startExamPractice")}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="pTwoCol">
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
        ) : (
          <section className="ws-card pCardTertiary">
            <div className="ws-cardTitleRow">
              <div>
                <div className="pKicker">
                  <span className="pKNum">3</span>
                  <span>TEST PREP</span>
                </div>
                <div className="ws-cardTitle">Test area (Exam practice)</div>
                <div className="ws-sub">
                  {t("practice.unlockTestAreaDesc")}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="ws-btn ws-btn-primary"
                onClick={() => nav("/store")}
              >
                {t("practice.unlockTestAreaBtn")}
              </button>
            </div>
          </section>
        )}

        {/* 4) WORK PRACTICE */}
        <section className="ws-card pCardQuaternary">
          <div className="ws-cardTitleRow">
            <div>
              <div className="pKicker">
                <span className="pKNum">4</span>
                <span>WORK PRACTICE</span>
              </div>
              <div className="ws-cardTitle">{t("practice.workScenariosTitle")}</div>
              <div className="ws-sub">{t("practice.onlySelectedIndustries")}</div>
            </div>

            <div className="pTopRight">
              <span className="ws-muted">
                Showing <b>{myWorkCats.length}</b>
              </span>
              {myWorkCats.length > 0 && (
                <button
                  className="pTopbarIconBtn"
                  type="button"
                  onClick={onRefreshWorkScenarios}
                  title={t("practice.refreshScenarios")}
                  aria-label={t("practice.refreshScenarios")}
                >
                  🔄
                </button>
              )}
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
                {shuffledWorkCats.map((c) => (
                  <div key={c.id} className="pWorkCard">
                    <div className="pWorkTop">
                      <div className="pWorkTitle">{c.title}</div>
                      <div className="pWorkSub">{t(`practice.${c.subKey}`)}</div>
                    </div>

                    <div className="pWorkChips">
                      {c.chipKeys.slice(0, 4).map((key) => (
                        <span key={key} className="ws-chip">
                          {t(`practice.${key}`)}
                        </span>
                      ))}
                    </div>

                    <div className="pWorkBottom">
                      <button className="ws-btn ws-btn-tertiary ws-btn-sm" onClick={() => onStartWork(c)} type="button">
                        {t("practice.startPractice")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Roadmap Popup — 테스트 영역 구매 시에만 */}
      {hasTestArea && showRoadmapPopup && (
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
            className="ws-storeModal ws-storeModalPopup"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
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

      {/* Study Settings modal (session-level only) */}
      {studySettingsOpen && (
        <>
          <div
            className="ws-storeOverlay"
            onClick={() => { saveStudySettings(); setStudySettingsOpen(false); }}
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
            className="ws-storeModal ws-storeModalPopup"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid var(--line)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              zIndex: 1001,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="ws-cardTitle" style={{ margin: 0 }}>Study Settings</h2>
              <button
                type="button"
                onClick={() => { saveStudySettings(); setStudySettingsOpen(false); }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="ws-sub" style={{ marginBottom: "16px" }}>
              {t("practice.studySettingsIntro")}
            </p>

            <div style={{ marginBottom: "20px" }}>
              <div className="ws-muted" style={{ fontSize: "12px", fontWeight: 800, marginBottom: "8px" }}>Daily practice time</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {([10, 20, 30] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={"pSegBtn " + (dailyMinutes === m ? "isActive" : "")}
                    onClick={() => setDailyMinutes(m)}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div className="ws-muted" style={{ fontSize: "12px", fontWeight: 800, marginBottom: "8px" }}>Practice intensity</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(["light", "standard", "intensive"] as const).map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={"pSegBtn " + (intensity === i ? "isActive" : "")}
                    onClick={() => setIntensity(i)}
                  >
                    {i === "light" ? "Light" : i === "standard" ? "Standard" : "Intensive"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div className="ws-muted" style={{ fontSize: "12px", fontWeight: 800, marginBottom: "8px" }}>Weakness auto-repeat</div>
              <button
                type="button"
                className={"pfToggle " + (weaknessAutoRepeat ? "pfToggleOn" : "")}
                onClick={() => setWeaknessAutoRepeat((v) => !v)}
                aria-pressed={weaknessAutoRepeat}
                style={{ marginTop: 4 }}
              >
                <span className="pfToggleThumb" />
              </button>
              <span style={{ marginLeft: "10px", fontSize: "13px", color: "var(--muted)" }}>
                {weaknessAutoRepeat ? "ON" : "OFF"}
              </span>
            </div>

            <button
              type="button"
              className="ws-btn ws-btn-primary"
              onClick={() => { saveStudySettings(); setStudySettingsOpen(false); }}
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}
