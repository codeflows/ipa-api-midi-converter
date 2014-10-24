var request = require('request')
var midiutils = require('midiutils')
var midifile = require('./midifile')

request("http://www.midiarchive.co.uk/files/Games/Tetris/Tetris%20-%202a.mid", function(error, response, body) {
  console.log(midifile.MidiFile(body))
})

var freq = midiutils.noteNumberToFrequency(69)
console.log(freq)
