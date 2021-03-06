const UV = require('../models/uservoice')
const Constants = require('../../constants')
const Redis = require('../models/redis')

module.exports = {
  getMail: (userid) => {
    return new Promise((resolve, reject) => {
      if (Constants.Debugging.enable) return resolve(Constants.Debugging.mocking.email)
      UV.v1.loginAsOwner().then(client => {
        return client.get('users/search.json', {
          guid: userid
        })
      }).then(result => {
        if (!result.users || result.users.length !== 1) return reject(false)
        else {
          Redis.set(`email:${userid}`, result.users[0].email)
          return resolve(result.users[0].email)
        }
      }).catch(console.error)
    })
  },
  getMailCached: (userid) => {
    return new Promise((resolve, reject) => {
      Redis.get(`email:${userid}`).then(res => {
        if (res !== null) return resolve(res)
        return module.exports.getMail(userid).then(resolve)
      }).catch((e) => {
        console.error(e)
        return module.exports.getMail(userid).then(resolve)
      })
    })
  }
}