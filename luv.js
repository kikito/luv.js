/*! luv 0.0.1 (2013-02-14) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
(function(){
Luv = function(options) {
  options = options || {};
  var el     = options.el,
      id     = options.id,
      width  = options.width,
      height = options.height;

  if(!el && id) { el = document.getElementById(id); }
  if(el) {
    if(!width  && el.getAttribute('width'))  { width = parseInt(el.getAttribute('width'), 10); }
    if(!height && el.getAttribute('height')) { height = parseInt(el.getAttribute('height'), 10); }
  } else {
    el = document.createElement('canvas');
    document.getElementsByTagName('body')[0].appendChild(el);
  }
  width = width || 800;
  height = height || 600;
  el.setAttribute('width', width);
  el.setAttribute('height', height);

  this.graphics = new Luv.Graphics(el, width, height);
  this.timer    = new Luv.Timer();
  this.keyboard = new Luv.Keyboard(el);
  this.mouse    = new Luv.Mouse(el);
  this.media    = new Luv.Media();
};

var luv = Luv.prototype;

luv.update = function(dt) {};
luv.draw   = function() {};
luv.load   = function() {};

luv.run    = function() {
  var luv = this;

  luv.load();

  var loop = function(time) {
    luv.timer.step(time);
    var dt = luv.timer.getDeltaTime();

    luv.update(dt);
    luv.graphics.clear();
    luv.draw();

    luv.timer.nextFrame(loop);
  };

  luv.timer.nextFrame(loop);
};



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


// keycodes/ algorithms inspired by http://www.selfcontained.us/2009/09/16/getting-keycode-values-in-javascript/
var keys = {
  8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt",
  19: "pause", 20: "capslock", 27: "escape", 33: "pageup", 34: "pagedown",
  35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert",
  46: "delete", 91: "lmeta", 92: "rmeta", 93: "mode", 96: "kp0", 97: "kp1",
  98: "kp2", 99: "kp3", 100: "kp4", 101: "kp5", 102: "kp6", 103: "kp7", 104: "kp8",
  105: "kp9", 106: "kp*", 107: "kp+", 109: "kp-", 110: "kp.", 111: "kp/", 112: "f1",
  113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9",
  121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scrolllock", 186: ",",
  187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
  221: "]", 222: "'"
};

var shiftedKeys = {
  192:"~", 48:")", 49:"!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^", 55:"&", 56:"*", 57:"(", 109:"_", 61:"+",
  219:"{", 221:"}", 220:"|", 59:":", 222:"\"", 188:"<", 189:">", 191:"?",
  96:"insert", 97:"end", 98:"down", 99:"pagedown", 100:"left", 102:"right", 103:"home", 104:"up", 105:"pageup"
};

var rightKeys = {
  16: "rshift", 17: "rctrl", 18: "ralt"
};

var getKeyFromEvent = function(event) {
  var code = event.which;
  var key;
  if(event.keyLocation && event.keyLocation > 1) { key = rightKeys[code]; }
  else if(event.shiftKey) { key = shiftedKeys[code]; }
  else { key = keys[code]; }

  return key || String.fromCharCode(code);
};

Luv.Keyboard = function(el) {
  el.tabIndex = 1;
  el.focus();
  this.keysDown = {};

  var keyboard = this;

  el.addEventListener('keydown', function(evt) {
    var key  = getKeyFromEvent(evt);
    keyboard.keysDown[key] = true;
    keyboard.onPressed(key, evt.which);
  });

  el.addEventListener('keyup', function(evt) {
    var key  = getKeyFromEvent(evt);
    keyboard.keysDown[key] = false;
    keyboard.onReleased(key, evt.which);
  });
};

var keyboard = Luv.Keyboard.prototype;

keyboard.onPressed   = function(key, code) {};
keyboard.onReleased  = function(key, code) {};

keyboard.isDown    = function(key) {
  return !!this.keysDown[key];
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

Luv.Media = function() {
  this.pending = 0;

  var media = this;

  media.Image = function(src, loadCallback, errorCallback) {
    Luv.Media.Image.call(this, media, src, loadCallback, errorCallback);
  };
  media.Image.prototype = Luv.Media.Image.prototype;
};

var media = Luv.Media.prototype;

media.isLoaded         = function() { return this.pending === 0; };
media.getPending       = function() { return this.pending; };
media.onResourceLoaded = function(resource) {};
media.onLoadError      = function(resource) { throw new Error("Could not load " + resource); };
media.onLoaded         = function() {};

media.registerNew = function(resource) {
  this.pending++;
  return resource;
};
media.registerLoad = function(resource) {
  this.pending--;
  this.onResourceLoaded(resource);
  if(this.isLoaded()) { this.onLoaded(); }
};
media.registerError = function(resource) {
  this.pending--;
  this.onLoadError(resource);
};

////

Luv.Media.Resource = function(source, loadCallback, errorCallback) {
  this.source         = source;
  this.loadCallback   = loadCallback;
  this.errorCallback  = errorCallback;
  this.status         = "pending";
};

Luv.Media.Resource.prototype = {
  markAsLoadWithCallback: function() {
    this.status = "loaded";
    if(this.loadCallback) { this.loadCallback(this); }
  },
  markAsErrorWithCallback: function() {
    this.status = "error";
    if(this.errorCallback) { this.errorCallback(this); }
  },
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

////

Luv.Media.Image = function(media, src, loadCallback, errorCallback) {
  var image = this,         // Luv image
      source = new Image(); // html image

  Luv.Media.Resource.call(this, source, loadCallback, errorCallback);

  source.addEventListener('load',  function(){
    image.markAsLoadWithCallback();
    media.registerLoad(image);
  });
  source.addEventListener('error', function(){
    image.markAsErrorWithCallback();
    media.registerError(image);
  });
  media.registerNew(this);

  source.src = src;
};

Luv.Media.Image.prototype = new Luv.Media.Resource();

Luv.Media.Image.prototype.getWidth       = function()  { return this.source.width; };
Luv.Media.Image.prototype.getHeight      = function() { return this.source.height; };
Luv.Media.Image.prototype.getDimensions  = function() {
  return {width: this.source.width, height: this.source.height};
};

Luv.Graphics = function(el, width, height) {
  this.el = el;
  this.width = width;
  this.height = height;
  this.color = {};
  this.backgroundColor = {};

  this.setColor(255,255,255);
  this.setBackgroundColor(0,0,0);

  this.ctx = el.getContext('2d');
};

var twoPI = Math.PI * 2;

var isArray = function(x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};

var setColor = function(self, name, r,g,b,a) {
  var color = self[name];
  if(isArray(r)) {
    color.r = r[0];
    color.g = r[1];
    color.b = r[2];
    color.a = r[3] || 255;
  } else {
    color.r = r;
    color.g = g;
    color.b = b;
    color.a = a || 255;
  }
  self[name + 'Style'] = "rgba(" + [color.r, color.g, color.b, color.a/255].join() + ")";
};

var getColor = function(color) {
  return [color.r, color.g, color.b, color.a ];
};

var drawPath = function(mode) {
  switch(mode){
  case 'fill':
    this.ctx.fillStyle = this.colorStyle;
    this.ctx.fill();
    break;
  case 'line':
    this.ctx.strokeStyle = this.colorStyle;
    this.ctx.stroke();
    break;
  default:
    throw new Error('Invalid mode: [' + mode + ']. Should be "fill" or "line"');
  }
};

var drawPolyLine = function(methodName, minLength, coords) {

  if(coords.length < minLength) { throw new Error(methodName + " requires at least 4 parameters"); }
  if(coords.length % 2 == 1) { throw new Error(methodName + " requires an even number of parameters"); }

  this.ctx.moveTo(coords[0], coords[1]);

  for(var i=2; i<coords.length; i=i+2) {
    this.ctx.lineTo(coords[i], coords[i+1]);
  }

  this.ctx.stroke();
};

var graphics = Luv.Graphics.prototype;

graphics.setColor = function(r,g,b,a) { setColor(this, 'color', r,g,b,a); };
graphics.getColor = function() { return getColor(this.color); };

graphics.setBackgroundColor = function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); };
graphics.getBackgroundColor = function() { return getColor(this.backgroundColor); };

graphics.setLineWidth = function(width) {
  this.ctx.lineWidth = width;
};

graphics.getLineWidth = function() {
  return this.ctx.lineWidth;
};

graphics.setLineCap = function(cap) {
  if(cap != "butt" && cap != "round" && cap != "square") {
    throw new Error("Line cap must be either 'butt', 'round' or 'square'");
  }
  this.ctx.lineCap = cap;
};

graphics.getLineCap = function() {
  return this.ctx.lineCap;
};

graphics.clear = function() {
  this.ctx.fillStyle = this.backgroundColorStyle;
  this.ctx.fillRect(0, 0, this.width, this.height);
};

graphics.print = function(str,x,y) {
  this.ctx.fillStyle = this.colorStyle;
  this.ctx.fillText(str, x, y);
};

graphics.line = function() {
  var coords = isArray(arguments[0]) ? arguments[0] : arguments;

  this.ctx.beginPath();
  drawPolyLine.call(this, 'luv.graphics.line', 4, coords);
  drawPath.call(this, 'line');
};

graphics.rectangle = function(mode, left, top, width, height) {
  this.ctx.beginPath();
  this.ctx.rect(left, top, width, height);
  drawPath.call(this, mode);
  this.ctx.closePath();
};

graphics.polygon = function() {
  var mode   = arguments[0],
      coords = arguments[1];

  if(!isArray(coords)) {
    coords = [];
    for(var i=1;i<arguments.length;i++) { coords[i-1] = arguments[i]; }
  }

  this.ctx.beginPath();

  drawPolyLine.call(this, 'luv.graphics.polygon', 6, coords);
  drawPath.call(this, mode);

  this.ctx.closePath();
};

graphics.circle = function(mode, x,y,radius) {
  this.arc(mode, x, y, radius, 0, twoPI);
  this.ctx.closePath();
};

graphics.arc = function(mode, x,y,radius, startAngle, endAngle) {
  this.ctx.beginPath();
  this.ctx.arc(x,y,radius, startAngle, endAngle, false);
  drawPath.call(this, mode);
};

graphics.drawImage = function(img, x, y) {
  if(!img.isLoaded()) {
    throw new Error("Attepted to draw a non loaded image: " + img);
  }
  this.ctx.drawImage(img.source, x, y);
};




}());