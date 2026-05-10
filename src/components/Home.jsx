export default function Home({ go }) {
  return (
    <div className="page">
      <div className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="2"/>
            <path d="M7 11h8M11 7v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="logo-name">nudge</span>
      </div>

      <div className="spacer-md" />

      <p className="heading-xl">Silent feedback.<br />Real clarity.</p>
      <div className="spacer-sm" />
      <p className="body-lg">
        Students tell you they're lost — without raising their hand.
        You know exactly what to fix, in real time.
      </p>

      <div className="spacer-lg" />

      <div
        className="role-card"
        onClick={() => go("teacher-setup")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && go("teacher-setup")}
      >
        <div className="role-icon role-icon-teacher">🎓</div>
        <div>
          <div className="role-title">I'm a teacher</div>
          <div className="role-desc">Start a session and see the live dashboard</div>
        </div>
      </div>

      <div
        className="role-card"
        onClick={() => go("student-join")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && go("student-join")}
      >
        <div className="role-icon role-icon-student">📚</div>
        <div>
          <div className="role-title">I'm a student</div>
          <div className="role-desc">Join with a room code and share how you're doing</div>
        </div>
      </div>

      <div className="spacer-lg" />
      <p className="body-sm text-center">Anonymous · No account needed · 3 seconds</p>
    </div>
  );
}
