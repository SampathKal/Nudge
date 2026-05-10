const AI_SUGGESTIONS = {
  pace: "More than a third of your class says the pace is too fast. Try pausing to recap the last two steps before moving on — even 60 seconds helps.",
  vocabulary: "Students are tripping on vocabulary. Write the key terms on the board with a plain-English definition next to each one.",
  example: "The example isn't landing. Try a simpler real-world version, or ask a student who gets it to explain it in their own words.",
  missed: "Several students feel they missed something earlier. A quick 60-second recap of the prerequisite concept could unlock the rest of the lesson.",
  other: "Some students are confused but weren't sure why. A quick pair-discussion — 'turn and tell your neighbor what's confusing you' — might surface what's going wrong.",
  default: "Nearly half the class is struggling. Consider pausing and asking 'what's the last thing that made sense?' then working forward from there.",
};

const CONFUSION_LABELS = {
  vocabulary: "Vocabulary / terms",
  example: "Example didn't click",
  missed: "Missed something earlier",
  pace: "Going too fast",
  other: "Other",
};

function BarRow({ label, count, total, colorClass }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`bar-row ${colorClass}`}>
      <div className="bar-header">
        <span className="bar-label">{label}</span>
        <span className="bar-count">{count} student{count !== 1 ? "s" : ""} · {pct}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TeacherDashboard({ go, session, simulateStudents }) {
  const { topic, roomCode, responses, confusion } = session;
  const total = responses.got + responses.kinda + responses.lost;

  const topConfusion = Object.keys(confusion).sort((a, b) => confusion[b] - confusion[a])[0];
  const aiText = topConfusion
    ? AI_SUGGESTIONS[topConfusion]
    : responses.lost > 0
    ? AI_SUGGESTIONS.default
    : null;

  const confusionEntries = Object.entries(confusion).sort(([, a], [, b]) => b - a);

  return (
    <div className="page">
      <button className="btn-ghost" onClick={() => go("home")} style={{ marginBottom: 20, width: "auto", padding: "8px 0" }}>
        ← End session
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p className="heading-md">{topic}</p>
        <span className="chip">● Live</span>
      </div>
      <p className="body-sm" style={{ marginBottom: 20 }}>{total} response{total !== 1 ? "s" : ""} so far</p>

      <div className="card">
        <p className="label" style={{ marginBottom: 6 }}>Room code</p>
        <div className="room-code-big">{roomCode}</div>
        <p className="body-sm text-center">Students go to nudge.app and enter this code</p>
      </div>

      <div className="card">
        <p className="label" style={{ marginBottom: 16 }}>Class breakdown</p>
        <BarRow label="Got it ✓" count={responses.got} total={total} colorClass="bar-green" />
        <BarRow label="Kinda ~" count={responses.kinda} total={total} colorClass="bar-amber" />
        <BarRow label="Lost ✗" count={responses.lost} total={total} colorClass="bar-red" />
      </div>

      {confusionEntries.length > 0 && (
        <div className="card">
          <p className="label" style={{ marginBottom: 12 }}>What's confusing them</p>
          {confusionEntries.map(([key, count]) => (
            <div className="confusion-row" key={key}>
              <span style={{ fontSize: 14, color: "var(--gray-800)" }}>{CONFUSION_LABELS[key] || key}</span>
              <span className="confusion-pill">{count}</span>
            </div>
          ))}
        </div>
      )}

      {aiText && (
        <div className="ai-card">
          <div className="ai-header">
            <span className="ai-badge">✦ AI Suggestion</span>
          </div>
          <p className="ai-text">{aiText}</p>
        </div>
      )}

      <button className="btn btn-secondary" onClick={simulateStudents}>
        ↺ Simulate student responses
      </button>
      <p className="body-sm text-center">For demo purposes — adds random student data</p>
    </div>
  );
}
