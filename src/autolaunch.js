const { app } = require('electron')
const AutoLaunch = require('auto-launch')

// export
module.exports = appName => {
  //create the autolaunch
  let autoLaunch = new AutoLaunch({
    name: appName,
    path: app.getPath('exe')
  })

  // enable it if not done already
  autoLaunch.isEnabled().then(isEnabled => {
    if (!isEnabled) autoLaunch.enable()
  })
}
