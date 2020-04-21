const { ipcMain, app, BrowserWindow, screen } = require('electron')

// store twitch url key
const TWITCH_URL = 'twitch_url'

// reuse the render process
app.allowRendererProcessReuse = true

// auto play twitch lives
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

// initialize
const init = store => {
  // event handling
  ipcMain.on('getLastTwitchUrl', event => {
    event.returnValue = store.get(TWITCH_URL, '')
  })
  ipcMain.on('setLastTwitchUrl', (_event, arg) => {
    store.set(TWITCH_URL, arg)
  })
}

let twitchWindow = null
const startTwitchOnTop = () => {
  if (!twitchWindow || twitchWindow.isDestroyed()) {
    // if no browser window, create it
    twitchWindow = new BrowserWindow({
      title: 'Twitch On Top',
      icon: './img/icon.ico',
      skipTaskbar: true,
      alwaysOnTop: true,
      //autoHideMenuBar: true,
      frame: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      },
      width: 1076,
      height: 438
    })

    // move it in the bottom right
    twitchWindow.setPosition(screen.getPrimaryDisplay().size.width - 1076, screen.getPrimaryDisplay().size.height - 438 - 50)
    // load the player
    twitchWindow.loadFile('./src/twitch-on-top/twitch.html')

    // when ready to show, show the window
    twitchWindow.on('ready-to-show', () => {
      twitchWindow.show()
    })

    // give focus events
    twitchWindow.on('focus', () => twitchWindow.webContents.send('focus', true))
    twitchWindow.on('blur', () => twitchWindow.webContents.send('focus', false))
  } else {
    // else show the damn window
    twitchWindow.show()
  }
}

module.exports = {
  trayItem: { label: 'Open Twitch On Top', click: () => startTwitchOnTop() }, // the item for the tray
  init: init
}
