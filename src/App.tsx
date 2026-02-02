// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import { StoreProvider } from "./context/StoreContext";
import HomeView from "./views/HomeView";
import PracticeView from "./views/PracticeView";
import RoadmapView from "./views/RoadmapView.tsx";
import ReportsView from "./views/ReportsView";
import ReportDetailView from "./views/ReportDetailView.tsx";
import StatsView from "./views/StatsView.tsx";
import StoreView from "./views/StoreView";

type View = "home" | "practice" | "roadmap" | "reports" | "stats" | "store";

// ✅ 추가: pathname -> activeView
function viewFromPath(pathname: string): View {
  if (pathname.startsWith("/practice")) return "practice";
  if (pathname.startsWith("/roadmap")) return "roadmap";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/stats")) return "stats";
  if (pathname.startsWith("/store")) return "store";
  return "home";
}

// ✅ 추가: view -> path
function pathFromView(v: View): string {
  if (v === "practice") return "/practice";
  if (v === "roadmap") return "/roadmap";
  if (v === "reports") return "/reports";
  if (v === "stats") return "/stats";
  if (v === "store") return "/store";
  return "/";
}

export default function App() {
  const nav = useNavigate();      // ✅ 추가
  const loc = useLocation();      // ✅ 추가

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("ws-theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("ws-theme", theme);
  }, [theme]);

  // ✅ 변경: state activeView 삭제하고 URL 기반 계산
  const activeView = useMemo<View>(() => viewFromPath(loc.pathname), [loc.pathname]);

  const user = { initials: "Y" };

  return (
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
            label="Home"
            icon="🏠"
            onClick={() => nav(pathFromView("home"))}
          />
          <RailItem
            active={activeView === "practice"}
            label="Practice"
            icon="🎯"
            onClick={() => nav(pathFromView("practice"))}
          />
          <RailItem
            active={activeView === "roadmap"}
            label="Roadmap"
            icon="🗺️"
            onClick={() => nav(pathFromView("roadmap"))}
          />
          <RailItem
            active={activeView === "reports"}
            label="Reports"
            icon="📝"
            onClick={() => nav(pathFromView("reports"))}
          />
          <RailItem
            active={activeView === "stats"}
            label="Stats"
            icon="📊"
            onClick={() => nav(pathFromView("stats"))}
          />
          <RailItem
            active={activeView === "store"}
            label="Store"
            icon="🛍️"
            onClick={() => nav(pathFromView("store"))}
          />
        </nav>

        <div className="ws-railFooter">
          <button
            className="ws-themeBtn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
            title="Toggle theme"
            type="button"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button className="ws-themeBtn ws-profileCardBtn" type="button" title="Profile">
            <div className="ws-avatar ws-avatar-sm">{user.initials}</div>
          </button>
        </div>
      </aside>

      <main className="ws-main">
        <StoreProvider>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/practice" element={<PracticeView />} />
            <Route path="/roadmap" element={<RoadmapView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/reports/:id" element={<ReportDetailView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/store" element={<StoreView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </main>
    </div>
  );
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
