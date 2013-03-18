// # audio.js
(function(){

// ## Luv.Audio
Luv.Audio = Luv.Class('Luv.Audio', {
  init: function(media) {
    this.media = media;
  },

  isAvailable: function() { return Luv.Audio.isAvailable(); },

  getSupportedTypes: function() {
    return Luv.Audio.getSupportedTypes();
  },

  canPlayType: function(type) {
    return this.supportedTypes[type.toLowerCase()];
  },

  Sound: function() {
    if(this.isAvailable()) {
      var args = [this.media].concat(Array.prototype.slice.call(arguments, 0));
      return Luv.Audio.Sound.apply(Luv.Audio.Sound, args);
    } else {
      return Luv.Audio.NullSound();
    }
  }

});

Luv.Audio.isAvailable = function() {
  return audioAvailable;
};

Luv.Audio.canPlayType = function(type) {
  return !!supportedTypes[type.toLowerCase()];
};

Luv.Audio.getSupportedTypes = function() {
  return Object.keys(supportedTypes);
};

var el = document.createElement('audio');
var supportedTypes = {};
var audioAvailable = !!el.canPlayType;
if(audioAvailable) {
  supportedTypes.ogg = !!el.canPlayType('audio/ogg; codecs="vorbis"');
  supportedTypes.mp3 = !!el.canPlayType('audio/mpeg;');
  supportedTypes.wav = !!el.canPlayType('audio/wav; codecs="1"');
  supportedTypes.m4a = !!el.canPlayType('audio/x-m4a;');
  supportedTypes.aac = !!el.canPlayType('audio/aac;');
}


})();
