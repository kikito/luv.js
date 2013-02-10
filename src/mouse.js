var getElementOffset = function(el) {
  var l = 0, t = 0;
  while(el) {
    l += el.offsetLeft || 0;
    t += el.offsetTop || 0;
    el = el.offsetParent;
  }
  return { left: l, top: t };
};

var getMousePositionFromEvent = function(evt) {
  var x = 0, y = 0;
  if (evt.pageX || evt.pageY)   {
    x = evt.pageX;
    y = evt.pageY;
  }
  else {
    x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  return {x: x, y: y};
};

var mouseButtonNames = {1: "l", 2: "m", 3: "r"};
var getButtonFromEvent = function(evt) {
  return mouseButtonNames[evt.which];
};


Luv.Mouse = function(el) {
  this.x = 0;
  this.y = 0;
  var mouse = this;

  el.addEventListener('mousemove', function(evt) {
    var pos    = getMousePositionFromEvent(evt);
    var offset = getElementOffset(el);
    mouse.x = pos.x - offset.left;
    mouse.y = pos.y - offset.top;
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
