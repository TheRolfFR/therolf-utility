const DELAY = 1000

class LogEntry {
  /**
   * @param {string} pseudo - The pseudo
   */
  constructor(pseudo) {
    this.action = false // logged out
    this.pseudo = pseudo
    this.time = new Date(0) // set date
    this.timeout = undefined
  }

  /**
   * @param {boolean} action - The action
   * @param {function} func - The associated function
   * @returns {LogEntry} - himself
   */
  update(action, func) {
    if (typeof func != 'function') return this

    if ((action == true) != this.action) {
      const d = new Date()
      if ((d - this.time) / 1000 / 60 >= 1) {
        this.time = d // update the last time
        func() // execute the function
      }
    }

    this.action = action == true // false = logged out, true = logged in
    return this
  }
}

class LogTable {
  constructor() {
    this.entries = []
  }

  /**
   * @param {string} pseudo - The action
   * @param {boolean} action - The action
   * @param {function} func - The associated function
   * @returns {LogTable} - himself
   */
  updateEntry(pseudo, action, func) {
    // find entry for pseudo
    let foundIndex = this.entries.findIndex(item => item.pseudo == pseudo)

    if (foundIndex != -1) {
      // if entry not null
      this.entries[foundIndex].update(action, func)
    } else {
      // create entry if not null
      this.entries.push(new LogEntry(pseudo).update(action, func))
    }

    return this
  }
}

module.exports = { LogTable }
