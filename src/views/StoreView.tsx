// src/views/StoreView.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDialog } from "../context/DialogContext";
import { useStoreOptional } from "../context/StoreContext";
import "../styles/store.css";

type ItemType = "instant" | "session" | "permanent";
type ItemCategory = "Utility" | "Booster" | "Practice" | "Track";

type StoreItem = {
  id: string;
  type: ItemType;
  category: ItemCategory;
  title: string;
  desc: string;
  price: number;
  badge?: string;
  /** Translation key for badge (e.g. store.badgeBest). */
  badgeKey?: string;
  uses?: number;
  usesLabel?: string;
  /** Translation key for uses label (e.g. store.uses5). */
  usesLabelKey?: string;
  /** Session items can also be time-based (e.g. 1 month access). */
  durationMonths?: number;
  /** Unlocks this roadmap track when purchased (permanent). */
  trackId?: string;
};

type Owned = {
  id: string;
  purchasedAt: number;
  readyCount?: number;
  remainingUses?: number;
  expiresAt?: number;
  enabled?: boolean;
};

const CREDITS_STORAGE_KEY = "ws-store-credits-owned";

function fmt(n: number) {
  return n.toLocaleString();
}

function addMonths(ts: number, months: number): number {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

function fmtDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function typeLabel(itemType: ItemType, tFn: (key: string) => string) {
  if (itemType === "instant") return tFn("store.useOnce");
  if (itemType === "session") return tFn("store.session");
  return tFn("store.unlockForever");
}

function typeIcon(t: ItemType) {
  if (t === "instant") return "⚡";
  if (t === "session") return "🔄";
  return "🔓";
}

function typeTooltipKey(t: ItemType): string {
  if (t === "instant") return "store.typeTooltipInstant";
  if (t === "session") return "store.typeTooltipSession";
  return "store.typeTooltipPermanent";
}

function pillClass(t: ItemType) {
  if (t === "instant") return "wsPill wsPillInstant";
  if (t === "session") return "wsPill wsPillSession";
  return "wsPill wsPillPermanent";
}

function loadOwned(): Record<string, Owned> {
  try {
    const raw = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, Owned>;
      return typeof parsed === "object" ? parsed : {};
    }
  } catch (_) {}
  return {};
}

function saveOwned(owned: Record<string, Owned>) {
  try {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(owned));
  } catch (_) {}
}

