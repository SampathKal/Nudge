import { useState } from "react";

export default function TeacherSetup({ go, startSession }) {
  const [topic, setTopic] = useState("");

  const handleStart = () => {
    startSession(topic.trim() || "Today's lesson");
  };

  return (
    <div className="page">
      <button className="btn-ghost" onClick={() => go("home")} style={{ marginBottom: 24, width: "auto", padding: "8px 0" }}>
        ← Back
      </button>

      <div className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="2"/>
            <path d="M7 11h8M11 7v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="logo-name">nudge</span>
      </div>

      <p className="heading-lg">Start a session</p>
      <div className="spacer-sm" />
      <p className="body-md">Enter your topic and you'll get a room code to put on the board.</p>

      <div className="spacer-lg" />

      <div className="card">
        <p className="label" style={{ marginBottom: 10 }}>What are you teaching?</p>
        <input
          className="input"
          placeholder="e.g. Stoichiometry, Chapter 4, The Cold War…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          autoFocus
        />
        <button className="btn btn-primary" onClick={handleStart}>
          🚀 Start session
        </button>
        <p className="body-sm text-center" style={{ marginTop: 4 }}>
          Students connect instantly — no app download needed
        </p>
      </div>

      <div className="card-inset">
        <p className="label" style={{ marginBottom: 8 }}>How it works</p>
        <p className="body-sm" style={{ lineHeight: 1.7 }}>
          1. You get a 4-digit room code<br />
          2. Put it on the board — students go to nudge.app<br />
          3. They tap Got it / Kinda / Lost in 3 seconds<br />
          4. You see the live breakdown + AI suggestions
        </p>
      </div>
    </div>
  );
}
