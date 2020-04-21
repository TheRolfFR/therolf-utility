const { app } = require('electron')
const AutoLaunch = require('auto-launch')

let autoLaunch
let menuItem = {
  label: 'Enable auto launch',
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
  menuItem.checked = !isEnabled
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
      menuItem.checked = isEnabled
    })
  },
  trayItem: () => {
    return menuItem
  }
}
