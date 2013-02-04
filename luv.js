/*! luv 0.0.1 (2013-02-04) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
Luv = function(options) {
  options = options || {};
  var el     = options.el,
      el_id  = options.el_id,
      width  = options.width,
      height = options.height;

  if(!el && el_id) { el = document.getElementById(el_id); }

  this.graphics = new Luv.Graphics(el, width, height);
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

Luv.Graphics.prototype.print = function(str,x,y) {
  this.ctx.fillText(str, x, y);
};
