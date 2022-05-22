const robot = require('robotjs')
const { BrowserWindow, clipboard, screen } = require('electron')
const ioHook = require('iohook')

const WINDOW_SIZE = 60
const WINDOWS_TASKBAR_HEIGHT = 40
const MARGIN = 5

const maximizePoints = pos => {
  const screenSize = screen.getPrimaryDisplay().size
  return {
    x: Math.min(pos.x, screenSize.width - 1),
    y: Math.min(pos.y, screenSize.height - 1)
  }
}

const rectifyWindowPosition = pos => {
  const screenSize = screen.getPrimaryDisplay().size

  return {
    x: pos.x + MARGIN + WINDOW_SIZE < screenSize.width ? pos.x + MARGIN : pos.x - MARGIN - WINDOW_SIZE,
    y: pos.y + MARGIN + WINDOW_SIZE < screenSize.height - WINDOWS_TASKBAR_HEIGHT ? pos.y + MARGIN : pos.y - MARGIN - WINDOW_SIZE + (pos.y >= screenSize.height - WINDOWS_TASKBAR_HEIGHT ? -(pos.y - (screenSize.height - WINDOWS_TASKBAR_HEIGHT)) : 0)
  }
}

let cursorColor = undefined
let interval = undefined
let x, y

const launchColorPicker = () => {
  console.log('Launching color picker...')
  // create window
  const bw = new BrowserWindow({
    frame: false,
    height: WINDOW_SIZE,
    width: WINDOW_SIZE,
    show: true,
    alwaysOnTop: true,
    focusable: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // starting interval
  interval = setInterval(() => {
    cursorColor = robot.getPixelColor(x, y)
  }, 1000 / 30)

  // load page
  bw.loadFile('./src/colorpicker/picker.html')

  // open devtools
  //bw.webContents.openDevTools()

  // hide cursor
  bw.webContents.on('dom-ready', event => {
    let css = '* { cursor: none !important; }'
    bw.webContents.insertCSS(css)
  })

  // show window
  bw.on('ready-to-show', () => bw.show())

  // on mouse move
  ioHook.on('mousemove', event => {
    if (bw && !bw.isDestroyed()) {
      //Extract x y
      const points = maximizePoints(robot.getMousePos())
      x = points.x
      y = points.y

      // move bw window
      const wpos = rectifyWindowPosition(points)
      bw.setPosition(wpos.x, wpos.y)

      // send color
      bw.webContents.send('color', '#' + cursorColor)
    }
  })

  setTimeout(() => {
    ioHook.on('mouseclick', event => {
      if (bw && !bw.isDestroyed()) {
        // copy cursor color to clipboard
        if (cursorColor) clipboard.writeText('#' + cursorColor)

        // clear intervel
        clearInterval(interval)

        // close the window
        bw.close()

        // stop iohook
        ioHook.stop()
      }
    })
  }, 200)

  bw.on('close', () => {
    console.log('Closed Color picker')
    ioHook.stop()
  })

  ioHook.start()
}

module.exports = {
  trayItem: {
    label: 'Open color picker',
    click: () => {
      launchColorPicker()
    }
  }
}
