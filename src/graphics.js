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
