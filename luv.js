/*! luv 0.0.1 (2013-02-17) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
(function(){
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

var initializeOptions = function(options) {
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

  options.el      = el;
  options.width   = width;
  options.height  = height;

  return options;
};

var LuvProto = {
  update: function(dt){},
  draw  : function(){},
  load  : function(){},
  run   : function(){
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
  }
};


Luv = function(options) {
  options = initializeOptions(options);

  var luv = Object.create(LuvProto);
  luv.el  = options.el;

  if(options.load)  { luv.load   = options.load; }
  if(options.update){ luv.update = options.update; }
  if(options.draw)  { luv.draw   = options.draw; }
  if(options.run)   { luv.run    = options.run; }

  luv.graphics  = Luv.Graphics(luv.el, options.width, options.height);
  luv.timer     = Luv.Timer();
  luv.keyboard  = Luv.Keyboard(luv.el);
  luv.mouse     = Luv.Mouse(luv.el);
  luv.media     = Luv.Media();

  return luv;
};




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

var KeyboardProto = {
  onPressed  : function(key, code) {},
  onReleased : function(key, code) {},
  isDown     : function(key) {
    return !!this.keysDown[key];
  }
};

Luv.Keyboard = function(el) {
  var keyboard = Object.create(KeyboardProto);

  keyboard.keysDown = {};

  el.tabIndex = 1;
  el.focus();

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

  return keyboard;
};


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


var AssetProto = {
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

var ImageProto = Object.create(AssetProto);

ImageProto.getWidth       = function() { return this.source.width; };
ImageProto.getHeight      = function() { return this.source.height; };
ImageProto.getDimensions  = function() {
  return { width: this.source.width, height: this.source.height };
};

var MediaProto = {
  isLoaded     : function() { return this.pending === 0; },
  getPending   : function() { return this.pending; },
  onAssetLoaded: function(asset) {},
  onLoadError  : function(asset) { throw new Error("Could not load " + asset); },
  onLoaded     : function() {},
  newAsset  : function(asset, loadCallback, errorCallback) {
    this.pending++;
    asset.loadCallback  = loadCallback;
    asset.errorCallback = errorCallback;
    asset.status        = "pending";
  },
  registerLoad : function(asset) {
    this.pending--;

    asset.status = "loaded";
    if(asset.loadCallback) { asset.loadCallback(asset); }

    this.onAssetLoaded(asset);
    if(this.isLoaded()) { this.onLoaded(); }
  },
  registerError: function(asset) {
    this.pending--;

    asset.status = "error";
    if(asset.errorCallback) { asset.errorCallback(asset); }

    this.onLoadError(asset);
  }
};

Luv.Media = function() {
  var media = Object.create(MediaProto);

  media.pending = 0;

  media.Image = function(src, loadCallback, errorCallback) {
    var image  = Object.create(ImageProto);
    media.newAsset(image, loadCallback, errorCallback);

    var source = new Image(); // html image
    image.source = source;

    source.addEventListener('load',  function(){ media.registerLoad(image); });
    source.addEventListener('error', function(){ media.registerError(image); });
    source.src = src;

    return image;
  };

  return media;
};


var twoPI = Math.PI * 2;

var setColor = function(self, name, r,g,b,a) {
  var color = self[name];
  if(Array.isArray(r)) {
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


var GraphicsProto = {
  setColor : function(r,g,b,a) { setColor(this, 'color', r,g,b,a); },
  getColor : function() { return getColor(this.color); },

  setBackgroundColor : function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); },
  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  setLineWidth : function(width) {
    this.ctx.lineWidth = width;
  },

  getLineWidth : function() {
    return this.ctx.lineWidth;
  },

  setLineCap : function(cap) {
    if(cap != "butt" && cap != "round" && cap != "square") {
      throw new Error("Line cap must be either 'butt', 'round' or 'square'");
    }
    this.ctx.lineCap = cap;
  },

  getLineCap : function() { return this.ctx.lineCap; },

  clear : function() {
    this.ctx.fillStyle = this.backgroundColorStyle;
    this.ctx.fillRect(0, 0, this.width, this.height);
  },

  print : function(str,x,y) {
    this.ctx.fillStyle = this.colorStyle;
    this.ctx.fillText(str, x, y);
  },

  line : function() {
    var coords = Array.isArray(arguments[0]) ? arguments[0] : arguments;

    this.ctx.beginPath();
    drawPolyLine.call(this, 'luv.graphics.line', 4, coords);
    drawPath.call(this, 'line');
  },

  rectangle : function(mode, left, top, width, height) {
    this.ctx.beginPath();
    this.ctx.rect(left, top, width, height);
    drawPath.call(this, mode);
    this.ctx.closePath();
  },

  polygon : function() {
    var mode   = arguments[0],
        coords = arguments[1];

    if(!Array.isArray(coords)) {
      coords = [];
      for(var i=1;i<arguments.length;i++) { coords[i-1] = arguments[i]; }
    }

    this.ctx.beginPath();

    drawPolyLine.call(this, 'luv.graphics.polygon', 6, coords);
    drawPath.call(this, mode);

    this.ctx.closePath();
  },

  circle : function(mode, x,y,radius) {
    this.arc(mode, x, y, radius, 0, twoPI);
    this.ctx.closePath();
  },

  arc : function(mode, x,y,radius, startAngle, endAngle) {
    this.ctx.beginPath();
    this.ctx.arc(x,y,radius, startAngle, endAngle, false);
    drawPath.call(this, mode);
  },

  drawImage : function(img, x, y) {
    if(!img.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + img);
    }
    this.ctx.drawImage(img.source, x, y);
  }
};

Luv.Graphics = function(el, width, height) {
  var gr = Object.create(GraphicsProto);

  gr.el = el;
  gr.width = width;
  gr.height = height;
  gr.ctx = el.getContext('2d');

  gr.color = {};
  gr.backgroundColor = {};

  gr.setColor(255,255,255);
  gr.setBackgroundColor(0,0,0);

  return gr;
};


}());