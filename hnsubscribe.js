'use strict'

var Firebase = require('firebase')
var topStories = new Firebase('https://hacker-news.firebaseio.com/v0/topstories')
var oldStories = []
var _ = require('lodash')

exports.fetchTopHN = function (cb) {
  topStories.limitToFirst(30).once('value', function (data) {
    var stories = data.val()
    var storyId = null
    var count = 0
    while (storyId == null) {
      var id = stories[randomIntFromInterval(0, 29)]
      if (_.indexOf(id) < 0) {
        storyId = id
      }
      count++
      if (count >= 30) {
        cb(true)
      }
    }
    var storyItem = new Firebase('https://hacker-news.firebaseio.com/v0/item/' + storyId)
    storyItem.once('value', function (data) {
      var story = data.val()
      oldStories.push(storyId)
      console.log(story.title)
      cb(null, story)
    })
  })
}

function randomIntFromInterval (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
