// src/App.tsx
import React from "react";
import "./index.css";

const App: React.FC = () => {
  return (
    <div className="ws-app">
      {/* Top Navigation */}
      <header className="ws-topnav">
        <div className="ws-topnav-left">
          <div className="ws-logo">WorkSpeak</div>
          <nav className="ws-nav-links">
            <button className="ws-nav-link ws-nav-link-active">Home</button>
            <button className="ws-nav-link">Practice Hub</button>
            <button className="ws-nav-link">Roadmap</button>
            <button className="ws-nav-link">Stats</button>
            <button className="ws-nav-link">Store</button>
          </nav>
        </div>
        <div className="ws-topnav-right">
          <div className="ws-badge ws-level-badge">Level 3 · Stage 2</div>
          <div className="ws-points">● 1,250 pts</div>
          <div className="ws-avatar">YJ</div>
        </div>
      </header>

      {/* Main layout */}
      <main className="ws-main">
        {/* LEFT COLUMN */}
        <section className="ws-column ws-column-left">
          {/* Today's mission */}
          <section className="ws-card ws-card-main">
            <div className="ws-card-header">
              <div>
                <p className="ws-eyebrow">Today's mission</p>
                <h1 className="ws-card-title">
                  Handle a customer who wants a refund after closing time
                </h1>
                <p className="ws-subtext">
                  Practice how to stay calm and professional when a customer
                  asks for a refund after closing.
                </p>
              </div>
              <div className="ws-pill-group">
                <span className="ws-pill ws-pill-stage">
                  Stage 2 · Busy shift survival
                </span>
                <span className="ws-pill">Real workplace role-play</span>
                <span className="ws-pill ws-pill-time">≈ 6 min</span>
              </div>
            </div>

            <div className="ws-tag-row">
              <span className="ws-tag">#Café staff</span>
              <span className="ws-tag">#Customer service</span>
              <span className="ws-tag">#Refund request</span>
            </div>

            <div className="ws-card-actions">
              <button className="ws-btn ws-btn-primary">Start mission</button>
              <button className="ws-btn ws-btn-ghost">View details</button>
            </div>
          </section>

          {/* Current stage progress */}
          <section className="ws-card">
            <div className="ws-card-header-row">
              <div>
                <p className="ws-eyebrow">Current stage</p>
                <h2 className="ws-card-title-sm">
                  Stage 2 · Busy shift survival
                </h2>
                <p className="ws-subtext">
                  Learn how to survive a busy shift, handle complaints, and
                  talk to your manager.
                </p>
              </div>
              <button className="ws-btn ws-btn-outline">
                Go to Practice hub
              </button>
            </div>

            <div className="ws-progress-row">
              <div className="ws-progress-labels">
                <span>Stage progress</span>
                <span className="ws-progress-percent">7 / 15 journeys</span>
              </div>
              <div className="ws-progress-bar">
                <div className="ws-progress-fill" style={{ width: "46%" }} />
              </div>
              <p className="ws-progress-helper">
                Complete 3 more missions to unlock Level 4.
              </p>
            </div>
          </section>

          {/* Next journeys */}
          <section className="ws-card">
            <div className="ws-card-header-row">
              <h3 className="ws-card-title-sm">Next journeys</h3>
              <span className="ws-eyebrow">From Stage 2</span>
            </div>

            <div className="ws-journey-list">
              <JourneyCard
                icon="😤"
                title="Journey 8 · Handling a rude customer"
                description="Learn phrases to stay calm, set boundaries, and close the conversation."
                type="Journey"
              />
              <JourneyCard
                icon="📞"
                title="Journey 9 · Calling your manager for help"
                description="Practice how to explain the situation and ask for support clearly."
                type="Journey"
              />
              <JourneyCard
                icon="🔁"
                title="Review · Busy shift expressions"
                description="Quick review of key phrases you used this week."
                type="Review"
              />
            </div>
          </section>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="ws-column ws-column-right">
          {/* Streak */}
          <section className="ws-card ws-card-small">
            <div className="ws-card-header-row">
              <h3 className="ws-card-title-sm">Streak</h3>
              <span className="ws-fire">🔥</span>
            </div>
            <p className="ws-streak-main">12 days</p>
            <p className="ws-subtext">
              You're on a 12-day streak. Keep it up!
            </p>

            <div className="ws-progress-row">
              <div className="ws-progress-labels">
                <span>This week</span>
                <span className="ws-progress-percent">3 / 5 days</span>
              </div>
              <div className="ws-progress-bar ws-progress-bar-small">
                <div className="ws-progress-fill" style={{ width: "60%" }} />
              </div>
            </div>

            <button className="ws-link-btn">Use vacation pass</button>
          </section>

          {/* Speaking summary */}
          <section className="ws-card ws-card-small">
            <div className="ws-card-header-row">
              <h3 className="ws-card-title-sm">Today's speaking</h3>
            </div>
            <p className="ws-speaking-main">
              12 <span>/ 30 sentences</span>
            </p>
            <p className="ws-subtext">
              Goal: 30 sentences · You spoke more than 65% of learners at your
              level.
            </p>
            <div className="ws-speaking-bar">
              <div className="ws-speaking-spoken" />
              <div className="ws-speaking-rest" />
            </div>
          </section>

          {/* Points & league */}
          <section className="ws-card ws-card-small">
            <div className="ws-card-header-row">
              <h3 className="ws-card-title-sm">Points & league</h3>
            </div>

            <div className="ws-points-row">
              <div>
                <p className="ws-label">Points</p>
                <p className="ws-points-main">1,250 pts</p>
                <p className="ws-subtext">+120 pts from today's mission</p>
              </div>
              <button className="ws-btn ws-btn-outline ws-btn-xs">
                Go to Store
              </button>
            </div>

            <div className="ws-divider" />

            <div>
              <p className="ws-label">This week's league</p>
              <p className="ws-league-main">Gold League · Rank 7 / 48</p>
              <div className="ws-progress-bar ws-progress-bar-small">
                <div
                  className="ws-progress-fill ws-progress-fill-gold"
                  style={{ width: "70%" }}
                />
              </div>
              <p className="ws-subtext">
                Score 350 more pts to reach the Top 10%.
              </p>
            </div>
          </section>

          {/* Quick review */}
          <section className="ws-card ws-card-small">
            <h3 className="ws-card-title-sm">Need something lighter today?</h3>
            <p className="ws-subtext">
              Do a quick review journey to keep your streak without a full
              mission.
            </p>
            <button className="ws-btn ws-btn-secondary">
              Start review journey
            </button>
          </section>
        </aside>
      </main>
    </div>
  );
};

type JourneyCardProps = {
  icon: string;
  title: string;
  description: string;
  type: "Journey" | "Review";
};

const JourneyCard: React.FC<JourneyCardProps> = ({
  icon,
  title,
  description,
  type
}) => {
  const badgeClass =
    type === "Review" ? "ws-pill ws-pill-review" : "ws-pill ws-pill-journey";

  return (
    <div className="ws-journey-card">
      <div className="ws-journey-icon">{icon}</div>
      <div className="ws-journey-content">
        <div className="ws-journey-header">
          <h4 className="ws-journey-title">{title}</h4>
          <span className={badgeClass}>{type}</span>
        </div>
        <p className="ws-journey-description">{description}</p>
      </div>
      <button className="ws-btn ws-btn-outline ws-btn-xs">Start</button>
    </div>
  );
};

export default App;
