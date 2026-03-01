// src/views/ProfileView.tsx
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStoredUserLevel } from "../utils/level";
import {
  AVATARS,
  AVATAR_URL_KEY,
  AVATAR_CAT_ID_KEY,
  AVATAR_CHANGED_EVENT,
} from "../constants/avatars";
import "../styles/landing.css";

const LOGGED_IN_KEY = "ws_logged_in";
const DISPLAY_NAME_KEY = "ws_display_name";

export default function ProfileView() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();

  const loggedIn = typeof window !== "undefined" && localStorage.getItem(LOGGED_IN_KEY) === "1";

  const [displayName, setDisplayName] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(LOGGED_IN_KEY) === "1"
      ? (localStorage.getItem(DISPLAY_NAME_KEY) || "YOU")
      : ""
  );
  const [email] = useState("you@example.com");

  useEffect(() => {
    const state = location.state as { displayName?: string } | undefined;
    if (state?.displayName) setDisplayName(state.displayName);
  }, [location.state]);

  useEffect(() => {
    if (loggedIn) {
      const savedName = typeof window !== "undefined" ? localStorage.getItem(DISPLAY_NAME_KEY) : null;
      if (savedName) setDisplayName(savedName);
    } else {
      setDisplayName("");
    }
  }, [loggedIn]);

  const streakDays = loggedIn ? 12 : 0;
  const credits = loggedIn ? 1250 : 0;
  const xp = loggedIn ? 8420 : 0;
  const level = loggedIn ? getStoredUserLevel() : 0;
  const stage = loggedIn ? 2 : 0;
  const unit = loggedIn ? 1 : 0;

  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    if (typeof window === "undefined") return AVATARS.find((a) => a.isDefault)?.id ?? AVATARS[0].id;
    const saved = localStorage.getItem(AVATAR_CAT_ID_KEY);
    if (saved && AVATARS.some((a) => a.id === saved)) return saved;
    return AVATARS.find((a) => a.isDefault)?.id ?? AVATARS[0].id;
  });
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(() =>
    typeof window !== "undefined" && localStorage.getItem(LOGGED_IN_KEY) === "1"
      ? localStorage.getItem(AVATAR_URL_KEY)
      : null
  );

  useEffect(() => {
    if (loggedIn) {
      const savedAvatar = typeof window !== "undefined" ? localStorage.getItem(AVATAR_URL_KEY) : null;
      setCustomPhotoUrl(savedAvatar);
    } else {
      setCustomPhotoUrl(null);
    }
  }, [loggedIn]);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarDraftId, setAvatarDraftId] = useState(selectedAvatarId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropState, setCropState] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const selectedAvatar = useMemo(
    () => AVATARS.find((a) => a.id === selectedAvatarId) ?? AVATARS[0],
    [selectedAvatarId]
  );

  function openAvatarModal() {
    setAvatarDraftId(selectedAvatarId);
    setCropMode(false);
    setCropImageSrc(null);
    setCropState({ x: 0, y: 0, scale: 1 });
    setImageSize({ width: 0, height: 0 });
    setAvatarModalOpen(true);
  }

  function saveAvatar() {
    setSelectedAvatarId(avatarDraftId);
    if (typeof window !== "undefined") {
      localStorage.setItem(AVATAR_CAT_ID_KEY, avatarDraftId);
      window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT));
    }
    setAvatarModalOpen(false);
  }

  function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCropImageSrc(dataUrl);
      setCropMode(true);
      // 이미지가 로드되면 초기 스케일 계산
      const img = new Image();
      img.onload = () => {
        const containerSize = 400;
        const cropSize = 200;
        setImageSize({ width: img.width, height: img.height });
        
        // Display size when image is shown in 400px container with object-fit: contain
        const imgAspect = img.width / img.height;
        let displayWidth = containerSize;
        let displayHeight = containerSize / imgAspect;
        
        if (displayHeight > containerSize) {
          displayHeight = containerSize;
          displayWidth = containerSize * imgAspect;
        }
        
        // 크롭 원(200px)이 표시된 이미지보다 작으면 이미지를 확대
        const minScale = (cropSize * 1.1) / Math.min(displayWidth, displayHeight);
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
    setCropState({
      ...cropState,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handleCropMouseUp() {
    setIsDragging(false);
  }

  function handleCropWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setCropState({
      ...cropState,
      scale: Math.max(0.5, Math.min(3, cropState.scale * delta)),
    });
  }

  function applyCrop() {
    if (!cropImageSrc || !cropImageRef.current || !imageSize.width) return;

    const img = cropImageRef.current;
    const canvas = document.createElement("canvas");
    const outputSize = 200;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerSize = 400;
    const cropSize = 200;
    const cropCenter = containerSize / 2;
    
    const imgNaturalWidth = imageSize.width;
    const imgNaturalHeight = imageSize.height;
    const imgAspect = imgNaturalWidth / imgNaturalHeight;
    
    // 이미지가 400px 컨테이너에 object-fit: contain으로 표시되는 실제 크기
    let displayWidth = containerSize;
    let displayHeight = containerSize / imgAspect;
    
    if (displayHeight > containerSize) {
      displayHeight = containerSize;
      displayWidth = containerSize * imgAspect;
    }
    
    // 스케일 적용된 표시 크기
    const scaledWidth = displayWidth * cropState.scale;
    const scaledHeight = displayHeight * cropState.scale;
    
    // 이미지 중심의 컨테이너 좌표 (cropState.x, y는 컨테이너 중앙(200,200) 기준)
    const imgCenterX = cropCenter + cropState.x;
    const imgCenterY = cropCenter + cropState.y;
    
    // 이미지의 왼쪽 상단 모서리 위치
    const imgLeft = imgCenterX - scaledWidth / 2;
    const imgTop = imgCenterY - scaledHeight / 2;
    
    // crop circle center as ratio within image (0–1)
    const cropXRatio = (cropCenter - imgLeft) / scaledWidth;
    const cropYRatio = (cropCenter - imgTop) / scaledHeight;
    
    // 원본 이미지에서 크롭할 영역 계산
    const cropRadiusInImage = (cropSize / 2) / scaledWidth * imgNaturalWidth;
    const sourceX = Math.max(0, Math.min(imgNaturalWidth - cropRadiusInImage * 2, (cropXRatio * imgNaturalWidth) - cropRadiusInImage));
    const sourceY = Math.max(0, Math.min(imgNaturalHeight - cropRadiusInImage * 2, (cropYRatio * imgNaturalHeight) - cropRadiusInImage));
    const sourceSize = cropRadiusInImage * 2;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();
    
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      Math.min(sourceSize, imgNaturalWidth - sourceX),
      Math.min(sourceSize, imgNaturalHeight - sourceY),
      0,
      0,
      outputSize,
      outputSize
    );
    
    ctx.restore();

    const croppedUrl = canvas.toDataURL("image/png");
    setCustomPhotoUrl(croppedUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem(AVATAR_URL_KEY, croppedUrl);
      window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT));
    }
    setCropMode(false);
    setCropImageSrc(null);
    setCropState({ x: 0, y: 0, scale: 1 });
    setImageSize({ width: 0, height: 0 });
    setAvatarModalOpen(false);
  }

  function cancelCrop() {
    setCropMode(false);
    setCropImageSrc(null);
    setCropState({ x: 0, y: 0, scale: 1 });
    setImageSize({ width: 0, height: 0 });
  }

  function removeCustomPhoto() {
    setCustomPhotoUrl(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AVATAR_URL_KEY);
      window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT));
    }
  }

  function openAccount() {
    nav("/profile/account", { state: { displayName, email } });
  }

  return (
    <div className="pfWrap">
      <div className="pfTop">
        <div>
          <div className="pfTitle">{t("profile.title")}</div>
          <div className="pfSub">
            {t("profile.subtitle")}
          </div>
        </div>
      </div>

      <div className="pfMain">
        <section className="pfPanel pfPanelMyInfo">
          {!loggedIn && (
            <div
              className="pfCreateProfileOverlay"
              aria-hidden
            >
              <button
                type="button"
                className="pfCreateProfileOverlayBtn"
                onClick={() => nav("/signup", { state: { fromProfile: true } })}
              >
                {t("landing.createProfile")}
              </button>
            </div>
          )}
          <div className="pfMyInfoHeader">
            <div className="pfPanelTitle" style={{ marginBottom: 0 }}>{t("profile.myInfo")}</div>
            {loggedIn && (
              <button
                type="button"
                className="pfSettingsIconBtn"
                onClick={() => nav("/profile/settings")}
                title={t("profile.settings")}
                aria-label={t("settings.title")}
              >
                <span className="pfSettingsIcon" aria-hidden>⚙️</span>
              </button>
            )}
          </div>

          <div className="pfUserCard">
            <div className="pfAvatarBlock">
              <button
                type="button"
                className="pfAvatarBigBtn"
                onClick={loggedIn ? openAvatarModal : undefined}
                aria-label="Change profile photo"
                disabled={!loggedIn}
              >
                {customPhotoUrl ? (
                  <span className="pfAvatarBig pfAvatarBigImg">
                    <img src={customPhotoUrl} alt="" className="pfAvatarImg" />
                  </span>
                ) : (
                  <span className="pfAvatarBig" aria-hidden>
                    {selectedAvatar.mark}
                  </span>
                )}
              </button>
            </div>
            <div className="pfUserMeta">
              <button
                type="button"
                className="pfNicknameRow"
                onClick={loggedIn ? openAccount : undefined}
                title="Edit nickname and account"
                aria-label="Edit nickname and account"
                disabled={!loggedIn}
              >
                <span className="pfUserName">{displayName || "—"}</span>
                <span className="pfNicknameEditIcon" aria-hidden>✏️</span>
              </button>
              <div className="pfUserEmailRow">
                <span className="pfUserEmail">{loggedIn ? email : ""}</span>
                {loggedIn && (
                  <button
                    type="button"
                    className="pfUserEmailEdit"
                    onClick={openAccount}
                    title="Edit account"
                    aria-label="Edit account"
                  >
                    <span aria-hidden>✏️</span>
                  </button>
                )}
              </div>
              <div className="pfUserDivider" />
              <div className="pfUserKpis">
                <span className="pfKpiPill">🔥 {streakDays}d streak</span>
                <span className="pfKpiPill">💎 {credits.toLocaleString()} credits</span>
                <span className="pfKpiPill">⭐ {xp.toLocaleString()} XP</span>
              </div>
              <div className="pfUserExtra">
                Level {level} · Stage {stage} · Unit {unit}
              </div>
              <div className="pfUserHint">
                {t("profile.characterHint")}
              </div>
            </div>
          </div>
        </section>

        <section className="pfSection">
          <h2 className="pfSectionTitle">Progress & history</h2>
          <div className="pfEntryGrid">
            <button
              type="button"
              className="pfEntryCard"
              onClick={() => nav("/profile/reports")}
            >
              <span className="pfEntryIcon">📝</span>
              <span className="pfEntryLabel">{t("profile.reports")}</span>
              <span className="pfEntryDesc">
                {t("profile.reportsDesc")}
              </span>
            </button>
            <button
              type="button"
              className="pfEntryCard"
              onClick={() => nav("/profile/stats")}
            >
              <span className="pfEntryIcon">📊</span>
              <span className="pfEntryLabel">{t("profile.stats")}</span>
              <span className="pfEntryDesc">
                {t("profile.statsDesc")}
              </span>
            </button>
            <button
              type="button"
              className="pfEntryCard"
              onClick={() => nav("/profile/access")}
            >
              <span className="pfEntryIcon">🎫</span>
              <span className="pfEntryLabel">{t("profile.myAccess")}</span>
              <span className="pfEntryDesc">
                {t("profile.myAccessDesc")}
              </span>
            </button>
          </div>
        </section>

        <div className="pfFooterLinks">
          <button type="button" className="pfFooterLink" onClick={() => nav("/profile/help")}>
            {t("profile.help")}
          </button>
          <span className="pfFooterSep">·</span>
          <button type="button" className="pfFooterLink" onClick={() => nav("/profile/about")}>
            {t("profile.about")}
          </button>
        </div>
      </div>

      {avatarModalOpen && (
        <div className="pfModalOverlay" onClick={() => setAvatarModalOpen(false)}>
          <div className={`pfModal ${cropMode ? "pfModalLarge" : ""}`} onClick={(e) => e.stopPropagation()}>
            {cropMode ? (
              <>
                <div className="pfModalTitle">Crop your photo</div>
                <div className="pfCropArea" ref={cropContainerRef}>
                  <div
                    className="pfCropImageContainer"
                    onMouseDown={handleCropMouseDown}
                    onMouseMove={handleCropMouseMove}
                    onMouseUp={handleCropMouseUp}
                    onMouseLeave={handleCropMouseUp}
                    onWheel={handleCropWheel}
                  >
                    {cropImageSrc && (
                      <img
                        ref={cropImageRef}
                        src={cropImageSrc}
                        alt="Crop preview"
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
                    )}
                    <div className="pfCropCircle" />
                  </div>
                </div>
                <div className="pfCropHint">
                  Drag to move · Scroll to zoom
                </div>
                <div className="pfModalActions">
                  <button type="button" className="pfBtn pfBtnGhost" onClick={cancelCrop}>
                    Cancel
                  </button>
                  <button type="button" className="pfBtn pfBtnPrimary" onClick={applyCrop}>
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="pfModalTitle">Choose character or photo</div>
                <div className="pfModalPhotoUpload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="pfFileInputHidden"
                    onChange={handlePhotoFile}
                    aria-label="Upload photo from camera or gallery"
                  />
                  <button
                    type="button"
                    className="pfPhotoUploadBtn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="pfPhotoUploadIcon">📷</span>
                    <span className="pfPhotoUploadLabel">Load photo</span>
                  </button>
                </div>
                <div className="pfAvatarGrid">
                  {AVATARS.map((a) => {
                    const active = !customPhotoUrl && a.id === avatarDraftId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className={"pfAvatarCard " + (active ? "pfAvatarCardActive" : "")}
                        onClick={() => {
                          setAvatarDraftId(a.id);
                          setCustomPhotoUrl(null);
                        }}
                      >
                        <div className="pfAvatarMark">{a.mark}</div>
                        <div className="pfAvatarName">{a.name}</div>
                      </button>
                    );
                  })}
                </div>
                {customPhotoUrl && (
                  <div className="pfModalRemovePhoto">
                    <button
                      type="button"
                      className="pfBtn pfBtnGhost"
                      onClick={removeCustomPhoto}
                    >
                      Remove my photo
                    </button>
                  </div>
                )}
                <div className="pfModalActions">
                  <button type="button" className="pfBtn pfBtnGhost" onClick={() => setAvatarModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="button" className="pfBtn pfBtnPrimary" onClick={saveAvatar}>
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      </div>
  );
}
