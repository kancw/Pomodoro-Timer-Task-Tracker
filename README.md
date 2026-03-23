# Pomodoro Timer & Task Tracker

A clean, dark-themed productivity app built with plain HTML, CSS, and JavaScript. No frameworks, no build step — just open `index.html` in a browser and go.

---

## How the Timer Works

The app follows the classic **Pomodoro Technique**:

1. Pick a task, press **Start**, and work for **25 minutes** (one Pomodoro).
2. When the timer ends, an alarm sounds and it automatically switches to a **Short Break (5 min)**.
3. Press **Start** again to begin your break.
4. After the break ends, it switches back to a **Pomodoro**.
5. After completing **4 Pomodoros**, you earn a **Long Break (15 min)** instead of a short one.
6. After the long break, the cycle resets and starts again.

> The timer **auto-switches** modes when time is up, but **does not auto-start** — you always press Start yourself.

### Session Flow

```
Pomodoro (25min)
    ↓ done
Short Break (5min)
    ↓ done
Pomodoro (25min)
    ↓ done
Short Break (5min)
    ↓ done
Pomodoro (25min)
    ↓ done
Short Break (5min)
    ↓ done
Pomodoro (25min)  ← 4th Pomodoro
    ↓ done
Long Break (15min)
    ↓ done
Pomodoro (25min)  ← cycle repeats
```

The **4 dots** below the timer fill in as you complete each Pomodoro in a set.

---

## Features

### Timer
- 3 modes: **Pomodoro** (25 min), **Short Break** (5 min), **Long Break** (15 min)
- Start / Pause / Resume / Reset controls
- Auto-switches mode when the timer ends
- Session dot tracker — 4 dots represent one full set
- Browser tab title updates with the live countdown
- Web Audio API beep alarm (no external files needed)

### Task Tracker
- Add tasks and press Enter or click **Add**
- Click a task's name to mark it as the **Active** task
- The active task automatically gets a 🍅 Pomodoro count each time a Pomodoro finishes
- Check tasks off as complete (with strikethrough)
- Delete individual tasks with ✕
- Filter tasks: **All / Active / Completed**
- **Clear Completed** removes all finished tasks at once
- Tasks are saved in `localStorage` and persist across page refreshes

### UI
- Dark theme with accent color that changes per mode (red / green / blue)
- Toast notification at the end of each session
- Smooth animations and custom styled checkboxes

---

## Getting Started

No installation or build required.
visit link: https://kancw.github.io/Pomodoro-Timer-Task-Tracker/
Or
1. Clone or download this repository.
2. Open `index.html` in any modern browser.

```bash
# Or open directly from the terminal (Windows)
start index.html
```


---

## File Structure

```
├── index.html   # App structure
├── style.css    # Styles and theme
├── app.js       # All timer and task logic
└── README.md
```
