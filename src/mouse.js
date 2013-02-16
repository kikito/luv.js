var mouseButtonNames = {1: "l", 2: "m", 3: "r"};
var getButtonFromEvent = function(evt) {
  return mouseButtonNames[evt.which];
};

var MouseProto = {
  getX: function() { return this.x; },
  getY: function() { return this.y; },
  getPosition: function() {
    return {x: this.x, y: this.y};
  },
  onPressed: function(x,y,button) {},
  onReleased: function(x,y,button) {}
};

Luv.Mouse = function(el) {
  var mouse = Object.create(MouseProto);

  mouse.x = 0;
  mouse.y = 0;

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

  return mouse;
};

