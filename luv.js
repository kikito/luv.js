/*! luv 0.0.1 (2013-02-04) - https://github.com/kikito/luv.js */
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

  window.requestAnimationFrame(function(dt){
    luv.update(dt);
    luv.graphics.clear();
    luv.draw();
  });
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

  this.ctx = el.getContext('2d');
};

var graphics = Luv.Graphics.prototype;

graphics.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

graphics.print = function(str,x,y) {
  this.ctx.fillText(str, x, y);
};

var isArray = function(x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};

graphics.line = function() {
  this.ctx.beginPath();

  var args = isArray(arguments[0]) ? arguments[0] : arguments;

  if(args.length < 4) { throw new Error("luv.graphics.line requires at least 4 parameters"); }
  if(args.length % 2 == 1) { throw new Error("luv.graphics.line requires an even number of parameters"); }


  this.ctx.moveTo(args[0],args[1]);

  for (var i=2; i<args.length; i=i+2) {
    this.ctx.lineTo(args[i],args[i+1]);
  }

  this.ctx.stroke();
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