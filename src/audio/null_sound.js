// # audio/null_sound.js
(function(){

// ## Luv.Audio.NullSound
//
// This class has the same methods as Luv.Audio.Sound, but they do nothing; they don't
// play or try to load any sounds.
//
// Browsers which don't support the `<audio>` tag will instantiate this class instead
// of Luv.Audio.Sound.
Luv.Audio.NullSound = Luv.Class('Luv.Audio.NullSound', {
  // `play` creates and returns a `SoundInstance` whose internal element is a "fake"
  // audio tag (in reality, a plain js object).
  // This makes it interface-compatible with Luv.Audio.Sound, but with no side effects,
  // since the sound instances it produces do nothing.
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
    loop: undefined,
    currentTime: 0,
    play: function(){},
    pause: function(){},
    addEventListener: function(ignored, f) { f(); }
  };
};


})();
