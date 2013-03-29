// # audio/null_sound.js
(function(){

// ## Luv.Audio.NullSound
//
// This class has the same methods as Luv.Audio.Sound, but they do nothing; they don't
// play or try to load any sounds.
//
// Browsers which don't support the `<audio>` tag will instantiate this class instead
// of Luv.Audio.Sound.
Luv.Audio.NullSound = Luv.Class('Luv.Audio.NullSound');

// Implement all the methods of Luv.Audio.Sound, but just return 0 instead of
// doing anything.
var fakeMethods = {},
    fakeMethod = function() { return 0; };
for(var name in Luv.Audio.Sound.methods) {
  if(Luv.Audio.Sound.methods.hasOwnProperty(name)) {
    fakeMethods[name] = fakeMethod;
  }
}

Luv.Audio.NullSound.include(fakeMethods, {
  // `play` is the only method that does something in a NullSound (it still does very little)
  // It returns a `SoundInstance` whose internal element is a "fake" audio tag (in reality, a plain js object).
  // This makes it interface-compatible with Luv.Audio.Sound, but with no side effects,
  // since the sound instances it produces do nothing.
  play: function() {
    return Luv.Audio.SoundInstance(FakeAudioElement());
  }
});

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
