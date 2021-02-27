const path = require('path')
const eventNames = require('./event-names')
const { BrowserWindow, screen } = require('electron')

const POMODORO_LABEL = 'Pomodoro Timer'
const POMODORO_WIDTH = 470
const POMODORO_HEIGHT = 300
const POMODORO_MARGIN = 10

const WORK_TIMER_DURATION = 25 // min
const PAUSE_TIMER_DURATION = 5 // min
const BIG_PAUSE_TIMER_DURATION = 15 // min

let countdownInterval
let isPaused = false
let countdownValue
let currentPeriod = ''

let workTimer
let pauseTimer

let pomodoroSession = 0

let pomodoroBw = null

const clearTimer = () => {
  // we clean everything
  clearTimeout(workTimer)
  clearTimeout(pauseTimer)
  clearInterval(countdownInterval)
}

const sendEvent = (eventName, value = null) => {
  if (pomodoroBw && !pomodoroBw.isDestroyed()) pomodoroBw.webContents.send(eventName, value)
}

const setupCountdown = duration => {
  // clear interval
  clearInterval(countdownInterval)

  // start countdown timer
  countdownValue = duration * 60 // seconds
  countdownInterval = setInterval(() => {
    if (!isPaused) {
      countdownValue = Math.max(0, countdownValue - 1)
      sendEvent(eventNames.COUNTDOWN_EVENT, {
        countdown: countdownValue,
        period: currentPeriod
      })
    }
  }, 1000)
}

const startTimer = () => {
  // increase number session of timer
  pomodoroSession += 1

  // we clean everything
  clearTimer()

  // send work event
  currentPeriod = 'Work'
  sendEvent(eventNames.WORK_EVENT)

  // start countdown work timer
  setupCountdown(WORK_TIMER_DURATION)

  // start work timer
  workTimer = setTimeout(() => {
    // send pause event
    currentPeriod = pomodoroSession % 4 === 0 ? 'Big pause' : 'Pause'
    sendEvent(pomodoroSession % 4 === 0 ? eventNames.BIG_PAUSE_EVENT : eventNames.PAUSE_EVENT)

    // start pause
    pauseTimer = setTimeout(() => {
      // hide window and start
      pomodoroBw.hide()

      // restart
      startTimer()
    }, (pomodoroSession % 4 === 0 ? BIG_PAUSE_TIMER_DURATION : PAUSE_TIMER_DURATION) * 60 * 1000) // big pause on fourth session
  }, WORK_TIMER_DURATION * 60 * 1000)
}

const createWindow = () => {
  // create new window
  pomodoroBw = new BrowserWindow({
    title: 'Pomodoro Timer',
    // frame: false,
    resizable: false,
    height: POMODORO_HEIGHT,
    width: POMODORO_WIDTH,
    movable: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    },
    autoHideMenuBar: true
  })

  // change position
  const bounds = screen.getPrimaryDisplay().bounds
  pomodoroBw.setPosition(bounds.x + bounds.width - POMODORO_WIDTH - POMODORO_MARGIN, bounds.y + bounds.height - POMODORO_HEIGHT - POMODORO_MARGIN - 50)

  // load the timer
  pomodoroBw.loadFile(path.join(__dirname, '/pomodoro.html').toString())

  pomodoroBw.on('start-timer', () => {
    console.log('start timer')
    startTimer()
  })
  pomodoroBw.on('pause-timer', () => { isPaused = true })
  pomodoroBw.on('resume-timer', () => { console.log('Resume Timer') })
  pomodoroBw.on('stop-timer', () => {
    console.log('Stop timer')
    clearTimer()
  })

  // show when ready
  pomodoroBw.on('ready-to-show', () => {
    pomodoroBw.show()

    // start timer
    startTimer()
  })

  pomodoroBw.on('closed', clearTimer)
}

const openPomodoro = () => {
  if (!pomodoroBw || pomodoroBw.isDestroyed()) createWindow()
  else {
    pomodoroBw.show()
  }
}

let menuItem = {
  label: POMODORO_LABEL,
  click: openPomodoro
}

module.exports = {
  trayItem: menuItem
}
