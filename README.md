# Nudge 🔔

> Silent, anonymous classroom feedback — in 3 seconds.

Students tell you they're lost without raising their hand. You see a live breakdown of the whole class, plus AI suggestions for what to do about it.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm start

# 3. Open http://localhost:3000
```

## How It Works

**Teacher flow**
1. Click "I'm a teacher" → enter your topic
2. A 4-digit room code is generated — put it on the board
3. Watch the live dashboard update as students respond
4. The AI suggestion panel tells you what to do based on the confusion type

**Student flow**
1. Click "I'm a student" → enter the room code
2. Tap one of three buttons: **Got it**, **Kinda**, or **Lost**
3. If Lost → one follow-up question (what's confusing you?)
4. Done. Anonymous. 3 seconds total.

## Tech Stack

- React 18
- CSS custom properties (no CSS framework)
- Google Fonts: Montserrat (display) + DM Sans (body)
- Zero external UI dependencies

## Color Palette

| Role | Hex |
|------|-----|
| Primary indigo | `#4338CA` |
| Success green | `#059669` |
| Warning amber | `#D97706` |
| Danger red | `#DC2626` |
| Background | `#F9FAFB` |

## File Structure

```
src/
  App.jsx              — routing & shared state
  App.css              — all styles + design tokens
  components/
    Home.jsx           — role picker
    TeacherSetup.jsx   — session config
    TeacherDashboard.jsx — live results + AI
    StudentJoin.jsx    — room code entry
    StudentVote.jsx    — Got it / Kinda / Lost
    StudentFollowUp.jsx — confusion follow-up
    StudentDone.jsx    — confirmation
```

---

Built for Creator Colosseum Startup Competition 2026.
