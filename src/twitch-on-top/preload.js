const { ipcRenderer } = require('electron')

window.api = {
  close: () => ipcRenderer.invoke('close'),
  minimize: () => ipcRenderer.invoke('minimize'),
  onfocus: (callback) => {
    ipcRenderer.removeAllListeners('focus')
    ipcRenderer.on('focus', callback)
  },
  getLastTwitchURL: () => { return ipcRenderer.sendSync('getLastTwitchUrl') },
  setLastTwitchURL: (url) => { ipcRenderer.send('setLastTwitchUrl', url) },
  urlExists: (url, resultCallback) => {
    const timeout = setTimeout(() => {
      ipcRenderer.removeAllListeners('urlexistsresponse')
      resultCallback('Timeout error', undefined)
    }, 3000)

    ipcRenderer.once('urlexistsresponse', function (_event, arg) {
      clearTimeout(timeout)
      resultCallback(arg.err, arg.exists)
    })

    ipcRenderer.send('urlexists', url)
  }
}


