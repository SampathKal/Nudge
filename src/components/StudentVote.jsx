export default function StudentVote({ go, session, recordVote }) {
  const handleVote = (type) => {
    if (type === "lost") {
      go("student-followup");
    } else {
      recordVote(type);
      go("student-done");
    }
  };

  return (
    <div className="page">
      <div className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="2"/>
            <path d="M7 11h8M11 7v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="logo-name">nudge</span>
      </div>

      <p className="heading-lg">How's it going?</p>
      <div className="spacer-sm" />
      {session.topic && (
        <div className="chip" style={{ marginBottom: 20 }}>📖 {session.topic}</div>
      )}
      <p className="body-md" style={{ marginBottom: 24 }}>Be honest — your teacher sees the whole class, not who pressed what.</p>

      <button className="vote-btn vote-got" onClick={() => handleVote("got")}>
        <span className="vote-emoji">✓</span>
        Got it
        <span className="vote-sub">Fully following along</span>
      </button>

      <button className="vote-btn vote-kinda" onClick={() => handleVote("kinda")}>
        <span className="vote-emoji">〜</span>
        Kinda
        <span className="vote-sub">Getting it but a little fuzzy</span>
      </button>

      <button className="vote-btn vote-lost" onClick={() => handleVote("lost")}>
        <span className="vote-emoji">✗</span>
        Lost
        <span className="vote-sub">Not following — need help</span>
      </button>

      <p className="body-sm text-center" style={{ marginTop: 8 }}>Anonymous · Takes 3 seconds</p>
    </div>
  );
}
