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

graphics.rect = function(mode, left, top, width, height) {

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
};


