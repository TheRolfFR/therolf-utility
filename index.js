const { app } = require('electron')
const Store = require('electron-store')
const autoLaunch = require('./src/autolaunch')
const monitorChange = require('./src/monitor-change')
const tray = require('./src/tray')
const twitch = require('./src/twitch-on-top')
const colorpicker = require('./src/colorpicker')

autoLaunch('Therolf Utility') // set autolaunch name
const store = new Store() // init store
twitch.init(store) // init event handling for twitch

app.on('ready', () => {
  monitorChange.init(store) // init store for monitor change

  tray.items.push(monitorChange.trayItem) // adds the monitor item
  tray.items.push(twitch.trayItem) // adds the twitch on top item
  tray.items.push(colorpicker.trayItem) // adds colorpicker tray item
  tray.onReady() // starts the tray
})

// prevent app from closing when browserwindow closes
app.on('window-all-closed', e => e.preventDefault())
