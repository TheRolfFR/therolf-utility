const { ipcMain, app, BrowserWindow, screen } = require('electron')
const { join } = require('path')
const urlExists = require('url-exists')

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

console.log(__dirname)

let twitchWindow = null
const startTwitchOnTop = () => {
  if (!twitchWindow || twitchWindow.isDestroyed()) {
    // if no browser window, create it
    twitchWindow = new BrowserWindow({
      title: 'Twitch On Top',
      icon: join(__dirname, '../img/icon.ico'),
      skipTaskbar: false,
      alwaysOnTop: true,
      // autoHideMenuBar: true,
      frame: false,
      show: false,
      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: false,
        nodeIntegration: false,
        preload: join(__dirname, 'preload.js'),
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

    ipcMain.handle('minimize', () => {
      console.log('minimize')
      if (twitchWindow) {
        twitchWindow.minimize()
      }
    })

    ipcMain.handle('close', () => {
      if (twitchWindow) {
        twitchWindow.close()
      }
    })

    ipcMain.on('urlexists', (_event, url) => {
      urlExists(url, (err, exists) => {
        twitchWindow.webContents.send('urlexistsresponse', {
          err: err,
          exists: exists
        })
      })
    })

    // open dev tools
    //twitchWindow.webContents.openDevTools()

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
