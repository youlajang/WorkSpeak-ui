// src/views/ProfileHelpView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    q: "How do I start a practice session?",
    a: "Go to Home and tap the main session card, or open Practice from the rail and pick a session.",
  },
  {
    q: "Where are my reports stored?",
    a: "Reports are kept for up to 1 year. Open Profile → Reports to filter and view them.",
  },
  {
    q: "How do I use credits?",
    a: "Credits are spent in the Store. Buy session boosts, instant items, or permanent unlocks.",
  },
  {
    q: "Can I change my character?",
    a: "Yes. In Profile, under Character (free), choose any of the 9 cat characters.",
  },
];

export default function ProfileHelpView() {
  const nav = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            Help & Support
          </h1>
        </div>
      </header>
      <div className="pfSub" style={{ marginTop: 4, marginBottom: 18 }}>
        FAQ and how to get in touch.
      </div>

      <section className="pfPanel">
        <div className="pfPanelTitle">Frequently asked questions</div>
        <div className="pfFaqList">
          {faqs.map((faq, i) => (
            <div key={i} className="pfFaqItem">
              <button
                type="button"
                className="pfFaqQuestion"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                {faq.q}
                <span className="pfFaqChevron">{openIndex === i ? "▲" : "▼"}</span>
              </button>
              {openIndex === i && <div className="pfFaqAnswer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="pfPanel">
        <div className="pfPanelTitle">Contact us</div>
        <p className="pfPanelDesc">
          Need more help? Reach out and we’ll get back to you as soon as we can.
        </p>
        <div className="pfContactRow">
          <a href="mailto:support@workspeak.example" className="pfLink">
            support@workspeak.example
          </a>
        </div>
        <div className="pfContactRow">
          <span className="pfMutedSmall">Response time: usually within 24 hours.</span>
        </div>
      </section>
    </div>
  );
}
