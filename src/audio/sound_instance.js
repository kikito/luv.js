// # audio/sound_instance.js
(function() {

// ## Luv.Audio.SoundInstance

// Once a `Luv.Sound` is loaded, you can invoke its `play` method to play it.
// Every time you invoke `play`, a instance of that sound (a `SoundInstance`)
// will be created (or recycled) and a reference to that instance will be
// returned by `play`. If you want, you can preserve that instance to do things
// with it later on.
//
// For example: You might have an `Enemy` class that `shouts` something when it
// sees the player. If an enemy is killed while he's shouting, you will probably
// want to hold a reference to that enemy's sound instance, and stop it. The rest
// of the enemies, who also saw the player, should "keep shouting", since they are
// still alive.
//
// You will almost certainly not instantiate this class directly. Instead, you will
// use `Luv.Sound.play` to create sound instances, like this:

//       var luv = Luv();
//       var shout = Luv.audio.Sound('sfx/shout.ogg', 'sfx/shout.mp3');
//       ...
//       // You could also do if(luv.media.isLoaded()){ here
//       if(shout.isLoaded()) {
//         var instance = shout.play({volume: 0.5});
//       }

Luv.Audio.SoundInstance = Luv.Class('Luv.Audio.SoundInstance', {

  // `init` takes an `el` (an audio tag) and an optional `options` array.
  // * `el` is usually a clone of a Sound's el instance.
  // * `onPlay` and `onStop` are callbacks that the sound instance must call when played/stopped.
  //   They are usually used by the Sound, to note that the instance is ready to be put in the
  //   available/expired track.
  init: function(el, onPlay, onStop) {
    var instance = this;
    instance.el = el;
    instance.onPlay = onPlay;
    instance.onStop = onStop;
    instance.el.addEventListener('ended', function(){ instance.stop(); });
  },

  // `reset` expects an audio element (usually, the one wrapped by a sound) and an options object
  // (with the same properties as `Luv.Audio.Sound.play`). It
  // sets the sound instance properties according to what they specify. When an option
  // is not specified, it resets the instance to a default value (for instance, if volume
  // is not specified, it's reset to 1.0).
  reset: function(soundEl, options) {
    options = options || {};
    var volume = typeof options.volume === "undefined" ? soundEl.volume       : options.volume,
        loop   = typeof options.loop   === "undefined" ? !!soundEl.loop       : options.loop,
        speed  = typeof options.speed  === "undefined" ? soundEl.playbackRate : options.speed,
        time   = typeof options.time   === "undefined" ? soundEl.currentTime  : options.time,
        status = typeof options.status === "undefined" ? "ready"              : options.status;

    this.setVolume(volume);
    this.setLoop(loop);
    this.setSpeed(speed);
    this.setTime(time);
    this.status = status;
  },

  // If the instance was not playing, it starts playing. If it was not playing, it does nothing
  play: function() {
    this.el.play();
    this.status = "playing";
    this.onPlay();
  },

  // `pause` halts the reproduction of a sound instance. The instance `status` is set to `"paused"`, and
  // sound is interrupted.
  pause: function() {
    if(this.isPlaying()) {
      this.el.pause();
      this.status = "paused";
    }
  },

  // `stop` halts the reproduction of a sound instance, and also rewinds it.
  // The instance `status` is set to `"ready"`.
  stop: function() {
    this.el.pause();
    this.setTime(0);
    this.status = "ready";
    this.onStop();
  },

  isPaused : function() { return this.status == "paused"; },
  isReady  : function() { return this.status == "ready"; },
  isPlaying: function() { return this.status == "playing"; },

  // Empty functions, usually set up by the Sound that creates the sound instance
  onPlay: function() {},
  onStop: function() {}

});

// This inserts lots of methods like `get/setVolume`, `get/setTime`, and so on.
// See the definition of `Luv.Audio.SoundMethods` inside `audio/sound.js` for details.
Luv.Audio.SoundInstance.include(Luv.Audio.SoundMethods);

}());
