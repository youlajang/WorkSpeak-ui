// src/views/HomeView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreOptional } from "../context/StoreContext";

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
  title: string;
  subtitle: string;
  status: Status;
  steps: StepItem[];
};

type Leader = { name: string; xp: number; me?: boolean };

type TodaySession = {
  id: string;
  title: string;
  description: string;
  estMin: number;
  rewardPoints: number;
  rewardXp: number;
  keepStreakRule: string;
};

export default function HomeView() {
  const nav = useNavigate();
  const store = useStoreOptional();

  // ---- Demo user (points from store context when available)
  const user = useMemo(
    () => ({
      name: "YOULA",
      initials: "Y",
      level: 3,
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

  // ---- Today sessions (Hero swaps to next after completion)
  const todaySessions: TodaySession[] = useMemo(
    () => [
      {
        id: "t1",
        title: "Handle a refund after closing",
        description:
          "Learn calm phrases to set boundaries and close the conversation professionally.",
        estMin: 6,
        rewardPoints: 120,
        rewardXp: 20,
        keepStreakRule: "Complete 1 session today to keep your streak."
      },
      {
        id: "t2",
        title: "Complaint responses: tone & empathy",
        description:
          "Practice empathetic replies and de-escalation phrases for busy shifts.",
        estMin: 5,
        rewardPoints: 80,
        rewardXp: 16,
        keepStreakRule: "Complete 1 session today to keep your streak."
      },
      {
        id: "t3",
        title: "Exchange & returns: polite escalation",
        description:
          "Handle exceptions and escalate to a manager with professional language.",
        estMin: 7,
        rewardPoints: 140,
        rewardXp: 24,
        keepStreakRule: "Complete 1 session today to keep your streak."
      }
    ],
    []
  );

  const [todayIdx, setTodayIdx] = useState(0);
  const today = todaySessions[todayIdx];

  // ---- Path Map (15+ sessions)
  const [mapNodes, setMapNodes] = useState<SessionMapNode[]>(() => {
    const make = (n: number, status: Status): SessionMapNode => {
      const learnStatus: Status =
        status === "done" ? "done" : status === "next" ? "next" : "locked";
      const lockedIfNotDone: Status = status === "done" ? "done" : "locked";

      return {
        id: `s${n}`,
        sessionNo: n,
        title: `Session ${n}`,
        subtitle:
          n === 1
            ? "Refund after closing · Customer service"
            : n === 2
            ? "Busy shift phrases · Speed & clarity"
            : n === 3
            ? "Return policy · Edge cases"
            : "Shipping & returns · Practice",
        status,
        steps: [
          {
            key: "learn",
            label: "Run",
            estMin: 6,
            rewardXp: 20,
            rewardPoints: 120,
            status: learnStatus
          },
          {
            key: "review",
            label: "Quick Review",
            estMin: 2,
            rewardXp: 8,
            rewardPoints: 40,
            status: lockedIfNotDone
          },
          {
            key: "quest",
            label: "Quest",
            estMin: 4,
            rewardXp: 30,
            rewardPoints: 150,
            status: lockedIfNotDone
          }
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

  // ---- Hero badge (1s)
  const [showUpNextBadge, setShowUpNextBadge] = useState(false);
  const [badgeMode, setBadgeMode] = useState<"ready" | "upnext">("ready");

  // ---- Session state (single CTA)
  const [sessionStatus, setSessionStatus] = useState<
    "not_started" | "in_progress" | "completed"
  >("not_started");
  const [currentStep, setCurrentStep] = useState<Step>("learn");

  const primaryCta = useMemo(() => {
    if (sessionStatus === "in_progress") return "Continue";
    return sessionStatus === "completed" ? "Start next" : "Start";
  }, [sessionStatus]);

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

  const leaders: Leader[] = useMemo(
    () => [
      { name: "Mina", xp: 16800 },
      { name: "Jin", xp: 15240 },
      { name: "YOU", xp: 8420, me: true },
      { name: "Ella", xp: 8180 },
      { name: "Noah", xp: 7700 }
    ],
    []
  );

  const nextSessionSubtitle =
    mapNodes.find((n) => n.status === "next")?.subtitle ?? "—";

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
            <Kpi icon="🔥" label="연속 학습" value={`${user.streakDays}일`} />
            <Kpi icon="💎" label="포인트" value={user.points.toLocaleString()} />
            <Kpi icon="⭐" label="XP" value={user.xp.toLocaleString()} />
          </div>
        </div>
      </header>

      {/* 2-column content */}
      <section className="ws-grid">
        {/* Center */}
        <section className="ws-center">
          {/* Today Hero */}
          <section className="ws-hero" aria-label="Today Session">
            <div className="ws-heroContent">
              <div className="ws-heroEyebrow">TODAY</div>

              <div className="ws-heroTitleRow">
                <h2 className="ws-heroTitle">Session</h2>

                {showUpNextBadge && (
                  <span
                    className={`ws-upNextBadge ${
                      badgeMode === "upnext" ? "isUpNext" : "isReady"
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {badgeMode === "upnext" ? "Up next" : "Next Session is ready"}
                  </span>
                )}
              </div>

              <div className="ws-sub">Run → Quick Review → Quest (auto flow)</div>

              <h3 className="ws-heroH3">{today.title}</h3>
              <p className="ws-heroDesc">{today.description}</p>

              <div className="ws-heroMeta">
                <span className="ws-metaPill">⏱ {today.estMin} min</span>
                <span className="ws-metaPill">⭐ +{today.rewardXp} XP</span>
                <span className="ws-metaPill">💎 +{today.rewardPoints} P</span>
                <span className="ws-metaPill">🔥 {today.keepStreakRule}</span>
              </div>

              <div className="ws-heroCtaRow">
                <button
                  className="ws-btn ws-btn-primary ws-btn-hero"
                  onClick={handlePrimary}
                  type="button"
                >
                  {primaryCta}
                </button>

                <button
                  className="ws-btn ws-btn-outline ws-btn-sm"
                  type="button"
                  onClick={completeSession}
                  style={{ marginLeft: 8 }}
                >
                  Complete (demo)
                </button>
              </div>

              <div className="ws-stepHint">
                Current step: <b>{currentStep}</b>{" "}
                {sessionStatus === "in_progress" ? "· in progress" : ""}
              </div>
            </div>

            <div className="ws-heroSide">
              <div className="ws-heroSideCard">
                <div className="ws-heroSideTitle">Next on your path</div>
                <div className="ws-heroSideSub">Path에서 다음 세션이 아래로 이어져요.</div>

                <div className="ws-miniStat">
                  <span className="ws-miniLabel">Next</span>
                  <span className="ws-miniValue">{nextSessionSubtitle}</span>
                </div>

                <div className="ws-miniStat">
                  <span className="ws-miniLabel">Reward</span>
                  <span className="ws-miniValue">
                    +{today.rewardXp} XP · +{today.rewardPoints} P
                  </span>
                </div>

                <div className="ws-miniStat">
                  <span className="ws-miniLabel">Streak</span>
                  <span className="ws-miniValue">stays alive 🔥</span>
                </div>
              </div>
            </div>
          </section>

          {/* Path Map */}
          <section className="ws-card ws-path" aria-label="Learning path">
            <div className="ws-pathHeader">
              <div>
                <div className="ws-cardTitle">Learning path</div>
                <div className="ws-sub">
                  세션이 15개 이상 아래로 이어져요. 상세보기에서 Run/Quick Review/Quest를 펼치세요.
                </div>
              </div>

              <button
                className="ws-btn ws-btn-outline ws-btn-sm"
                onClick={() => setShowRoadmap(true)}
                type="button"
              >
                View roadmap
              </button>
            </div>

            <div className="ws-mapScroller">
              <div className="ws-mapLine" />

              {mapNodes.map((node) => {
                const isExpanded = expandedId === node.id;

                return (
                  <div key={node.id} className="ws-mapRow">
                    <button
                      className={`ws-mapDot ${node.status}`}
                      onClick={() => setExpandedId(isExpanded ? null : node.id)}
                      type="button"
                      aria-label={`${node.title} details`}
                      disabled={node.status === "locked"}
                      title={node.status === "locked" ? "Locked" : "Open details"}
                    >
                      {node.status === "done" ? "✓" : node.status === "next" ? "★" : ""}
                    </button>

                    <div className={`ws-mapCard ${node.status}`}>
                      <div className="ws-mapCardTop">
                        <div>
                          <div className="ws-mapTitle">
                            {node.title} <span className="ws-mapNo">#{node.sessionNo}</span>
                          </div>
                          <div className="ws-mapSub">{node.subtitle}</div>
                        </div>

                        <button
                          className="ws-mapDetailBtn"
                          onClick={() => setExpandedId(isExpanded ? null : node.id)}
                          type="button"
                          disabled={node.status === "locked"}
                        >
                          {isExpanded ? "접기" : "상세보기"}
                        </button>
                      </div>

                      <div className={`ws-accordion ${isExpanded ? "open" : ""}`}>
                        {node.steps.map((s) => (
                          <div key={s.key} className={`ws-accItem ${s.status}`}>
                            <div className="ws-accLeft">
                              <div className="ws-accLabel">{s.label}</div>
                              <div className="ws-accMeta">
                                {typeof s.estMin === "number" && <span>⏱ {s.estMin}m</span>}
                                {typeof s.rewardXp === "number" && <span>⭐ +{s.rewardXp}XP</span>}
                                {typeof s.rewardPoints === "number" && (
                                  <span>💎 +{s.rewardPoints}P</span>
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
                              {s.status === "next" ? "Start" : s.status === "done" ? "Review" : "Locked"}
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

        {/* Right */}
        <aside className="ws-right">
          <section className="ws-card" aria-label="Streak">
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">Streak · 연속 학습</div>
              <div className="ws-pill">🔥 {user.streakDays}일</div>
            </div>
            <div className="ws-sub">오늘 Session 1개만 완료하면 유지돼요.</div>
            <button className="ws-btn ws-btn-outline" type="button">
              Go to Items
            </button>
          </section>

          <section className="ws-card" aria-label="Leaderboard">
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">Leaderboard</div>
              <button className="ws-link" type="button">
                See all
              </button>
            </div>
            <div className="ws-sub">XP 기반 리더보드</div>

            <div className="ws-rankOnly">
              <div className="ws-rankBig">{user.myRank.toLocaleString()}위</div>
              <div className="ws-mutedSmall">현재 내 등수</div>
            </div>

            <div className="ws-leaderList" style={{ marginTop: 12 }}>
              {leaders.map((l, idx) => (
                <div key={l.name} className={`ws-leaderRow ${l.me ? "is-me" : ""}`}>
                  <div className="ws-rank">{idx + 1}</div>
                  <div className="ws-leaderName">{l.name}</div>
                  <div className="ws-leaderPts">{l.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </section>

          <section className="ws-card" aria-label="Current level">
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">Current level</div>
              <div className="ws-pill">
                Stage {user.stage} · Lv {user.level}
              </div>
            </div>

            <div className="ws-sub">
              퀘스트 결과에 따라 승급/강등돼요. (메인에서 현재 레벨이 보여야 함)
            </div>

            <div className="ws-levelReason">
              <span className="ws-levelTag">Reason</span>
              <span className="ws-mutedSmall">
                최근 퀘스트 성과가 기준 이상 → 승급 / 기준 미달 → 강등
              </span>
            </div>

            <button className="ws-btn ws-btn-outline" type="button">
              See details
            </button>
          </section>

          <section className="ws-card" aria-label="Points">
            <div className="ws-cardTitleRow">
              <div className="ws-cardTitle">Points · 포인트</div>
              <div className="ws-pill">💎 {user.points.toLocaleString()}</div>
            </div>
            <div className="ws-sub">상점에서 아이템/쿠폰 구매에 사용해요.</div>
            <button className="ws-btn ws-btn-outline" type="button" onClick={() => nav("/store")}>
              Go to Store
            </button>
          </section>
        </aside>
      </section>

      {showRoadmap && (
        <div className="ws-modalOverlay" role="dialog" aria-modal="true">
          <div className="ws-modal">
            <div className="ws-modalHeader">
              <div>
                <div className="ws-cardTitle">Full roadmap</div>
                <div className="ws-sub">
                  Stage {user.stage} · Unit {user.unit} 전체 세션
                </div>
              </div>
              <button
                className="ws-btn ws-btn-outline ws-btn-sm"
                onClick={() => setShowRoadmap(false)}
                type="button"
              >
                Close
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
                        {node.title} <span className="ws-mapNo">#{node.sessionNo}</span>
                      </div>
                      <div className="ws-mapSub">{node.subtitle}</div>
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
