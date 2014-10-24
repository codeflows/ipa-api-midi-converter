var request = require('request')
var midiutils = require('midiutils')
var midifileparser = require('midi-file-parser')

request("http://www.midiarchive.co.uk/files/Games/Tetris/Tetris%20-%202a.mid", function(error, response, body) {
  console.log(midifileparser(body))
})

var freq = midiutils.noteNumberToFrequency(69)
console.log(freq)
