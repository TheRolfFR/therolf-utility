const { dialog, screen } = require('electron')
const { exec } = require('child_process')
const path = require('path')

// tb store key
const TRANSLUCENT_TASKBAR = 'tb'

let _store

const getPath = () => {
  return _store.get(TRANSLUCENT_TASKBAR, undefined)
}

const setTTBPath = () => {
  let p = getPath()
  p = p ? path.dirname(p) : p

  dialog
    .showOpenDialog(undefined, {
      title: 'Select Tanslucent Taskbar location',
      defaultPath: p
    })
    .then(result => {
      if (!result.canceled && 'filePaths' in result && result.filePaths.length > 0) {
        console.log('Setting TB path to : ' + result.filePaths[0])
        _store.set(TRANSLUCENT_TASKBAR, result.filePaths[0])
      }
    })
}

const onMonitorChange = () => {
  const path = '"' + getPath() + '"'
  if (path) {
    exec(path, (error, _stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
    })
  }
  console.log('display changed')
}

module.exports = {
  // set store
  setStore: store => {
    _store = store
  },
  // the tray item
  trayItem: {
    label: 'Select Translucent taskbar location',
    click: setTTBPath
  },

  // VERY IMPORTANT must me placed in on ready
  onReady: store => {
    // added listeners when display is changed
    screen.on('display-added', onMonitorChange)
    screen.on('display-removed', onMonitorChange)
  }
}
