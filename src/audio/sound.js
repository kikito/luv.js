// # audio/sound.js
(function(){

// ## Luv.Audio.Sound

// This class wraps an `<audio>` tag. You will likely not instantiate this
// class directly; instead you will create a `Luv` instance, which has an
// `audio` module. And that module will have a `Sound` method, which will
// internally call `Luv.Audio.Sound` with the appropiate parameters. In other
// words, you will probably do this:

//       var luv = Luv();
//       var cry = luv.audio.Sound('sfx/cry.ogg', 'sfx/cry.mp3');

// `Luv.Audio.Sound` accepts a variable number of paths (strings). This is due to the fact
// that different browsers have different sound codecs. Luv will detect which
// codecs the browser supports, and load the first one on the given list that is
// available.

// If the browser is not capable of playing sounds reliably (for example in some
// old iphone browsers) then creating sounds will not produce any errors; no files
// will be downloaded, but calling `cry.play()` will not produce any sound.
// For more information about sound calls in non-sound-capable browsers, see
// `audio/null_sound.js`

// However, if the browser is capable of playing sounds, but it could not load
// them (for a network reason, or because the list of file paths doesn't include
// a file format that the browser can handle) then an error will be produced.

// Notice that Sounds can't be played right after they are created; they must
// finish loading first. See the `play` method below for details.
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

  // `play` is the main way one has for playing sounds in Luv. Usually you call it
  // inside the `update` function.
  //
  // There is a catch, though. If you attempt to play a sound that has not been
  // completely loaded, you might get an error:
  //
  //       var luv = Luv();
  //       var cry;
  //
  //       luv.load = function() {
  //         cry = luv.audio.Sound('sfx/cry.ogg', 'sfx/cry.mp3');
  //       };
  //
  //       luv.update = function() {
  //         // This will throw an error;
  //         // cry might need some time to load.
  //         // Continue reading for a working version.
  //         if(something) { cry.play(); }
  //       };
  //
  // A simple way to fix this is to check that all media has been loaded before
  // attempting to play any sounds. The `luv.media` object has a `isLoaded` method
  // that we can use for that. A simple way is to just end the `luv.update` call
  // if media is still being loaded. Like this:
  //
  //       luv.update = function() {
  //         if(!luv.media.isLoaded()) { return; }
  //         // All sounds (and images) are loaded now, we can play them
  //         if(something) { cry.play(); }
  //       };
  //
  // Note: play returns a *sound instance*. The same sound can have several sound
  // instances playing simultaneously; each of those is one instance. See `audio/sound_instance.js` for
  // details.
  //
  // Possible options:
  //
  // * `volume`: float number, from 0 (muted) to 1 (max volume). Default: 1.
  // * `loop`: boolean, true if the instance must loop, false otherwise. Default: false.
  // * `speed`: float number, 1 is regular velocity, 2 is 2x, 0.5 is half, etc. Default: 1.
  // * `time`: float number, in seconds. The time offset to be used. Default: 0
  // * `status`: string, it can be either "paused" or "ready". Defaults to "ready".
  play: function(options) {
    if(!this.isLoaded()) {
      throw new Error("Attepted to play a non loaded sound: " + this);
    }
    var instance = this.getReadyInstance(options);
    instance.play();
    return instance;
  },

  // Pauses all the instances of the sound. If you want to pause an individual instance,
  // call `instance.pause()` instead of `sound.pause()`.
  pause: function() {
    this.instances.forEach(function(instance){ instance.pause(); });
  },

  // Stops all the instances of the sound. The difference between `pause` and `stop` is that
  // stop "rewinds" each instance, and marks it as "ready to be reused";
  stop: function() {
    this.instances.forEach(function(instance){ instance.stop(); });
  },

  // `countInstances` returns how many instances the sound has.
  // Includes both playing and finished instances.
  countInstances: function() {
    return this.instances.length;
  },

  // `countPlayingInstances` counts how many instances of the sound are currently playing.
  // Non-playing instances are destroyed after 3 seconds of inactivity by default.
  countPlayingInstances: function() {
    var count = 0;
    this.instances.forEach(function(inst){ count += inst.isPlaying() ? 1 : 0; });
    return count;
  },

  // `getReadyInstance` returns the first instance which is available for playing.
  // The method tries to find one available instance in the list of instances; if no
  // available instances are found, it creates a new one.
  //
  // accepts the same options as `play`. The only difference is that getReadyInstance returns
  // an instance in the `"ready"` status, while the one returned by `play` is in the `"playing"` status.
  getReadyInstance: function(options) {
    var instance = getExistingReadyInstance(this.instances);
    if(!instance) {
      instance = createInstance(this);
      this.instances.push(instance);
    }
    instance.reset(this.el, options);
    return instance;
  },

  // `getExpirationTime` returns how much time instances are preserved before they
  // expire. By default it's 3 seconds.
  getExpirationTime: function() {
    return this.expirationTime;
  },

  // `setExpirationTime` sets the time it takes to expire an instance after it has stopped playing.
  // In some browers, it takes time to create each sound instance, so increasing this value can
  // By default it is 3 seconds.
  setExpirationTime: function(seconds) {
    this.expirationTime = seconds;
  }
});

// This class variable controls the default expiration time of sound instances
Luv.Audio.Sound.DEFAULT_EXPIRATION_TIME = 3; // 3 seconds

