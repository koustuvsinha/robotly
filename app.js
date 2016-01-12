'use strict'

var Botkit = require('botkit')
var config = require('./config')
var archiver = require('./archiver')
var moment = require('moment')
var hnsubscribe = require('./hnsubscribe')
var botly
var lastRun
var CronJob = require('cron').CronJob
var hnjob
var conversations = require('./conversations')

var controller = Botkit.slackbot({
  debug: false
})

controller.spawn({
  token: config.botly
}).startRTM(function (err, bot) {
  if (err) {
    throw new Error(err)
  } else {
    botly = bot
  }
})

controller.hears(['archive'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, 'Okey dokey! Starting to archive the chats in this channel ...')
  archiver.archiveChannel(message.channel, 0, 0, function (err, done) {
    if (err) {
      bot.reply(message, 'Oops, something wrong with the archiver! Contacting admin..')
    } else {
      bot.reply(message, 'Done archiving! ' + done.count + ' messages saved! Yay!')
    }
  })
})

controller.hears(['cron', 'cron job'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  if (lastRun) {
    bot.reply(message, 'Hey! Last cron job was run on ' + moment(lastRun).format('MMMM Do YYYY, h:mm a'))
  } else {
    bot.reply(message, "Sorry, I think the cron job hasn't yet run.")
  }
})

controller.hears(conversations.subscribeHN, ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    if (err) console.log(err)
    convo.ask('Cool! Subscribing you for half-hourly updates. Are you ok with it?', [
      {
        pattern: bot.utterances.yes,
        callback: function (response, convo) {
          convo.say('Consider it done')
          hnSubscribeCronJob(message.channel)
          convo.next()
        }
      },
      {
        pattern: bot.utterances.no,
        callback: function (response, convo) {
          convo.say('Perhaps later then...')
          convo.next()
        }
      },
      {
        default: true,
        callback: function (response, convo) {
          convo.repeat()
          convo.next()
        }
      }
    ])
  })
})

controller.hears(conversations.unsubscribeHN, ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    if (err) console.log(err)
    convo.ask('No problem! Are you sure though?', [
      {
        pattern: bot.utterances.yes,
        callback: function (response, convo) {
          convo.say('Done!')
          unsubscribeHn()
          convo.next()
        }
      },
      {
        pattern: bot.utterances.no,
        callback: function (response, convo) {
          convo.say('Fine, I wont touch it!')
          convo.next()
        }
      },
      {
        default: true,
        callback: function (response, convo) {
          convo.repeat()
          convo.next()
        }
      }
    ])
  })
})

controller.hears(['trending on HN', 'trending on Hacker News'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, 'Okey Dokey! Looking for a HN post...')
  hnsubscribe.fetchTopHN(function (err, story) {
    if (err) console.log(err)
    bot.reply(message, story.title + ' : ' + story.url)
  })
})

function hnSubscribeCronJob (channel) {
  hnjob = new CronJob({
    cronTime: '0,30 * * * *',
    onTick: function () {
      getHNPost(channel)
    },
    start: false,
    timeZone: 'Asia/Calcutta'
  })
  hnjob.start()
  getHNPost(channel)

}

function getHNPost (channel) {
  hnsubscribe.fetchTopHN(function (err, story) {
    if (err) console.log(err)
    botly.say({
      text: story.title + ' : ' + story.url,
      channel: channel
    })
  })
}

function unsubscribeHn () {
  if (hnjob) {
    hnjob.stop()
  }
}

/*
function cronJob (channel) {
  var date = new Date()
  var prevDate = new Date(date)
  prevDate.setDate(date.getDate() - 1)
  archiver.archiveChannel(channel, prevDate.getTime() / 1000, date.getTime() / 1000, function (err, done) {
    if (!err) {
      lastRun = date
      botly.say({
        text: 'Knock knock! Daily Cron job has run, ' + done.count + ' messages were archived',
        channel: channel
      })
    }
  })
}

function hasKey (key) {
  return ('key' in oldStories)
}
*/
