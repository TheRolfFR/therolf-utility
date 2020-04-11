const { Menu, Tray, app } = require('electron')

let _tray = undefined
// define the items and the quit item of tray
let items = [
  {
    label: 'Quit',
    click: () => {
      _tray.destroy()
      app.quit()
    }
  }
]

// on ready function
const onReady = () => {
  // create the tray
  _tray = new Tray(__dirname + '/img/icon.ico')
  // set its tooltip name
  _tray.setToolTip('TheRolf Utility')
  // build and set its context menu
  _tray.setContextMenu(Menu.buildFromTemplate(items))
  // open tray on left click too (Win-Mac only)
  _tray.on('click', () => {
    _tray.popUpContextMenu()
  })
}

//export
module.exports = {
  _tray: _tray,
  items: items,
  onReady: onReady
}
