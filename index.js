var request = require('request')
var midiutils = require('midiutils')
var midifileparser = require('midi-file-parser')
var _ = require('lodash')

var midi = midifileparser(require('fs').readFileSync('smb1-Theme.mid', 'binary'))
console.log(midi.tracks.length)
console.log(midi.header.ticksPerBeat)

_.each(midi.tracks[1], function(x) {
  console.log(
    x.subtype,
    "Time", x.deltaTime,
    "Note#", x.noteNumber,
    "Freq", midiutils.noteNumberToFrequency(x.noteNumber),
    "Name", midiutils.noteNumberToName(x.noteNumber),
    "Velocity", x.velocity)
})
