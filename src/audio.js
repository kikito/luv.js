// # audio.js
(function(){

// ## Luv.Audio
// The audio module is in charge of loading and playing sounds in Luv.
// It is a wrapper around the `audio` tag, so it is relatively cross-browser.
//
// The `audio` module is attached to the game object that you receive when
// you invoke the `Luv` function, and you usually don't need more than one,
// so you will most likely not be instantiating this class directly. Instead,
// you will be instantiating `Luv` and using the `audio` attribute of the returned
// object:

//       var luv = Luv();
//       luv.audio.isAvailable(); // luv.audio already contains the instance you need

// The function that you will use the most of this module is `Sound`:

//       var luv = Luv();
//       var cry = luv.audio.Sound('sfx/cry.ogg', 'sfx/cry.mp3');

// Love.audio will not fail if the browser using it is not capable of playing sounds; it will
// just not play sounds at all. *However*, `audio.Sound` *will* fail if the game tries to
// load a Sound that is not available. In the example above:
//
// * The code will produce no errors (and no sound) in an android phone with no `audio` support.
// * The code will work in a modern Firefox browser, if `sfx/cry.ogg` is loaded correctly.
// * The code will produce an error in Internet Explorer, if `sfx/cry.mp3` could not be found.

Luv.Audio = Luv.Class('Luv.Audio', {

  init: function(media) {
    this.media = media;
  },

  // `isAvailable` returns whether the browser is capable of reproducing sounds.
  // You don't have to test for this explicitly. If a browser is totally incapable of using the
  // audio tag, sounds will not load and the system will not try to emit any sound when
  // `Sound.play()` gets called.
  isAvailable: function() { return Luv.Audio.isAvailable(); },

  // Returns an array of the supported audio types that the current browser allows.
  //
  // * chrome: `['ogg', 'mp3', 'wav', 'm4a', 'aac']`
  // * firefox: `['ogg', 'mp3', 'wav', 'm4a', 'aac']`
  // * ie: `['mp3', 'wav', 'm4a', 'aac']`
  // * others: unknown (try!)
  getSupportedTypes: function() {
    return Luv.Audio.getSupportedTypes();
  },

  // `canPlayType` expects a file extension (i.e. `"mp3"`), and returns whether the current
  // browser is capable of playing files with that extension.
  canPlayType: function(type) {
    return this.supportedTypes[type.toLowerCase()];
  },

  // `Sound` creates sounds. Once loaded, sounds can be played, if the browser supports them.
  //
  //       var luv = Luv();
  //       var cry = luv.audio.Sound('sfx/cry.ogg', 'sfx/cry.mp3');
  //
  // See audio/sound.js for more information.
  Sound: function() {
    if(this.isAvailable()) {
      var args = [this.media].concat(Array.prototype.slice.call(arguments, 0));
      return Luv.Audio.Sound.apply(Luv.Audio.Sound, args);
    } else {
      return Luv.Audio.NullSound();
    }
  }

});

// The following three are class methods; they return the same as the instance methods described above.
Luv.Audio.isAvailable = function() {
  return audioAvailable;
};

Luv.Audio.canPlayType = function(type) {
  return !!supportedTypes[type.toLowerCase()];
};

Luv.Audio.getSupportedTypes = function() {
  return Object.keys(supportedTypes);
};

// These internal variables dealing with audio support detection
var el = document.createElement('audio'),
    supportedTypes = {},
    audioAvailable = !!el.canPlayType;
if(audioAvailable) {
  supportedTypes.ogg = !!el.canPlayType('audio/ogg; codecs="vorbis"');
  supportedTypes.mp3 = !!el.canPlayType('audio/mpeg;');
  supportedTypes.wav = !!el.canPlayType('audio/wav; codecs="1"');
  supportedTypes.m4a = !!el.canPlayType('audio/x-m4a;');
  supportedTypes.aac = !!el.canPlayType('audio/aac;');
}


})();
