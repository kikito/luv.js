/*! luv 0.0.1 (2013-02-06) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
(function(){
Luv = function(options) {
  options = options || {};
  var el     = options.el,
      el_id  = options.el_id,
      width  = options.width,
      height = options.height;

  if(!el && el_id) { el = document.getElementById(el_id); }

  this.graphics = new Luv.Graphics(el, width, height);
};

var luv = Luv.prototype;

luv.update = function(dt) {};
luv.draw   = function() {};
luv.load   = function() {};
luv.run    = function() {
  var luv = this;

  luv.load();

  var loop = function(dt) {
    luv.update(dt);
    luv.graphics.clear();
    luv.draw();
    window.requestAnimationFrame(loop);
  };

  loop(0);
};



Luv.Graphics = function(el, width, height) {
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

  this.el = el;
  this.width = width;
  this.height = height;
  this.color = {};
  this.backgroundColor = {};

  this.setColor(255,255,255);
  this.setBackgroundColor(0,0,0);

  this.ctx = el.getContext('2d');
};

var isArray = function(x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};

var graphics = Luv.Graphics.prototype;

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

graphics.setColor = function(r,g,b,a) { setColor(this, 'color', r,g,b,a); };
graphics.getColor = function() { return getColor(this.color); };

graphics.setBackgroundColor = function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); };
graphics.getBackgroundColor = function() { return getColor(this.backgroundColor); };

graphics.clear = function() {
  this.ctx.fillStyle = this.backgroundColorStyle;
  this.ctx.fillRect(0, 0, this.width, this.height);
};

graphics.print = function(str,x,y) {
  this.ctx.fillStyle = this.colorStyle;
  this.ctx.fillText(str, x, y);
};

graphics.line = function() {
  this.ctx.beginPath();

  var args = isArray(arguments[0]) ? arguments[0] : arguments;

  this.ctx.strokeStyle = this.colorStyle;

  if(args.length < 4) { throw new Error("luv.graphics.line requires at least 4 parameters"); }
  if(args.length % 2 == 1) { throw new Error("luv.graphics.line requires an even number of parameters"); }


  this.ctx.moveTo(args[0],args[1]);

  for (var i=2; i<args.length; i=i+2) {
    this.ctx.lineTo(args[i],args[i+1]);
  }

  this.ctx.stroke();
};

graphics.rectangle = function(mode, left, top, width, height) {

  this.ctx.beginPath();
  this.ctx.rect(left, top, width, height);
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
  this.ctx.closePath();
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

}());