/* global Element, tippy */
const { ipcRenderer } = require('electron')

Element.prototype.appendHTML = function (str) {
  const div = document.createElement('div')
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
let playerNumberElement
let maxPlayerElement
let playersElement
let ipInputElement

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
  playerNumberElement = document.getElementById('pn')
  maxPlayerElement = document.getElementById('mp')
  playersElement = document.getElementById('players')
  ipInputElement = document.getElementById('server_ip_input')

  buttons.forEach(item => {
    item.addEventListener('click', function () {
      ipcRenderer.send('mss:action', this.attributes.action.value)
    })
  })

  ipElement.addEventListener('click', () => {
    ipInputElement.style.display = 'block'
    ipInputElement.focus()
  })

  ipInputElement.addEventListener('keydown', (e) => {
    if ((e.which || e.keyCode) === 13) {
      e.preventDefault()
      ipInputElement.style.display = 'none'
      ipcRenderer.send('requestInfos', ipInputElement.value)
    }
  })

  ipcRenderer.send('requestInfos')
  setInterval(() => {
    console.log('requesting infos')
    ipcRenderer.send('requestInfos')
  }, 10000)

  ipcRenderer.on('getInfos', (_event, data) => {
    const { ip, status, players, motd, max } = data

    console.log('getting infos...')
    console.log(ip, status, players, motd, max)

    // set text
    iconElement.src = 'https://api.mcsrvstat.us/icon/' + ip
    iconElement.classList.add('shown')
    ipElement.innerText = ip
    motdElement.innerHTML = motd

    // change empty text field with stored ip
    if (ipInputElement.value === '') ipInputElement.value = ip

    statusElement.classList = []
    statusElement.innerText = status === true ? 'Online' : 'Offline'
    statusElement.classList.add(statusElement.innerText.toLowerCase())

    if (status === false) {
      playerNumberElement.innerText = '???'
      maxPlayerElement.innerText = '???'
      motdElement.innerHTML = ''
      return
    }

    playerNumberElement.innerText = players.length
    maxPlayerElement.innerText = max

    tippy.hideAll()
    playersElement.innerHTML = ''
    let rand
    for (let i = 0; i < players.length; ++i) {
      rand = Math.floor(Math.random() * 1000) // used not to have tippy bugs
      playersElement.appendHTML('<img id="' + players[i] + rand + '-online" src="https://mc-heads.net/avatar/' + players[i] + '/32" alt="' + players[i] + '" />')
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
      trackedPlayers.appendHTML('<img id="' + players[i] + rand + '-tracked" src="https://mc-heads.net/avatar/' + players[i] + '/32" alt="' + players[i] + '" />')
      tippy('#' + players[i] + rand + '-tracked', {
        content: players[i]
      })
    }
  })
})
