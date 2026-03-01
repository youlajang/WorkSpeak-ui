// src/views/ProfileAccountView.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkNicknameAvailable, checkEmailAvailable, isValidEmail } from "../utils/validation";

type AccountLocationState = { displayName?: string; email?: string };

const DEBOUNCE_MS = 350;
const DISPLAY_NAME_KEY = "ws_display_name";

function getStoredDisplayName(): string {
  if (typeof window === "undefined") return "YOU";
  return localStorage.getItem(DISPLAY_NAME_KEY) || "YOU";
}

export default function ProfileAccountView() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as AccountLocationState;

  const [displayName, setDisplayName] = useState(state.displayName ?? getStoredDisplayName());
  const [email, setEmail] = useState(state.email ?? "you@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameSuccess, setNicknameSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [currentPasswordMsg, setCurrentPasswordMsg] = useState<"" | "incorrect" | "correct">("");
  const [confirmMatchMsg, setConfirmMatchMsg] = useState<"" | "match" | "mismatch">("");

  const MOCK_CURRENT_PASSWORD = "password123";
  const nicknameCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function goBackToProfile() {
    nav("/profile", { state: { displayName } });
  }

  // 닉네임: 타이핑하는 즉시(디바운스 후) 중복 여부 표시
  useEffect(() => {
    if (nicknameCheckRef.current) clearTimeout(nicknameCheckRef.current);
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNicknameError("");
      setNicknameSuccess("");
      return;
    }
    nicknameCheckRef.current = setTimeout(async () => {
      nicknameCheckRef.current = null;
      const current = state.displayName ?? getStoredDisplayName();
      const available = await checkNicknameAvailable(trimmed, current);
      if (available) {
        setNicknameError("");
        setNicknameSuccess("This nickname is available.");
      } else {
        setNicknameSuccess("");
        setNicknameError("This nickname is already taken.");
      }
    }, DEBOUNCE_MS);
    return () => {
      if (nicknameCheckRef.current) clearTimeout(nicknameCheckRef.current);
    };
  }, [displayName, state.displayName]);

  async function handleSaveDisplayName(e: React.FormEvent) {
    e.preventDefault();
    setNicknameError("");
    setNicknameSuccess("");
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNicknameError("Please enter a nickname.");
      return;
    }
    const current = state.displayName ?? getStoredDisplayName();
    const available = await checkNicknameAvailable(trimmed, current);
    if (!available) {
      setNicknameError("This nickname is already taken.");
      return;
    }
    setDisplayName(trimmed);
    if (typeof window !== "undefined") localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // 이메일: 타이핑하는 즉시(디바운스 후) 형식·중복 여부 표시
  useEffect(() => {
    if (emailCheckRef.current) clearTimeout(emailCheckRef.current);
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("");
      setEmailSuccess("");
      return;
    }
    emailCheckRef.current = setTimeout(async () => {
      emailCheckRef.current = null;
      if (!isValidEmail(trimmed)) {
        setEmailSuccess("");
        setEmailError("Please enter a valid email address.");
        return;
      }
      const current = state.email ?? "you@example.com";
      const available = await checkEmailAvailable(trimmed, current);
      if (available) {
        setEmailError("");
        setEmailSuccess("This email is available.");
      } else {
        setEmailSuccess("");
        setEmailError("This email is already in use.");
      }
    }, DEBOUNCE_MS);
    return () => {
      if (emailCheckRef.current) clearTimeout(emailCheckRef.current);
    };
  }, [email, state.email]);

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Please enter an email address.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    const current = state.email ?? "you@example.com";
    const available = await checkEmailAvailable(trimmed, current);
    if (!available) {
      setEmailError("This email is already in use.");
      return;
    }
    setEmail(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // 현재 비밀번호: 타이핑하는 즉시 일치 여부 표시
  useEffect(() => {
    if (!currentPassword) {
      setCurrentPasswordMsg("");
      return;
    }
    setCurrentPasswordMsg(currentPassword === MOCK_CURRENT_PASSWORD ? "correct" : "incorrect");
  }, [currentPassword]);

  useEffect(() => {
    if (!newPassword && !confirmPassword) {
      setConfirmMatchMsg("");
      return;
    }
    if (newPassword && confirmPassword) {
      setConfirmMatchMsg(newPassword === confirmPassword ? "match" : "mismatch");
    } else {
      setConfirmMatchMsg("");
    }
  }, [newPassword, confirmPassword]);

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPasswordMsg("");
    setConfirmMatchMsg("");
    if (currentPassword !== MOCK_CURRENT_PASSWORD) {
      setCurrentPasswordMsg("incorrect");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmMatchMsg("mismatch");
      return;
    }
    setSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="pfWrap pfSettingsWrap">
      <header className="pfAccessHeader">
        <div className="pfAccessHeaderLeft">
          <button
            type="button"
            className="ws-link ws-linkSm"
            onClick={goBackToProfile}
          >
            ← Profile
          </button>
          <h1 className="pfTitle" style={{ marginBottom: 0 }}>
            My Account
          </h1>
        </div>
      </header>
      <div className="pfSub" style={{ marginTop: 4, marginBottom: 18 }}>
        Edit your display name, email, and password.
      </div>

      <section className="pfPanel">
        <div className="pfPanelTitle">Display name</div>
        <form className="pfForm" onSubmit={handleSaveDisplayName}>
          <label className="pfFormLabel">
            <span className="pfSettingLabel">Nickname</span>
            <input
              type="text"
              className={"pfInput" + (nicknameError ? " pfInputError" : "")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={24}
              aria-invalid={!!nicknameError}
              aria-describedby={nicknameError || nicknameSuccess ? "nickname-msg" : undefined}
            />
            {nicknameError && (
              <span id="nickname-msg" className="pfFormError" role="alert">
                {nicknameError}
              </span>
            )}
            {nicknameSuccess && !nicknameError && (
              <span id="nickname-msg" className="pfFormSuccess" role="status">
                {nicknameSuccess}
              </span>
            )}
          </label>
          <button type="submit" className="pfBtn pfBtnPrimary">
            Save display name
          </button>
        </form>
      </section>

      <section className="pfPanel">
        <div className="pfPanelTitle">Email</div>
        <form className="pfForm" onSubmit={handleSaveEmail}>
          <label className="pfFormLabel">
            <span className="pfSettingLabel">Email address</span>
            <input
              type="email"
              className={"pfInput" + (emailError ? " pfInputError" : "")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
              aria-describedby={emailError || emailSuccess ? "email-msg" : undefined}
            />
            {emailError && (
              <span id="email-msg" className="pfFormError" role="alert">
                {emailError}
              </span>
            )}
            {emailSuccess && !emailError && (
              <span id="email-msg" className="pfFormSuccess" role="status">
                {emailSuccess}
              </span>
            )}
          </label>
          <button type="submit" className="pfBtn pfBtnPrimary">
            Save email
          </button>
        </form>
      </section>

      <section className="pfPanel">
        <div className="pfPanelTitle">Change password</div>
        <form className="pfForm" onSubmit={handleChangePassword}>
          <label className="pfFormLabel">
            <span className="pfSettingLabel">Current password</span>
            <input
              type="password"
              className={"pfInput" + (currentPasswordMsg === "incorrect" ? " pfInputError" : "")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-describedby={currentPasswordMsg ? "current-pw-msg" : undefined}
            />
            {currentPasswordMsg === "incorrect" && (
              <span id="current-pw-msg" className="pfFormError" role="alert">
                Current password is incorrect.
              </span>
            )}
            {currentPasswordMsg === "correct" && (
              <span id="current-pw-msg" className="pfFormSuccess" role="status">
                Current password is correct.
              </span>
            )}
          </label>
          <label className="pfFormLabel">
            <span className="pfSettingLabel">New password</span>
            <input
              type="password"
              className="pfInput"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>
          <label className="pfFormLabel">
            <span className="pfSettingLabel">Confirm new password</span>
            <input
              type="password"
              className={"pfInput" + (confirmMatchMsg === "mismatch" ? " pfInputError" : "")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-describedby={confirmMatchMsg ? "confirm-pw-msg" : undefined}
            />
            {confirmMatchMsg === "mismatch" && (
              <span id="confirm-pw-msg" className="pfFormError" role="alert">
                Passwords do not match.
              </span>
            )}
            {confirmMatchMsg === "match" && (
              <span id="confirm-pw-msg" className="pfFormSuccess" role="status">
                Passwords match.
              </span>
            )}
          </label>
          <button type="submit" className="pfBtn pfBtnPrimary">
            Update password
          </button>
        </form>
      </section>

      {saved && (
        <div className="pfToast" role="status">
          Saved.
        </div>
      )}
    </div>
  );
}
