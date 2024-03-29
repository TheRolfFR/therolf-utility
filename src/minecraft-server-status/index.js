const { BrowserWindow, Notification, ipcMain, screen, nativeImage } = require('electron')
const mssapi = require('./mss.api')
const mssstore = require('./mss.store')
const { LogTable } = require('./mss.api.log')
const path = require('path')

const WIDTH = 330
const HEIGHT = 600

const MSS_NOTIFICATIONS_ENABLED_LABEL = 'Enable MSS notifications'

let bw = null

let initNotifOn = false

// create log table
const logTable = new LogTable()

const events = mssapi.events

let _icon = './src/img/icon.ico'
// more infos here : https://www.electronjs.org/docs/api/native-image#nativeimagecreatefrombufferbuffer-options
const downloadIcon = () => {
  mssapi.getIcon().then(result => {
    _icon = nativeImage.createFromBuffer(result, { width: 46, height: 64 })
  })
}

// More infos at https://www.electronjs.org/docs/api/notification
const sendNotification = message => {
  if (mssstore.areNotificationsOn()) {
    const notif = {
      title: 'Minecraft Server Status',
      subtitle: mssapi.getServerIP(), // MacOS only
      body: message,
      icon: _icon,
      silent: true // no sound
    }
    const n = new Notification(notif)
    n.show()

    // open window on notification
    n.on('click', () => {
      if (bw && !bw.isDestroyed()) openMSSWindow()
    })
  }
}

// send infos to the window when asked
ipcMain.on('requestInfos', (event, arg) => {
  if (arg !== undefined) {
    mssstore.setServerIP(arg)
  }

  mssapi.setServerIP(mssstore.getServerIP())
  mssapi.update()

  if (bw && !bw.isDestroyed()) {
    const data = {
      ip: mssapi.getServerIP(),
      status: mssapi.isServerOnline(),
      players: mssapi.getPlayerList(),
      motd: mssapi.getMotd(),
      max: mssapi.getMax(),
      modded: mssapi.isModded(),
      mods: mssapi.getMods()
    }
    bw.webContents.send('getInfos', data)
  }
})

ipcMain.on('requestTrackingList', () => {
  if (bw && !bw.isDestroyed()) {
    bw.webContents.send('getTrackingList', mssstore.getTrackingList())
  }
})

// general mss window action event handler
ipcMain.on('mss:action', (_event, action) => {
  if (bw && !bw.isDestroyed()) {
    switch (action) {
      case 'close':
        bw.close()
        break
      case 'minimize':
        bw.minimize()
        break
      default:
        break
    }
  }
})

// tracking toggle event handling
ipcMain.on('togglePlayerTrack', (event, pseudo) => {
  const isInList = mssstore.toggleTracking(pseudo) // not my business, see msstore code

  const message = pseudo + (isInList ? ' added to' : ' removed from') + ' the tracking list'
  sendNotification(message) // notify the user of the toggle
  if (bw && !bw.isDestroyed()) {
    bw.webContents.send('getTrackingList', mssstore.getTrackingList())
  }
})

const openMSSWindow = () => {
  if (!bw || bw.isDestroyed()) {
    bw = new BrowserWindow({
      title: 'Minecraft Server Status',
      icon: './img/icon.ico',
      resizable: false,
      width: WIDTH,
      autoHideMenuBar: true,
      height: HEIGHT,
      frame: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true
      }
    })

    // moving the window
    bw.setPosition(screen.getPrimaryDisplay().size.width - WIDTH - 10, screen.getPrimaryDisplay().size.height - HEIGHT - 50)

    bw.loadFile(path.join(__dirname, '/mss.index.html'))

    // bw.webContents.openDevTools() // open devtools

    bw.on('ready-to-show', () => {
      bw.show()
    })
  } else {
    // get focus
    bw.unmaximize()
    bw.show()
    bw.focus()
  }
}

events.on('server-online', () => {
  sendNotification('Server went online') // notify user
})

events.on('server-offline', () => {
  sendNotification('Server went offline') // notify user
})

events.on('players-list-loggedin', players => {
  const trackingList = mssstore.getTrackingList()

  players.forEach(newPlayerConnected => {
    if (trackingList.includes(newPlayerConnected)) {
      logTable.updateEntry(newPlayerConnected, true, () => {
        sendNotification(newPlayerConnected + ' just logged in') // notify the user of tracked players
      })
    }
  })
})

events.on('players-list-disconnected', players => {
  const trackingList = mssstore.getTrackingList()

  players.forEach(newPlayerConnected => {
    if (trackingList.includes(newPlayerConnected)) {
      logTable.updateEntry(newPlayerConnected, false, () => {
        sendNotification(newPlayerConnected + ' just logged out') // notify the user of tracked players
      })
    }
  })
})

module.exports = {
  onReady: function () {
    mssapi.setServerIP(mssstore.getServerIP())
    mssapi.update()
  },
  setStore: function (store) {
    mssstore.setStore(store)
    initNotifOn = mssstore.areNotificationsOn()
  },
  setServerIP: function (serverUrl) {
    mssapi.setServerIP(serverUrl)
    downloadIcon()
  },
  listen: function () {
    mssapi.listen()
  },
  trayItem: {
    label: 'Open Minecraft Server Status',
    click: () => openMSSWindow()
  },
  muteTrayItem: {
    label: MSS_NOTIFICATIONS_ENABLED_LABEL,
    type: 'checkbox',
    checked: initNotifOn,
    click: () => mssstore.toggleNotifications(MSS_NOTIFICATIONS_ENABLED_LABEL)
  }
}
