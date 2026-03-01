// src/views/ProfileSettingsView.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDialog } from "../context/DialogContext";
import i18n, { SUPPORTED_LANGUAGES, type SupportedLocale, getInitialLocale } from "../i18n";

const FLAG_EXTENSIONS = ["png", "svg"];

const VOICE_SPEED_KEY = "ws_voice_speed";
const TARGET_LEVEL_KEY = "ws_target_level";
const PUSH_TIME_KEY = "ws_push_time";

const VOICE_SPEED_MIN = 0;
const VOICE_SPEED_MAX = 3;
const VOICE_SPEED_STEP = 0.2;
const VOICE_SPEED_DEFAULT = 1;

/** CEFR target levels with A1 added; option labels come from settings.targetLevelA1 etc. */
const TARGET_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const PUSH_TIME_DEFAULT = "09:00";

/** 0.2 단위로 맞추고 소수 오차 제거 (2.40000004 → 2.4) */
function clampSpeed(value: number): number {
  const step = VOICE_SPEED_STEP;
  const v = Math.round(value / step) * step;
  const clamped = Math.max(VOICE_SPEED_MIN, Math.min(VOICE_SPEED_MAX, v));
  return Math.round(clamped * 10) / 10;
}

/** 0.2 단위로만 표시, 소수 오차 제거 (예: 2.4×) */
function formatSpeedDisplay(speed: number): string {
  const clamped = clampSpeed(speed);
  const oneDecimal = Math.round(clamped * 10) / 10;
  const str = oneDecimal % 1 === 0 ? String(Math.round(oneDecimal)) : oneDecimal.toFixed(1);
  return str + "×";
}

