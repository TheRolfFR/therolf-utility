const https = require('https')
const axios = require('axios').default
const EventEmitter = require('events')
const icond = require('./mss.api.icondownloader')

let _serverIP
let interval = undefined

class MSSEmittor extends EventEmitter {}

const _events = new MSSEmittor()

let firstime = true

let wasServerOffline = false
let playerList = []
let modt = ''
let max = 0
let modded
let mods

const instance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
})

const getPlayersDifference = (oldPlayersList, newPlayersList) => {
  let loggedin = []

  let tmp
  let playerOfTheNewList

  for (let i = 0; i < newPlayersList.length; i++) {
    playerOfTheNewList = newPlayersList[i]

    if (!oldPlayersList.includes(playerOfTheNewList)) {
      // if the new player wasn't on the list
      loggedin.push(playerOfTheNewList) // push to the logged in
    } else {
      // if he was
      tmp = oldPlayersList.findIndex(element => element == playerOfTheNewList)
      oldPlayersList.splice(tmp, 1) // delete it from the old list
    }
  }

  return {
    disconnected: oldPlayersList, // this list is the result of the substraction of people connected before minus now / the disconnected
    loggedin: loggedin
  }
}

const getServerStatusUpdate = () => {
  const url = 'https://api.mcsrvstat.us/2/' + _serverIP // defining the URL

  instance.get(url)
    .then(res => {
      let server = undefined
      server = res.data
      
      if (!server) return

      if (server.online) {
        if (wasServerOffline) {
          wasServerOffline = false
          _events.emit('server-online') // set change status to online
        }

        max = server.players.max

        let newList = server.players.list || []

        const difference = getPlayersDifference(playerList, newList) // get the difference
        // notify the difference
        if (!firstime && difference.loggedin.length > 0) _events.emit('players-list-loggedin', difference.loggedin)
        if (difference.disconnected.length > 0) _events.emit('players-list-disconnected', difference.disconnected)

        // update player list
        playerList = newList
        _events.emit('player-list-updated', playerList)

        modded = server.mods !== undefined
        mods = modded ? (server.mods.names || []) : []

        // update message of the day
        modt = server.motd.html
        _events.emit('modt', modt)
      } else {
        if (!wasServerOffline) {
          wasServerOffline = true
          _events.emit('server-offline') // change status to offline
        }
      }

      firstime = false
    })
    .catch((...arg) => {
      console.error(...arg)
    })
}

module.exports = {
  events: _events,
  setServerIP: serverIP => {
    _serverIP = serverIP
  },
  getServerIP: () => {
    return _serverIP
  },
  isServerOnline: () => {
    return !wasServerOffline
  },
  getPlayerList: () => {
    return playerList
  },
  getNumberOfPlayers: () => {
    return playerList.length
  },
  getMotd: () => {
    return modt
  },
  getMax: () => {
    return max
  },
  update: () => getServerStatusUpdate(),
  listen: () => {
    if (!_serverIP) {
      throw new Error('Server IP not defined')
    }

    getServerStatusUpdate()

    interval = setInterval(getServerStatusUpdate, 1000)
  },
  isListening: () => {
    return interval !== undefined
  },
  stop: () => {
    if (this.isListening()) clearInterval(interval)
  },
  getIcon: () => {
    return icond.downloadIcon(_serverIP)
  },
  isModded : () => { return modded },
  getMods: () => { return mods }
}
