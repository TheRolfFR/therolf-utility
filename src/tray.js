const { Menu, Tray, app } = require('electron')
const { join } = require('path')

let _tray
let _isReady = false
// define the items and the quit item of tray
const items = [
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
  _tray = new Tray(join(__dirname, '/img/icon.ico'))

  // set its tooltip name
  _tray.setToolTip('TheRolf Utility')

  // build and set its context menu
  _tray.setContextMenu(Menu.buildFromTemplate(items))

  // set ready
  _isReady = true

  // open tray on left click too (Win-Mac only)
  _tray.on('click', () => {
    _tray.popUpContextMenu()
  })
}

const check = (label, checked) => {
  const foundIndex = items.findIndex(item => 'type' in item && item.type === 'checkbox' && item.label === label)

  if (foundIndex !== -1) items[foundIndex].checked = checked

  // rebuild the context menu
  _tray.setContextMenu(Menu.buildFromTemplate(items))
}

// export
module.exports = {
  _tray: _tray,
  items: items,
  onReady: onReady,
  setChecked: check,
  isReady: () => { return _isReady }
}
