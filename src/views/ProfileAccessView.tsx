// src/views/ProfileAccessView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDateLite } from "./reportData";

type AccessType = "instant" | "session" | "permanent";

type AccessItem = {
  id: string;
  type: AccessType;
  title: string;
  desc: string;
  /** When set, desc is shown via t(descKey). */
  descKey?: string;
  readyCount?: number;
  remainingUses?: number;
  totalUses?: number;
  enabled?: boolean;
  badge?: string;
  purchaseDate: string;
  creditsSpent: number;
  startDate?: string;
};

function typeLabelKey(t: AccessType): string {
  if (t === "instant") return "profileAccess.useOnce";
  if (t === "session") return "profileAccess.session";
  return "profileAccess.unlockForever";
}

function pillClass(t: AccessType) {
  if (t === "instant") return "pfPill pfPillInstant";
  if (t === "session") return "pfPill pfPillSession";
  return "pfPill pfPillPermanent";
}

export default function ProfileAccessView() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [access, setAccess] = useState<AccessItem[]>([
    {
      id: "instant_streak_shield",
      type: "instant",
      title: "Streak Shield (1 day)",
      desc: "",
      descKey: "profileAccess.streakShieldDesc",
      readyCount: 1,
      badge: "Best",
      purchaseDate: "2026-01-15T10:30:00Z",
      creditsSpent: 500,
    },
    {
      id: "session_practice_plus",
      type: "session",
      title: "Practice+ Pack",
      desc: "",
      descKey: "profileAccess.practicePlusDesc",
      remainingUses: 3,
      totalUses: 5,
      badge: "Popular",
      purchaseDate: "2026-01-20T14:20:00Z",
      creditsSpent: 1200,
    },
    {
      id: "perm_medical_sim",
      type: "permanent",
      title: "Medical simulation unlock",
      desc: "",
      descKey: "profileAccess.medicalSimDesc",
      enabled: true,
      badge: "Pro",
      purchaseDate: "2026-01-10T09:15:00Z",
      creditsSpent: 2500,
      startDate: "2026-01-10T09:15:00Z",
    },
  ]);

  function useInstant(id: string) {
    setAccess((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const n = x.readyCount ?? 0;
        return { ...x, readyCount: Math.max(0, n - 1) };
      })
    );
  }

  function useSession(id: string) {
    setAccess((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const n = x.remainingUses ?? 0;
        return { ...x, remainingUses: Math.max(0, n - 1) };
      })
    );
  }

  return (
    <div className="pfWrap">
      <header className="pfAccessHeader">
        <div className="pfAccessHeaderLeft">
          <button
            type="button"
            className="ws-link ws-linkSm"
            onClick={() => nav("/profile")}
          >
            ← {t("common.profile")}
          </button>
          <h1 className="pfTitle" style={{ marginBottom: 0 }}>{t("profile.myAccess")}</h1>
        </div>
      </header>
      <div className="pfSub" style={{ marginTop: 4, marginBottom: 18 }}>
        {t("profileAccess.intro")}
      </div>

      {access.length === 0 ? (
        <div className="pfEmpty">
          {t("profileAccess.noPurchases")}
        </div>
      ) : (
        <div className="pfAccessList">
          {access.map((it) => {
            // 세션 타입의 경우 사용한 횟수 계산
            const usedCount = it.type === "session" && it.totalUses && it.remainingUses !== undefined
              ? it.totalUses - it.remainingUses
              : 0;

            const status =
              it.type === "permanent"
                ? it.enabled
                  ? t("profileAccess.active")
                  : t("profileAccess.inactive")
                : it.type === "instant"
                  ? `${t("profileAccess.ready")} ${it.readyCount ?? 0}`
                  : `${usedCount}/${it.totalUses ?? 0}`;

            const canUse =
              it.type === "instant"
                ? (it.readyCount ?? 0) > 0
                : it.type === "session"
                  ? (it.remainingUses ?? 0) > 0
                  : false;

            return (
              <div key={it.id} className="pfAccessCard">
                <div className="pfAccessCardHead">
                  <span aria-hidden>🧾</span>
                  <span>{t("profileAccess.purchase")}</span>
                </div>
                <div className="pfAccessCardBody">
                  <div className="pfAccessTop">
                    <span className={pillClass(it.type)}>{t(typeLabelKey(it.type))}</span>
                    <div className="pfAccessRight">
                      {it.badge && <span className="pfBadge">{it.badge}</span>}
                      <span className="pfStatus">{status}</span>
                    </div>
                  </div>

                  <div className="pfAccessTitle">{it.title}</div>
                  <div className="pfAccessDesc">{it.descKey ? t(it.descKey) : it.desc}</div>

                  <div className="pfAccessMeta">
                  <div className="pfAccessMetaRow">
                    <span className="pfAccessMetaLabel">{t("profileAccess.purchased")}</span>
                    <span className="pfAccessMetaValue">{formatDateLite(it.purchaseDate)}</span>
                  </div>
                  <div className="pfAccessMetaRow">
                    <span className="pfAccessMetaLabel">💎 {t("profileAccess.credits")}</span>
                    <span className="pfAccessMetaValue">{it.creditsSpent.toLocaleString()}</span>
                  </div>
                  {it.type === "permanent" && it.startDate && (
                    <div className="pfAccessMetaRow">
                      <span className="pfAccessMetaLabel">{t("profileAccess.started")}</span>
                      <span className="pfAccessMetaValue">{formatDateLite(it.startDate)}</span>
                    </div>
                  )}
                </div>

                <div className="pfAccessFoot">
                  <div className="pfMutedSmall">
                    {it.type === "permanent"
                      ? t("profileAccess.permanentUnlock")
                      : it.type === "instant"
                        ? t("profileAccess.oneTimeUse")
                        : t("profileAccess.sessionBoost")}
                  </div>

                  {it.type === "permanent" ? (
                    <button className="pfBtn pfBtnGhost" type="button" disabled>
                      {t("profileAccess.enabled")}
                    </button>
                  ) : (
                    <button
                      className={"pfBtn " + (canUse ? "pfBtnPrimary" : "pfBtnGhost")}
                      type="button"
                      disabled={!canUse}
                      onClick={() =>
                        it.type === "instant" ? useInstant(it.id) : useSession(it.id)
                      }
                      title={!canUse ? "No uses left" : "Use (demo)"}
                    >
                      {t("profileAccess.use")}
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pfNote">
        {t("profileAccess.demoNote")}
      </div>
    </div>
  );
}
