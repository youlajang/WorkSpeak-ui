// src/views/HomeView.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStoreOptional } from "../context/StoreContext";
import { getStoredUserLevel } from "../utils/level";

type Step = "learn" | "review" | "quest";
type Status = "next" | "locked" | "done";

type StepItem = {
  key: Step;
  label: string;
  estMin?: number;
  rewardPoints?: number;
  rewardXp?: number;
  status: Status;
};

type SessionMapNode = {
  id: string;
  sessionNo: number;
  subKey: string;
  status: Status;
  steps: StepItem[];
};

type Leader = {
  name: string;
  xp: number;
  streak: number;
  credits: number;
  me?: boolean;
  /** 프로필 사진 URL (없으면 avatarMark 또는 이니셜 사용) */
  avatarUrl?: string | null;
  avatarMark?: string;
};

type TodaySession = {
  id: string;
  titleKey: string;
  descKey: string;
  estMin: number;
  rewardPoints: number;
  rewardXp: number;
  keepStreakRuleKey: string;
};

export default function HomeView() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const store = useStoreOptional();

  // ---- Demo user (points from store context when available)
  const user = useMemo(
    () => ({
      name: "YOULA",
      initials: "Y",
      level: getStoredUserLevel(),
      stage: 2,
      unit: 1,
      unitTitle: "Shipping & returns",
      streakDays: 12,
      points: store?.points ?? 1250,
      xp: 8420,
      myRank: 1234
    }),
    [store?.points]
  );

  // ---- Today sessions (Hero swaps to next after completion); text via t("home.*")
  const todaySessions: TodaySession[] = useMemo(
    () => [
      { id: "t1", titleKey: "today1Title", descKey: "today1Desc", estMin: 6, rewardPoints: 120, rewardXp: 20, keepStreakRuleKey: "keepStreakRule" },
      { id: "t2", titleKey: "today2Title", descKey: "today2Desc", estMin: 5, rewardPoints: 80, rewardXp: 16, keepStreakRuleKey: "keepStreakRule" },
      { id: "t3", titleKey: "today3Title", descKey: "today3Desc", estMin: 7, rewardPoints: 140, rewardXp: 24, keepStreakRuleKey: "keepStreakRule" }
    ],
    []
  );

  const [todayIdx, setTodayIdx] = useState(0);
  const today = todaySessions[todayIdx];

  // ---- Path Map (15+ sessions); labels via t("home.run" etc.), subKey via t("home.mapSub1") etc.
  const [mapNodes, setMapNodes] = useState<SessionMapNode[]>(() => {
    const make = (n: number, status: Status): SessionMapNode => {
      const learnStatus: Status =
        status === "done" ? "done" : status === "next" ? "next" : "locked";
      const lockedIfNotDone: Status = status === "done" ? "done" : "locked";
      const subKey = n === 1 ? "mapSub1" : n === 2 ? "mapSub2" : n === 3 ? "mapSub3" : "mapSubDefault";
      return {
        id: `s${n}`,
        sessionNo: n,
        subKey,
        status,
        steps: [
          { key: "learn", label: "run", estMin: 6, rewardXp: 20, rewardPoints: 120, status: learnStatus },
          { key: "review", label: "quickReview", estMin: 2, rewardXp: 8, rewardPoints: 40, status: lockedIfNotDone },
          { key: "quest", label: "quest", estMin: 4, rewardXp: 30, rewardPoints: 150, status: lockedIfNotDone }
        ]
      };
    };

    const list: SessionMapNode[] = [];
    for (let i = 1; i <= 18; i++) list.push(make(i, i === 1 ? "next" : "locked"));
    return list;
  });

  // ---- Accordion + Roadmap modal
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  // ---- Leader profile popup (다른 사람 클릭 시)
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  // ---- Hero badge (1s)
  const [showUpNextBadge, setShowUpNextBadge] = useState(false);
  const [badgeMode, setBadgeMode] = useState<"ready" | "upnext">("ready");

  // ---- Session state (single CTA)
  const [sessionStatus, setSessionStatus] = useState<
    "not_started" | "in_progress" | "completed"
  >("not_started");
  const [currentStep, setCurrentStep] = useState<Step>("learn");

  const primaryCta = useMemo(() => {
    if (sessionStatus === "in_progress") {
      return currentStep === "quest" ? t("home.complete") : "Continue";
    }
    return sessionStatus === "completed" ? t("home.startNext") : t("home.start");
  }, [sessionStatus, currentStep, t]);

  const showBadgeFor1s = () => {
    setBadgeMode(Math.random() > 0.5 ? "ready" : "upnext");
    setShowUpNextBadge(true);
    window.setTimeout(() => setShowUpNextBadge(false), 1000);
  };

  const handlePrimary = () => {
    if (sessionStatus === "not_started") {
      setSessionStatus("in_progress");
      setCurrentStep("learn");
      return;
    }
    if (sessionStatus === "in_progress") {
      if (currentStep === "quest") {
        completeSession();
        return;
      }
      setCurrentStep((prev) =>
        prev === "learn" ? "review" : prev === "review" ? "quest" : "quest"
      );
      return;
    }
    setSessionStatus("not_started");
    setCurrentStep("learn");
  };

  // Demo complete: marks current next session done and unlocks the next
  const completeSession = () => {
    setSessionStatus("completed");

    setMapNodes((prev) => {
      const nextIdx = prev.findIndex((n) => n.status === "next");
      if (nextIdx === -1) return prev;

      const updated = prev.map((n) => ({
        ...n,
        steps: n.steps.map((s) => ({ ...s }))
      }));

      const cur = updated[nextIdx];
      cur.status = "done";
      cur.steps.forEach((s) => (s.status = "done"));

      const nxt = updated[nextIdx + 1];
      if (nxt) {
        nxt.status = "next";
        nxt.steps.forEach((s) => {
          s.status = s.key === "learn" ? "next" : "locked";
        });
      }

      return updated;
    });

    setTodayIdx((i) => (i + 1 < todaySessions.length ? i + 1 : i));
    showBadgeFor1s();

    window.setTimeout(() => {
      setSessionStatus("not_started");
      setCurrentStep("learn");
    }, 0);
  };

  const leaders: Leader[] = useMemo(() => {
    const base: Omit<Leader, "me">[] = [
      { name: "Mina", xp: 16800, streak: 28, credits: 2100, avatarUrl: "https://i.pravatar.cc/80?img=1", avatarMark: "👩" },
      { name: "Jin", xp: 15240, streak: 14, credits: 1890, avatarUrl: "https://i.pravatar.cc/80?img=2", avatarMark: "👨" },
      { name: "Ella", xp: 8180, streak: 7, credits: 950, avatarUrl: "https://i.pravatar.cc/80?img=3", avatarMark: "👩" },
      { name: "Noah", xp: 7700, streak: 21, credits: 1100, avatarUrl: "https://i.pravatar.cc/80?img=4", avatarMark: "👨" }
    ];
    const myAvatarUrl = typeof window !== "undefined" ? localStorage.getItem("ws_avatar_url") : null;
    const myRow: Leader = {
      name: "YOU",
      xp: user.xp,
      streak: user.streakDays,
      credits: user.points,
      me: true,
      avatarUrl: myAvatarUrl || undefined,
      avatarMark: "🐱"
    };
    return [
      base[0],
      base[1],
      myRow,
      base[2],
      base[3]
    ];
  }, [user.xp, user.streakDays, user.points]);

  const nextSessionSubKey = mapNodes.find((n) => n.status === "next")?.subKey ?? "mapSubDefault";
  const nextSessionSubtitle = t(`home.${nextSessionSubKey}`);

  return (
    <>
      {/* Top bar */}
      <header className="ws-topbar">
        <div className="ws-topbarLeft">
          <h1 className="ws-title">Home</h1>

          <div className="ws-breadcrumb" aria-label="Current course location">
            <span className="ws-chip">Stage {user.stage}</span>
            <span className="ws-dot">›</span>
            <span className="ws-chip">Unit {user.unit}</span>
            <span className="ws-dot">›</span>
            <span className="ws-chip" title={user.unitTitle}>
              {user.unitTitle}
            </span>
          </div>
        </div>

        <div className="ws-topbarRight">
          <div className="ws-kpis" aria-label="Key progress indicators">
            <Kpi icon="🔥" label={t("home.streak")} value={`${user.streakDays}d`} />
            <Kpi icon="💎" label={t("home.credits")} value={user.points.toLocaleString()} />
            <Kpi icon="⭐" label={t("home.xp")} value={user.xp.toLocaleString()} />
          </div>
        </div>
      </header>

      {/* Hero: full width */}
      <section className="ws-hero" aria-label={t("home.todayHero")}>
            <div className="ws-heroContent">
              <div className="ws-heroEyebrow">{t("home.todayHero").toUpperCase()}</div>

              <div className="ws-heroTitleRow">
                <h2 className="ws-heroTitle">{t("home.session")}</h2>

                {showUpNextBadge && (
                  <span
                    className={`ws-upNextBadge ${
                      badgeMode === "upnext" ? "isUpNext" : "isReady"
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {badgeMode === "upnext" ? t("home.upNext") : t("home.nextSessionReady")}
                  </span>
                )}
              </div>

              <div className="ws-sub">{t("home.heroFlowHint")}</div>

              <h3 className="ws-heroH3">{t(`home.${today.titleKey}`)}</h3>
              <p className="ws-heroDesc">{t(`home.${today.descKey}`)}</p>

              <div className="ws-heroMeta">
                <span className="ws-metaPill">⏱ {today.estMin} min</span>
                <span className="ws-metaPill">⭐ +{today.rewardXp} XP</span>
                <span className="ws-metaPill">💎 +{today.rewardPoints} credits</span>
                <span className="ws-metaPill">🔥 {t(`home.${today.keepStreakRuleKey}`)}</span>
              </div>

              <div className="ws-heroCtaRow">
                <button
                  className="ws-btn ws-btn-primary ws-btn-hero"
                  onClick={handlePrimary}
                  type="button"
                >
                  {primaryCta}
                </button>
              </div>

              <div className="ws-stepHint">
                {t("home.currentStep")}: <b>{currentStep}</b>{" "}
                {sessionStatus === "in_progress" ? `· ${t("home.inProgress")}` : ""}
              </div>
            </div>

            <div className="ws-heroSide">
              <div className="ws-heroSideCard">
                <div className="ws-heroSideTitle">{t("home.nextOnPath")}</div>
                <div className="ws-heroSideSub">{t("home.nextOnPathSub")}</div>

                <div className="ws-miniStat">
                  <span className="ws-miniLabel">{t("home.nextLabel")}</span>
                  <span className="ws-miniValue">{nextSessionSubtitle}</span>
                </div>

                <div className="ws-miniStat">
                  <span className="ws-miniLabel">{t("home.rewardLabel")}</span>
                  <span className="ws-miniValue">
                    +{today.rewardXp} XP · +{today.rewardPoints} credits
                  </span>
                </div>

                <div className="ws-miniStat">
                  <span className="ws-miniLabel">{t("home.streak")}</span>
                  <span className="ws-miniValue">{t("home.streakStaysAlive")} 🔥</span>
                </div>
              </div>
            </div>
      </section>

      {/* Below hero: Learning path 2/3 + Sidebar 1/3 */}
      <section className="ws-grid ws-gridBelowHero">
        <section className="ws-center">
          <section className="ws-card ws-path" aria-label={t("home.learningPath")}>
            <div className="ws-pathHeader">
              <div>
                <div className="ws-cardTitle">{t("home.learningPath")}</div>
                <div className="ws-sub">
                  {t("home.sessionsContinueBelow")}
                </div>
              </div>

              <button
                className="ws-btn ws-btn-utility"
                onClick={() => setShowRoadmap(true)}
                type="button"
              >
                {t("home.viewRoadmap")}
              </button>
            </div>

            <div className="ws-mapScroller">
              <div className="ws-mapLine" />

              {mapNodes.map((node) => {
                const isExpanded = expandedId === node.id;
                const nodeTitle = `${t("home.mapSessionTitle")} ${node.sessionNo}`;

                return (
                  <div key={node.id} className="ws-mapRow">
                    <button
                      className={`ws-mapDot ${node.status}`}
                      onClick={() => setExpandedId(isExpanded ? null : node.id)}
                      type="button"
                      aria-label={`${nodeTitle} ${t("home.details")}`}
                      disabled={node.status === "locked"}
                      title={node.status === "locked" ? t("home.locked") : t("home.openDetails")}
                    >
                      {node.status === "done" ? "✓" : node.status === "next" ? "★" : ""}
                    </button>

                    <div className={`ws-mapCard ${node.status}`}>
                      <div className="ws-mapCardTop">
                        <div>
                          <div className="ws-mapTitle">
                            {nodeTitle} <span className="ws-mapNo">#{node.sessionNo}</span>
                          </div>
                          <div className="ws-mapSub">{t(`home.${node.subKey}`)}</div>
                        </div>

                        <button
                          className="ws-btn ws-btn-secondary ws-btn-sm"
                          onClick={() => setExpandedId(isExpanded ? null : node.id)}
                          type="button"
                          disabled={node.status === "locked"}
                        >
                          {isExpanded ? t("home.collapse") : t("home.details")}
                        </button>
                      </div>

                      <div className={`ws-accordion ${isExpanded ? "open" : ""}`}>
                        {node.steps.map((s) => (
                          <div key={s.key} className={`ws-accItem ${s.status}`}>
                            <div className="ws-accLeft">
                              <div className="ws-accLabel">{t(`home.${s.label}`)}</div>
                              <div className="ws-accMeta">
                                {typeof s.estMin === "number" && <span>⏱ {s.estMin}m</span>}
                                {typeof s.rewardXp === "number" && <span>⭐ +{s.rewardXp}XP</span>}
                                {typeof s.rewardPoints === "number" && (
                                  <span>💎 +{s.rewardPoints} credits</span>
                                )}
                              </div>
                            </div>

                            <button
                              className={`ws-btn ws-btn-sm ${
                                s.status === "next"
                                  ? "ws-btn-primary"
                                  : s.status === "done"
                                  ? "ws-btn-outline"
                                  : "ws-btn-disabled"
                              }`}
                              disabled={s.status === "locked"}
                              type="button"
                            >
                              {s.status === "next" ? t("home.start") : s.status === "done" ? t("home.review") : t("home.locked")}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        <aside className="ws-right">
          <section className="ws-card" aria-label={t("home.streak")}>
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">{t("home.streak")}</div>
              <div className="ws-pill">🔥 {user.streakDays}d</div>
            </div>
            <div className="ws-sub">{t("home.maintainStreak")}</div>
            <button className="ws-btn ws-btn-secondary ws-btn-sm" type="button">
              {t("home.goToItems")}
            </button>
          </section>

          <section className="ws-card" aria-label={t("home.leaderboard")}>
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">{t("home.leaderboard")}</div>
              <button className="ws-link" type="button">
                {t("home.seeAll")}
              </button>
            </div>
            <div className="ws-sub">{t("home.leaderboardSub")}</div>

            <div className="ws-rankOnly">
              <div className="ws-rankBig">#{user.myRank.toLocaleString()}</div>
              <div className="ws-mutedSmall">{t("home.yourRank")}</div>
            </div>

            <div className="ws-leaderList" style={{ marginTop: 12 }}>
              {leaders.map((l, idx) => (
                <div key={l.me ? "me" : l.name} className={`ws-leaderRow ${l.me ? "is-me" : ""}`}>
                  <div className="ws-rank">{idx + 1}</div>
                  <button
                    type="button"
                    className="ws-leaderAvatarBtn"
                    onClick={() => !l.me && setSelectedLeader(l)}
                    disabled={!!l.me}
                    aria-label={l.me ? undefined : t("home.leaderViewProfile", { name: l.name })}
                    title={l.me ? undefined : t("home.leaderViewProfile", { name: l.name })}
                  >
                    {l.avatarUrl ? (
                      <img src={l.avatarUrl} alt="" className="ws-leaderAvatarImg" />
                    ) : (
                      <span className="ws-leaderAvatarMark" aria-hidden>{l.avatarMark ?? l.name.slice(0, 1)}</span>
                    )}
                  </button>
                  <div className="ws-leaderName">{l.name}</div>
                  <div className="ws-leaderPts">{l.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </section>

          {selectedLeader && (
            <div
              className="ws-modalOverlay ws-leaderProfileOverlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ws-leaderProfileTitle"
              onClick={() => setSelectedLeader(null)}
            >
              <div className="ws-leaderProfileCard" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="ws-leaderProfileClose"
                  onClick={() => setSelectedLeader(null)}
                  aria-label={t("common.close")}
                >
                  <span aria-hidden>×</span>
                </button>
                <div className="ws-leaderProfileHead">
                  <div className="ws-leaderProfileAvatarWrap">
                    {selectedLeader.avatarUrl ? (
                      <img src={selectedLeader.avatarUrl} alt="" className="ws-leaderProfileAvatar" />
                    ) : (
                      <span className="ws-leaderProfileAvatarMark" aria-hidden>
                        {selectedLeader.avatarMark ?? selectedLeader.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <h2 id="ws-leaderProfileTitle" className="ws-leaderProfileTitle">
                    {selectedLeader.name}
                  </h2>
                </div>
                <div className="ws-leaderProfileStats">
                  <div className="ws-leaderProfileStat">
                    <span className="ws-leaderProfileStatIcon" aria-hidden>🔥</span>
                    <div className="ws-leaderProfileStatText">
                      <span className="ws-leaderProfileStatLabel">{t("home.streak")}</span>
                      <span className="ws-leaderProfileStatValue">{selectedLeader.streak}d</span>
                    </div>
                  </div>
                  <div className="ws-leaderProfileStat">
                    <span className="ws-leaderProfileStatIcon" aria-hidden>💎</span>
                    <div className="ws-leaderProfileStatText">
                      <span className="ws-leaderProfileStatLabel">{t("home.credits")}</span>
                      <span className="ws-leaderProfileStatValue">{selectedLeader.credits.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="ws-leaderProfileStat">
                    <span className="ws-leaderProfileStatIcon" aria-hidden>⭐</span>
                    <div className="ws-leaderProfileStatText">
                      <span className="ws-leaderProfileStatLabel">{t("home.xp")}</span>
                      <span className="ws-leaderProfileStatValue">{selectedLeader.xp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="ws-card" aria-label={t("home.currentLevel")}>
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">{t("home.currentLevel")}</div>
              <div className="ws-pill">📈 Stage {user.stage} · Lv {user.level}</div>
            </div>
            <div className="ws-sub">
              {t("home.levelReason")}
            </div>
            <button className="ws-btn ws-btn-tertiary ws-btn-sm" type="button">
              {t("home.seeDetails")}
            </button>
          </section>

          <section className="ws-card" aria-label={t("home.credits")}>
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">{t("home.credits")}</div>
              <div className="ws-pill">💎 {user.points.toLocaleString()}</div>
            </div>
            <div className="ws-sub">{t("home.creditsSub")}</div>
            <button className="ws-btn ws-btn-tertiary ws-btn-sm" type="button" onClick={() => nav("/store")}>
              {t("home.goToStore")}
            </button>
          </section>
        </aside>
      </section>

      {showRoadmap && (
        <div className="ws-modalOverlay" role="dialog" aria-modal="true">
          <div className="ws-modal">
            <div className="ws-modalHeader">
              <div>
                <div className="ws-cardTitle">{t("home.fullRoadmap")}</div>
                <div className="ws-sub">
                  {t("home.stageUnitAll", { stage: user.stage, unit: user.unit })}
                </div>
              </div>
              <button
                className="ws-btn ws-btn-outline ws-btn-sm"
                onClick={() => setShowRoadmap(false)}
                type="button"
              >
                {t("home.close")}
              </button>
            </div>

            <div className="ws-modalBody">
              <div className="ws-mapScroller ws-mapScroller-modal">
                <div className="ws-mapLine" />
                {mapNodes.map((node) => (
                  <div key={node.id} className="ws-mapRow">
                    <div className={`ws-mapDot ${node.status}`} aria-hidden="true">
                      {node.status === "done" ? "✓" : node.status === "next" ? "★" : ""}
                    </div>
                    <div className={`ws-mapCard ${node.status}`}>
                      <div className="ws-mapTitle">
                        {t("home.mapSessionTitle")} {node.sessionNo} <span className="ws-mapNo">#{node.sessionNo}</span>
                      </div>
                      <div className="ws-mapSub">{t(`home.${node.subKey}`)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* --- Small components --- */
function Kpi({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="ws-kpi">
      <div className="ws-kpiIcon">{icon}</div>
      <div className="ws-kpiText">
        <div className="ws-kpiLabel">{label}</div>
        <div className="ws-kpiValue">{value}</div>
      </div>
    </div>
  );
}
