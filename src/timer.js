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
