const { app } = require('electron')
const Store = require('electron-store')
const autoLaunch = require('./src/autolaunch')
const monitorChange = require('./src/monitor-change')
const trayModule = require('./src/tray')
const twitch = require('./src/twitch-on-top')
const colorpicker = require('./src/colorpicker')
const mss = require('./src/minecraft-server-status')
// const pomodoro = require('./src/pomodoro-timer')
const express = require('./src/deezer-rpc/server')

// limit to single instance because big errors else
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, open the tray menu
    if (trayModule.isReady()) {
      trayModule._tray.popUpContextMenu()
    }
  })
}

autoLaunch.start('Therolf Utility') // set autolaunch name

const store = new Store() // init store
monitorChange.setStore(store) // setting store for monitor change
twitch.init(store) // init event handling for twitch
mss.setStore(store) // adding store to the mss

app.on('ready', () => {
  mss.onReady() // iinit store value for mss
  monitorChange.onReady() // init store for monitor change

  trayModule.items.push(autoLaunch.trayItem) // adds the auto launch checkbox option
  trayModule.items.push(monitorChange.trayItem) // adds the monitor item
  trayModule.items.push(twitch.trayItem) // adds the twitch on top item
  trayModule.items.push(colorpicker.trayItem) // adds colorpicker tray item
  trayModule.items.push(mss.muteTrayItem) // adds minecraft server status checkbox mute item
  trayModule.items.push(mss.trayItem) // adds minecraft server status item
  // tray.items.push(pomodoro.trayItem) // adds pomodoro timer item
  trayModule.onReady() // starts the tray

  mss.listen() // VERY IMPORTANT : listens to the api
})

// prevent app from closing when browserwindow closes
app.on('window-all-closed', e => e.preventDefault())

app.on('quit', () => {
  express.client.destroy()
  express.server.close()
})
