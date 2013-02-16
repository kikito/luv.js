
var TimerProto = {
  step : function(time) {
    if(time > this.microTime) {
      this.deltaTime = (time - this.microTime) / 1000;
      this.microTime = time;
    }
  },

  getMicroTime : function() {
    return this.microTime;
  },

  getTime : function() {
    return this.getMicroTime() / 1000;
  },

  getDeltaTime : function() {
    return Math.min(this.deltaTime, this.deltaTimeLimit);
  },

  getDeltaTimeLimit : function() {
    return this.deltaTimeLimit;
  },

  setDeltaTimeLimit : function(deltaTimeLimit) {
    this.deltaTimeLimit = deltaTimeLimit;
  },

  getFPS : function() {
    return this.deltaTime === 0 ? 0 : 1 / this.deltaTime;
  },

  nextFrame : function(f) {
    window.requestAnimationFrame(f);
  }

};

Luv.Timer = function() {
  var timer = Object.create(TimerProto);
  timer.microTime = 0;
  timer.deltaTime = 0;
  timer.deltaTimeLimit = 0.25;
  return timer;
};

