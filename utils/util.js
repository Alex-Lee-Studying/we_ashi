var formatTime = function(date, format) {
  date = new Date(date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  if (format === 'date') {
    return [year, month, day].map(formatNumber).join('-')
  } else {
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }  
}

var formatNumber = function(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var dateToUTC = function(date) {
  // var date = new Date(date).toJSON()
  // var newDate = new Date(+new Date(date) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
  var newDate = new Date(date).toISOString()
  return newDate
}

module.exports = {
  formatTime: formatTime,
  dateToUTC: dateToUTC
}
