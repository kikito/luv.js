// # after_event.js
(function() {

// ## Luv.Timer.AfterEvent
Luv.Timer.AfterEvent = Luv.Class('Luv.Timer.AfterEvent', {

  init: function(timeToCall, callback, context) {
    this.timeRunning = 0;
    this.timeToCall  = timeToCall;
    this.callback    = callback;
    this.context     = context;
  },

  update: function(dt) {
    this.timeRunning += dt;
    var diff = this.timeRunning - this.timeToCall;
    if(diff >= 0) {
      this.callback.call(this.context, diff);
      return true;
    }
    return false;
  }

});

}());
