const timer = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    longBreakInterval: 4,
    sessions: 0,
    remainingTime: {},
    totalFocusTime: 0, // in seconds
    milestones: {
      3600: '1 Hour Achieved!',
      10800: '3 Hours Achieved!',
      21600: '6 Hours Achieved!',
    },
    achievementsReached: {} // Track milestones reached
  };
  
  let interval;
  const buttonSound = new Audio('button-sound.mp3');
  const mainButton = document.getElementById('js-btn');
  
  // Event listener for the main button
  mainButton.addEventListener('click', () => {
    buttonSound.play();
    if (mainButton.dataset.action === 'start') {
      startTimer();
    } else {
      stopTimer();
    }
  });
  
  // Event listener for mode buttons
  document.querySelector('#js-mode-buttons').addEventListener('click', handleMode);
  
  // Function to get remaining time
  function getRemainingTime(endTime) {
    const currentTime = Date.now();
    const difference = endTime - currentTime;
  
    return {
      total: Math.max(0, Math.floor(difference / 1000)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }
  
  // Function to start the timer
  function startTimer() {
    const endTime = Date.now() + timer.remainingTime.total * 1000;
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'Stop';
    mainButton.classList.add('active');
  
    interval = setInterval(() => {
      timer.remainingTime = getRemainingTime(endTime);
      updateClock();
  
      if (timer.remainingTime.total <= 0) {
        clearInterval(interval);
        handleTimerEnd();
      }
    }, 1000);
  }
  
  // Function to stop the timer
  function stopTimer() {
    clearInterval(interval);
    mainButton.dataset.action = 'start';
    mainButton.textContent = 'Start';
    mainButton.classList.remove('active');
  }
  
  // Function to update the clock display
  function updateClock() {
    const minutes = `${timer.remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${timer.remainingTime.seconds}`.padStart(2, '0');
  
    document.getElementById('js-minutes').textContent = minutes;
    document.getElementById('js-seconds').textContent = seconds;
    document.title = `${minutes}:${seconds} — ${timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!'}`;
    
    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
  }
  
  // Function to switch the mode
  function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
      total: timer[mode],
      minutes: Math.floor(timer[mode] / 60),
      seconds: timer[mode] % 60
    };
  
    document.querySelectorAll('button[data-mode]').forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document.getElementById('js-progress').setAttribute('max', timer.remainingTime.total);
  
    updateClock();
  }
  
  // Function to handle mode button clicks
  function handleMode(event) {
    const { mode } = event.target.dataset;
    if (mode) {
      switchMode(mode);
      stopTimer();
    }
  }
  
  // Function to handle the end of a Pomodoro session
  function endPomodoro() {
    timer.totalFocusTime += timer.pomodoro;
    checkMilestones(timer.totalFocusTime);
  }
  
  // Function to check milestones and display achievements
  function checkMilestones(totalFocusTime) {
    for (const [milestoneTime, achievement] of Object.entries(timer.milestones)) {
      if (totalFocusTime >= milestoneTime && !timer.achievementsReached[milestoneTime]) {
        timer.achievementsReached[milestoneTime] = true;
        // Display achievement here
      }
    }
  }
  
  // Function to handle the end of a timer session
  function handleTimerEnd() {
    if (timer.mode === 'pomodoro') {
      endPomodoro();
      timer.sessions++;
      if (timer.sessions % timer.longBreakInterval === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('pomodoro');
    }
  
    if (Notification.permission === 'granted') {
      const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
      new Notification(text);
    }
  }
  
  // Settings panel functionality
  document.getElementById('settings-button').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.remove('hidden');
  });
  
  document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.add('hidden');
  });
  
  document.getElementById('save-settings').addEventListener('click', () => {
    timer.pomodoro = parseInt(document.getElementById('pomodoro-duration').value, 10) * 60;
    timer.shortBreak = parseInt(document.getElementById('short-break-duration').value, 10) * 60;
    timer.longBreak = parseInt(document.getElementById('long-break-duration').value, 10) * 60;
    timer.longBreakInterval = parseInt(document.getElementById('long-break-interval').value, 10);
  
    if (timer.mode) {
      switchMode(timer.mode);
    }
  
    document.getElementById('settings-panel').classList.add('hidden');
  });
  
  // Initial setup
  document.addEventListener('DOMContentLoaded', () => {
    switchMode('pomodoro');
    document.getElementById('js-progress').max = timer.pomodoro;
  });
