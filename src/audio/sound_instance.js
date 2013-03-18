// # audio/sound_instance.js
(function() {

// ## Luv.Audio.SoundInstance

Luv.Audio.SoundInstance = Luv.Class('Luv.Audio.SoundInstance', {
  init: function(el, options) {
    var soundInstance = this;
    soundInstance.el = el;
    soundInstance.el.addEventListener('ended', function(){ soundInstance.stop(); });
    soundInstance.reset(options);
  },
  reset: function(options) {
    options = options || {};
    var el = this.el;
    var volume = typeof options.volume === "undefined" ? el.volume       : options.volume,
        loop   = typeof options.loop   === "undefined" ? el.loop         : options.loop,
        speed  = typeof options.speed  === "undefined" ? el.playbackRate : options.speed,
        time   = typeof options.time   === "undefined" ? el.currentTime  : options.time,
        status = typeof options.status === "undefined" ? "ready"         : options.status;

    this.setVolume(volume);
    this.setLoop(loop);
    this.setSpeed(speed);
    this.setTime(time);
    this.status = status;
  },
  play: function() {
    this.el.play();
    this.status = "playing";
  },
  pause: function() {
    if(this.isPlaying()) {
      this.el.pause();
      this.status = "paused";
    }
  },
  stop: function() {
    this.el.pause();
    this.setTime(0);
    this.status = "ready";
  },
  isPaused : function() { return this.status == "paused"; },
  isReady  : function() { return this.status == "ready"; },
  isPlaying: function() { return this.status == "playing"; }
});

Luv.Audio.SoundInstance.include(Luv.Audio.SoundMethods);

}());
