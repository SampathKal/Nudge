import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabase = createClient(
  "https://cipnmsqmetcfrjfuzgjb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpcG5tc3FtZXRjZnJqZnV6Z2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDA0NzYsImV4cCI6MjA5Mzc3NjQ3Nn0.qal2R3ROZKbhS8QTxTk-9iUkNrsKcPePjlhRdL4sRAE"
);

const GEMINI_KEY = "AIzaSyDxQ3wiF9iolQQ7Mc-3HcrwWn1X7gypVmE";

const LogoMark = () => (
  <div className="logo-mark">
    <svg viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="white" strokeOpacity=".9" strokeWidth="1.5"/>
      <path d="M7 11h8M11 7v8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const Logo = () => (
  <div className="logo">
    <LogoMark />
    <span className="logo-name">nudge</span>
  </div>
);

const AI_SUGGESTIONS = {
  pace: "More than a third of your class says the pace is too fast. Pause and recap the last two steps before moving on — even 60 seconds makes a difference.",
  vocabulary: "Students are tripping on vocabulary. Write the key terms on the board with a plain-English definition next to each one.",
  example: "The example isn't landing. Try a simpler real-world version, or ask a student who gets it to explain it in their own words.",
  missed: "Several students feel they missed something foundational. A 60-second recap of the prerequisite concept could unlock the rest of the lesson.",
  other: "Students described specific confusion. Check the breakdown and address it directly before moving on.",
  default: "Nearly half the class is struggling. Pause and ask 'what's the last thing that made sense?' — then work forward from there.",
};