export default function StoreView() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dialog = useDialog();
  const store = useStoreOptional();
  const credits = store?.points ?? 1250;
  const typeLabelT = (itemType: ItemType) => typeLabel(itemType, t);

  const [owned, setOwned] = useState<Record<string, Owned>>(loadOwned);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  const items = useMemo<StoreItem[]>(
    () => [
      {
        id: "instant_streak_shield",
        type: "instant",
        category: "Utility",
        title: "",
        desc: "",
        price: 120,
        badge: "Best",
        badgeKey: "store.badgeBest",
      },
      {
        id: "instant_fast_review",
        type: "instant",
        category: "Practice",
        title: "",
        desc: "",
        price: 90,
      },
      {
        id: "instant_focus_mode",
        type: "instant",
        category: "Booster",
        title: "",
        desc: "",
        price: 60,
      },
      {
        id: "session_practice_plus_5",
        type: "session",
        category: "Practice",
        title: "",
        desc: "",
        price: 250,
        uses: 5,
        usesLabel: "",
        usesLabelKey: "store.uses5",
        badge: "Popular",
        badgeKey: "store.badgePopular",
      },
      {
        id: "session_practice_plus_1m",
        type: "session",
        category: "Practice",
        title: "",
        desc: "",
        price: 420,
        durationMonths: 1,
        usesLabel: "",
        usesLabelKey: "store.uses1month",
      },
      {
        id: "session_roleplay_pro_3",
        type: "session",
        category: "Practice",
        title: "",
        desc: "",
        price: 210,
        uses: 3,
        usesLabel: "",
        usesLabelKey: "store.uses3",
      },
      {
        id: "session_review_boost_7",
        type: "session",
        category: "Booster",
        title: "",
        desc: "",
        price: 280,
        uses: 7,
        usesLabel: "",
        usesLabelKey: "store.uses7",
      },
      {
        id: "perm_cafe_track",
        type: "permanent",
        category: "Track",
        title: "",
        desc: "",
        price: 640,
        trackId: "cafe",
      },
      {
        id: "perm_medical_sim",
        type: "permanent",
        category: "Practice",
        title: "",
        desc: "",
        price: 980,
        badge: "Pro",
        badgeKey: "store.badgePro",
        trackId: "medical",
      },
      {
        id: "perm_interview_master",
        type: "permanent",
        category: "Practice",
        title: "",
        desc: "",
        price: 860,
        trackId: "interview",
      },
      {
        id: "perm_report_filters",
        type: "permanent",
        category: "Utility",
        title: "",
        desc: "",
        price: 720,
      },
      {
        id: "perm_test_area",
        type: "permanent",
        category: "Practice",
        title: "",
        desc: "",
        price: 500,
      },
    ],
    []
  );

  type FilterType = ItemType | "all";
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const filteredItems = useMemo(() => {
    if (typeFilter === "all") return items;
    return items.filter((x) => x.type === typeFilter);
  }, [items, typeFilter]);

  function notify(msg: string, kind: "ok" | "err" = "ok") {
    setToast({ msg, kind });
    window.setTimeout(() => setToast(null), 1800);
  }

  async function buy(item: StoreItem) {
    const o = owned[item.id];
    const now = Date.now();

    if (item.type === "permanent" && o?.enabled) {
      notify("Already unlocked.", "err");
      return;
    }
    if (item.type === "instant" && (o?.readyCount ?? 0) > 0) {
      notify("You still have uses left. Use it from Practice first.", "err");
      return;
    }
    if (item.type === "session") {
      const isTimeBased = typeof item.durationMonths === "number" && item.durationMonths > 0;
      const activeByUses = (o?.remainingUses ?? 0) > 0;
      const activeByTime = (o?.expiresAt ?? 0) > now;
      const sessionActive = isTimeBased ? activeByTime : activeByUses;
      if (sessionActive) {
        notify("Already active. Buy again after it ends.", "err");
        return;
      }
    }
    if (credits < item.price) {
      notify("Not enough credits.", "err");
      return;
    }

    const ok = await dialog.confirm(
      `Use ${fmt(item.price)} credits to buy "${t(`store.item_${item.id}_title`)}"?`
    );
    if (!ok) return;

    const spent = store?.spendPoints(item.price);
    if (store && !spent) {
      notify("Not enough credits.", "err");
      return;
    }

    setOwned((prev) => {
      const next = { ...prev };
      const now = Date.now();

      if (item.type === "instant") {
        const prevCount = next[item.id]?.readyCount ?? 0;
        next[item.id] = {
          id: item.id,
          purchasedAt: now,
          readyCount: prevCount + 1,
        };
      } else if (item.type === "session") {
        const isTimeBased = typeof item.durationMonths === "number" && item.durationMonths > 0;
        if (isTimeBased) {
          next[item.id] = {
            id: item.id,
            purchasedAt: now,
            expiresAt: addMonths(now, item.durationMonths ?? 1),
          };
        } else {
          next[item.id] = {
            id: item.id,
            purchasedAt: now,
            remainingUses: item.uses ?? 5,
          };
        }
      } else {
        next[item.id] = {
          id: item.id,
          purchasedAt: now,
          enabled: true,
        };
      }

      saveOwned(next);
      return next;
    });

    notify(`Purchased: ${t(`store.item_${item.id}_title`)}`, "ok");
  }

  function useNow(item: StoreItem) {
    const o = owned[item.id];
    if (!o) return;

    if (item.type === "instant") {
      const n = o.readyCount ?? 0;
      if (n <= 0) return notify("No uses left.", "err");
      setOwned((prev) => {
        const next = {
          ...prev,
          [item.id]: { ...prev[item.id], readyCount: n - 1 },
        };
        saveOwned(next);
        return next;
      });
      nav("/practice");
    }

    if (item.type === "session") {
      const isTimeBased = typeof item.durationMonths === "number" && item.durationMonths > 0;
      if (isTimeBased) return notify("This is time-based access (no Use button).", "err");
      const n = o.remainingUses ?? 0;
      if (n <= 0) return notify("No uses left.", "err");
      setOwned((prev) => {
        const next = {
          ...prev,
          [item.id]: { ...prev[item.id], remainingUses: n - 1 },
        };
        saveOwned(next);
        return next;
      });
      return notify("Applied to this session! (demo)", "ok");
    }

    notify("Permanent items don't have a Use button.", "err");
  }

  if (!store) {
    return (
      <div className="wsStoreWrap">
        <header className="ws-topbar">
          <div className="ws-topbarLeft">
            <h1 className="ws-title">{t("store.title")}</h1>
            <div className="ws-sub">Store requires app context. Use StoreProvider in App.</div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="wsStoreWrap">
      <header className="ws-topbar">
        <div className="ws-topbarLeft">
          <h1 className="ws-title">{t("store.title")}</h1>
          <div className="ws-sub">{t("store.subtitleShort")}</div>
        </div>
        <div className="ws-topbarRight">
          <div className="ws-kpis" aria-label={t("store.credits")}>
            <div className="ws-kpi">
              <div className="ws-kpiIcon">💎</div>
              <div className="ws-kpiText">
                <div className="ws-kpiLabel">{t("store.credits")}</div>
                <div className="ws-kpiValue">{fmt(credits)}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="ws-card wsStoreIntro" aria-label="Credits store">
        <div className="ws-heroEyebrow">{t("store.creditsStore")}</div>
        <div className="ws-cardTitle" style={{ marginTop: 4 }}>{t("store.introHeading")}</div>
        <div className="ws-sub">{t("store.intro")}</div>
        <div className="ws-heroMeta" style={{ marginTop: 10 }}>
          <span className="ws-metaPill">
            <span title={t(typeTooltipKey("instant"))}>⚡ {t("store.useOnce")}</span>
            {" · "}
            <span title={t(typeTooltipKey("session"))}>🔄 {t("store.session")}</span>
            {" · "}
            <span title={t(typeTooltipKey("permanent"))}>🔓 {t("store.unlockForever")}</span>
          </span>
        </div>
        <div className="wsStoreIntroHow">
          {t("store.howItWorks")}
        </div>
      </section>

      <div className="wsStoreFilter">
        <span className="wsStoreFilterLabel">{t("store.filterLabel")}</span>
        {(["all", "instant", "session", "permanent"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={"wsStoreFilterBtn " + (typeFilter === key ? "isActive" : "")}
            onClick={() => setTypeFilter(key)}
            title={key === "all" ? undefined : t(typeTooltipKey(key as ItemType))}
          >
            {key === "all" ? t("store.all") : typeLabelT(key as ItemType)}
          </button>
        ))}
      </div>

      <div className="wsGrid">
        {filteredItems.map((it) => {
          const o = owned[it.id];
          const now = Date.now();
          const isSessionTimeBased =
            it.type === "session" && typeof it.durationMonths === "number" && it.durationMonths > 0;
          const sessionActiveByUses = (o?.remainingUses ?? 0) > 0;
          const sessionActiveByTime = (o?.expiresAt ?? 0) > now;
          const sessionActive =
            it.type === "session"
              ? (isSessionTimeBased ? sessionActiveByTime : sessionActiveByUses)
              : false;

          const isOwned =
            it.type === "permanent"
              ? Boolean(o?.enabled)
              : it.type === "instant"
                ? Boolean(o)
                : it.type === "session"
                  ? sessionActive
                  : false;
          const instantReady = o?.readyCount ?? 0;
          const ownedTag =
            it.type === "permanent" && o?.enabled
              ? t("store.ownedTagPurchased")
              : it.type === "instant" && o
                ? instantReady > 0
                  ? t("store.ownedTagReady", { count: instantReady })
                  : t("store.ownedTagZeroLeft")
                : it.type === "session" && o
                  ? isSessionTimeBased
                    ? sessionActiveByTime
                      ? t("store.ownedTagActiveUntil", { date: fmtDate(o.expiresAt ?? 0) })
                      : t("store.ownedTagExpired")
                    : t("store.ownedTagLeft", { count: o.remainingUses ?? 0 })
                  : null;

          const showBuy =
            it.type === "permanent"
              ? !Boolean(o?.enabled)
              : it.type === "instant"
                ? instantReady <= 0
                : it.type === "session"
                  ? !sessionActive
                  : true;

          const canUse =
            it.type === "instant"
              ? (o?.readyCount ?? 0) > 0
              : it.type === "session"
                ? !isSessionTimeBased && (o?.remainingUses ?? 0) > 0
                : false;

          const itemTitle = t(`store.item_${it.id}_title`);
          const itemDesc = t(`store.item_${it.id}_desc`);
          return (
            <section
              key={it.id}
              className={`ws-card wsCard wsCard--${it.type}${isOwned ? " wsCard-isOwned" : ""}`}
              aria-label={itemTitle}
            >
              <div className="wsCardTop">
                <span className={pillClass(it.type)} title={t(typeTooltipKey(it.type))}>
                  <span className="wsPillIcon" aria-hidden>{typeIcon(it.type)}</span>
                  {typeLabelT(it.type)}
                </span>
                <div className="wsCardTopRight">
                  {it.badgeKey && <span className="wsBadge">{t(it.badgeKey)}</span>}
                  {(it.usesLabelKey || it.usesLabel) && (
                    <span className="wsMiniTag">{it.usesLabelKey ? t(it.usesLabelKey) : it.usesLabel}</span>
                  )}
                </div>
              </div>
              <div className="ws-cardTitleRow" style={{ marginBottom: 0 }}>
                <h3 className="ws-cardTitle wsCardTitle">{itemTitle}</h3>
              </div>
              <div className="ws-sub wsCardDesc">{itemDesc}</div>
              <div className="wsCardFoot">
                <div className="wsPrice">
                  <span className="wsPriceIcon" aria-hidden>💎</span>
                  <b>{fmt(it.price)}</b>
                </div>
                <div className="wsActions">
                  {ownedTag && <span className="wsOwnedTag">{ownedTag}</span>}
                  {showBuy && (
                    <button
                      type="button"
                      className={"ws-btn ws-btn-sm ws-btn-secondary"}
                      onClick={() => buy(it)}
                    >
                      Buy
                    </button>
                  )}
                  {(it.type === "instant" || (it.type === "session" && !isSessionTimeBased)) && (
                    <button
                      type="button"
                      className={"ws-btn ws-btn-sm ws-btn-tertiary " + (!canUse ? "ws-btn-disabled" : "")}
                      onClick={() => useNow(it)}
                      disabled={!canUse}
                      title={!canUse ? "No uses left" : "Use now (demo)"}
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {toast && (
        <div className={"wsToast " + (toast.kind === "err" ? "wsToastErr" : "wsToastOk")}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
