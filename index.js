var request = require('request')
var midiutils = require('midiutils')
var midifileparser = require('midi-file-parser')
var _ = require('lodash')

var midi = midifileparser(require('fs').readFileSync('smb1-Theme.mid', 'binary'))
console.log("Number of MIDI tracks", midi.tracks.length)
console.log("Ticks per beat:", midi.header.ticksPerBeat)

function toNotes(track) {
  var currentTick = 0;
  var notes = [];
  var currentNote;
  var tempoInMicrosecondsPerBeat;

  _.each(track, function(event) {
    currentTick += event.deltaTime;
    if(event.subtype === 'noteOn') {
      if(currentNote) throw "Note already being played. Polyphony schmolyphony!"
      notes.push({ rest: event.deltaTime })
      currentNote = {
        startTick: currentTick,
        noteNumber: event.noteNumber
      }
    } else if(event.subtype === 'noteOff') {
      if(!currentNote) throw "Note off with no current note?!?!"
      if(currentNote.noteNumber !== event.noteNumber) throw "That's not right"
      notes.push({
        length: currentTick - currentNote.startTick,
        noteNumber: event.noteNumber,
        frequency: midiutils.noteNumberToFrequency(event.noteNumber),
        name: midiutils.noteNumberToName(event.noteNumber),
        velocity: event.velocity
      })
      currentNote = null
    } else if(event.subtype === 'setTempo') {
      tempoInMicrosecondsPerBeat = event.microsecondsPerBeat;
    }
  })

  return notes
}

var notesPerTrack = _.map(midi.tracks, toNotes)
_.each(notesPerTrack, function(notes, i) {
  console.log("Track", i)
  _.each(notes, function(note) {
    console.log("Note", note)
  })
})
