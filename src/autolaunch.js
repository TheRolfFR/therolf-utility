const { app } = require('electron')
const AutoLaunch = require('auto-launch')
const tray = require('./tray')

const AUTOLAUNCH_LABEL = 'Enable auto launch'

let autoLaunch
let menuItem = {
  label: AUTOLAUNCH_LABEL,
  type: 'checkbox',
  click: toggleAutoLaunch
}

async function toggleAutoLaunch() {
  const isEnabled = await autoLaunch.isEnabled()
  if (isEnabled) {
    autoLaunch.disable()
  } else {
    autoLaunch.enable()
  }

  console.info('Auto launch is now ' + (isEnabled ? 'dis' : 'en') + 'abled')
  // update menu item
  tray.setChecked(AUTOLAUNCH_LABEL, !isEnabled)
}

// export
module.exports = {
  start: async function (appName) {
    //create the autolaunch
    autoLaunch = new AutoLaunch({
      name: appName,
      path: app.getPath('exe')
    })

    autoLaunch.isEnabled().then(isEnabled => {
      tray.setChecked(AUTOLAUNCH_LABEL, isEnabled)
    })
  },
  trayItem: menuItem
}
