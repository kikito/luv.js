var mouseButtonNames = {1: "l", 2: "m", 3: "r"};
var getButtonFromEvent = function(evt) {
  return mouseButtonNames[evt.which];
};


Luv.Mouse = function(el) {
  this.x = 0;
  this.y = 0;
  var mouse = this;

  el.addEventListener('mousemove', function(evt) {
    var rect = el.getBoundingClientRect();
    mouse.x = evt.pageX - rect.left;
    mouse.y = evt.pageY - rect.top;
  });

  el.addEventListener('mousedown', function(evt) {
    mouse.onPressed(mouse.x, mouse.y, getButtonFromEvent(evt));
  });

  el.addEventListener('mouseup', function(evt) {
    mouse.onReleased(mouse.x, mouse.y, getButtonFromEvent(evt));
  });
};

var mouse = Luv.Mouse.prototype;

mouse.getPosition = function() {
  return {x: this.x, y: this.y};
};

mouse.getX = function() { return this.x; };
mouse.getY = function() { return this.y; };

mouse.onPressed  = function(x,y,button) {};
mouse.onReleased = function(x,y,button) {};
