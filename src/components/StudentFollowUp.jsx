const OPTIONS = [
  { key: "vocabulary", icon: "📖", label: "The vocabulary or terms", sub: "I don't know what the words mean" },
  { key: "example",   icon: "💡", label: "The example didn't click", sub: "I get the idea but not how it applies" },
  { key: "missed",    icon: "⏪", label: "I missed something earlier", sub: "I'm lost from a few steps back" },
  { key: "pace",      icon: "⚡", label: "Going too fast", sub: "I need more time to absorb this" },
  { key: "other",     icon: "💬", label: "Other", sub: "Something else is off" },
];

export default function StudentFollowUp({ go, recordConfusion }) {
  const handleSelect = (key) => {
    recordConfusion(key);
    go("student-done");
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

      <p className="heading-lg">What's confusing you?</p>
      <div className="spacer-sm" />
      <p className="body-md" style={{ marginBottom: 24 }}>
        This helps your teacher know exactly what to fix. Still 100% anonymous.
      </p>

      {OPTIONS.map((opt) => (
        <div
          key={opt.key}
          className="followup-opt"
          onClick={() => handleSelect(opt.key)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect(opt.key)}
        >
          <span className="followup-icon">{opt.icon}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{opt.label}</div>
            <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>{opt.sub}</div>
          </div>
        </div>
      ))}

      <button className="btn-ghost" onClick={() => go("student-vote")} style={{ marginTop: 8, width: "auto" }}>
        ← Go back
      </button>
    </div>
  );
}
