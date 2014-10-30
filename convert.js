#!/usr/bin/env node

var request = require('request')
var midiutils = require('midiutils')
var midifileparser = require('midi-file-parser')
var _ = require('lodash')

if(process.argv.length < 3) {
  console.log("Usage: node convert.js [midifile]")
  return;
}

// beats per minute
var defaultTempo = bpmToMicrosecondsPerBeat(120);

var file = process.argv[2]
var midi = midifileparser(require('fs').readFileSync(file, 'binary'))

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

var notesPerTrack = _.map(midi.tracks, toNotes)
_.each(notesPerTrack, function(notes, i) {
  console.log("// track", i)
  _.each(notes, function(note) {
    var lengthInSeconds = note.lengthInMicroseconds / 1000.0 / 1000.0
    if(note.type === "rest") {
      console.log("rest(" + lengthInSeconds + ");")
    } else {
      console.log("playNote(" + note.frequency + ", " + lengthInSeconds + ");")
    }
  })
})
