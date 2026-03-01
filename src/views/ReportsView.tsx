// src/views/ReportsView.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

type ReportKind = "quest" | "level_test";
type LevelChange = "promoted" | "demoted" | "same" | "none";

export type Report = {
  id: string;
  stage: number; // 1~8
  unit: number; // 1~N
  kind: ReportKind;
  title: string;
  createdAt: string; // ISO date
  score?: number;
  xpEarned?: number;
  pointsEarned?: number;
  levelChange?: LevelChange;

  summary?: string;
  strengths?: string[];
  improvements?: string[];
  transcript?: { q: string; a: string; ok: boolean }[];
};

const STAGES = Array.from({ length: 8 }, (_, i) => i + 1);

// demo: units per stage
const UNITS_BY_STAGE: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [1, 2, 3, 4],
  3: [1, 2, 3],
  4: [1, 2],
  5: [1, 2, 3],
  6: [1, 2],
  7: [1],
  8: [1],
};

type DatePreset = "7d" | "3m" | "6m" | "1y" | "custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function formatDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function parseDateInputValue(v: string) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function formatDateLite(iso: string) {
  const d = new Date(iso);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}
function levelLabel(v?: LevelChange) {
  if (v === "promoted") return "Promoted";
  if (v === "demoted") return "Demoted";
  if (v === "same") return "No change";
  return "—";
}
function kindLabel(k: ReportKind) {
  return k === "quest" ? "Quest" : "Test";
}

