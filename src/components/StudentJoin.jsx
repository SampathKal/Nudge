import { useState } from "react";

export default function StudentJoin({ go, session }) {
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (code.trim().length >= 4) go("student-vote");
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

      <p className="heading-lg">Join a session</p>
      <div className="spacer-sm" />
      <p className="body-md">Enter the room code your teacher put on the board.</p>

      <div className="spacer-lg" />

      <div className="card">
        <p className="label" style={{ marginBottom: 10 }}>Room code</p>
        <input
          className="input input-code"
          placeholder="1234"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          maxLength={4}
          inputMode="numeric"
          autoFocus
        />
        <button className="btn btn-primary" onClick={handleJoin} disabled={code.length < 4} style={{ opacity: code.length < 4 ? 0.5 : 1 }}>
          Join →
        </button>
      </div>

      <div className="card-inset" style={{ textAlign: "center" }}>
        <p className="body-sm">🔒 Your responses are 100% anonymous.<br />Your teacher sees the class breakdown, not who said what.</p>
      </div>
    </div>
  );
}
