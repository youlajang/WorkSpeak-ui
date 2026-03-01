// src/views/ProfileAboutView.tsx
import { useNavigate } from "react-router-dom";

const APP_NAME = "WorkSpeak";
const VERSION = "1.0.0";

export default function ProfileAboutView() {
  const nav = useNavigate();

  return (
    <div className="pfWrap">
      <header className="pfAccessHeader">
        <div className="pfAccessHeaderLeft">
          <button
            type="button"
            className="ws-link ws-linkSm"
            onClick={() => nav("/profile")}
          >
            ← Profile
          </button>
          <h1 className="pfTitle" style={{ marginBottom: 0 }}>
            About
          </h1>
        </div>
      </header>
      <div className="pfSub" style={{ marginTop: 4, marginBottom: 18 }}>
        App info, version, and legal.
      </div>

      <section className="pfPanel">
        <div className="pfAboutBrand">{APP_NAME}</div>
        <div className="pfAboutVersion">Version {VERSION}</div>
        <p className="pfPanelDesc" style={{ marginTop: 8 }}>
          Practice your communication skills with sessions, quests, and feedback.
        </p>
      </section>

      <section className="pfPanel">
        <div className="pfPanelTitle">Legal</div>
        <div className="pfAboutLinks">
          <a href="#terms" className="pfLink">
            Terms of Service
          </a>
          <a href="#privacy" className="pfLink">
            Privacy Policy
          </a>
        </div>
        <p className="pfMutedSmall" style={{ marginTop: 12 }}>
          By using this app you agree to our terms and privacy policy.
        </p>
      </section>

      <section className="pfPanel">
        <div className="pfPanelTitle">License & credits</div>
        <p className="pfPanelDesc">
          Built with React. Icons and assets may be subject to their own licenses.
        </p>
      </section>
    </div>
  );
}
