// # timer.js
(function(){

// ## Luv.Timer
Luv.Timer = function() {

// In luv, time is managed via instances of this constructor, instead of with
// javascript's setInterval.
// Usually, the timer is something internal that is created by Luv when a game
// is created, and it's used mostly inside luv.js' `run` function.
// luv.js users will rarely need to manipulate objects of this
// library, except to obtain the Frames per second or maybe to tweak the
// deltaTimeLimit (see below)

  return Luv.extend(Object.create(Luv.Timer), {
    // The time that has passed since the timer was created, in milliseconds
    microTime : 0,

    // The time that has passed between the last two frames, in seconds
    deltaTime : 0,

    // The upper value that deltaTime can have, in seconds. Defaults to 0.25.
    // Can be changed via `setDeltaTimeLimit`.
    // Note that this does *not* magically make a game go faster. If a game has
    // very low FPS, this makes sure that the delta time is not too great (its bad
    // for things like physics simulations, etc).
    deltaTimeLimit : 0.25
  });
};

// ## TimerProto
// The `timer` methods go here
Luv.extend(Luv.Timer, {
  getType: function() { return 'Luv.Timer'; },

  // updates the timer with a new timestamp.
  step : function(time) {
    // In some rare cases (the first couple frames) the time readings might
    // overflow. This conditional makes sure that case does not happen.
    if(time > this.microTime) {
      this.deltaTime = (time - this.microTime) / 1000;
      this.microTime = time;
    }
  },

  // `deltaTimeLimit` means "the maximum delta time that the timer will report".
  // It's 0.25 by default. That means that if a frame takes 3 seconds to complete,
  // the *reported* delta time will be 0.25s. This setting doesn't magically make
  // games go faster. It's there to prevent errors when a lot of time passes between
  // frames (for example, if the user changes tabs, the timer could spend entire
  // minutes locked in one frame).
  setDeltaTimeLimit : function(deltaTimeLimit) {
    this.deltaTimeLimit = deltaTimeLimit;
  },

  // returns the `deltaTimeLimit`; the maximum delta time that will be reported.
  // see `setDeltaTimeLimit` for details.
  getDeltaTimeLimit : function() {
    return this.deltaTimeLimit;
  },

  // returns how much time has passed between this frame and the previous one,
  // in seconds. Note that it's capped by `deltaTimeLimit`.
  getDeltaTime : function() {
    return Math.min(this.deltaTime, this.deltaTimeLimit);
  },

  // Returns how much time has passed since the timer was created, in milliseconds
  getMicroTime : function() {
    return this.microTime;
  },

  // Returns how much time has passed since the timer was created, in seconds
  getTime : function() {
    return this.getMicroTime() / 1000;
  },

  // Returns the frames per second
  getFPS : function() {
    return this.deltaTime === 0 ? 0 : 1 / this.deltaTime;
  },

  // This function is used in the main game loop. For now, it just calls `window.requestAnimationFrame`.
  nextFrame : function(f) {
    window.requestAnimationFrame(f);
  }

});

}());
