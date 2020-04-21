const { app, ipcMain } = require('electron')
const Store = require('electron-store')
const autoLaunch = require('./src/autolaunch')
const monitorChange = require('./src/monitor-change')
const tray = require('./src/tray')
const twitch = require('./src/twitch-on-top')
const colorpicker = require('./src/colorpicker')
const mss = require('./src/minecraft-server-status')

autoLaunch('Therolf Utility') // set autolaunch name
const store = new Store() // init store
twitch.init(store) // init event handling for twitch
mss.setStore(store) // adding store to the mss

mss.setServerIP('minecraftutbm.fr:10154') // setting server url

app.on('ready', () => {
  monitorChange.init(store) // init store for monitor change

  tray.items.push(monitorChange.trayItem) // adds the monitor item
  tray.items.push(twitch.trayItem) // adds the twitch on top item
  tray.items.push(colorpicker.trayItem) // adds colorpicker tray item
  tray.items.push(mss.trayItem) // adds minecraft server status item
  tray.onReady() // starts the tray

  mss.listen() // VERY IMPORTANT : listens to the api
})

// prevent app from closing when browserwindow closes
app.on('window-all-closed', e => e.preventDefault())
