// src/App.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./index.css";

import { Routes, Route, Navigate, useParams, useLocation, useNavigate } from "react-router-dom";

import {
  AVATAR_URL_KEY,
  AVATAR_CAT_ID_KEY,
  AVATAR_CHANGED_EVENT,
  getCatMark,
} from "./constants/avatars";
import { StoreProvider } from "./context/StoreContext";
import { DialogProvider } from "./context/DialogContext";
import HomeView from "./views/HomeView";
import PracticeView from "./views/PracticeView";
import RoadmapView from "./views/RoadmapView.tsx";
import ProfileView from "./views/ProfileView";
import ProfileAccessView from "./views/ProfileAccessView";
import ProfileSettingsView from "./views/ProfileSettingsView";
import ProfileAccountView from "./views/ProfileAccountView";
import ProfileHelpView from "./views/ProfileHelpView";
import ProfileAboutView from "./views/ProfileAboutView";
import ReportsView from "./views/ReportsView";
import ReportDetailView from "./views/ReportDetailView.tsx";
import StatsView from "./views/StatsView.tsx";
import StoreView from "./views/StoreView";
import LandingView from "./views/LandingVIew";
import LoginView from "./views/LoginView";
import SignupView from "./views/SignupView";

const ONBOARDING_DONE_KEY = "ws_onboarding_done";
const LOGGED_IN_KEY = "ws_logged_in";

type View = "home" | "practice" | "roadmap" | "profile" | "store";

// pathname -> activeView (profile includes /profile/reports, /profile/stats)
function viewFromPath(pathname: string): View {
  if (pathname === "/" || pathname.startsWith("/home")) return "home";
  if (pathname.startsWith("/practice")) return "practice";
  if (pathname.startsWith("/roadmap")) return "roadmap";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/store")) return "store";
  return "home";
}

function pathFromView(v: View): string {
  if (v === "home") return "/home";
  if (v === "practice") return "/practice";
  if (v === "roadmap") return "/roadmap";
  if (v === "profile") return "/profile";
  if (v === "store") return "/store";
  return "/home";
}

export default function App() {
  const nav = useNavigate();
  const loc = useLocation();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("ws-theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("ws-theme", theme);
  }, [theme]);

  const onboardingDone = typeof window !== "undefined" && localStorage.getItem(ONBOARDING_DONE_KEY) === "1";
  const loggedIn = typeof window !== "undefined" && localStorage.getItem(LOGGED_IN_KEY) === "1";
  const showLanding =
    loc.pathname === "/landing" || (loc.pathname === "/" && !onboardingDone && !loggedIn);
  const showLogin = loc.pathname === "/login";
  const showSignup = loc.pathname === "/signup";

  const { t } = useTranslation();
  const activeView = useMemo<View>(() => viewFromPath(loc.pathname), [loc.pathname]);

  const readRailAvatar = useCallback(() => {
    if (typeof window === "undefined") return { photoUrl: null as string | null, catMark: null as string | null };
    const photoUrl = localStorage.getItem(AVATAR_URL_KEY);
    if (photoUrl) return { photoUrl, catMark: null };
    const catId = localStorage.getItem(AVATAR_CAT_ID_KEY);
    const catMark = getCatMark(catId);
    return { photoUrl: null, catMark };
  }, []);
  const [railAvatar, setRailAvatar] = useState(readRailAvatar);
  useEffect(() => {
    const onAvatarChanged = () => setRailAvatar(readRailAvatar());
    window.addEventListener(AVATAR_CHANGED_EVENT, onAvatarChanged);
    return () => window.removeEventListener(AVATAR_CHANGED_EVENT, onAvatarChanged);
  }, [readRailAvatar]);

  const user = { initials: "Y" };

  useEffect(() => {
    if (loggedIn && (showLogin || showSignup)) {
      nav("/home", { replace: true });
    }
  }, [loggedIn, showLogin, showSignup, nav]);

  if (showLanding) {
    return (
      <DialogProvider>
        <LandingView />
      </DialogProvider>
    );
  }

  if (showLogin) {
    return (
      <DialogProvider>
        <LoginView />
      </DialogProvider>
    );
  }

  if (showSignup) {
    return (
      <DialogProvider>
        <SignupView />
      </DialogProvider>
    );
  }

  return (
    <DialogProvider>
    <div className="ws-shell">
      <aside className="ws-rail">
        <div className="ws-brand">
          <div className="ws-logoMark" title="WorkSpeak">
            W
          </div>
        </div>

        <nav className="ws-railNav" aria-label="Primary navigation">
          <RailItem
            active={activeView === "home"}
            label={t("nav.home")}
            icon="🏠"
            onClick={() => nav(pathFromView("home"))}
          />
          <RailItem
            active={activeView === "practice"}
            label={t("nav.practice")}
            icon="🎯"
            onClick={() => nav(pathFromView("practice"))}
          />
          <RailItem
            active={activeView === "roadmap"}
            label={t("nav.roadmap")}
            icon="🗺️"
            onClick={() => nav(pathFromView("roadmap"))}
          />
          <RailItem
            active={activeView === "store"}
            label={t("nav.store")}
            icon="🛍️"
            onClick={() => nav(pathFromView("store"))}
          />
        </nav>

        <div className="ws-railFooter">
          <button
            className="ws-themeBtn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={t("nav.toggleTheme")}
            title={t("nav.toggleTheme")}
            type="button"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            className={`ws-themeBtn ws-profileCardBtn ${activeView === "profile" ? "is-active" : ""}`}
            type="button"
            title={t("nav.profile")}
            onClick={() => nav("/profile")}
          >
            <div className="ws-avatar ws-avatar-sm">
              {railAvatar.photoUrl ? (
                <img src={railAvatar.photoUrl} alt="" className="ws-avatarImg" />
              ) : railAvatar.catMark ? (
                <span className="ws-avatarMark" aria-hidden>{railAvatar.catMark}</span>
              ) : (
                user.initials
              )}
            </div>
          </button>
        </div>
      </aside>

      <main className="ws-main">
        <StoreProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeView />} />
            <Route path="/practice" element={<PracticeView />} />
            <Route path="/roadmap" element={<RoadmapView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/profile/reports" element={<ReportsView />} />
            <Route path="/profile/reports/:id" element={<ReportDetailView />} />
            <Route path="/profile/stats" element={<StatsView />} />
            <Route path="/profile/access" element={<ProfileAccessView />} />
            <Route path="/profile/settings" element={<ProfileSettingsView />} />
            <Route path="/profile/account" element={<ProfileAccountView />} />
            <Route path="/profile/help" element={<ProfileHelpView />} />
            <Route path="/profile/about" element={<ProfileAboutView />} />
            <Route path="/store" element={<StoreView />} />
            <Route path="/reports" element={<Navigate to="/profile/reports" replace />} />
            <Route path="/reports/:id" element={<RedirectToProfileReport />} />
            <Route path="/stats" element={<Navigate to="/profile/stats" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </main>
    </div>
    </DialogProvider>
  );
}

function RedirectToProfileReport() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/profile/reports/${id}` : "/profile/reports"} replace />;
}

function RailItem({
  icon,
  label,
  active,
  onClick
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`ws-railItem ${active ? "is-active" : ""}`}
      type="button"
      onClick={onClick}
    >
      <span className="ws-railIcon">{icon}</span>
      <span className="ws-railLabel">{label}</span>
    </button>
  );
}
