'use strict'

var config = require('./config')
var loadUsers = require('./loadUsers')
var request = require('request')
var fs = require('fs')
var _ = require('lodash')
var utils = require('./utils')
var async = require('async')

exports.archiveChannel = function (channel, start, end, cb) {
  loadUsers.getUsers(function (err, users) {
    if (err) cb(err)
    fetchComments(channel, start, end, function (err, comments) {
      if (err) cb(err)
      console.log(comments.length)
      async.eachSeries(comments, function (comment, callback) {
        var line = '**' + users[comment.user] + '**' + ' *(' + utils.formatAMPM(new Date(comment.ts)) + ')* : ' + comment.text + '\n\n'
        line = utils.insertUserNames(line, users)
        var dt = new Date()
        fs.appendFile('archive' + dt.getTime() + '.md', line, function (err, done) {
          if (err) callback(err)
          else callback(null, done)
        })
      }, function done (err, ok) {
        if (err) cb(err)
        else cb(null, {status: 'ok', count: comments.length})
      })
    })
  })
}

function fetchComments (channel, oldest, latest, cb) {
  request({
    url: 'https://slack.com/api/channels.history',
    qs: {
      token: config.tempUser,
      channel: channel,
      count: 1000,
      oldest: oldest,
      latest: latest
    }
  }, function (err, res, body) {
    if (err) {
      cb(err)
    } else {
      // process the message
      // console.log(body)
      var result = JSON.parse(body)
      if (result.ok) {
        result.messages.map(function (message) {
          message.ts = parseInt(message.ts, 10) * 1000
          return message
        })
        var sorted = _.sortBy(result.messages, function (message) {
          return message.ts
        })
        cb(null, sorted)
      }
    }
  })
}
