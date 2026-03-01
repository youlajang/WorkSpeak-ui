// src/views/RoadmapView.tsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/** Credits store localStorage key (same as StoreView). */
const CREDITS_STORAGE_KEY = "ws-store-credits-owned";

/** Store item ids that unlock a roadmap track when purchased (permanent, enabled). */
const TRACK_ITEM_IDS: Record<string, string> = {
  cafe: "perm_cafe_track",
  medical: "perm_medical_sim",
  interview: "perm_interview_master",
};

export const TRACK_LABELS: Record<string, string> = {
  core: "Core",
  cafe: "Cafe",
  medical: "Medical",
  interview: "Interview",
};

/** Core track is free (from landing job choice). Others from store permanent purchase. */
function getUnlockedTrackIds(): string[] {
  try {
    const raw = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (!raw) return ["core"];
    const owned = JSON.parse(raw) as Record<string, { enabled?: boolean }>;
    const unlocked = Object.keys(TRACK_ITEM_IDS).filter(
      (trackId) => owned[TRACK_ITEM_IDS[trackId]]?.enabled === true
    );
    return ["core", ...unlocked];
  } catch {
    return ["core"];
  }
}

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
  const { t } = useTranslation();
  const current = useMemo(() => ({ stage: 2, unit: 1 }), []);

  const unlockedTrackIds = useMemo(getUnlockedTrackIds, []);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => unlockedTrackIds[0] ?? "core");

  useEffect(() => {
    if (!unlockedTrackIds.includes(selectedTrackId)) {
      setSelectedTrackId(unlockedTrackIds[0] ?? "core");
    }
  }, [unlockedTrackIds, selectedTrackId]);

  const stages: Stage[] = useMemo(() => {
    const makeUnits = (stageNo: number): Unit[] => {
      return [1, 2, 3].map((key) => {
        const status: Status =
          stageNo < current.stage
            ? "done"
            : stageNo === current.stage
            ? key < current.unit
              ? "done"
              : key === current.unit
              ? "current"
              : "locked"
            : "locked";
        const titleKey = `roadmap.unit${key}Title` as const;
        const subKey = `roadmap.unit${key}Sub` as const;
        return {
          id: `st${stageNo}-u${key}`,
          title: `Unit ${key} · ${t(titleKey)}`,
          subtitle: t(subKey),
          sessions: 18,
          status
        };
      });
    };

    const stageMeta = [1, 2, 3, 4, 5, 6, 7, 8].map((no) => ({
      no,
      titleKey: `roadmap.stage${no}Title` as const,
      goalKey: `roadmap.stage${no}Goal` as const
    }));

    return stageMeta.map((m) => {
      const status: Status =
        m.no < current.stage ? "done" : m.no === current.stage ? "current" : "locked";
      return {
        id: `stage-${m.no}`,
        stageNo: m.no,
        title: t(m.titleKey),
        goal: t(m.goalKey),
        status,
        units: makeUnits(m.no)
      };
    });
  }, [current.stage, current.unit, t]);

  // 펼침/접힘(스테이지 단위) - 디폴트: Focus current
  const [openStage, setOpenStage] = useState<number | "all">(current.stage);

  // top progress (0–1)
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
          <h1 className="ws-title">{t("nav.roadmap")}</h1>
          <div className="ws-sub">
            {t("roadmap.subtitle")}{" "}
            <b>
              Stage {current.stage} · Unit {current.unit}
            </b>
          </div>
        </div>
      </div>

      {/* Track tabs (Core = free from job; others = unlocked by store permanent purchase) */}
      <div className="ws-roadTabsWrap">
        <span className="ws-roadTabsLabel">{t("roadmap.trackLabel")}</span>
        <div className="ws-roadTabs" role="tablist" aria-label="Select roadmap track">
          {unlockedTrackIds.map((trackId) => (
            <button
              key={trackId}
              type="button"
              role="tab"
              aria-selected={selectedTrackId === trackId}
              className={"ws-roadTab " + (selectedTrackId === trackId ? "isActive" : "")}
              onClick={() => setSelectedTrackId(trackId)}
            >
              {TRACK_LABELS[trackId] ?? trackId}
              {trackId === "core" && (
                <span className="ws-roadTabBadge" title={t("roadmap.freeBadgeTitle")}>{t("roadmap.freeBadge")}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <section className="ws-card ws-roadProgress">
        <div className="ws-roadProgressTop">
          <div className="ws-cardTitle">{t("roadmap.overallProgress")}</div>
          <div className="ws-pill">
            {t("roadmap.stageOf8", { current: current.stage })}
          </div>
        </div>

        <div className="ws-roadBar" aria-label="Roadmap progress bar">
          <div className="ws-roadFill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="ws-roadHint">
          {t("roadmap.nextGoal", { stage: current.stage, unit: current.unit })}
        </div>
      </section>

      {/* Stage list header: title (left) + View filter (right) — filter labels stay in English */}
      <div className="ws-roadListHeader">
        <h2 className="ws-roadListTitle">{t("roadmap.coreStages")}</h2>
        <div className="ws-roadFilter">
          <span className="ws-roadFilterLabel">{t("roadmap.view")}:</span>
          <select
            className="ws-roadFilterSelect"
            value={openStage === "all" ? "all" : openStage === current.stage ? "focus" : "collapse"}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "all") setOpenStage("all");
              else if (v === "focus") setOpenStage(current.stage);
              else setOpenStage(0);
            }}
            aria-label="Roadmap view"
          >
            <option value="focus">{t("roadmap.focusCurrent")}</option>
            <option value="all">{t("roadmap.expandAll")}</option>
            <option value="collapse">{t("roadmap.collapsed")}</option>
          </select>
        </div>
      </div>

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
                    <span className="ws-roadStageLabel ws-roadStageLabelCurrent">{t("roadmap.current")}</span>
                  )}
                  {st.status === "done" && (
                    <span className="ws-roadStageLabel ws-roadStageLabelDone">{t("roadmap.completed")}</span>
                  )}
                  {st.status === "locked" && (
                    <span className="ws-roadStageLabel ws-roadStageLabelLocked">{t("roadmap.locked")}</span>
                  )}

                  <button
                    type="button"
                    className="ws-stageToggle"
                    onClick={() =>
                      setOpenStage((prev) => (prev === st.stageNo ? 0 : st.stageNo))
                    }
                    aria-expanded={isOpen}
                    aria-label={isOpen ? t("roadmap.hideUnits") : t("roadmap.viewUnits")}
                  >
                    <span className="ws-stageArrow" aria-hidden>
                      {isOpen ? "▼" : "▲"}
                    </span>
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
                        <span className="ws-pill">{t("roadmap.sessions")} · {u.sessions}</span>
                        <span className="ws-pill">
                          {u.status === "done"
                            ? t("roadmap.done")
                            : u.status === "current"
                            ? t("roadmap.next")
                            : t("roadmap.locked")}
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
                          ? t("roadmap.openUnit")
                          : u.status === "done"
                          ? t("roadmap.review")
                          : t("roadmap.locked")}
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
