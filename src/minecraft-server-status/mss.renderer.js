const { ipcRenderer } = require('electron')

Element.prototype.appendHTML = function (str) {
  var div = document.createElement('div')
  div.innerHTML = str
  while (div.children.length > 0) {
    this.appendChild(div.children[0])
  }
}

let buttons

let iconElement
let ipElement
let motdElement
let statusElement
let playersElement

let collapsible
let trackedPlayers
let toggleButton
let playerTrackInput

document.addEventListener('DOMContentLoaded', () => {
  buttons = document.querySelectorAll('#buttons button[action]')

  iconElement = document.getElementById('icon')
  ipElement = document.getElementById('server_ip')
  motdElement = document.getElementById('motd')
  statusElement = document.getElementById('status')
  playersElement = document.getElementById('players')

  buttons.forEach(item => {
    item.addEventListener('click', function () {
      ipcRenderer.send('mss:action', this.attributes.action.value)
    })
  })

  ipcRenderer.send('requestInfos')
  setInterval(() => {
    console.log('requesting infos')
    ipcRenderer.send('requestInfos')
  }, 10000)

  ipcRenderer.on('getInfos', (_event, data) => {
    const { ip, status, players, motd } = data

    console.log('getting infos...')
    console.log(ip, status, players, motd)

    iconElement.src = 'https://api.mcsrvstat.us/icon/' + ip
    iconElement.classList.add('shown')
    ipElement.innerText = ip
    motdElement.innerHTML = motd

    statusElement.classList.remove('offline', 'online')
    statusElement.innerText = status == true ? 'Online' : 'Offline'
    statusElement.classList.add(statusElement.innerText.toLowerCase())

    if (!players) return

    tippy.hideAll()
    playersElement.innerHTML = ''
    let rand
    for (let i = 0; i < players.length; ++i) {
      rand = Math.floor(Math.random() * 1000) // used not to have tippy bugs
      playersElement.appendHTML('<img id="' + players[i] + rand + '-online" src="https://minotar.net/helm/' + players[i] + '/32" alt="' + players[i] + '" />')
      tippy('#' + players[i] + rand + '-online', {
        content: players[i]
      })
    }
  })

  collapsible = document.getElementById('collapsible')
  collapsible.addEventListener('click', () => {
    collapsible.classList.toggle('shown')
  })

  trackedPlayers = document.getElementById('trackedPlayers')
  playerTrackInput = document.getElementById('playerTrackInput')
  toggleButton = document.getElementById('toggleButton')

  toggleButton.addEventListener('click', () => {
    const val = playerTrackInput.value
    ipcRenderer.send('togglePlayerTrack', val)
  })

  ipcRenderer.send('requestTrackingList')
  ipcRenderer.on('getTrackingList', (_event, players) => {
    tippy.hideAll()

    trackedPlayers.innerHTML = ''

    let rand
    for (let i = 0; i < players.length; i++) {
      rand = Math.floor(Math.random() * 1000) // used not to have tippy bugs
      trackedPlayers.appendHTML('<img id="' + players[i] + rand + '-tracked" src="https://minotar.net/helm/' + players[i] + '/32" alt="' + players[i] + '" />')
      tippy('#' + players[i] + rand + '-tracked', {
        content: players[i]
      })
    }
  })
})