// Sound is an asset. The `Luv.Media.Asset` mixin adds methods like `isLoaded` and `isPending` to the class.
Luv.Audio.Sound.include(Luv.Media.Asset);

// `Luv.Audio.SoundMethods` is a mixin shared by both `Luv.Audio.Sound` and `Luv.Audio.SoundInstance`.
// In `Sound`, they modify the "defaults" used for creating new instances. In `SoundInstance` they modify
// the instances themselves.
Luv.Audio.SoundMethods = {

  // `setVolume` expects a float between 0.0 (no sound) and 1.0 (full sound). Defaults to 1.
  //
  // * When invoked in a `Sound`, it alters how any subsequent calls to sound.play() sound. Alternatively, you can invoke
  //   `sound.play({sound: 0.5})` to alter the volume of only one sound instance.
  // * When invoked in a `SoundInstance`, it alters the volume of that particular instance.
  setVolume: function(volume) {
    volume = clampNumber(volume, 0, 1);
    this.el.volume = volume;
  },

  // `getVolume` returns the volume of a particular sound/sound instance. See `setVolume` for more details.
  getVolume: function() {
    return this.el.volume;
  },

  // `setLoop` expects a `true` or `false` value.
  //
  // * When invoked in a `Sound`, it will make the sound "play in loop" in all sucessive calls to `sound.play()`. It is
  //   usually a better idea to call `sound.play({loop: true})` instead. That way, only one instance of the sound will loop.
  // * When invoked in a `SoundInstance`, it will make the instance loop (or deactivate the looping).
  setLoop: function(loop) {
    this.loop = !!loop;
    if(loop) {
      this.el.loop = "loop";
    } else {
      this.el.removeAttribute("loop");
    }
  },

  // `getLoop` returns the state of the internal `loop` variable (true if the sound/sound instance starts over after finishing, false
  // if the sound/sound instance just halts after the first play).
  getLoop: function() {
    return this.loop;
  },

  // `setSpeed` expects a numeric float with the speed at which the sound/sound instance will play. 1.0 is regular. 2.0 is 2x. 0.5 is half
  // speed. And so on.
  // If nothing is specified, the default speed of any sound is 1.0.
  //
  // * When invoked in a `Sound`, it alters the speed of all the sound instances produced by calls to `sound.play()`. You can also invoke
  //   `sound.play({speed: 2.0})` to alter the speed of a particular sound instance without modifying the others.
  // * When invoked in a `SoundInstance`, it alters the speed of that instance only.
  setSpeed: function(speed) {
    this.el.playbackRate = speed;
  },

  // `getSpeed` returns the sound/sound instance speed. See `setSpeed` for details.
  getSpeed: function() {
    return this.el.playbackRate;
  },

  // `setTime` expects a float number specifying the "time offset" of a particular sound/sound instance. Defaults to 0.
  //
  // * When invoked in a `Sound`, it will make all the sound instances created by `sound.play()` have a default time when they start playing.
  //   You can alternatively do `sound.play({time: 4})` to only modify one particular instance.
  // * When invoked in a `SoundInstance`:
  //   * If the instance is playing, it will "jump" to that time.
  //   * If the instance is not playing, it will "start" on that time when it is played.
  setTime: function(time) {
    try {
      this.el.currentTime = time;
    } catch(err) {
      // some browsers throw an error when setting currentTime right after loading
      // a node. See https://bugzilla.mozilla.org/show_bug.cgi?id=465498
    }
  },

  // `getTime` returns the internal `time` attribute of a sound/sound instance. See `setTime` for details.
  getTime: function() {
    return this.el.currentTime;
  },

  // `getDuration` returns the total duration of a sound instance.
  getDuration: function() {
    return this.el.duration;
  }
};

Luv.Audio.Sound.include(Luv.Audio.SoundMethods);

// Internal function used by Luv.Sound.getReadyInstance
var getExistingReadyInstance = function(instances) {
  var instance;
  for(var i=0; i< instances.length; i++) {
    instance = instances[i];
    if(instance.isReady()) {
      return instance;
    }
  }
};

// Internal function used by Luv.Sound.getReadyInstance
var createInstance = function(sound) {
 return Luv.Audio.SoundInstance(
    sound.el.cloneNode(true),
    function() { clearTimeout(this.expirationTimeOut); },
    function() {
      var instance = this;
      instance.expirationTimeOut = setTimeout(
        function() { removeInstance(sound, instance); },
        sound.getExpirationTime() * 1000
      );
  });
};

// Internal function. Removes an instance from the list of instances.
var removeInstance = function(sound, instance) {
  var index = sound.instances.indexOf(instance);
  if(index != -1){ sound.instances.splice(index, 1); }
};

// Internal function to get the file extension from a path. It takes into account things like removing query
// parameters (it takes something like `"http://example.com/foo.mp3?x=1&y=2"` and returns `"mp3"`).
var getExtension = function(path) {
  var match = path.match(/.+\.([^?]+)(\?|$)/);
  return match ? match[1].toLowerCase() : "";
};

// Internal function. Given a path, return whether its file extension is playable by the current browser.
var isPathExtensionSupported = function(path) {
  return Luv.Audio.canPlayType(getExtension(path));
};

// Internal function. If x < min, return min. If x > max, return max. Otherwise, return x.
var clampNumber = function(x, min, max) {
  return Math.max(min, Math.min(max, Number(x)));
};

})();
