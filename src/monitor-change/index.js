const { dialog, screen } = require('electron')
const { exec } = require('child_process')
const path = require('path')

// tb store key
const TRANSLUCENT_TASKBAR = 'tb'

module.exports = {
  // the tray item
  trayItem: {
    label: 'Select Translucent taskbar location',
    click: () => this.setTTBPath()
  },

  // initialize everything
  init: store => {
    this._store = store

    const getPath = () => {
      return store.get(TRANSLUCENT_TASKBAR, undefined)
    }

    this.setTTBPath = () => {
      let p = getPath()
      p = p ? path.dirname(p) : p

      dialog
        .showOpenDialog(undefined, {
          title: 'Select Tanslucent Taskbar location',
          defaultPath: p
        })
        .then(result => {
          if (
            !result.canceled &&
            'filePaths' in result &&
            result.filePaths.length > 0
          ) {
            console.log(result.filePaths[0])
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

    // added listeners when display is changed
    screen.on('display-added', onMonitorChange)
    screen.on('display-removed', onMonitorChange)
  }
}
