// src/views/RoadmapView.tsx
import { useMemo, useState } from "react";

type Status = "done" | "current" | "locked";

type Unit = {
  id: string;
  title: string;
  subtitle: string;
  sessions: number; // 총 세션 수 (예: 18)
  status: Status;
};

type Stage = {
  id: string;
  stageNo: number;
  title: string;
  goal: string;
  status: Status;
  units: Unit[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function RoadmapView() {
  // 데모: 현재 위치 (나중에 서버에서 가져오면 됨)
  const current = useMemo(() => ({ stage: 2, unit: 1 }), []);

  const stages: Stage[] = useMemo(() => {
    // Stage별 Unit 구성(데모)
    const makeUnits = (stageNo: number): Unit[] => {
      const base = [
        { key: 1, t: "Shipping & returns", s: "Refunds, exchanges, policies" },
        { key: 2, t: "Customer conflicts", s: "De-escalation & boundaries" },
        { key: 3, t: "Busy shift speed", s: "Fast, clear, polite phrases" }
      ];

      return base.map((b) => {
        const status: Status =
          stageNo < current.stage
            ? "done"
            : stageNo === current.stage
            ? b.key < current.unit
              ? "done"
              : b.key === current.unit
              ? "current"
              : "locked"
            : "locked";

        return {
          id: `st${stageNo}-u${b.key}`,
          title: `Unit ${b.key} · ${b.t}`,
          subtitle: b.s,
          sessions: 18,
          status
        };
      });
    };

    const stageMeta = [
      { no: 1, title: "Foundations", goal: "Basic café flow & polite essentials" },
      { no: 2, title: "Service control", goal: "Returns, complaints, boundaries" },
      { no: 3, title: "Rush hour", goal: "Speed + clarity under pressure" },
      { no: 4, title: "Advanced requests", goal: "Edge cases & manager escalation" },
      { no: 5, title: "Team & ops", goal: "Handoffs, shift notes, coordination" },
      { no: 6, title: "Confidence", goal: "Natural tone & small talk" },
      { no: 7, title: "Leadership", goal: "Handling tough customers calmly" },
      { no: 8, title: "Mastery", goal: "Consistent performance & challenge mode" }
    ];

    return stageMeta.map((m) => {
      const status: Status =
        m.no < current.stage ? "done" : m.no === current.stage ? "current" : "locked";

      return {
        id: `stage-${m.no}`,
        stageNo: m.no,
        title: m.title,
        goal: m.goal,
        status,
        units: makeUnits(m.no)
      };
    });
  }, [current.stage, current.unit]);

  // 펼침/접힘(스테이지 단위)
  const [openStage, setOpenStage] = useState<number | "all">("all");

  // 상단 progress (0~1)
  const progress = useMemo(() => {
    const totalStages = 8;
    const stageProg = (current.stage - 1) / totalStages;
    return clamp(stageProg, 0, 1);
  }, [current.stage]);

  return (
    <div className="ws-roadmap">
      {/* Header */}
      <div className="ws-topbar" style={{ paddingLeft: 6, paddingRight: 6 }}>
        <div>
          <h1 className="ws-title">Roadmap</h1>
          <div className="ws-sub">
            Stage 1–8 전체 학습 루트. 현재 위치:{" "}
            <b>
              Stage {current.stage} · Unit {current.unit}
            </b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="ws-btn ws-btn-outline ws-btn-sm"
            type="button"
            onClick={() => setOpenStage("all")}
          >
            Expand all
          </button>
          <button
            className="ws-btn ws-btn-outline ws-btn-sm"
            type="button"
            onClick={() => setOpenStage(current.stage)}
          >
            Focus current
          </button>
          <button
            className="ws-btn ws-btn-outline ws-btn-sm"
            type="button"
            onClick={() => setOpenStage(0)}
            title="Collapse all"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <section className="ws-card ws-roadProgress">
        <div className="ws-roadProgressTop">
          <div className="ws-cardTitle">Overall progress</div>
          <div className="ws-pill">
            Stage {current.stage} / 8
          </div>
        </div>

        <div className="ws-roadBar" aria-label="Roadmap progress bar">
          <div className="ws-roadFill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="ws-roadHint">
          다음 목표: <b>Stage {current.stage} · Unit {current.unit}</b> 완료 → 다음 유닛/스테이지로 이동
        </div>
      </section>

      {/* Stage list */}
      <section className="ws-roadList" aria-label="All stages roadmap">
        {stages.map((st) => {
          const isOpen = openStage === "all" || openStage === st.stageNo;

          return (
            <section key={st.id} className={`ws-card ws-stageCard ${st.status}`}>
              <div className="ws-stageTop">
                <div className="ws-stageLeft">
                  <div className={`ws-stageBadge ${st.status}`}>
                    {st.status === "done" ? "✓" : st.status === "current" ? "★" : "🔒"}
                  </div>

                  <div>
                    <div className="ws-stageTitle">
                      Stage {st.stageNo} · {st.title}
                    </div>
                    <div className="ws-sub">{st.goal}</div>
                  </div>
                </div>

                <div className="ws-stageRight">
                  {st.status === "current" && (
                    <span className="ws-pill ws-pill-warn">Current</span>
                  )}
                  {st.status === "done" && <span className="ws-pill">Completed</span>}
                  {st.status === "locked" && <span className="ws-pill">Locked</span>}

                  <button
                    className="ws-btn ws-btn-outline ws-btn-sm"
                    type="button"
                    onClick={() =>
                      setOpenStage((prev) => (prev === st.stageNo ? 0 : st.stageNo))
                    }
                  >
                    {isOpen ? "Hide units" : "View units"}
                  </button>
                </div>
              </div>

              {/* Units */}
              <div className={`ws-stageUnits ${isOpen ? "open" : ""}`}>
                <div className="ws-unitsGrid">
                  {st.units.map((u) => (
                    <div key={u.id} className={`ws-unitCard ${u.status}`}>
                      <div className="ws-unitTitle">{u.title}</div>
                      <div className="ws-unitSub">{u.subtitle}</div>

                      <div className="ws-unitMeta">
                        <span className="ws-pill">Sessions · {u.sessions}</span>
                        <span className="ws-pill">
                          {u.status === "done"
                            ? "Done"
                            : u.status === "current"
                            ? "Next"
                            : "Locked"}
                        </span>
                      </div>

                      <button
                        className={`ws-btn ws-btn-sm ${
                          u.status === "current"
                            ? "ws-btn-primary"
                            : u.status === "done"
                            ? "ws-btn-outline"
                            : "ws-btn-disabled"
                        }`}
                        type="button"
                        disabled={u.status === "locked"}
                      >
                        {u.status === "current"
                          ? "Open unit"
                          : u.status === "done"
                          ? "Review"
                          : "Locked"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}
