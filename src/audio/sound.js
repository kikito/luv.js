// # audio/sound.js
(function(){

// ## Luv.Audio.Sound
Luv.Audio.Sound = Luv.Class('Luv.Audio.Sound', {
  init: function(media) {
    var paths = Array.prototype.slice.call(arguments, 1);
    if(paths.length === 0) {
      throw new Error("Must provide at least one path for the Sound");
    }
    paths = paths.filter(isPathExtensionSupported);
    if(paths.length === 0) {
      throw new Error("None of the proposed sound types (" +
                      paths.join(", ") +
                      ") is supported by the browser: (" +
                      Luv.Audio.getSupportedTypes().join(", ") +
                      ")");
    }

    var sound = this;
    sound.path = paths[0];

    media.newAsset(sound);

    sound.el         = document.createElement('audio');
    sound.el.preload = "auto";

    sound.el.addEventListener('canplaythrough', function() { media.registerLoad(sound); });
    sound.el.addEventListener('error', function() { media.registerError(sound); });

    sound.el.src     = sound.path;
    sound.el.load();
  },

  toString: function() {
    return 'Luv.Audio.Sound("' + this.path + '")';
  },

  play: function() {
    if(!this.isLoaded()) {
      throw new Error("Attepted to play a non loaded sound: " + this);
    }
    this.el.play();
  }
});

Luv.Audio.Sound.include(Luv.Media.Asset);

var getExtension = function(path) {
  var match = path.match(/.+\.([^?]+)(\?|$)/);
  return match ? match[1].toLowerCase() : "";
};

var isPathExtensionSupported = function(path) {
  return Luv.Audio.canPlayType(getExtension(path));
};

})();
