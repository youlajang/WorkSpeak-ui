import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isValidEmail, checkNicknameAvailable, checkEmailAvailable } from "../utils/validation";
import { AVATAR_URL_KEY, AVATAR_CHANGED_EVENT } from "../constants/avatars";
import "../styles/landing.css";

const CROP_CONTAINER_SIZE = 400;
const CROP_CIRCLE_SIZE = 200;
const CROP_OUTPUT_SIZE = 200;

type SignupLocationState = {
  occupationCategory?: string;
  occupationJob?: string;
  why?: string[];
  level?: string;
  fromProfile?: boolean;
};

type NicknameStatus = "idle" | "checking" | "available" | "duplicate";
type EmailStatus = "idle" | "checking" | "invalid" | "duplicate" | "available";
type PasswordMatchStatus = "idle" | "match" | "mismatch";

const DEBOUNCE_MS = 400;

export default function SignupView() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();
  const onboardingState = (location.state ?? {}) as SignupLocationState;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [passwordMatchStatus, setPasswordMatchStatus] = useState<PasswordMatchStatus>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropState, setCropState] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const cropImageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const trimmedNickname = nickname.trim();
  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);

  const checkNickname = useCallback(() => {
    if (!trimmedNickname) {
      setNicknameStatus("idle");
      return;
    }
    setNicknameStatus("checking");
    checkNicknameAvailable(trimmedNickname, "")
      .then((ok) => setNicknameStatus(ok ? "available" : "duplicate"))
      .catch(() => setNicknameStatus("idle"));
  }, [trimmedNickname]);

  const checkEmail = useCallback(() => {
    if (!trimmedEmail) {
      setEmailStatus("idle");
      return;
    }
    if (!emailValid) {
      setEmailStatus("invalid");
      return;
    }
    setEmailStatus("checking");
    checkEmailAvailable(trimmedEmail, "")
      .then((ok) => setEmailStatus(ok ? "available" : "duplicate"))
      .catch(() => setEmailStatus("idle"));
  }, [trimmedEmail, emailValid]);

  useEffect(() => {
    const t1 = window.setTimeout(checkNickname, DEBOUNCE_MS);
    return () => clearTimeout(t1);
  }, [checkNickname]);

  useEffect(() => {
    const t2 = window.setTimeout(checkEmail, DEBOUNCE_MS);
    return () => clearTimeout(t2);
  }, [checkEmail]);

  useEffect(() => {
    if (!confirmPassword) {
      setPasswordMatchStatus("idle");
      return;
    }
    setPasswordMatchStatus(password === confirmPassword ? "match" : "mismatch");
  }, [password, confirmPassword]);

  const canSubmit =
    nicknameStatus === "available" &&
    emailStatus === "available" &&
    password.length >= 6 &&
    passwordMatchStatus === "match";

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCropImageSrc(dataUrl);
      setCropModalOpen(true);
      setCropState({ x: 0, y: 0, scale: 1 });
      setImageSize({ width: 0, height: 0 });
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        const imgAspect = img.width / img.height;
        let displayWidth = CROP_CONTAINER_SIZE;
        let displayHeight = CROP_CONTAINER_SIZE / imgAspect;
        if (displayHeight > CROP_CONTAINER_SIZE) {
          displayHeight = CROP_CONTAINER_SIZE;
          displayWidth = CROP_CONTAINER_SIZE * imgAspect;
        }
        const minScale = (CROP_CIRCLE_SIZE * 1.1) / Math.min(displayWidth, displayHeight);
        const initialScale = Math.max(1, minScale);
        setCropState({ x: 0, y: 0, scale: initialScale });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleCropMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropState.x, y: e.clientY - cropState.y });
  }

  function handleCropMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setCropState((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  }

  function handleCropMouseUp() {
    setIsDragging(false);
  }

  function handleCropWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setCropState((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale * delta)),
    }));
  }

  function applyCrop() {
    if (!cropImageSrc || !cropImageRef.current || !imageSize.width) return;
    const img = cropImageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = CROP_OUTPUT_SIZE;
    canvas.height = CROP_OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cropCenter = CROP_CONTAINER_SIZE / 2;
    const imgNaturalWidth = imageSize.width;
    const imgNaturalHeight = imageSize.height;
    const imgAspect = imgNaturalWidth / imgNaturalHeight;
    let displayWidth = CROP_CONTAINER_SIZE;
    let displayHeight = CROP_CONTAINER_SIZE / imgAspect;
    if (displayHeight > CROP_CONTAINER_SIZE) {
      displayHeight = CROP_CONTAINER_SIZE;
      displayWidth = CROP_CONTAINER_SIZE * imgAspect;
    }
    const scaledWidth = displayWidth * cropState.scale;
    const scaledHeight = displayHeight * cropState.scale;
    const imgCenterX = cropCenter + cropState.x;
    const imgCenterY = cropCenter + cropState.y;
    const imgLeft = imgCenterX - scaledWidth / 2;
    const imgTop = imgCenterY - scaledHeight / 2;
    const cropXRatio = (cropCenter - imgLeft) / scaledWidth;
    const cropYRatio = (cropCenter - imgTop) / scaledHeight;
    const cropRadiusInImage = (CROP_CIRCLE_SIZE / 2 / scaledWidth) * imgNaturalWidth;
    const sourceX = Math.max(0, Math.min(imgNaturalWidth - cropRadiusInImage * 2, cropXRatio * imgNaturalWidth - cropRadiusInImage));
    const sourceY = Math.max(0, Math.min(imgNaturalHeight - cropRadiusInImage * 2, cropYRatio * imgNaturalHeight - cropRadiusInImage));
    const sourceSize = cropRadiusInImage * 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(CROP_OUTPUT_SIZE / 2, CROP_OUTPUT_SIZE / 2, CROP_OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      Math.min(sourceSize, imgNaturalWidth - sourceX),
      Math.min(sourceSize, imgNaturalHeight - sourceY),
      0,
      0,
      CROP_OUTPUT_SIZE,
      CROP_OUTPUT_SIZE
    );
    ctx.restore();
    setPhotoUrl(canvas.toDataURL("image/png"));
    setCropModalOpen(false);
    setCropImageSrc(null);
    setCropState({ x: 0, y: 0, scale: 1 });
    setImageSize({ width: 0, height: 0 });
  }

  function cancelCrop() {
    setCropModalOpen(false);
    setCropImageSrc(null);
    setCropState({ x: 0, y: 0, scale: 1 });
    setImageSize({ width: 0, height: 0 });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    localStorage.setItem("ws_logged_in", "1");
    localStorage.setItem("ws_onboarding_done", "1");
    if (photoUrl) {
      localStorage.setItem(AVATAR_URL_KEY, photoUrl);
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT));
    }
    localStorage.setItem("ws_display_name", trimmedNickname);
    if (onboardingState.occupationCategory) localStorage.setItem("ws_occupation_category", onboardingState.occupationCategory);
    if (onboardingState.occupationJob) localStorage.setItem("ws_occupation_job", onboardingState.occupationJob);
    if (onboardingState.level) localStorage.setItem("ws_placement_level", onboardingState.level);
    try {
      const storeRaw = localStorage.getItem("ws-store");
      const store = storeRaw ? (JSON.parse(storeRaw) as { points?: number; ownedItemIds?: string[]; equippedAvatar?: unknown; equippedRoom?: unknown }) : null;
      const currentPoints = typeof store?.points === "number" ? store.points : 2000;
      const bonusCredits = onboardingState.fromProfile ? 0 : 100;
      localStorage.setItem(
        "ws-store",
        JSON.stringify({
          points: currentPoints + bonusCredits,
          ownedItemIds: store?.ownedItemIds ?? [],
          equippedAvatar: store?.equippedAvatar ?? {},
          equippedRoom: store?.equippedRoom ?? {},
        })
      );
    } catch (_) {
      const points = onboardingState.fromProfile ? 2000 : 2100;
      localStorage.setItem("ws-store", JSON.stringify({ points, ownedItemIds: [], equippedAvatar: {}, equippedRoom: {} }));
    }
    nav("/home", { replace: true });
  }

  return (
    <div className="ldWrap">
      <div className="ldTop">
        <button
          type="button"
          className="ldIconBtn"
          onClick={() => nav(-1)}
          aria-label={t("common.back")}
        >
          ←
        </button>
        <div style={{ flex: 1 }} />
      </div>
      <div className="ldBody">
        <div className="ldStage">
          <div className="ldCard">
            <div className="ldBrand">WorkSpeak</div>
            <h1 className="ldTitle2">{t("signup.title")}</h1>
            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <div className="pfFormLabel">
                <span className="pfSettingLabel">{t("signup.photo")} ({t("signup.photoOptional")})</span>
                <div
                  className="pfPhotoUploadCard"
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
                  aria-label={t("signup.addPhoto")}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="pfPhotoUploadCardImg" />
                  ) : (
                    <>
                      <span className="pfPhotoUploadCardIcon" aria-hidden>📷</span>
                      <span className="pfPhotoUploadCardLabel">{t("signup.addPhoto")}</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="pfFileInputHidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
              <label className="pfFormLabel" style={{ marginTop: 16 }}>
                <span className="pfSettingLabel">{t("signup.nickname")} *</span>
                <input
                  type="text"
                  className={"pfInput" + (nicknameStatus === "duplicate" ? " pfInputError" : "")}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t("signup.placeholderNickname")}
                  maxLength={24}
                />
                <div style={{ marginTop: 6 }} role="alert">
                  {nicknameStatus === "checking" && <span className="pfFormError">{t("signup.checking")}</span>}
                  {nicknameStatus === "duplicate" && <span className="pfFormError">{t("signup.nicknameDuplicate")}</span>}
                  {nicknameStatus === "available" && <span className="pfFormSuccess">{t("signup.nicknameAvailable")}</span>}
                </div>
              </label>
              <label className="pfFormLabel" style={{ marginTop: 16 }}>
                <span className="pfSettingLabel">{t("signup.email")} *</span>
                <input
                  type="email"
                  className={"pfInput" + (emailStatus === "invalid" || emailStatus === "duplicate" ? " pfInputError" : "")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("signup.placeholderEmail")}
                />
                <div style={{ marginTop: 6 }} role="alert">
                  {emailStatus === "checking" && <span className="pfFormError">{t("signup.checking")}</span>}
                  {emailStatus === "invalid" && <span className="pfFormError">{t("signup.emailInvalid")}</span>}
                  {emailStatus === "duplicate" && <span className="pfFormError">{t("signup.emailDuplicate")}</span>}
                  {emailStatus === "available" && <span className="pfFormSuccess">{t("signup.emailAvailable")}</span>}
                </div>
              </label>
              <label className="pfFormLabel" style={{ marginTop: 16 }}>
                <span className="pfSettingLabel">{t("signup.password")} *</span>
                <input
                  type="password"
                  className="pfInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("signup.placeholderPassword")}
                  minLength={6}
                />
              </label>
              <label className="pfFormLabel" style={{ marginTop: 16 }}>
                <span className="pfSettingLabel">{t("signup.confirmPassword")} *</span>
                <input
                  type="password"
                  className={"pfInput" + (passwordMatchStatus === "mismatch" ? " pfInputError" : "")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("signup.placeholderConfirmPassword")}
                />
                <div style={{ marginTop: 6 }} role="alert">
                  {passwordMatchStatus === "mismatch" && <span className="pfFormError">{t("signup.passwordMismatch")}</span>}
                  {passwordMatchStatus === "match" && <span className="pfFormSuccess">{t("signup.passwordMatch")}</span>}
                </div>
              </label>
              {error && (
                <p className="pfFormError" style={{ marginTop: 12 }} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="ldPrimary" style={{ marginTop: 24, width: "100%" }} disabled={!canSubmit}>
                {t("signup.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {cropModalOpen && cropImageSrc && (
        <div className="pfModalOverlay" onClick={cancelCrop}>
          <div className="pfModal pfModalLarge" onClick={(e) => e.stopPropagation()}>
            <div className="pfModalTitle">{t("signup.cropTitle")}</div>
            <div className="pfCropArea" ref={cropContainerRef}>
              <div
                className="pfCropImageContainer"
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
                onWheel={handleCropWheel}
              >
                <img
                  ref={cropImageRef}
                  src={cropImageSrc}
                  alt=""
                  className="pfCropImage"
                  style={{
                    transform: `translate(calc(-50% + ${cropState.x}px), calc(-50% + ${cropState.y}px)) scale(${cropState.scale})`,
                  }}
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
                  }}
                />
                <div className="pfCropCircle" />
              </div>
            </div>
            <div className="pfCropHint">{t("signup.cropHint")}</div>
            <div className="pfModalActions">
              <button type="button" className="pfBtn pfBtnGhost" onClick={cancelCrop}>
                {t("common.cancel")}
              </button>
              <button type="button" className="pfBtn pfBtnPrimary" onClick={applyCrop}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
