// # mouse.js

// ## Luv.Mouse
Luv.Mouse = function(el) {
  // This module allows luv.js games to get input from the mouse
  // It is usually instantiated directly by the main Luv() function,
  // a programmer using luv.js to create a game will almost certainly
  // not need to create this module. But it's completely possible to
  // do so, like this:

  //       var mouse = Luv.Mouse(el); // el must be a DOM element
  var mouse = Object.create(MouseProto);

  mouse.x = 0;
  mouse.y = 0;
  mouse.pressedButtons = {};

  // The mouse module works by attaching several event listeners to the
  // given el element. That's how clicks and movements are detected.

  // mousemove is particularly laggy in Chrome. I'd love to find a better solution
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


// Internal variable + function to transform DOM event magic numbers into human button names
// (left, middle, right)
var mouseButtonNames = {1: "l", 2: "m", 3: "r"};
var getButtonFromEvent = function(evt) {
  return mouseButtonNames[evt.which];
};

// ## MouseProto
// Shared mouse functions go here
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

