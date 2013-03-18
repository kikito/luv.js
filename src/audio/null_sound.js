// # audio/null_sound.js
(function(){

// ## Luv.Audio.NullSound
Luv.Audio.NullSound = Luv.Class('Luv.Audio.NullSound', {
  play: function() {
    return Luv.Audio.SoundInstance(FakeAudioElement());
  }
});

var nopFunctions = {};
"pause stop setVolume setVolume setLoop setSpeed setTime setExpirationTime".split(" ").forEach(function(name){
  nopFunctions[name] = function(){};
});

var zeroFunctions = {};
"countInstances countPlayingInstances getExpirationTime getVolume getSpeed getTime getDuration".split(" ").forEach(function(name){
  nopFunctions[name] = function(){ return 0; };
});

Luv.Audio.NullSound.include(nopFunctions, zeroFunctions);

var FakeAudioElement = function() {
  return {
    volume: 1,
    playbackRate: 1,
    // loop: undefined
    currentTime: 0,
    play: function(){},
    pause: function(){},
    addEventListener: function(ignored, f) { f(); }
  };
};


})();
