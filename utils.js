'use strict'

exports.insertUserNames = function (line, users) {
  var pos = getIndicesOf('<@', line, false)
  pos.forEach(function (p) {
    var startPos = p + 2
    var curPos = startPos
    var id = ''
    while (line.charAt(curPos) !== '>') {
      id = id + line.charAt(curPos)
      curPos++
    }
    if (id.length > 9) {
      id = id.substr(0, 9)
    }
    var newLine = line.substr(0, p) + '@' + users[id] + line.substr(curPos + 1, line.length)
    line = newLine
  })
  return line
}

function getIndicesOf (searchStr, str, caseSensitive) {
  var startIndex = 0
  var searchStrLen = searchStr.length
  var index
  var indices = []
  if (!caseSensitive) {
    str = str.toLowerCase()
    searchStr = searchStr.toLowerCase()
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index)
    startIndex = index + searchStrLen
  }
  return indices
}

exports.formatAMPM = function (date) {
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}
