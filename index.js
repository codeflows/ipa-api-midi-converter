var request = require('request')
var midiutils = require('midiutils')
var midifileparser = require('midi-file-parser')

var requestSettings = {
  method: 'GET',
  url: process.argv[2]
  // Will read as binary
  //encoding: null
};

request(requestSettings, function(error, response, body) {
  if(error) {
    throw "Uh oh: " + error;
  }
  console.log(midifileparser(body))
})

var freq = midiutils.noteNumberToFrequency(69)
console.log(freq)
