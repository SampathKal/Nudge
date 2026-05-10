export default function StudentDone({ go }) {
  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60 }}>
      <div className="success-circle">✓</div>

      <p className="heading-lg text-center">Response sent</p>
      <div className="spacer-sm" />
      <p className="body-md text-center" style={{ maxWidth: 320 }}>
        Your teacher can see the class breakdown right now. They don't know it was you.
      </p>

      <div className="spacer-lg" />

      <div className="card-inset" style={{ width: "100%", textAlign: "center" }}>
        <p className="body-sm">
          🔒 Anonymous · Your response helps the whole class
        </p>
      </div>

      <div className="spacer-md" />

      <button className="btn btn-secondary" onClick={() => go("student-vote")}>
        ↺ Change my response
      </button>
      <button className="btn-ghost" onClick={() => go("home")}>
        Back to home
      </button>
    </div>
  );
}
