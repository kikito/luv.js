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
      throw new Error("None of the provided sound types (" +
                      paths.join(", ") +
                      ") is supported by the browser: (" +
                      Luv.Audio.getSupportedTypes().join(", ") +
                      ")");
    }

    var sound = this;

    sound.path = paths[0];

    media.newAsset(sound);
    var el = sound.el= document.createElement('audio');
    el.preload = "auto";

    el.addEventListener('canplaythrough', function() {
      if(sound.isLoaded()){ return; }
      media.registerLoad(sound);
    });
    el.addEventListener('error', function() { media.registerError(sound); });

    el.src     = sound.path;
    el.load();

    sound.instances = [];
    sound.expirationTime = Luv.Audio.Sound.DEFAULT_EXPIRATION_TIME;
  },

  toString: function() {
    return 'Luv.Audio.Sound("' + this.path + '")';
  },

  play: function(options) {
    if(!this.isLoaded()) {
      throw new Error("Attepted to play a non loaded sound: " + this);
    }
    var instance = this.getReadyInstance(options);
    instance.play();
    return instance;
  },

  pause: function() {
    this.instances.forEach(function(instance){ instance.pause(); });
  },

  stop: function() {
    this.instances.forEach(function(instance){ instance.stop(); });
  },

  countInstances: function() {
    return this.instances.length;
  },

  countPlayingInstances: function() {
    var count = 0;
    this.instances.forEach(function(inst){ count += inst.isPlaying() ? 1 : 0; });
    return count;
  },

  getReadyInstance: function(options) {
    var sound = this;
    var instance = getExistingReadyInstance(this.instances);
    if(instance) {
      instance.reset(options);
    } else {
      instance = Luv.Audio.SoundInstance(this.el.cloneNode(true), options);
      this.instances.push(instance);
    }
    resetInstanceExpirationTimeOut(this, instance);
    return instance;
  },

  getExpirationTime: function() {
    return this.expirationTime;
  },

  setExpirationTime: function(time) {
    this.expirationTime = time;
  }
});

Luv.Audio.Sound.DEFAULT_EXPIRATION_TIME = 3000; // 3 seconds

Luv.Audio.Sound.include(Luv.Media.Asset);

Luv.Audio.SoundMethods = {
  setVolume: function(volume) {
    volume = clampNumber(volume, 0, 1);
    this.el.volume = volume;
  },
  getVolume: function() {
    return this.el.volume;
  },
  setLoop: function(loop) {
    this.loop = !!loop;
    if(loop) {
      this.el.loop = "loop";
    } else {
      this.el.removeAttribute("loop");
    }
  },
  getLoop: function() {
    return this.loop;
  },
  setSpeed: function(speed) {
    this.el.playbackRate = speed;
  },
  getSpeed: function() {
    return this.el.playbackRate;
  },
  setTime: function(time) {
    try {
      this.el.currentTime = time;
    } catch(err) {
      // some browsers throw an error when setting currentTime right after loading
      // a node. See https://bugzilla.mozilla.org/show_bug.cgi?id=465498
    }
  },
  getTime: function() {
    return this.el.currentTime;
  },
  getDuration: function() {
    return this.el.duration;
  }
};

Luv.Audio.Sound.include(Luv.Audio.SoundMethods);

var getExistingReadyInstance = function(instances) {
  var instance;
  for(var i=0; i< instances.length; i++) {
    instance = instances[i];
    if(instance.isReady()) {
      return instance;
    }
  }
};

var resetInstanceExpirationTimeOut = function(sound, instance) {
  clearTimeout(instance.expirationTimeOut);
  instance.expirationTimeOut = setTimeout(function() {
    var index = sound.instances.indexOf(instance);
    if(index != -1){ sound.instances.splice(index, 1); }
  }, sound.expirationTime);
};

var getExtension = function(path) {
  var match = path.match(/.+\.([^?]+)(\?|$)/);
  return match ? match[1].toLowerCase() : "";
};

var isPathExtensionSupported = function(path) {
  return Luv.Audio.canPlayType(getExtension(path));
};

var clampNumber = function(x, min, max) {
  return Math.max(min, Math.min(max, Number(x)));
};

})();
