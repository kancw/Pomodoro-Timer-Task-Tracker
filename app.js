// ===== State =====
const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

let state = {
  mode: 'pomodoro',
  timeLeft: MODES.pomodoro,
  running: false,
  intervalId: null,
  sessionCount: 1,
  sessionDots: [false, false, false, false], // true = completed
  tasks: loadTasks(),
  filter: 'all',
};

// ===== DOM References =====
const timerEl       = document.getElementById('timer');
const startStopBtn  = document.getElementById('startStopBtn');
const resetBtn      = document.getElementById('resetBtn');
const sessionCount  = document.getElementById('sessionCount');
const sessionDotsEl = document.querySelector('.session-info span:last-child');
const modeBtns      = document.querySelectorAll('.mode-btn');
const taskForm      = document.getElementById('taskForm');
const taskInput     = document.getElementById('taskInput');
const taskListEl    = document.getElementById('taskList');
const taskCountEl   = document.getElementById('taskCount');
const clearBtn      = document.getElementById('clearCompleted');
const filterBtns    = document.querySelectorAll('.filter-btn');

// ===== Timer Logic =====
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(state.timeLeft);
  document.title = `${formatTime(state.timeLeft)} — Pomodoro`;
}

function tick() {
  if (state.timeLeft > 0) {
    state.timeLeft--;
    updateTimerDisplay();
  } else {
    finishSession();
  }
}

function startTimer() {
  if (state.running) return;
  state.running = true;
  state.intervalId = setInterval(tick, 1000);
  startStopBtn.textContent = 'Pause';
}

function pauseTimer() {
  if (!state.running) return;
  state.running = false;
  clearInterval(state.intervalId);
  startStopBtn.textContent = 'Resume';
}

function resetTimer() {
  pauseTimer();
  state.timeLeft = MODES[state.mode];
  startStopBtn.textContent = 'Start';
  updateTimerDisplay();
}

function finishSession() {
  clearInterval(state.intervalId);
  state.running = false;
  playAlarm();

  if (state.mode === 'pomodoro') {
    // Mark current session dot as complete
    const idx = (state.sessionCount - 1) % 4;
    state.sessionDots[idx] = true;
    updateSessionDots();

    // Increment pomodoros on active task
    incrementActiveTaskPomodoro();

    if (state.sessionCount % 4 === 0) {
      switchMode('long', true);
      showNotification('Great work! Take a long break.');
    } else {
      switchMode('short', true);
      showNotification('Pomodoro done! Take a short break.');
    }

    state.sessionCount++;
    sessionCount.textContent = state.sessionCount;
  } else {
    switchMode('pomodoro', true);
    showNotification('Break over! Back to work.');
  }

  // Auto-start the next session
  startTimer();
}

function updateSessionDots() {
  const dots = state.sessionDots.map(d => d ? '&#9679;' : '&#9675;').join(' ');
  sessionDotsEl.innerHTML = dots;
}

// ===== Mode Switching =====
// autoSwitch: true when called internally after a session ends (don't stop the timer)
function switchMode(mode, autoSwitch = false) {
  state.mode = mode;
  state.timeLeft = MODES[mode];
  if (!autoSwitch) {
    // Manual tab click — stop any running timer
    state.running = false;
    clearInterval(state.intervalId);
    startStopBtn.textContent = 'Start';
  }

  // Update active tab
  modeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Update body class for color theme
  document.body.className = mode === 'pomodoro' ? '' : `mode-${mode}`;

  updateTimerDisplay();
}

// ===== Event: Timer Buttons =====
startStopBtn.addEventListener('click', () => {
  if (state.running) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// ===== Task Logic =====
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('pomodoroTasks')) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem('pomodoroTasks', JSON.stringify(state.tasks));
}

function addTask(text) {
  const task = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    pomodoros: 0,
    active: false,
  };
  state.tasks.unshift(task);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) task.active = false;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function setActiveTask(id) {
  state.tasks.forEach(t => { t.active = t.id === id && !t.completed; });
  saveTasks();
  renderTasks();
}

function incrementActiveTaskPomodoro() {
  const active = state.tasks.find(t => t.active && !t.completed);
  if (active) {
    active.pomodoros++;
    saveTasks();
    renderTasks();
  }
}

function clearCompleted() {
  state.tasks = state.tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

function getFilteredTasks() {
  switch (state.filter) {
    case 'active':    return state.tasks.filter(t => !t.completed);
    case 'completed': return state.tasks.filter(t => t.completed);
    default:          return state.tasks;
  }
}

function renderTasks() {
  const filtered = getFilteredTasks();
  taskListEl.innerHTML = '';

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}${task.active ? ' active-task' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'task-checkbox';
    cb.checked = task.completed;
    cb.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
    cb.addEventListener('change', () => toggleTask(task.id));

    // Text
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    span.title = 'Click to set as active task';
    if (!task.completed) {
      span.style.cursor = 'pointer';
      span.addEventListener('click', () => setActiveTask(task.id));
    }

    // Pomodoro count
    const pom = document.createElement('span');
    pom.className = 'task-pomodoros';
    pom.title = 'Pomodoros completed for this task';
    pom.innerHTML = task.pomodoros > 0
      ? `&#127813; &times;${task.pomodoros}`
      : '';

    // Active indicator
    if (task.active) {
      const badge = document.createElement('span');
      badge.style.cssText = 'font-size:0.72rem;background:var(--accent);color:#fff;border-radius:4px;padding:1px 6px;font-weight:700;';
      badge.textContent = 'Active';
      pom.prepend(badge, ' ');
    }

    // Delete button
    const del = document.createElement('button');
    del.className = 'task-delete';
    del.innerHTML = '&#10005;';
    del.setAttribute('aria-label', `Delete task: ${task.text}`);
    del.addEventListener('click', () => deleteTask(task.id));

    li.append(cb, span, pom, del);
    taskListEl.appendChild(li);
  });

  // Update task count
  const remaining = state.tasks.filter(t => !t.completed).length;
  taskCountEl.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
}

// ===== Event: Task Form =====
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    addTask(text);
    taskInput.value = '';
  }
});

clearBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

// ===== Alarm =====
function playAlarm() {
  // Use Web Audio API to generate a simple beep — no external file needed
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    beep(880, 0,    0.18);
    beep(880, 0.22, 0.18);
    beep(1100, 0.44, 0.3);
  } catch (e) {
    // Silently ignore if audio is not available
  }
}

// ===== Notification Toast =====
function showNotification(message) {
  let toast = document.querySelector('.notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== Init =====
updateTimerDisplay();
updateSessionDots();
renderTasks();