export default function ProfileSettingsView() {
  const nav = useNavigate();
  const dialog = useDialog();
  const { t } = useTranslation();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [pushTime, setPushTime] = useState(PUSH_TIME_DEFAULT);
  const [profileVisible, setProfileVisible] = useState(true);

  const [voiceSpeed, setVoiceSpeed] = useState<number>(VOICE_SPEED_DEFAULT);
  const [targetLevel, setTargetLevel] = useState<string>("B2");
  const [langSelectOpen, setLangSelectOpen] = useState(false);
  const langSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(VOICE_SPEED_KEY);
      if (v !== null) {
        const n = clampSpeed(Number(v));
        if (!Number.isNaN(n)) setVoiceSpeed(n);
      }
      const l = localStorage.getItem(TARGET_LEVEL_KEY);
      if (l !== null && TARGET_LEVELS.includes(l as (typeof TARGET_LEVELS)[number])) setTargetLevel(l);
      const pt = localStorage.getItem(PUSH_TIME_KEY);
      if (pt !== null && /^\d{2}:\d{2}$/.test(pt)) setPushTime(pt);
    } catch (_) {}
  }, []);

  const persistVoiceSpeed = (value: number) => {
    const clamped = clampSpeed(value);
    setVoiceSpeed(clamped);
    try {
      localStorage.setItem(VOICE_SPEED_KEY, String(clamped));
    } catch (_) {}
  };

  const persistTargetLevel = (value: string) => {
    setTargetLevel(value);
    try {
      localStorage.setItem(TARGET_LEVEL_KEY, value);
    } catch (_) {}
  };

  const persistPushTime = (value: string) => {
    setPushTime(value);
    try {
      localStorage.setItem(PUSH_TIME_KEY, value);
    } catch (_) {}
  };

  const currentLang = SUPPORTED_LANGUAGES.some((x) => x.code === i18n.language)
    ? (i18n.language as SupportedLocale)
    : getInitialLocale();
  const setLanguage = (code: SupportedLocale) => {
    i18n.changeLanguage(code);
    setLangSelectOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langSelectRef.current && !langSelectRef.current.contains(e.target as Node)) {
        setLangSelectOpen(false);
      }
    };
    if (langSelectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [langSelectOpen]);

  const currentLangInfo = SUPPORTED_LANGUAGES.find((x) => x.code === currentLang) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className="pfWrap pfSettingsWrap">
      <header className="pfAccessHeader">
        <div className="pfAccessHeaderLeft">
          <button
            type="button"
            className="ws-link ws-linkSm"
            onClick={() => nav("/profile")}
          >
            ← {t("common.profile")}
          </button>
          <h1 className="pfTitle" style={{ marginBottom: 0 }}>
            {t("settings.title")}
          </h1>
        </div>
      </header>
      <p className="pfSettingsIntro">
        {t("settings.intro")}
      </p>

      <section className="pfSettingsCard">
        <h2 className="pfSettingsCardTitle">
          <span className="pfSettingsCardIcon" aria-hidden>🔔</span>
          {t("settings.notifications")}
        </h2>
        <p className="pfSettingsCardDesc">{t("settings.notifDesc")}</p>
        <div className="pfSettingList">
          <div className="pfSettingRow">
            <span className="pfSettingLabel">{t("settings.emailNotif")}</span>
            <button
              type="button"
              className={"pfToggle " + (emailNotifs ? "pfToggleOn" : "")}
              onClick={() => setEmailNotifs((v) => !v)}
              aria-pressed={emailNotifs}
            >
              <span className="pfToggleThumb" />
            </button>
          </div>
          <div className="pfSettingRow pfSettingRow--pushGroup">
            <span className="pfSettingLabel">{t("settings.pushNotif")}</span>
            <button
              type="button"
              className={"pfToggle " + (pushNotifs ? "pfToggleOn" : "")}
              onClick={() => setPushNotifs((v) => !v)}
              aria-pressed={pushNotifs}
            >
              <span className="pfToggleThumb" />
            </button>
          </div>
          {pushNotifs && (
            <div className="pfPushSub">
              <span className="pfSettingLabel">{t("settings.pushNotifTime")}</span>
              <p className="pfSettingHint">{t("settings.pushNotifTimeDesc")}</p>
              <input
                type="time"
                className="pfSettingTimeInput"
                value={pushTime}
                onChange={(e) => persistPushTime(e.target.value)}
                aria-label={t("settings.pushNotifTime")}
              />
            </div>
          )}
        </div>
      </section>

      <section className="pfSettingsCard">
        <h2 className="pfSettingsCardTitle">
          <span className="pfSettingsCardIcon" aria-hidden>🌐</span>
          {t("settings.language")}
        </h2>
        <p className="pfSettingsCardDesc">{t("settings.appLanguage")}</p>
        <div className="pfSettingList">
          <div className="pfSettingRow">
            <span className="pfSettingLabel">{t("settings.appLanguageLabel")}</span>
            <div className="pfLangSelectWrap" ref={langSelectRef}>
              <button
                type="button"
                className="pfLangSelectBtn"
                onClick={() => setLangSelectOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={langSelectOpen}
                aria-label={t("settings.appLanguageLabel")}
              >
                <span className="pfLangSelectFlagWrap">
                  <img
                    src={`/flags/${currentLangInfo.code}.png`}
                    alt=""
                    className="pfLangSelectFlagImg"
                    data-try="png"
                    onError={(e) => {
                      const img = e.currentTarget;
                      const tryOrder = FLAG_EXTENSIONS;
                      const idx = tryOrder.indexOf(img.dataset.try || "png");
                      const next = tryOrder[idx + 1];
                      if (next) {
                        img.dataset.try = next;
                        img.src = `/flags/${currentLangInfo.code}.${next}`;
                      } else {
                        img.style.display = "none";
                        const fallback = img.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "inline-block";
                      }
                    }}
                  />
                  <span className="pfLangSelectFlagEmoji" aria-hidden style={{ display: "none" }}>{currentLangInfo.flag}</span>
                </span>
                <span className="pfLangSelectLabel">{currentLangInfo.label}</span>
                <span className="pfLangSelectChevron" aria-hidden>{langSelectOpen ? "▲" : "▼"}</span>
              </button>
              {langSelectOpen && (
                <ul className="pfLangSelectDropdown" role="listbox" aria-label={t("settings.appLanguageLabel")}>
                  {SUPPORTED_LANGUAGES.map(({ code, label, flag }) => (
                    <li key={code} role="option" aria-selected={currentLang === code}>
                      <button
                        type="button"
                        className={"pfLangSelectOption " + (currentLang === code ? "pfLangSelectOptionActive" : "")}
                        onClick={() => setLanguage(code)}
                      >
                        <span className="pfLangSelectFlagWrap">
                          <img
                            src={`/flags/${code}.png`}
                            alt=""
                            className="pfLangSelectFlagImg"
                            data-try="png"
                            onError={(e) => {
                              const img = e.currentTarget;
                              const tryOrder = FLAG_EXTENSIONS;
                              const idx = tryOrder.indexOf(img.dataset.try || "png");
                              const next = tryOrder[idx + 1];
                              if (next) {
                                img.dataset.try = next;
                                img.src = `/flags/${code}.${next}`;
                              } else {
                                img.style.display = "none";
                                const fallback = img.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = "inline-block";
                              }
                            }}
                          />
                          <span className="pfLangSelectFlagEmoji" aria-hidden style={{ display: "none" }}>{flag}</span>
                        </span>
                        <span className="pfLangSelectLabel">{label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pfSettingsCard">
        <h2 className="pfSettingsCardTitle">
          <span className="pfSettingsCardIcon" aria-hidden>🔊</span>
          {t("settings.voiceSpeed")}
        </h2>
        <p className="pfSettingsCardDesc">{t("settings.voiceSpeedDesc")}</p>
        <div className="pfSettingList">
          <div className="pfSettingRow pfSettingRow--slider">
            <span className="pfSettingLabel">{t("settings.voiceSpeed")}</span>
            <div className="pfSpeedSliderBlock">
              <div className="pfSpeedSliderTrackWrap">
                <input
                  type="range"
                  className="pfSpeedSlider"
                  min={VOICE_SPEED_MIN}
                  max={VOICE_SPEED_MAX}
                  step={VOICE_SPEED_STEP}
                  value={voiceSpeed}
                  onChange={(e) => persistVoiceSpeed(clampSpeed(Number(e.target.value)))}
                  aria-valuemin={VOICE_SPEED_MIN}
                  aria-valuemax={VOICE_SPEED_MAX}
                  aria-valuenow={voiceSpeed}
                  aria-valuetext={formatSpeedDisplay(voiceSpeed)}
                  aria-label={t("settings.voiceSpeed")}
                />
                <div className="pfSpeedTickMarks" aria-hidden>
                  <span className="pfSpeedTick" style={{ left: "0%" }} />
                  <span className="pfSpeedTick" style={{ left: "33.33%" }} />
                  <span className="pfSpeedTick" style={{ left: "66.66%" }} />
                  <span className="pfSpeedTick" style={{ left: "100%" }} />
                </div>
              </div>
              <span className="pfSpeedValue" aria-hidden>{formatSpeedDisplay(voiceSpeed)}</span>
              <div className="pfSpeedTicks" aria-hidden>
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pfSettingsCard">
        <h2 className="pfSettingsCardTitle">
          <span className="pfSettingsCardIcon" aria-hidden>🎯</span>
          {t("settings.targetLevel")}
        </h2>
        <p className="pfSettingsCardDesc">{t("settings.targetLevelDesc")}</p>
        <div className="pfSettingList">
          <div className="pfSettingRow">
            <span className="pfSettingLabel">{t("settings.targetLevel")}</span>
            <select
              className="pfSelect"
              value={targetLevel}
              onChange={(e) => persistTargetLevel(e.target.value)}
              aria-label={t("settings.targetLevel")}
            >
              {TARGET_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {t(`settings.targetLevel${l}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="pfSettingsCard">
        <h2 className="pfSettingsCardTitle">
          <span className="pfSettingsCardIcon" aria-hidden>🔒</span>
          {t("settings.privacy")}
        </h2>
        <p className="pfSettingsCardDesc">{t("settings.privacyDesc")}</p>
        <div className="pfSettingList">
          <div className="pfSettingRow">
            <span className="pfSettingLabel">{t("settings.profileVisible")}</span>
            <button
              type="button"
              className={"pfToggle " + (profileVisible ? "pfToggleOn" : "")}
              onClick={() => setProfileVisible((v) => !v)}
              aria-pressed={profileVisible}
            >
              <span className="pfToggleThumb" />
            </button>
          </div>
        </div>
      </section>

      <div className="pfSettingsAccountActions">
        <button
          type="button"
          className="pfBtn pfBtnGhost pfSettingsAccountBtn"
          onClick={async () => {
            const ok = await dialog.confirm(t("dialog.confirmLogout"));
            if (ok) nav("/");
          }}
        >
          {t("settings.logout")}
        </button>
        <button
          type="button"
          className="pfBtn pfBtnGhost pfSettingsAccountBtn"
          onClick={async () => {
            const ok = await dialog.confirm(t("dialog.confirmDeleteMessage"), { destructive: true });
            if (ok) window.location.href = "/";
          }}
        >
          {t("settings.deleteAccount")}
        </button>
      </div>
    </div>
  );
}
