// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
//
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];

  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] ||
                                   window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }
}());


Luv.Timer = function() {
  this.microTime = 0;
  this.deltaTime = 0;
  this.deltaTimeLimit = 0.25;
};

var timer = Luv.Timer.prototype;

timer.step = function(time) {
  if(time > this.microTime) {
    this.deltaTime = (time - this.microTime) / 1000;
    this.microTime = time;
  }
};

timer.getMicroTime = function() {
  return this.microTime;
};

timer.getTime = function() {
  return this.getMicroTime() / 1000;
};

timer.getDeltaTime = function() {
  return Math.min(this.deltaTime, this.deltaTimeLimit);
};

timer.getDeltaTimeLimit = function() {
  return this.deltaTimeLimit;
};

timer.setDeltaTimeLimit = function(deltaTimeLimit) {
  this.deltaTimeLimit = deltaTimeLimit;
};

timer.getFPS = function() {
  return this.deltaTime === 0 ? 0 : 1 / this.deltaTime;
};

timer.nextFrame = function(f) {
  window.requestAnimationFrame(f);
};
