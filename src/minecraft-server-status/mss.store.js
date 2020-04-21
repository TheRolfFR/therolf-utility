const SEPARATOR = '%%%'

const TRACKING_STORE_KEY = 'tracking_store_key'

let _store = undefined

let trackingList = []

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

module.exports = {
  setStore: store => {
    _store = store

    if (!_store) return

    trackingList = store.get(TRACKING_STORE_KEY, '').split(SEPARATOR)
  },
  toggleTracking: pseudo => toggleTracking(pseudo),
  getTrackingList: () => {
    return trackingList
  }
}
