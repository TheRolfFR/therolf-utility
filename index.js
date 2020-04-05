const { app, BrowserWindow, screen, Menu, Tray, dialog } = require('electron')
const AutoLaunch = require('auto-launch')
const Store = require('electron-store')
const { exec } = require("child_process")
const path = require('path')

let win

const store = new Store();

const TRANSLUCENT_TASKBAR = 'tb';

const getPath = () => { return store.get(TRANSLUCENT_TASKBAR, undefined) };

let tray = null
app.on('ready', () => {
  let autoLaunch = new AutoLaunch({
    name: 'Therolf Utility',
    path: app.getPath('exe'),
  });

  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  });

  const onMonitorChange = () => {
    const path = '"' + getPath() + '"';
    if(path) {
      exec(path, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        // console.log(`stdout: ${stdout}`);
    });
    }
    console.log("display changed");
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
        store.set(TRANSLUCENT_TASKBAR, result.filePaths[0]);
      }
    })
  }
  
  screen.on('display-added', onMonitorChange);
  screen.on('display-removed', onMonitorChange);

  tray = new Tray('img/icon.ico')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: () => app.quit() },
    { label: 'Select Translucent taskbar location', click: () => getTranslucentTaskBarPath() }
  ])
  tray.setToolTip('TheRolf Utility')
  tray.setContextMenu(contextMenu)

  /* win = new BrowserWindow({
    x: externalDisplay.bounds.x + 50,
    y: externalDisplay.bounds.y + 50
  })
  win.loadURL('https://github.com') */
})

app.on('window-all-closed', function() {
  if(process.platform != 'darwin')
      app.quit();
})