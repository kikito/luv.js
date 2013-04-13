// # every_event.js
(function() {

// ## Luv.Timer.EveryEvent
Luv.Timer.EveryEvent = Luv.Class('Luv.Timer.EveryEvent', {

  init: function(timeToCall, callback, context) {
    this.timeRunning = 0;
    this.timeToCall  = timeToCall;
    this.callback    = callback;
    this.context     = context;
  },

  update: function(dt) {
    this.timeRunning += dt;

    if(this.timeToCall > 0) {
      while(this.timeRunning >= this.timeToCall) {
        this.callback.call(this.context, this.timeRunning - this.timeToCall);
        this.timeRunning -= this.timeToCall;
      }
    } else {
      this.callback.call(this.context, dt);
    }
    return false;
  }

});

}());
