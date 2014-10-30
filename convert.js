#!/usr/bin/env node

var request = require('request')
var midiutils = require('midiutils')
var midifileparser = require('midi-file-parser')
var _ = require('lodash')

if(process.argv.length < 3 || process.argv.length > 4) {
  console.log("Usage: node convert.js [midi-file] (midi-track-number)")
  return;
}

// beats per minute
var defaultTempo = bpmToMicrosecondsPerBeat(120);

var file = process.argv[2]
var track = process.argv[3]
var midi = midifileparser(require('fs').readFileSync(file, 'binary'))

var allTracks = _.map(midi.tracks, toNotes)

if(track) {
  printImpCode(allTracks[track - 1], track)
} else {
  _.each(allTracks, printImpCode)

  console.log("// This MIDI file has", midi.tracks.length, "tracks.")
  console.log("// Run with convert.js", file, "(midi-track-number) to only print score for a specific track")
}

function printImpCode(track, number) {
  console.log("// track #", number)
  _.each(track, function(note) {
    var lengthInSeconds = note.lengthInMicroseconds / 1000.0 / 1000.0
    if(note.type === "rest") {
      console.log("rest(" + lengthInSeconds + ");")
    } else {
      console.log("playNote(" + note.frequency + ", " + lengthInSeconds + ");")
    }
  })
  console.log()
}

function bpmToMicrosecondsPerBeat(bpm) {
  var oneMinuteInMicroseconds = 60 * 1000 * 1000
  return oneMinuteInMicroseconds / bpm
}

function toNotes(track) {
  var currentTick = 0;
  var notes = [];
  var currentNote;
  var tempoInMicrosecondsPerBeat = defaultTempo;

  function ticksInMicroseconds(ticks) {
    var beats = ticks/ticksPerBeat
    var lengthInMicroseconds = beats * tempoInMicrosecondsPerBeat
    return lengthInMicroseconds
  }

  _.each(track, function(event) {
    currentTick += event.deltaTime;
    if(event.subtype === 'noteOn') {
      if(currentNote) throw "Note already being played. Polyphony schmolyphony!"
      notes.push({ type: 'rest', lengthInMicroseconds: ticksInMicroseconds(event.deltaTime) })
      currentNote = {
        startTick: currentTick,
        noteNumber: event.noteNumber
      }
    } else if(event.subtype === 'noteOff') {
      if(!currentNote) throw "Note off with no current note?!?!"
      if(currentNote.noteNumber !== event.noteNumber) throw "That's not right"
      notes.push({
        type: 'note',
        lengthInMicroseconds: ticksInMicroseconds(currentTick - currentNote.startTick),
        note: midiutils.noteNumberToName(event.noteNumber),
        midiNoteNumber: event.noteNumber,
        frequency: midiutils.noteNumberToFrequency(event.noteNumber),
        velocity: event.velocity
      })
      currentNote = null
    } else if(event.subtype === 'setTempo') {
      tempoInMicrosecondsPerBeat = event.microsecondsPerBeat;
    }
  })

  return _.filter(notes, function(note) { return note.lengthInMicroseconds > 0 })
}
