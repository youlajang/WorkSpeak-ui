import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/landing.css";

const MOCK_EMAIL = "user@example.com";
const MOCK_PASSWORD = "password123";

export default function LoginView() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError(t("login.error"));
      return;
    }
    if (email.trim() === MOCK_EMAIL && password === MOCK_PASSWORD) {
      localStorage.setItem("ws_logged_in", "1");
      localStorage.setItem("ws_onboarding_done", "1");
      nav("/home", { replace: true });
    } else {
      setError(t("login.error"));
    }
  }

  return (
    <div className="ldWrap">
      <div className="ldTop">
        <button type="button" className="ldIconBtn" onClick={() => nav(-1)} aria-label={t("common.back")}>
          ←
        </button>
        <div style={{ flex: 1 }} />
      </div>
      <div className="ldBody">
        <div className="ldStage">
          <div className="ldCard">
            <div className="ldBrand">WorkSpeak</div>
            <h1 className="ldTitle2">{t("login.title")}</h1>
            <form className="pfForm" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <label className="pfFormLabel">
                <span className="pfSettingLabel">{t("login.email")}</span>
                <input
                  type="email"
                  className="pfInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label className="pfFormLabel" style={{ marginTop: 16 }}>
                <span className="pfSettingLabel">{t("login.password")}</span>
                <input
                  type="password"
                  className="pfInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>
              {error && (
                <p className="pfFormError" style={{ marginTop: 12 }} role="alert">{error}</p>
              )}
              <button type="submit" className="ldPrimary" style={{ marginTop: 24, width: "100%" }}>
                {t("login.submit")}
              </button>
            </form>
            <div className="loginDemoAccount" style={{ marginTop: 20 }}>
              <p className="loginDemoAccountLabel">{t("login.demoAccountHint")}</p>
              <p className="loginDemoAccountCreds">
                {MOCK_EMAIL} / {MOCK_PASSWORD}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
