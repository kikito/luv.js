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
  onReleased: function(x,y,button) {},
  isPressed: function(button) {
    return !!this.pressedButtons[button];
  }
};

Luv.Mouse = function(el) {
  var mouse = Object.create(MouseProto);

  mouse.x = 0;
  mouse.y = 0;
  mouse.pressedButtons = {};

  el.addEventListener('mousemove', function(evt) {
    var rect = el.getBoundingClientRect();
    mouse.x = evt.pageX - rect.left;
    mouse.y = evt.pageY - rect.top;
  });

  el.addEventListener('mousedown', function(evt) {
    var button = getButtonFromEvent(evt);
    mouse.pressedButtons[button] = true;
    mouse.onPressed(mouse.x, mouse.y, button);
  });

  el.addEventListener('mouseup', function(evt) {
    var button = getButtonFromEvent(evt);
    mouse.pressedButtons[button] = false;
    mouse.onReleased(mouse.x, mouse.y, button);
  });

  return mouse;
};

