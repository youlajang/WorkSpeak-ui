// src/views/LandingView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import i18n, {
  LANG_STORAGE_KEY,
  type SupportedLocale,
  getInitialLocale,
  fetchSuggestedLocale,
  sortLanguagesWithFirst,
} from "../i18n";
import { CANADIAN_OCCUPATIONS } from "../data/canadianOccupations";
import {
  PLACEMENT_LISTEN,
  PLACEMENT_SPEAK,
  PLACEMENT_STATEMENTS,
  PLACEMENT_VOCAB_A12,
  PLACEMENT_VOCAB_B12,
  PLACEMENT_VOCAB_C12,
  getVocabBandFromCEFR,
  resolvePlacementLevel,
  type StatementAnswer,
} from "../data/placementItems";
import { useDialog } from "../context/DialogContext";
import "../styles/landing.css";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type StepId =
  | "language"
  | "welcome"
  | "howFound"
  | "why"
  | "occupation"
  | "level"
  | "placementStatement0"
  | "placementStatement1"
  | "placementStatement2"
  | "placementStatement3"
  | "placementStatement4"
  | "placementStatement5"
  | "placementVocabA"
  | "placementVocabB"
  | "placementVocabC"
  | "dailyGoal"
  | "notify"
  | "startPoint"
  | "miniLessonIntro"
  | "placementListen0"
  | "placementListen1"
  | "placementListen2"
  | "placementSpeak0"
  | "placementSpeak1"
  | "placementSpeak2"
  | "lessonComplete"
  | "scoreUnlocked"
  | "streak"
  | "reward"
  | "recommendation"
  | "createProfile";

