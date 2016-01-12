'use strict'

var config = require('./config')
var request = require('request')
var endpoint = 'https://slack.com/api/'

exports.getUsers = function (cb) {
  request({
    url: endpoint + 'users.list',
    qs: {
      token: config.tempUser
    }
  }, function (err, res, body) {
    if (err) {
      cb(err)
    } else {
      var result = JSON.parse(body)
      if (result.ok) {
        var userObj = {}
        result.members.forEach(function (member) {
          userObj[member.id] = member.name
        })
        cb(null, userObj)
      } else {
        cb(true)
      }
    }
  })
}
