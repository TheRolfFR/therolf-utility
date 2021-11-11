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
let moddedElement
let modscElement
let modsCountElement
let modsElement
let playerNumberElement
let maxPlayerElement
let playersElement
let ipInputElement

let collapsibles
let trackedPlayers
let toggleButton
let playerTrackInput

document.addEventListener('DOMContentLoaded', () => {
  buttons = document.querySelectorAll('#buttons button[action]')

  iconElement = document.getElementById('icon')
  ipElement = document.getElementById('server_ip')
  motdElement = document.getElementById('motd')
  statusElement = document.getElementById('status')
  moddedElement = document.getElementById('modded')
  modscElement = document.getElementById('modsc')
  modsCountElement = document.getElementById('modscounter')
  modsElement = document.getElementById('mods')
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
    const { ip, status, players, motd, max, modded, mods } = data

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

    // if modded
    moddedElement.style.display = modded ? 'initial' : 'none';
    modscElement.style.display = modded ? 'initial' : 'none';
    modsElement.innerHTML = ''
    modsCountElement.innerText = mods.length
    mods.forEach(m => {
      modsElement.appendHTML('<span>' + m + '</span> ')
    })

    // mods list

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

  collapsibles = document.getElementsByClassName('collapsible')
  for(let i = 0; i < collapsibles.length; ++i) {
    collapsibles[i].addEventListener('click', () => {
      collapsibles[i].classList.toggle('shown')
    })
  }

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