type Choice = { id: string; label?: string; labelKey?: string; sub?: string; subKey?: string; icon?: string };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function LandingView() {
  const nav = useNavigate();
  const loc = useLocation();
  const { t } = useTranslation();
  const { confirm } = useDialog();

  // 온보딩을 끝낸 사용자는 랜딩 스킵. /landing 은 테스트용으로 항상 랜딩 표시.
  useEffect(() => {
    if (loc.pathname === "/landing") return;
    const done = localStorage.getItem("ws_onboarding_done") === "1";
    const loggedIn = localStorage.getItem("ws_logged_in") === "1";
    if (done || loggedIn) nav("/practice", { replace: true });
  }, [nav, loc.pathname]);

  const [idx, setIdx] = useState(0);

  // answers
  const [howFound, setHowFound] = useState<string | null>(null);
  const [why, setWhy] = useState<string[]>([]);
  const [occupationCategory, setOccupationCategory] = useState<string | null>(null);
  const [occupationJob, setOccupationJob] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [statementAnswers, setStatementAnswers] = useState<(StatementAnswer | null)[]>([null, null, null, null, null, null]);
  const [vocabSelectedA, setVocabSelectedA] = useState<string[]>([]);
  const [vocabSelectedB, setVocabSelectedB] = useState<string[]>([]);
  const [vocabSelectedC, setVocabSelectedC] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState<string | null>(null);

  /** Placement: vocab + difficulty + 3 listen + 3 speak. */
  const [listenChosens, setListenChosens] = useState<string[][]>([[], [], []]);
  const [speakDones, setSpeakDones] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [resolvedLevel, setResolvedLevel] = useState<string | null>(null);

  const placementBand = getVocabBandFromCEFR(vocabSelectedA, vocabSelectedB, vocabSelectedC);
  const listenShuffledTokens = useMemo(() => {
    const idx = placementBand;
    return shuffle([...PLACEMENT_LISTEN[idx].tokens]);
  }, [placementBand]);

  const steps: StepId[] = useMemo(
    () => {
      const listenStep = `placementListen${placementBand}` as StepId;
      const speakStep = `placementSpeak${placementBand}` as StepId;
      return [
        "language",
        "welcome",
        "howFound",
        "why",
        "occupation",
        "level",
        "placementStatement0",
        "placementStatement1",
        "placementStatement2",
        "placementStatement3",
        "placementStatement4",
        "placementStatement5",
        "placementVocabA",
        "placementVocabB",
        "placementVocabC",
        "dailyGoal",
        "notify",
        "startPoint",
        "miniLessonIntro",
        listenStep,
        speakStep,
        "lessonComplete",
        "scoreUnlocked",
        "streak",
        "reward",
        "recommendation",
        "createProfile",
      ];
    },
    [placementBand]
  );

  const step = steps[idx];
  const progress = clamp((idx + 1) / steps.length, 0, 1);

  useEffect(() => {
    if (step !== "lessonComplete" || !level) return;
    const band = getVocabBandFromCEFR(vocabSelectedA, vocabSelectedB, vocabSelectedC);
    const listenCorrect = listenChosens[band].join(" ") === PLACEMENT_LISTEN[band].tokens.join(" ");
    const speakDone = speakDones[band];
    const finalBand = listenCorrect && speakDone ? band : Math.max(0, band - 1);
    const num = resolvePlacementLevel(finalBand, level, undefined);
    const resolved = String(num);
    setResolvedLevel(resolved);
    if (typeof window !== "undefined") {
      localStorage.setItem("ws_placement_level", resolved);
      const st = statementAnswers.filter((a): a is StatementAnswer => a != null);
      if (st.length > 0) {
        localStorage.setItem("ws_placement_statements", JSON.stringify(st));
      }
    }
  }, [step, level, listenChosens, speakDones, statementAnswers, vocabSelectedA, vocabSelectedB, vocabSelectedC]);

  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(getInitialLocale);
  const [geoFetched, setGeoFetched] = useState(false);

  useEffect(() => {
    if (step !== "language" || geoFetched) return;
    setGeoFetched(true);
    const hasSaved = typeof window !== "undefined" && localStorage.getItem(LANG_STORAGE_KEY);
    if (hasSaved) return;
    fetchSuggestedLocale().then((locale) => {
      setSelectedLocale(locale);
      i18n.changeLanguage(locale);
    });
  }, [step, geoFetched]);

  const canContinue = useMemo(() => {
    switch (step) {
      case "language":
        return true;
      case "welcome":
        return true;
      case "howFound":
        return !!howFound;
      case "why":
        return why.length > 0;
      case "occupation":
        return !!occupationCategory && !!occupationJob;
      case "level":
        return !!level;
      case "placementStatement0":
      case "placementStatement1":
      case "placementStatement2":
      case "placementStatement3":
      case "placementStatement4":
      case "placementStatement5": {
        const i = step === "placementStatement0" ? 0 : step === "placementStatement1" ? 1 : step === "placementStatement2" ? 2 : step === "placementStatement3" ? 3 : step === "placementStatement4" ? 4 : 5;
        return statementAnswers[i] != null;
      }
      case "placementVocabA":
      case "placementVocabB":
      case "placementVocabC":
        return true;
      case "dailyGoal":
        return !!dailyGoal;
      case "notify":
        return true; // proceed regardless of allow/block
      case "startPoint":
        return true;
      case "miniLessonIntro":
        return true;
      case "placementListen0":
      case "placementListen1":
      case "placementListen2":
      case "placementSpeak0":
      case "placementSpeak1":
      case "placementSpeak2":
        return true;
      case "lessonComplete":
      case "scoreUnlocked":
      case "streak":
      case "reward":
      case "recommendation":
        return true;
      case "createProfile":
        return true;
      default:
        return true;
    }
  }, [step, howFound, why.length, occupationCategory, occupationJob, level, dailyGoal, statementAnswers, listenChosens, speakDones]);

  function goNext() {
    if (!canContinue) return;
    if (idx === steps.length - 1) return;
    setIdx((v) => Math.min(v + 1, steps.length - 1));
  }

  function goBack() {
    if (idx === 0) {
      nav("/", { replace: true });
      return;
    }
    setIdx((v) => Math.max(v - 1, 0));
  }

  function close() {
    localStorage.setItem("ws_onboarding_done", "1");
    nav("/practice", { replace: true });
  }

  function finishAndGoHome() {
    localStorage.setItem("ws_onboarding_done", "1");
    localStorage.removeItem("ws_logged_in");
    nav("/home", { replace: true });
  }

  async function requestNotify() {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission === "granted") return;
      await Notification.requestPermission();
    } catch {
      // ignore
    }
  }

  const handleGoBack = async () => {
    if (step === "createProfile") {
      const ok = await confirm(t("landing.leaveProfileRewardConfirm"));
      if (!ok) return;
    }
    goBack();
  };
  const handleClose = async () => {
    if (step === "createProfile") {
      const ok = await confirm(t("landing.leaveProfileRewardConfirm"));
      if (!ok) return;
    }
    close();
  };

  // UI blocks
  const topBar = (
    <div className="ldTop">
      <button className="ldIconBtn" onClick={handleGoBack} aria-label={t("common.back")}>
        ←
      </button>
      <div className="ldProgressWrap" aria-label="Progress">
        <div className="ldProgressTrack">
          <div className="ldProgressFill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <button className="ldIconBtn" onClick={handleClose} aria-label={t("common.close")}>
        ✕
      </button>
    </div>
  );

  const bottomCTA = (
    <div className="ldBottom">
      <button
        className={`ldCta ${canContinue ? "isOn" : "isOff"}`}
        onClick={goNext}
        disabled={!canContinue}
      >
        {t("common.continue")}
      </button>
    </div>
  );

  const card = (children: React.ReactNode) => (
    <div className="ldStage">
      <div className="ldCard">{children}</div>
    </div>
  );

  const choicesGrid = (
    items: Choice[],
    selected: string | null,
    onPick: (id: string) => void,
    columns: 2 | 3 = 2
  ) => (
    <div className={`ldGrid cols${columns}`}>
      {items.map((it) => (
        <button
          key={it.id}
          className={`ldChoice ${selected === it.id ? "isSelected" : ""}`}
          onClick={() => onPick(it.id)}
        >
          <div className="ldChoiceTop">
            {it.icon && <span className="ldChoiceIcon">{it.icon}</span>}
            <span className="ldChoiceLabel">{it.labelKey ? t(it.labelKey) : it.label}</span>
          </div>
          {(it.subKey ? t(it.subKey) : it.sub) && <div className="ldChoiceSub">{it.subKey ? t(it.subKey) : it.sub}</div>}
        </button>
      ))}
    </div>
  );

  const choicesGridMulti = (
    items: Choice[],
    selectedIds: string[],
    onToggle: (id: string) => void,
    columns: 2 | 3 = 2
  ) => (
    <div className={`ldGrid cols${columns}`}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`ldChoice ${selectedIds.includes(it.id) ? "isSelected" : ""}`}
          onClick={() => onToggle(it.id)}
        >
          <div className="ldChoiceTop">
            {it.icon && <span className="ldChoiceIcon">{it.icon}</span>}
            <span className="ldChoiceLabel">{it.labelKey ? t(it.labelKey) : it.label}</span>
          </div>
          {(it.subKey ? t(it.subKey) : it.sub) && <div className="ldChoiceSub">{it.subKey ? t(it.subKey) : it.sub}</div>}
        </button>
      ))}
    </div>
  );

  // step content
  let content: React.ReactNode = null;

  if (step === "language") {
    const languagesSorted = sortLanguagesWithFirst(selectedLocale);
    content = card(
      <>
        <div className="ldBrand">{t("landing.brand")}</div>
        <div className="ldMascot">🌐</div>
        <h1 className="ldTitle">{t("landing.languageStepTitle")}</h1>
        <p className="ldDesc">{t("landing.languageStepDesc")}</p>
        <div className="ldLangGridWrap">
          <div className="ldGrid cols2">
          {languagesSorted.map(({ code, label, flag }) => (
            <button
              key={code}
              type="button"
              className={`ldChoice ldChoiceLang ${selectedLocale === code ? "isSelected" : ""}`}
              onClick={() => {
                setSelectedLocale(code);
                i18n.changeLanguage(code);
              }}
            >
              <div className="ldChoiceFlagWrap">
                <img
                  src={`/flags/${code}.png`}
                  alt=""
                  className="ldChoiceFlagImg"
                  data-try="0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const tryOrder = ["png", "jpg", "svg"];
                    const tryIdx = parseInt(img.dataset.try ?? "0", 10);
                    const nextIdx = tryIdx + 1;
                    if (nextIdx < tryOrder.length) {
                      img.dataset.try = String(nextIdx);
                      img.src = `/flags/${code}.${tryOrder[nextIdx]}`;
                    } else {
                      img.style.display = "none";
                      const next = img.nextElementSibling as HTMLElement | null;
                      if (next) next.style.display = "inline-block";
                    }
                  }}
                />
                <span className="ldChoiceFlag" aria-hidden role="img">{flag}</span>
              </div>
              <span className="ldChoiceLabel">{label}</span>
            </button>
          ))}
          </div>
        </div>
        <div className="ldHeroBtns" style={{ marginTop: 24 }}>
          <button className="ldPrimary" onClick={goNext}>
            {t("common.continue")}
          </button>
        </div>
      </>
    );
  }

  if (step === "welcome") {
    content = card(
      <>
        <div className="ldBrand">{t("landing.brand")}</div>
        <div className="ldMascot">🎯</div>
        <h1 className="ldTitle">{t("landing.welcomeTitle")}</h1>
        <p className="ldDesc">
          <Trans i18nKey="landing.welcomeDesc" components={{ 1: <b />, 2: <b /> }} />
        </p>

        <div className="ldHeroBtns">
          <button className="ldPrimary" onClick={goNext}>
            {t("landing.getStarted")}
          </button>
          <button className="ldGhost" onClick={() => nav("/login")}>
            {t("landing.alreadyHaveAccount")}
          </button>
        </div>
      </>
    );
  }

  if (step === "howFound") {
    const items: Choice[] = [
      { id: "google", labelKey: "landingChoices.google", icon: "🔎" },
      { id: "blog", labelKey: "landingChoices.blog", icon: "📰" },
      { id: "friend", labelKey: "landingChoices.friend", icon: "👥" },
      { id: "sns", labelKey: "landingChoices.sns", icon: "📱" },
      { id: "tiktok", labelKey: "landingChoices.tiktok", icon: "🎵" },
      { id: "youtube", labelKey: "landingChoices.youtube", icon: "▶️" },
      { id: "tv", labelKey: "landingChoices.tv", icon: "📺" },
      { id: "etc", labelKey: "landingChoices.other", icon: "…" },
    ];
    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.howFoundTitle")}</h2>
        <p className="ldDesc2">{t("landing.howFoundDesc")}</p>
        {choicesGrid(items, howFound, setHowFound, 2)}
      </>
    );
  }

  if (step === "why") {
    const items: Choice[] = [
      { id: "work", labelKey: "landingChoices.work", subKey: "landingChoices.workSub", icon: "💼" },
      { id: "job", labelKey: "landingChoices.job", subKey: "landingChoices.jobSub", icon: "🧑‍💻" },
      { id: "service", labelKey: "landingChoices.service", subKey: "landingChoices.serviceSub", icon: "☕" },
      { id: "imm", labelKey: "landingChoices.imm", subKey: "landingChoices.immSub", icon: "🛂" },
      { id: "study", labelKey: "landingChoices.study", subKey: "landingChoices.studySub", icon: "📚" },
      { id: "etc", labelKey: "landingChoices.other", icon: "…" },
    ];
    const toggleWhy = (id: string) => {
      setWhy((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };
    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.whyTitle")}</h2>
        <p className="ldDesc2">{t("landing.whyDesc")}</p>
        {choicesGridMulti(items, why, toggleWhy, 2)}
      </>
    );
  }

  if (step === "occupation") {
    const cat = CANADIAN_OCCUPATIONS.find((c) => c.id === occupationCategory);
    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.occupationStepTitle")}</h2>
        <p className="ldDesc2">{t("landing.occupationStepDesc")}</p>
        {!occupationCategory ? (
          <div className="ldList">
            {CANADIAN_OCCUPATIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`ldRowChoice ${occupationCategory === c.id ? "isSelected" : ""}`}
                onClick={() => {
                  setOccupationCategory(c.id);
                  setOccupationJob(null);
                }}
              >
                <span className="ldRowMain">
                  <span className="ldRowLabel">
                    {c.labelKey ? t(c.labelKey) : c.labelEn}
                  </span>
                </span>
                <span className="ldRowRight">›</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button
              type="button"
              className="ldBackToCat"
              onClick={() => {
                setOccupationCategory(null);
                setOccupationJob(null);
              }}
            >
              ← {t("landing.selectCategory")}
            </button>
            <div className="ldList" style={{ marginTop: 12 }}>
              {cat?.jobs.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  className={`ldRowChoice ${occupationJob === j.id ? "isSelected" : ""}`}
                  onClick={() => setOccupationJob(j.id)}
                >
                  <span className="ldRowMain">
                    <span className="ldRowLabel">
                      {j.labelKey ? t(j.labelKey) : j.labelEn}
                    </span>
                  </span>
                  <span className="ldRowRight">›</span>
                </button>
              ))}
            </div>
          </>
        )}
      </>
    );
  }

  if (step === "level") {
    const items: Choice[] = [
      { id: "freeze", labelKey: "landingChoices.freeze", subKey: "landingChoices.freezeSub", icon: "🧊" },
      { id: "basic", labelKey: "landingChoices.basic", subKey: "landingChoices.basicSub", icon: "🟦" },
      { id: "smalltalk", labelKey: "landingChoices.smalltalk", subKey: "landingChoices.smalltalkSub", icon: "💬" },
      { id: "meeting", labelKey: "landingChoices.meeting", subKey: "landingChoices.meetingSub", icon: "🧑‍🤝‍🧑" },
      { id: "present", labelKey: "landingChoices.present", subKey: "landingChoices.presentSub", icon: "🎤" },
    ];
    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.levelTitle")}</h2>
        <p className="ldDesc2">{t("landing.levelDesc")}</p>
        <div className="ldList">
          {items.map((it) => (
            <button
              key={it.id}
              className={`ldRowChoice ${level === it.id ? "isSelected" : ""}`}
              onClick={() => setLevel(it.id)}
            >
              <span className="ldRowIcon">{it.icon}</span>
              <span className="ldRowMain">
                <span className="ldRowLabel">{it.labelKey ? t(it.labelKey) : it.label}</span>
                <span className="ldRowSub">{it.subKey ? t(it.subKey) : it.sub}</span>
              </span>
              <span className="ldRowRight">›</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const statementStepNum = step.startsWith("placementStatement")
    ? (step === "placementStatement0" ? 0 : parseInt(step.replace("placementStatement", ""), 10))
    : -1;
  if (statementStepNum >= 0 && statementStepNum < PLACEMENT_STATEMENTS.length) {
    const item = PLACEMENT_STATEMENTS[statementStepNum];
    const value = statementAnswers[statementStepNum];
    const setAnswer = (a: StatementAnswer) => {
      setStatementAnswers((prev) => {
        const n = [...prev];
        n[statementStepNum] = a;
        return n;
      });
    };
    content = card(
      <>
        <h2 className="ldTitle2">
          {t(item.statementKey) !== item.statementKey ? t(item.statementKey) : item.statementEn}
        </h2>
        <p className="ldDesc2">{t("landing.doesThisApply")}</p>
        <div className="ldList">
          {(["yes", "partially", "no"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              className={`ldRowChoice ${value === opt ? "isSelected" : ""}`}
              onClick={() => setAnswer(opt)}
            >
              <span className="ldRowMain">
                <span className="ldRowLabel">{t(`landing.answer.${opt}`)}</span>
              </span>
              <span className="ldRowRight">{value === opt ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  if (step === "placementVocabA" || step === "placementVocabB" || step === "placementVocabC") {
    const words = step === "placementVocabA" ? PLACEMENT_VOCAB_A12 : step === "placementVocabB" ? PLACEMENT_VOCAB_B12 : PLACEMENT_VOCAB_C12;
    const selected = step === "placementVocabA" ? vocabSelectedA : step === "placementVocabB" ? vocabSelectedB : vocabSelectedC;
    const setSelected = step === "placementVocabA" ? setVocabSelectedA : step === "placementVocabB" ? setVocabSelectedB : setVocabSelectedC;
    const levelLabel = step === "placementVocabA" ? "A1-A2" : step === "placementVocabB" ? "B1-B2" : "C1-C2";
    const stageLabel = step === "placementVocabA" ? t("landing.vocabStageBeginner") : step === "placementVocabB" ? t("landing.vocabStageIntermediate") : t("landing.vocabStageAdvanced");
    const toggle = (w: string) => {
      setSelected((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);
    };
    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.vocabSelectTitle")}</h2>
        <p className="ldDesc2">{t("landing.vocabSelectDesc")} {stageLabel} ({levelLabel})</p>
        <div className="ldVocabChips" style={{ marginTop: 12 }}>
          {words.map((w) => (
            <button
              key={w}
              type="button"
              className={`ldChip ${selected.includes(w) ? "isSelected" : ""}`}
              onClick={() => toggle(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </>
    );
  }

  if (step === "dailyGoal") {
    const items: Choice[] = [
      { id: "10", labelKey: "landingChoices.min10", subKey: "landingChoices.light", icon: "🟢" },
      { id: "20", labelKey: "landingChoices.min20", subKey: "landingChoices.moderate", icon: "🟡" },
      { id: "30", labelKey: "landingChoices.min30", subKey: "landingChoices.steady", icon: "🟠" },
      { id: "60", labelKey: "landingChoices.min60", subKey: "landingChoices.focused", icon: "🔴" },
    ];
    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.dailyGoalTitle")}</h2>
        <p className="ldDesc2">{t("landing.dailyGoalDesc")}</p>
        <div className="ldList">
          {items.map((it) => (
            <button
              key={it.id}
              className={`ldRowChoice ${dailyGoal === it.id ? "isSelected" : ""}`}
              onClick={() => setDailyGoal(it.id)}
            >
              <span className="ldRowIcon">{it.icon}</span>
              <span className="ldRowMain">
                <span className="ldRowLabel">{it.labelKey ? t(it.labelKey) : it.label}</span>
                <span className="ldRowSub">{it.subKey ? t(it.subKey) : it.sub}</span>
              </span>
              <span className="ldRowRight">›</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  if (step === "notify") {
    content = card(
      <>
        <div className="ldMascot">🔔</div>
        <h2 className="ldTitle2">{t("landing.notifyTitle")}</h2>
        <p className="ldDesc2">{t("landing.notifyDesc")}</p>

        <div className="ldInlineBtns">
          <button className="ldSecondary" onClick={requestNotify}>
            {t("landing.enableNotifications")}
          </button>
          <button type="button" className="ldGhost2" onClick={goNext}>
            {t("landing.later")}
          </button>
        </div>
        <p className="ldDesc2" style={{ marginTop: 12, marginBottom: 0 }}>
          <Trans i18nKey="landing.thenTapContinue" components={{ 1: <b /> }} />
        </p>
      </>
    );
  }

  if (step === "startPoint") {
    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.startPointTitle")}</h2>
        <p className="ldDesc2">
          <Trans i18nKey="landing.startPointDesc" components={{ 1: <b /> }} />
        </p>
      </>
    );
  }

  if (step === "miniLessonIntro") {
    content = card(
      <>
        <div className="ldMascot">🧪</div>
        <h2 className="ldTitle2">{t("landing.miniLessonTitle")}</h2>
        <p className="ldDesc2">{t("landing.miniLessonDesc")}</p>
        <div className="ldCallout">
          {t("landing.miniLessonCallout")}
        </div>
      </>
    );
  }

  const getEnglishVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => v.lang.startsWith("en-US")) ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  };
  const playTTS = (sentence: string, rate = 0.9) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(sentence);
    u.lang = "en-US";
    u.rate = rate;
    const enVoice = getEnglishVoice();
    if (enVoice) u.voice = enVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const placementListenIndex = step === "placementListen0" ? 0 : step === "placementListen1" ? 1 : 2;
  if (step.startsWith("placementListen")) {
    const item = PLACEMENT_LISTEN[placementListenIndex];
    const chosen = listenChosens[placementListenIndex];
    const setChosen = (next: string[]) => {
      setListenChosens((prev) => {
        const n = [...prev];
        n[placementListenIndex] = next;
        return n;
      });
    };
    const canTap = () => chosen.length < item.tokens.length;
    const onTap = (t: string) => {
      if (!canTap()) return;
      setChosen([...chosen, t]);
    };
    const onUndo = () => setChosen(chosen.slice(0, -1));
    const isCorrect = chosen.join(" ") === item.tokens.join(" ");

    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.listenTitle")}</h2>
        <p className="ldDesc2">{t("landing.tapWordsInOrder")}</p>

        <div className="ldAudioRow">
          <button type="button" className="ldAudioBtn" title={t("landing.play")} onClick={() => playTTS(item.sentence, 0.9)}>🔊</button>
          <button type="button" className="ldAudioBtn" title={t("landing.playSlow")} onClick={() => playTTS(item.sentence, 0.65)}>🐢</button>
        </div>

        <div className="ldSlots">
          {item.tokens.map((_, i) => (
            <div key={i} className={`ldSlot ${chosen[i] ? "filled" : ""}`}>
              {chosen[i] ?? ""}
            </div>
          ))}
        </div>

        <div className="ldTokens">
          {listenShuffledTokens.map((t, i) => (
            <button key={`tok-${i}`} className="ldToken" onClick={() => onTap(t)}>
              {t}
            </button>
          ))}
          <button className="ldTokenGhost" onClick={onUndo}>
            ⌫
          </button>
        </div>

        <div className={`ldResultBar ${isCorrect ? "ok" : "idle"}`}>
          <div className="ldResultTitle">{isCorrect ? t("landing.nice") : t("landing.tapWordsInOrder")}</div>
        </div>
      </>
    );
  }

  const placementSpeakIndex = step === "placementSpeak0" ? 0 : step === "placementSpeak1" ? 1 : 2;
  if (step.startsWith("placementSpeak")) {
    const item = PLACEMENT_SPEAK[placementSpeakIndex];
    const done = speakDones[placementSpeakIndex];
    const setDone = () => {
      setSpeakDones((prev) => {
        const n = [...prev] as [boolean, boolean, boolean];
        n[placementSpeakIndex] = true;
        return n;
      });
    };
    const startSpeechRecognition = () => {
      try {
        const Win = typeof window !== "undefined" ? (window as unknown as { SpeechRecognition?: new () => { lang: string; continuous: boolean; interimResults: boolean; start: () => void; onresult: () => void; onerror: () => void }; webkitSpeechRecognition?: new () => { lang: string; continuous: boolean; interimResults: boolean; start: () => void; onresult: () => void; onerror: () => void } }) : null;
        const SR = Win?.SpeechRecognition ?? Win?.webkitSpeechRecognition;
        if (!SR) {
          setDone();
          return;
        }
        const rec = new SR();
        rec.lang = "en-US";
        rec.continuous = false;
        rec.interimResults = false;
        rec.onresult = () => setDone();
        rec.onerror = () => setDone();
        rec.start();
      } catch {
        setDone();
      }
    };

    content = card(
      <>
        <h2 className="ldTitle2">{t("landing.saySentence")}</h2>
        <div className="ldSpeechBubble">
          <span className="ldSpeechIcon">🔊</span>
          <span className="ldSpeechText">{item.sentence}</span>
        </div>
        <div className="ldInlineBtns" style={{ marginBottom: 16 }}>
          <button type="button" className="ldSecondary" onClick={() => playTTS(item.sentence)} title={t("landing.playAgain")}>
            🔊 {t("landing.playAgain")}
          </button>
        </div>

        <div className="ldMicBox">
          <button
            type="button"
            className={`ldMicBtn ${done ? "done" : ""}`}
            onClick={done ? undefined : startSpeechRecognition}
            disabled={done}
          >
            {done ? `✅ ${t("common.done")}` : `🎤 ${t("landing.startSpeaking")}`}
          </button>
          <p className="ldHint">{t("landing.micHint")}</p>
        </div>

        {done && (
          <div className="ldResultBar ok">
            <div className="ldResultTitle">{t("landing.wellDone")}</div>
            <div className="ldResultSub">{t("landing.xpCreditsHint")}</div>
          </div>
        )}
      </>
    );
  }

  useEffect(() => {
    if (step !== "placementSpeak0" && step !== "placementSpeak1" && step !== "placementSpeak2") return;
    const i = step === "placementSpeak0" ? 0 : step === "placementSpeak1" ? 1 : 2;
    const item = PLACEMENT_SPEAK[i];
    const t = setTimeout(() => playTTS(item.sentence, 0.9), 400);
    return () => clearTimeout(t);
  }, [step]);

  if (step === "lessonComplete") {
    const displayLevel = resolvedLevel ?? "4";
    content = card(
      <>
        <div className="ldMascot">🎉</div>
        <h2 className="ldTitle2">{t("landing.lessonComplete")}</h2>
        <div className="ldStats2">
          <div className="ldStatBox">
            <div className="ldStatLabel">{t("landing.xpEarned")}</div>
            <div className="ldStatValue">20</div>
          </div>
          <div className="ldStatBox">
            <div className="ldStatLabel">{t("common.done")}</div>
            <div className="ldStatValue">100%</div>
          </div>
          <div className="ldStatBox">
            <div className="ldStatLabel">예상 레벨</div>
            <div className="ldStatValue">L{displayLevel}</div>
          </div>
        </div>
      </>
    );
  }

  if (step === "scoreUnlocked") {
    content = card(
      <>
        <div className="ldMascot">🏁</div>
        <h2 className="ldTitle2">{t("landing.scoreUnlockedTitle")}</h2>
        <p className="ldDesc2">{t("landing.scoreUnlockedDesc")}</p>
        <div className="ldUnlockRow">
          <div className="ldUnlockItem">
            <span className="ldUnlockIcon">⭐</span>
            <span className="ldUnlockLabel">XP</span>
          </div>
          <div className="ldUnlockItem">
            <span className="ldUnlockIcon">💎</span>
            <span className="ldUnlockLabel">{t("profile.credits")}</span>
          </div>
        </div>
      </>
    );
  }

  if (step === "streak") {
    content = card(
      <>
        <div className="ldMascot">🔥</div>
        <h2 className="ldTitle2">{t("landing.streakTitle")}</h2>
        <p className="ldDesc2">{t("landing.streakDesc")}</p>
        <div className="ldWeek">
          {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
            <div key={d} className={`ldDot ${i === 0 ? "on" : ""}`}>
              {d}
            </div>
          ))}
        </div>
      </>
    );
  }

  if (step === "reward") {
    content = card(
      <>
        <div className="ldMascot">💎</div>
        <h2 className="ldTitle2">{t("landing.rewardTitle")}</h2>
        <p className="ldDesc2">{t("landing.rewardDesc")}</p>
        <div className="ldReward">
          <div className="ldChest">💎</div>
          <div>
            <div className="ldRewardTitle">{t("landing.rewardCredits")}</div>
            <div className="ldRewardSub">{t("landing.rewardSub")}</div>
          </div>
        </div>
      </>
    );
  }

  if (step === "recommendation") {
    content = card(
      <>
        <div className="ldMascot">🧠</div>
        <h2 className="ldTitle2">{t("landing.recommendTitle")}</h2>
        <p className="ldDesc2">
          <Trans i18nKey="landing.recommendDesc" components={{ 1: <b /> }} />
        </p>

        <div className="ldCallout">
          {t("landing.recommendCallout")} <b>Stage 2 · Workplace Small Talk</b>
          <div className="ldCalloutSub">{t("landing.recommendChange")}</div>
        </div>

        <div className="ldMiniList">
          <div className="ldMiniItem">• Canadian greetings & tone</div>
          <div className="ldMiniItem">• &quot;Could you…?&quot; requests</div>
          <div className="ldMiniItem">• Checking questions on calls and in meetings</div>
        </div>
      </>
    );
  }

  if (step === "createProfile") {
    content = card(
      <>
        <div className="ldMascot">👤</div>
        <h2 className="ldTitle2">{t("landing.createProfileTitle")}</h2>
        <p className="ldDesc2">{t("landing.createProfileDesc")}</p>
        <div className="ldCreditsNotice">
          <span className="ldCreditsNoticeIcon" aria-hidden>💎</span>
          <span className="ldCreditsNoticeText">{t("landing.createProfileCreditsNotice")}</span>
        </div>

        <div className="ldHeroBtns">
          <button
            className="ldPrimary"
            onClick={() => {
              nav("/signup", {
                state: {
                  occupationCategory,
                  occupationJob,
                  why,
                  level: resolvedLevel ?? level,
                },
              });
            }}
          >
            {t("landing.createProfileBtn")}
          </button>
          <button
            className="ldGhost"
            onClick={async () => {
              const ok = await confirm(t("landing.leaveProfileRewardConfirm"));
              if (ok) finishAndGoHome();
            }}
          >
            {t("landing.maybeLater")}
          </button>
        </div>
      </>
    );
  }

  // Layout
  return (
    <div className="ldWrap">
      {topBar}
      <div className="ldBody">{content}</div>

      {/* welcome은 자체 버튼이 있어서 하단 CTA 숨김 */}
      {step !== "language" && step !== "welcome" && step !== "createProfile" && bottomCTA}

      {/* createProfile은 자체 버튼 */}
      {step === "createProfile" && <div className="ldBottomSpacer" />}
    </div>
  );
}