const CONFUSION_LABELS = {
  vocabulary: "Vocabulary / terms",
  example: "Example didn't click",
  missed: "Missed something earlier",
  pace: "Going too fast",
  other: "Other",
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [topic, setTopic] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [responses, setResponses] = useState({ got: 0, kinda: 0, lost: 0 });
  const [confusion, setConfusion] = useState({});
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const go = (s) => { setScreen(s); window.scrollTo(0, 0); };

  useEffect(() => {
    if (roomCode) {
      const voted = localStorage.getItem(`nudge_voted_${roomCode}`);
      setAlreadyVoted(!!voted);
    }
  }, [roomCode]);

  useEffect(() => {
    if (screen !== "teacher-dashboard" || !roomCode) return;
    const channel = supabase
      .channel("session-" + roomCode)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "sessions",
        filter: `id=eq.${roomCode}`,
      }, (payload) => {
        const d = payload.new;
        setResponses({ got: d.got, kinda: d.kinda, lost: d.lost });
        setConfusion(d.confusion || {});
        if (d.quiz) setQuiz(d.quiz);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [screen, roomCode]);

  useEffect(() => {
    if (screen !== "student-vote" && screen !== "student-done") return;
    if (!roomCode) return;
    const channel = supabase
      .channel("quiz-" + roomCode)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "sessions",
        filter: `id=eq.${roomCode}`,
      }, (payload) => {
        const d = payload.new;
        if (d.quiz && d.quiz.active) {
          setQuiz(d.quiz);
          setQuizAnswers({});
          setQuizSubmitted(false);
          go("student-quiz");
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [screen, roomCode]);

  const startSession = async () => {
    const t = topic.trim() || "Today's lesson";
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setResponses({ got: 0, kinda: 0, lost: 0 });
    setConfusion({});
    setQuiz(null);
    await supabase.from("sessions").insert({
      id: code, topic: t, got: 0, kinda: 0, lost: 0, confusion: {}, quiz: null,
    });
    go("teacher-dashboard");
  };

  const joinRoom = async () => {
    const { data } = await supabase.from("sessions").select("*").eq("id", codeInput).single();
    if (!data) { alert("Room not found! Check the code and try again."); return; }
    setTopic(data.topic);
    setRoomCode(codeInput);
    const voted = localStorage.getItem(`nudge_voted_${codeInput}`);
    setAlreadyVoted(!!voted);
    if (data.quiz && data.quiz.active) {
      setQuiz(data.quiz);
      go("student-quiz");
    } else {
      go("student-vote");
    }
  };

  const vote = (type) => {
    if (alreadyVoted) return;
    if (type === "lost") { go("student-followup"); return; }
    submitVote(type, null);
  };

  const submitVote = async (type, confusionType) => {
    if (alreadyVoted) return;
    const { data } = await supabase.from("sessions").select("*").eq("id", roomCode).single();
    if (!data) return;
    const updates = { got: data.got, kinda: data.kinda, lost: data.lost, confusion: data.confusion || {} };
    if (confusionType) {
      updates.lost = data.lost + 1;
      updates.confusion = { ...data.confusion, [confusionType]: (data.confusion[confusionType] || 0) + 1 };
    } else {
      updates[type] = data[type] + 1;
    }
    await supabase.from("sessions").update(updates).eq("id", roomCode);
    localStorage.setItem(`nudge_voted_${roomCode}`, "true");
    setAlreadyVoted(true);
    setOtherOpen(false);
    go("student-done");
  };

  const submitConfusion = (type) => submitVote(null, type);

  const generateQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate exactly 3 multiple choice quiz questions to check student understanding of: "${topic}".
Return ONLY a JSON array, no markdown, no explanation. Format:
[
  {
    "question": "question text",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "A"
  }
]`
              }]
            }]
          })
        }
      );
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(clean);
      const quizData = { questions, active: true };
      await supabase.from("sessions").update({ quiz: quizData }).eq("id", roomCode);
      setQuiz(quizData);
    } catch (e) {
      alert("Couldn't generate quiz. Try again!");
    }
    setQuizLoading(false);
  };

  const submitQuizAnswers = async () => {
    if (!quiz) return;
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) score++;
    });
    setQuizResults({ score, total: quiz.questions.length });
    setQuizSubmitted(true);
  };

  const total = responses.got + responses.kinda + responses.lost;
  const pct = (v) => total > 0 ? Math.round((v / total) * 100) : 0;
  const topC = Object.keys(confusion).sort((a, b) => confusion[b] - confusion[a])[0];
  const aiText = topC ? AI_SUGGESTIONS[topC] : responses.lost > 0 ? AI_SUGGESTIONS.default : null;

  return (
    <>
      <div className="app-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="app">

        {screen === "home" && (
          <div className="page">
            <Logo />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="badge-live glass" style={{ alignSelf: "flex-start" }}>
                <span className="badge-dot" /><span className="badge-text">Built for classrooms that move fast</span>
              </div>
              <p className="t-hero" style={{ marginBottom: 20 }}>Silent feedback.<br />Real clarity.</p>
              <p className="t-sub" style={{ maxWidth: 360, marginBottom: 40 }}>
                Students tell you they're lost — without raising their hand. You see the whole class in real time, and AI tells you exactly what to fix.
              </p>
              <div className="role-card glass" onClick={() => go("teacher-setup")} role="button" tabIndex={0}>
                <div className="role-icon icon-t">🎓</div>
                <div><div className="role-title">I'm a teacher</div><div className="role-desc">Start a live session — get a room code instantly</div></div>
              </div>
              <div className="role-card glass" onClick={() => go("student-join")} role="button" tabIndex={0}>
                <div className="role-icon icon-s">📚</div>
                <div><div className="role-title">I'm a student</div><div className="role-desc">Join with a code — respond in 3 seconds, anonymously</div></div>
              </div>
            </div>
            <p className="t-label" style={{ textAlign: "center", marginTop: 28 }}>Anonymous · No account · No app download</p>
          </div>
        )}

        {screen === "teacher-setup" && (
          <div className="page">
            <Logo />
            <button className="btn-ghost" onClick={() => go("home")}>← Back</button>
            <div style={{ marginTop: 24 }}>
              <p className="t-label" style={{ marginBottom: 12 }}>// New session</p>
              <p className="t-lg" style={{ marginBottom: 8 }}>What are you<br />teaching today?</p>
              <p className="t-sub" style={{ marginBottom: 28 }}>You'll get a room code to put on the board. Students connect instantly — no app needed.</p>
              <div className="card glass">
                <p className="t-label" style={{ marginBottom: 10 }}>Topic</p>
                <input className="input" placeholder="e.g. Stoichiometry, The Cold War…" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && startSession()} autoFocus />
                <button className="btn btn-glow" onClick={startSession}>Launch Session →</button>
              </div>
              <div className="card-sm glass">
                <p className="t-label" style={{ marginBottom: 8 }}>How it works</p>
                <p className="t-sub" style={{ fontSize: 13 }}>1. Put the 4-digit room code on the board<br />2. Students tap Got it / Kinda / Lost in 3 seconds<br />3. You see the live breakdown + AI suggestions instantly</p>
              </div>
            </div>
          </div>
        )}

        {screen === "teacher-dashboard" && (
          <div className="page">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <Logo />
              <div className="badge-live glass" style={{ marginBottom: 0 }}>
                <span className="badge-dot" /><span className="badge-text" style={{ fontSize: 11 }}>Live</span>
              </div>
            </div>
            <p className="t-md" style={{ marginBottom: 4 }}>{topic || "Today's lesson"}</p>
            <p className="t-sub" style={{ fontSize: 13, marginBottom: 20 }}>{total} response{total !== 1 ? "s" : ""} so far</p>

            <div className="card glass">
              <p className="t-label" style={{ marginBottom: 8 }}>Room code — put this on the board</p>
              <div className="room-code">{roomCode}</div>
              <p className="t-sub" style={{ textAlign: "center", fontSize: 13 }}>Students go to nudge-beige-ten.vercel.app and enter this code</p>
            </div>

            <div className="card glass">
              <p className="t-label" style={{ marginBottom: 18 }}>Class breakdown</p>
              {[
                { label: "Got it ✓", val: responses.got, fill: "bg", cnt: "cg" },
                { label: "Kinda ~", val: responses.kinda, fill: "ba", cnt: "ca" },
                { label: "Lost ✗", val: responses.lost, fill: "br", cnt: "cr" },
              ].map(({ label, val, fill, cnt }) => (
                <div className="bar-row" key={label}>
                  <div className="bar-head"><span className="bar-lbl">{label}</span><span className={`bar-cnt ${cnt}`}>{val} · {pct(val)}%</span></div>
                  <div className="bar-track"><div className={`bar-fill ${fill}`} style={{ width: `${pct(val)}%` }} /></div>
                </div>
              ))}
            </div>

            {Object.keys(confusion).length > 0 && (
              <div className="card glass">
                <p className="t-label" style={{ marginBottom: 14 }}>What's confusing them</p>
                {Object.entries(confusion).sort(([,a],[,b]) => b - a).map(([k, v]) => (
                  <div className="c-row" key={k}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,.85)" }}>{CONFUSION_LABELS[k] || k}</span>
                    <span className="c-pill">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {aiText && (
              <div className="ai-card">
                <div className="ai-badge">✦ AI Suggestion</div>
                <p className="ai-body">{aiText}</p>
              </div>
            )}

            <div className="card glass">
              <p className="t-label" style={{ marginBottom: 8 }}>Re-check quiz</p>
              <p className="t-sub" style={{ fontSize: 13, marginBottom: 16 }}>Launch a 3-question AI quiz — students answer right inside Nudge, no switching tabs.</p>
              {quiz && quiz.active ? (
                <div>
                  <div className="ai-badge" style={{ marginBottom: 12 }}>✦ Quiz Live</div>
                  {quiz.questions.map((q, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 8 }}>{i + 1}. {q.question}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Answer: {q.answer}</p>
                    </div>
                  ))}
                  <button className="btn btn-outline" onClick={async () => {
                    await supabase.from("sessions").update({ quiz: { ...quiz, active: false } }).eq("id", roomCode);
                    setQuiz(null);
                  }}>End Quiz</button>
                </div>
              ) : (
                <button className="btn btn-glow" onClick={generateQuiz} disabled={quizLoading}>
                  {quizLoading ? "Generating..." : "✦ Generate AI Quiz"}
                </button>
              )}
            </div>

            <button className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }} onClick={() => go("home")}>End session</button>
          </div>
        )}

        {screen === "student-join" && (
          <div className="page">
            <Logo />
            <button className="btn-ghost" onClick={() => go("home")}>← Back</button>
            <div style={{ marginTop: 24 }}>
              <p className="t-label" style={{ marginBottom: 12 }}>// Join session</p>
              <p className="t-lg" style={{ marginBottom: 8 }}>Enter your<br />room code</p>
              <p className="t-sub" style={{ marginBottom: 28 }}>Your teacher put a 4-digit code on the board.</p>
              <div className="card glass">
                <p className="t-label" style={{ marginBottom: 10 }}>Room code</p>
                <input className="input input-code" placeholder="1234" value={codeInput} onChange={e => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))} onKeyDown={e => e.key === "Enter" && codeInput.length >= 4 && joinRoom()} maxLength={4} inputMode="numeric" autoFocus />
                <button className="btn btn-glow" onClick={joinRoom} disabled={codeInput.length < 4}>Join →</button>
              </div>
              <div className="anon-strip glass">🔒 Your response is 100% anonymous</div>
            </div>
          </div>
        )}

        {screen === "student-vote" && (
          <div className="page">
            <Logo />
            <button className="btn-ghost" onClick={() => go("home")}>← Back</button>
            <p className="t-label" style={{ marginBottom: 12 }}>// How's it going?</p>
            <p className="t-lg" style={{ marginBottom: 8 }}>Be honest.</p>
            {topic && <div className="topic-chip">📖 {topic}</div>}
            <p className="t-sub" style={{ marginBottom: 28 }}>Your teacher sees the whole class — not who you are.</p>
            {alreadyVoted ? (
              <div className="card glass" style={{ textAlign: "center", padding: 32 }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>✓</p>
                <p className="t-md" style={{ marginBottom: 8 }}>Already responded</p>
                <p className="t-sub" style={{ fontSize: 13 }}>You've already submitted a response for this session.</p>
              </div>
            ) : (
              <>
                <button className="vote-btn v-got" onClick={() => vote("got")}>
                  <span className="v-emoji">✓</span><span className="v-label">Got it</span><span className="v-sub">Fully following along</span>
                </button>
                <button className="vote-btn v-kinda" onClick={() => vote("kinda")}>
                  <span className="v-emoji">〜</span><span className="v-label">Kinda</span><span className="v-sub">Getting it but a little fuzzy</span>
                </button>
                <button className="vote-btn v-lost" onClick={() => vote("lost")}>
                  <span className="v-emoji">✗</span><span className="v-label">Lost</span><span className="v-sub">Not following — need help</span>
                </button>
                <p className="t-label" style={{ textAlign: "center", marginTop: 8 }}>Anonymous · One response per session</p>
              </>
            )}
          </div>
        )}

        {screen === "student-followup" && (
          <div className="page">
            <Logo />
            <button className="btn-ghost" onClick={() => go("student-vote")}>← Back</button>
            <p className="t-label" style={{ marginBottom: 12 }}>// One more thing</p>
            <p className="t-lg" style={{ marginBottom: 8 }}>What's<br />confusing you?</p>
            <p className="t-sub" style={{ marginBottom: 24 }}>Still anonymous. Helps your teacher fix the right thing.</p>
            {[
              { key: "vocabulary", icon: "📖", title: "The vocabulary or terms", sub: "I don't know what the words mean" },
              { key: "example", icon: "💡", title: "The example didn't click", sub: "I get the idea but not how it applies" },
              { key: "missed", icon: "⏪", title: "I missed something earlier", sub: "Lost from a few steps back" },
              { key: "pace", icon: "⚡", title: "Going too fast", sub: "Need more time to absorb this" },
            ].map(({ key, icon, title, sub }) => (
              <div className="fup" key={key} onClick={() => submitConfusion(key)} role="button" tabIndex={0}>
                <span className="fup-icon">{icon}</span>
                <div><div className="fup-title">{title}</div><div className="fup-sub">{sub}</div></div>
              </div>
            ))}
            <div className="fup" onClick={() => setOtherOpen(o => !o)} role="button" tabIndex={0}>
              <span className="fup-icon">💬</span>
              <div><div className="fup-title">Other — tell us in your own words</div><div className="fup-sub">Tap to write what's confusing you</div></div>
            </div>
            {otherOpen && (
              <div style={{ marginTop: 4, marginBottom: 16 }}>
                <textarea className="input textarea" placeholder="What's confusing you? (still anonymous)" value={otherText} onChange={e => setOtherText(e.target.value)} autoFocus />
                <button className="btn btn-glow" onClick={() => submitConfusion("other")}>Send →</button>
              </div>
            )}
          </div>
        )}

        {screen === "student-quiz" && quiz && (
          <div className="page">
            <Logo />
            <p className="t-label" style={{ marginBottom: 12 }}>// Re-check quiz</p>
            <p className="t-lg" style={{ marginBottom: 8 }}>Quick check.</p>
            {topic && <div className="topic-chip">📖 {topic}</div>}
            <p className="t-sub" style={{ marginBottom: 24 }}>3 questions — pick the best answer for each.</p>
            {!quizSubmitted ? (
              <>
                {quiz.questions.map((q, i) => (
                  <div className="card glass" key={i} style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "#fff", marginBottom: 14 }}>{i + 1}. {q.question}</p>
                    {q.options.map((opt, j) => (
                      <div key={j} onClick={() => setQuizAnswers(a => ({ ...a, [i]: opt[0] }))}
                        style={{
                          padding: "12px 16px", borderRadius: 12, marginBottom: 8, cursor: "pointer",
                          border: quizAnswers[i] === opt[0] ? "1px solid rgba(168,85,247,.6)" : "1px solid rgba(255,255,255,.08)",
                          background: quizAnswers[i] === opt[0] ? "rgba(168,85,247,.15)" : "rgba(255,255,255,.03)",
                          fontSize: 14, color: "#fff", transition: "all .15s"
                        }}>
                        {opt}
                      </div>
                    ))}
                  </div>
                ))}
                <button className="btn btn-glow" onClick={submitQuizAnswers} disabled={Object.keys(quizAnswers).length < quiz.questions.length}>
                  Submit answers →
                </button>
              </>
            ) : (
              <div className="success-wrap">
                <div className="success-orb" style={{ fontSize: 32 }}>{quizResults.score}/{quizResults.total}</div>
                <p className="t-lg" style={{ marginBottom: 12 }}>
                  {quizResults.score === quizResults.total ? "Perfect!" : quizResults.score >= 2 ? "Almost there!" : "Keep going!"}
                </p>
                <p className="t-sub" style={{ maxWidth: 300 }}>You got {quizResults.score} out of {quizResults.total} correct.</p>
                <button className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 32 }} onClick={() => go("student-done")}>
                  Back
                </button>
              </div>
            )}
          </div>
        )}

        {screen === "student-done" && (
          <div className="page">
            <div className="success-wrap">
              <div className="success-orb">✓</div>
              <p className="t-lg" style={{ marginBottom: 12 }}>Response sent.</p>
              <p className="t-sub" style={{ maxWidth: 300 }}>Your teacher sees the class breakdown right now. They don't know it was you.</p>
              <div className="anon-strip glass">🔒 You're anonymous</div>
              <div style={{ marginTop: 32, width: "100%", maxWidth: 340 }}>
                <button className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }} onClick={() => go("home")}>Back to home</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}