/* eslint valid-typeof: ["error", { "requireStringLiterals": false }] */

const express = require('express')
const DiscordRPC = require('discord-rpc')
const SECRET = require('./client-secret')

const client = new DiscordRPC.Client({ transport: 'ipc' })
let clientReady = false
const app = express()

let timeout // = undefined

app.use(express.json())

function regenerateTimeout () {
  clearTimeout(timeout)

  timeout = setTimeout(clear, 5000)
}

function clear () {
  if (clientReady) {
    client.clearActivity()
  }
}

function setRP (musicTitle, musicState) {
  let state = musicState
  if (musicState.length > 100) {
    state = musicState.slice(0, 99) + '…'
  }

  if (musicTitle.length > 128) {
    musicTitle = musicTitle.slice(0, 127) + '…'
  }

  client.setActivity({
    details: musicTitle,
    state: state,
    // startTimestamp: timestamp (not relevant here)
    largeImageKey: 'deezer',
    largeImageText: musicTitle,
    instance: false
  })
}

function checkVariable (variable, fieldsIn, lastFields, lastFieldsType = undefined) {
  let result = true

  // check inner fields
  while (fieldsIn.length && result) {
    result = fieldsIn[0] in variable

    variable = variable[fieldsIn[0]]

    fieldsIn.splice(0, 1)
  }

  if (!result) { return false }

  // check last fields
  while (lastFields.length && result) {
    result = lastFields[0] in variable

    if (lastFieldsType !== undefined) { result = typeof (variable[fieldsIn[0]]) === lastFieldsType }

    if (typeof (variable[fieldsIn[0]]) === 'string') { result = variable[fieldsIn[0]].length > 0 }

    lastFields.splice(0, 1)
  }

  return true
}

app.post('/setRP', (req, res) => {
  if (res.statusCode === 200 && req && checkVariable(req, ['body'], ['musicTitle', 'musicState'], 'string')) {
    regenerateTimeout()

    // console.log(req.body)
    const musicTitle = req.body.musicTitle
    const musicState = req.body.musicState

    setRP(musicTitle, musicState)
  } else {
    client.clearActivity()
  }

  res.end()
})

const server = app.listen(6553, () => console.log('Express port: 6553'))

exports.client = client
exports.server = server

client.on('ready', () => {
  clientReady = true
  console.log('RPC Client Ready')
  client.clearActivity()

  regenerateTimeout()
})

client.login({ clientId: '758012282511950015', clientSecret: SECRET }).catch(console.error)
