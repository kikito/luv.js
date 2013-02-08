Luv.Timer = function() {
  this.microTime = 0;
  this.deltaTime = 0;
};

var timer = Luv.Timer.prototype;

timer.step = function(time) {
  if(time > this.microTime) {
    this.deltaTime = time - this.microTime;
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
  return this.deltaTime / 1000;
};
