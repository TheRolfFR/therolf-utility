const tray = require('../tray')
const SEPARATOR = '%%%'

const TRACKING_STORE_KEY = 'tracking_store_key'
const MSS_NOTIFICATIONS_KEY = 'mss_notification_key'

let _store = undefined

let trackingList = []
let areNotificationsOn = true

const toggleTracking = pseudo => {
  const foundIndex = trackingList.findIndex(element => element == pseudo)
  const found = foundIndex != -1 // returns true if found (index >= 0)

  // update the list
  if (found) trackingList.splice(foundIndex, 1)
  else trackingList.push(pseudo)

  // save the list
  if (_store) _store.set(TRACKING_STORE_KEY, trackingList.join(SEPARATOR))

  // return if is now part of the list (return not found because now added)
  return !found
}

// toggle boolean navigation and return the new state
const toggleNotifications = label => {
  areNotificationsOn = !areNotificationsOn

  _store.set(MSS_NOTIFICATIONS_KEY, areNotificationsOn)
  console.info('MSS notifcations are now ' + (areNotificationsOn ? 'en' : 'dis') + 'abled')

  tray.setChecked(label, areNotificationsOn)

  return areNotificationsOn
}

module.exports = {
  setStore: store => {
    _store = store

    if (!_store) return

    areNotificationsOn = store.get(MSS_NOTIFICATIONS_KEY, true)
    trackingList = store.get(TRACKING_STORE_KEY, '').split(SEPARATOR)
  },
  toggleTracking: pseudo => toggleTracking(pseudo),
  getTrackingList: () => {
    return trackingList
  },
  areNotificationsOn: () => {
    return areNotificationsOn
  },
  toggleNotifications: label => toggleNotifications(label)
}
