'use strict'

module.exports = function without (arr, key) {
  let found = arr.indexOf(key)
  while (found !== -1) {
    arr.splice(found, 1)
    found = arr.indexOf(key)
  }
}
