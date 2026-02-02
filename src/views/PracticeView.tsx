// src/views/PracticeView.tsx
import React from "react";

export default function PracticeView() {
  return (
    <section className="ws-practicePage">
      <div className="ws-practiceHeader">
        <h1 className="ws-title">Practice</h1>
        <div className="ws-sub">자유 연습 공간이에요. (지금은 임시 화면)</div>
      </div>

      <div className="ws-practiceGrid">
        <div className="ws-practiceLeftCard ws-card">
          <div className="ws-cardTitle">부족한 부분</div>
          <div className="ws-sub" style={{ marginTop: 8 }}>
            내가 부족한 부분을 채울 예정인데, 아직 내용을 정하는 중이에요.
          </div>
          <div className="ws-practiceStatus">고민중</div>
        </div>

        <div className="ws-practiceCard ws-card">
          <div className="ws-cardTitle">Speaking Drill</div>
          <div className="ws-sub">따라 말하기 / 문장 연습</div>
          <button className="ws-btn ws-btn-primary" style={{ marginTop: 10 }} type="button">
            Start
          </button>
        </div>

        <div className="ws-practiceCard ws-card">
          <div className="ws-cardTitle">Roleplay</div>
          <div className="ws-sub">상황 롤플레이 연습</div>
          <button className="ws-btn ws-btn-primary" style={{ marginTop: 10 }} type="button">
            Start
          </button>
        </div>

        <div className="ws-practiceCard ws-card">
          <div className="ws-cardTitle">Quick Review</div>
          <div className="ws-sub">2분 복습</div>
          <button className="ws-btn ws-btn-outline" style={{ marginTop: 10 }} type="button">
            Open
          </button>
        </div>

        <div className="ws-practiceCard ws-card">
          <div className="ws-cardTitle">Quest Prep</div>
          <div className="ws-sub">퀘스트 대비 미니 연습</div>
          <button className="ws-btn ws-btn-outline" style={{ marginTop: 10 }} type="button">
            Open
          </button>
        </div>
      </div>
    </section>
  );
}
