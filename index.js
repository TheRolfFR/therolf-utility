const { app, BrowserWindow, screen, Menu, Tray, dialog, ipcMain } = require('electron')
const AutoLaunch = require('auto-launch')
const Store = require('electron-store')
const { exec } = require("child_process")
const path = require('path')

let win

const store = new Store()

const TRANSLUCENT_TASKBAR = 'tb'
const TWITCH_URL = 'twitch_url'

const getPath = () => { return store.get(TRANSLUCENT_TASKBAR, undefined) }

let tray = null
let twitchWindow = null
app.allowRendererProcessReuse = true
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required") 
app.on('ready', () => {
  let autoLaunch = new AutoLaunch({
    name: 'Therolf Utility',
    path: app.getPath('exe'),
  })

  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable()
  })

  const onMonitorChange = () => {
    const path = '"' + getPath() + '"'
    if(path) {
      exec(path, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        // console.log(`stdout: ${stdout}`)
    })
    }
    console.log("display changed")
  }

  const getTranslucentTaskBarPath = () => {
    let p = getPath()
    p = (p) ? path.dirname(p) : p

    dialog.showOpenDialog(undefined, {
      title: 'Select Tanslucent Taskbar location',
      defaultPath : p
    }).then((result) => {
      if(!result.canceled && 'filePaths' in result && result.filePaths.length > 0) {
        console.log(result.filePaths[0])
        store.set(TRANSLUCENT_TASKBAR, result.filePaths[0])
      }
    })
  }

  const startTwitchOnTop = () => {
    if(twitchWindow === null || twitchWindow.isDestroyed()) {
      twitchWindow = new BrowserWindow({
        title: "Twitch On Top",
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
      twitchWindow.setPosition(screen.getPrimaryDisplay().size.width - 1076, screen.getPrimaryDisplay().size.height - 438 - 50)
      twitchWindow.loadFile('./src/views/twitch.html')
  
      twitchWindow.on('ready-to-show', () => {
        twitchWindow.show()
      })

      twitchWindow.on('focus', () => twitchWindow.webContents.send('focus', true))
      twitchWindow.on('blur', () => twitchWindow.webContents.send('focus', false))
    } else {
      twitchWindow.show();
    }
  }
  
  screen.on('display-added', onMonitorChange)
  screen.on('display-removed', onMonitorChange)

  tray = new Tray('img/icon.ico')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: () => { tray.destroy(); app.quit(); } },
    { label: 'Select Translucent taskbar location', click: () => getTranslucentTaskBarPath() },
    { label: 'Start Twitch On Top', click: () => startTwitchOnTop() }
  ])
  tray.setToolTip('TheRolf Utility')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    tray.popUpContextMenu()
  })

  /* win = new BrowserWindow({
    x: externalDisplay.bounds.x + 50,
    y: externalDisplay.bounds.y + 50
  })
  win.loadURL('https://github.com') */
})
ipcMain.on('getLastTwitchUrl', (event) => {
  event.returnValue = store.get(TWITCH_URL, "")
})
ipcMain.on('setLastTwitchUrl', (_event, arg) => {
  store.set(TWITCH_URL, arg)
})

app.on('window-all-closed', e => e.preventDefault() )