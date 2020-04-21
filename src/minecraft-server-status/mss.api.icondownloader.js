module.exports = {
  downloadIcon: serverIP => {
    return new Promise((resolve, reject) => {
      const options = {
        url: 'https://api.mcsrvstat.us/icon/' + serverIP,
        method: 'get',
        encoding: null
      }
      // https://stackoverflow.com/a/49424282/6594899
      require('request').get(options, function (err, response, body) {
        if (err || response.statusCode != 200) {
          // exit if error
          reject(err)
          return
        }

        // return body which is a buffer
        resolve(body)
        return
      })
    })
  }
}