function RadioPill({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className={`ws-radioPill ${checked ? "is-checked" : ""}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="ws-reportSelectField">
      <div className="ws-reportFilterLabel">{label}</div>
      <select
        className="ws-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {children}
      </select>
    </label>
  );
}

export default function ReportsView() {
  const { t } = useTranslation();
  const nav = useNavigate();

  // Filters
  const [stage, setStage] = useState<number | "all">("all");
  const [unit, setUnit] = useState<number | "all">("all");
  const [kind, setKind] = useState<ReportKind | "all">("all");
  const [sort, setSort] = useState<"newest" | "score">("newest");
  const [datePreset, setDatePreset] = useState<DatePreset>("3m");

  // Info toggle (Retention policy)
  const [showInfo, setShowInfo] = useState(false);

  // Date range (last 1 year)
  const maxWindowStart = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return startOfDay(d);
  }, []);

  const initialEnd = useMemo(() => endOfDay(new Date()), []);
  const initialStart = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d < maxWindowStart ? maxWindowStart : startOfDay(d);
  }, [maxWindowStart]);

  const [startDate, setStartDate] = useState<Date>(initialStart);
  const [endDate, setEndDate] = useState<Date>(initialEnd);

  // Demo data
  const reports: Report[] = useMemo(
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
        summary: "Excellent clarity. Slightly shorter confirmations next.",
        strengths: ["Fast responses", "Polite phrasing", "Excellent clarity"],
        improvements: ["Reduce filler words", "Shorter confirmations"],
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
        levelChange: "same",
        summary: "Solid baseline. Focus on tense consistency and greetings.",
        strengths: ["Good comprehension", "Key phrases remembered"],
        improvements: ["Past tense consistency", "Smoother greetings"],
      },
    ],
    []
  );

  const unitOptions = useMemo(() => {
    if (stage === "all") return ["all"] as const;
    return ["all", ...UNITS_BY_STAGE[stage]];
  }, [stage]);

  const applyPreset = (p: DatePreset) => {
    setDatePreset(p);
    const end = endOfDay(new Date());

    if (p === "custom") {
      const s = startDate < maxWindowStart ? maxWindowStart : startOfDay(startDate);
      const e = endDate > end ? end : endOfDay(endDate);
      setStartDate(s);
      setEndDate(e);
      return;
    }

    const s = new Date();
    if (p === "7d") s.setDate(s.getDate() - 7);
    if (p === "3m") s.setMonth(s.getMonth() - 3);
    if (p === "6m") s.setMonth(s.getMonth() - 6);
    if (p === "1y") s.setFullYear(s.getFullYear() - 1);

    const clampedStart = s < maxWindowStart ? maxWindowStart : startOfDay(s);
    setStartDate(clampedStart);
    setEndDate(end);
  };

  const onChangeStart = (v: string) => {
    const picked = startOfDay(parseDateInputValue(v));
    const clamped = picked < maxWindowStart ? maxWindowStart : picked;
    const newEnd = endDate < clamped ? endOfDay(clamped) : endDate;
    setStartDate(clamped);
    setEndDate(newEnd);
  };

  const onChangeEnd = (v: string) => {
    const picked = endOfDay(parseDateInputValue(v));
    const todayEnd = endOfDay(new Date());
    const clamped = picked > todayEnd ? todayEnd : picked;

    const newStart = startDate > clamped ? startOfDay(clamped) : startDate;
    const clampedStart = newStart < maxWindowStart ? maxWindowStart : newStart;

    setStartDate(clampedStart);
    setEndDate(clamped);
  };

  const filtered = useMemo(() => {
    const start = startDate.getTime();
    const end = endDate.getTime();

    return reports
      .filter((r) => (stage === "all" ? true : r.stage === stage))
      .filter((r) => (unit === "all" ? true : r.unit === unit))
      .filter((r) => (kind === "all" ? true : r.kind === kind))
      .filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= maxWindowStart.getTime() && t >= start && t <= end;
      });
  }, [reports, stage, unit, kind, startDate, endDate, maxWindowStart]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sort === "score") {
      copy.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      return copy;
    }
    copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return copy;
  }, [filtered, sort]);

  return (
    <div className="ws-reportsPage">
      <header className="ws-topbar" style={{ paddingLeft: 6, paddingRight: 6 }}>
        <div className="ws-topbarLeft">
          <div className="ws-reportBackRow">
            <button type="button" className="ws-link ws-linkSm" onClick={() => nav("/profile")}>
              ← Profile
            </button>
          </div>
          <h1 className="ws-title">{t("reports.title")}</h1>
          <div className="ws-reportSubRow">
            <span className="ws-sub">{t("reports.openReport")}</span>
            <button
              type="button"
              className="ws-btn ws-btn-utility"
              onClick={() => setShowInfo((v) => !v)}
              aria-expanded={showInfo}
              title={t("reports.info")}
            >
              {t("reports.info")}
            </button>
          </div>
        </div>
      </header>

      {showInfo && (
        <div className="ws-reportNoticeBlock">
          <span className="ws-reportNoticeBlockTitle">{t("reports.retentionPolicyTitle")}</span>
          <span className="ws-reportNoticeBlockText">
            <Trans i18nKey="reports.retentionPolicyText" components={{ 1: <b /> }} />
          </span>
        </div>
      )}

      <section className="ws-card ws-reportFilters">
        {/* ===== 2-row grid: left half = Stage, Unit, Range | right half = Type, Sort | mobile: 1 col ===== */}
        <div className="ws-reportFilterRow ws-reportFilterRow--reports">
          {/* Left half — row 1: Stage + Unit */}
          <div className="ws-reportFilterStageUnit">
            <div className="ws-reportFilterCell">
              <SelectField
                label="Stage"
                value={String(stage)}
                onChange={(v) => {
                  const next = v === "all" ? "all" : Number(v);
                  setStage(next);
                  setUnit("all");
                }}
              >
                <option value="all">All</option>
                {STAGES.map((s) => (
                  <option key={s} value={String(s)}>{`Stage ${s}`}</option>
                ))}
              </SelectField>
            </div>
            <div className="ws-reportFilterCell">
              <SelectField
                label="Unit"
                value={String(unit)}
                onChange={(v) => setUnit(v === "all" ? "all" : Number(v))}
                disabled={stage === "all"}
              >
                {stage === "all" ? (
                  <option value="all">All (select Stage first)</option>
                ) : (
                  unitOptions.map((u) =>
                    u === "all" ? (
                      <option key="all" value="all">
                        All
                      </option>
                    ) : (
                      <option key={u} value={String(u)}>{`Unit ${u}`}</option>
                    )
                  )
                )}
              </SelectField>
            </div>
          </div>

          {/* Right half — row 1: Type */}
          <div className="ws-reportFilterCellWide">
            <div className="ws-reportFilterLabel">Type</div>
            <div className="ws-radioRow ws-radioRowTight">
              <RadioPill name="reportType" value="all" checked={kind === "all"} onChange={() => setKind("all")} label="All" />
              <RadioPill
                name="reportType"
                value="quest"
                checked={kind === "quest"}
                onChange={() => setKind("quest")}
                label="Quest"
              />
              <RadioPill
                name="reportType"
                value="level_test"
                checked={kind === "level_test"}
                onChange={() => setKind("level_test")}
                label="Test"
              />
            </div>
          </div>

          <div className="ws-reportFilterRange">
            <div className="ws-reportFilterLabel">Range</div>
            <div className="ws-radioRow ws-radioRowTight">
              <RadioPill name="rangePreset" value="7d" checked={datePreset === "7d"} onChange={() => applyPreset("7d")} label="7d" />
              <RadioPill name="rangePreset" value="3m" checked={datePreset === "3m"} onChange={() => applyPreset("3m")} label="3m" />
              <RadioPill name="rangePreset" value="6m" checked={datePreset === "6m"} onChange={() => applyPreset("6m")} label="6m" />
              <RadioPill name="rangePreset" value="1y" checked={datePreset === "1y"} onChange={() => applyPreset("1y")} label="1y" />
              <RadioPill
                name="rangePreset"
                value="custom"
                checked={datePreset === "custom"}
                onChange={() => applyPreset("custom")}
                label="Custom"
              />
            </div>

            {datePreset === "custom" && (
              <div className="ws-dateGrid ws-dateGridTight">
                <label className="ws-dateField">
                  <div className="ws-reportFilterLabel">Start</div>
                  <input
                    className="ws-dateInput"
                    type="date"
                    value={formatDateInputValue(startDate)}
                    min={formatDateInputValue(maxWindowStart)}
                    max={formatDateInputValue(new Date())}
                    onChange={(e) => onChangeStart(e.target.value)}
                  />
                </label>

                <label className="ws-dateField">
                  <div className="ws-reportFilterLabel">End</div>
                  <input
                    className="ws-dateInput"
                    type="date"
                    value={formatDateInputValue(endDate)}
                    min={formatDateInputValue(maxWindowStart)}
                    max={formatDateInputValue(new Date())}
                    onChange={(e) => onChangeEnd(e.target.value)}
                  />
                </label>

                <div className="ws-sub" style={{ marginTop: 2 }}>
                  * You can select up to the last 1 year.
                </div>
              </div>
            )}
          </div>

          <div className="ws-reportFilterSort">
            <div className="ws-reportFilterLabel">Sort</div>
            <div className="ws-radioRow ws-radioRowTight">
              <RadioPill name="sort" value="newest" checked={sort === "newest"} onChange={() => setSort("newest")} label="Newest" />
              <RadioPill name="sort" value="score" checked={sort === "score"} onChange={() => setSort("score")} label="Score" />
            </div>
          </div>
        </div>
      </section>

      {/* Results 헤더: 카드 밖 */}
      <div className="ws-reportResultsHeader">
        <div>
          <h2 className="ws-cardTitle">Results</h2>
          <span className="ws-reportCount">{sorted.length} reports</span>
        </div>
        {sorted.length > 0 && (
          <div className="ws-sub" style={{ marginTop: 4 }}>
            Click a report to open full details.
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <section className="ws-card ws-reportEmptyState">
          <div className="ws-sub">{t("reports.noResults")}</div>
        </section>
      ) : (
        <section className="ws-card">
          <div className="ws-reportList">
            {sorted.map((r) => (
              <button
                key={r.id}
                type="button"
                className="ws-reportRow"
                onClick={() => nav(`/profile/reports/${r.id}`)} // ✅ router navigation
              >
                <div className="ws-reportLeft">
                  <div className="ws-reportTitleBlock">
                    <span className={`ws-kindTag ws-kindTag--vertical ${r.kind === "quest" ? "is-quest" : "is-test"}`}>
                      {kindLabel(r.kind)}
                    </span>
                    <div className="ws-reportTitleGroup">
                      <div className="ws-reportTitleRow">
                        <div className="ws-reportTitleText">{r.title}</div>
                      </div>
                      <div className="ws-reportMeta">
                        <span>Stage {r.stage}</span>
                        <span className="ws-reportMetaSep">|</span>
                        <span>Unit {r.unit}</span>
                        <span className="ws-reportMetaSep">|</span>
                        <span className={`ws-reportLevelText ${r.levelChange ?? "none"}`}>{levelLabel(r.levelChange)}</span>
                        <span className="ws-reportMetaSep">|</span>
                        <span className="ws-reportMetaDate">{formatDateLite(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ws-reportRight">
                  {typeof r.score === "number" && <div className="ws-reportScore">{r.score}</div>}
                  <div className="ws-reportRewards">
                    {typeof r.xpEarned === "number" && <span>⭐ {r.xpEarned} XP</span>}
                    {typeof r.pointsEarned === "number" && <span>💎 {r.pointsEarned} P</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

