

var CanvasProto = {
  getWidth      : function(){ return this.width; },
  getHeight     : function(){ return this.height; },
  getDimensions : function(){ return { width: this.width, height: this.height }; }
};

var Canvas = function(el, width, height) {
  el.setAttribute('width', width);
  el.setAttribute('height', height);

  var canvas     = Object.create(CanvasProto);
  canvas.width   = width;
  canvas.height  = height;
  canvas.el      = el;
  canvas.ctx     = el.getContext('2d');

  return canvas;
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

var drawPath = function(graphics, mode) {
  switch(mode){
  case 'fill':
    graphics.ctx.fillStyle = graphics.colorStyle;
    graphics.ctx.fill();
    break;
  case 'line':
    graphics.ctx.strokeStyle = graphics.colorStyle;
    graphics.ctx.stroke();
    break;
  default:
    throw new Error('Invalid mode: [' + mode + ']. Should be "fill" or "line"');
  }
};

var drawPolyLine = function(graphics, methodName, minLength, coords) {

  if(coords.length < minLength) { throw new Error(methodName + " requires at least 4 parameters"); }
  if(coords.length % 2 == 1) { throw new Error(methodName + " requires an even number of parameters"); }

  graphics.ctx.moveTo(coords[0], coords[1]);

  for(var i=2; i<coords.length; i=i+2) {
    graphics.ctx.lineTo(coords[i], coords[i+1]);
  }

  graphics.ctx.stroke();
};


var GraphicsProto = {
  setCanvas: function(canvas) {
    canvas = canvas || this.defaultCanvas;
    this.canvas = canvas;
    this.el     = canvas.el;
    this.ctx    = canvas.ctx;
    this.setLineWidth(this.lineWidth);
    this.setLineCap(this.lineCap);
  },
  getCanvas: function() { return this.canvas; },
  setColor : function(r,g,b,a) { setColor(this, 'color', r,g,b,a); },
  getColor : function() { return getColor(this.color); },

  setBackgroundColor : function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); },
  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  setLineWidth : function(width) {
    this.lineWidth = width;
    this.ctx.lineWidth = width;
  },

  getLineWidth : function() {
    return this.lineWidth;
  },

  setLineCap : function(cap) {
    if(cap != "butt" && cap != "round" && cap != "square") {
      throw new Error("Line cap must be either 'butt', 'round' or 'square'");
    }
    this.ctx.lineCap = cap;
    this.lineCap     = this.ctx.lineCap;
  },

  getLineCap : function() { return this.lineCap; },

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
    drawPolyLine(this, 'luv.graphics.line', 4, coords);
    drawPath(this, 'line');
  },

  rectangle : function(mode, left, top, width, height) {
    this.ctx.beginPath();
    this.ctx.rect(left, top, width, height);
    drawPath(this, mode);
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

    drawPolyLine(this, 'luv.graphics.polygon', 6, coords);
    drawPath(this, mode);

    this.ctx.closePath();
  },

  circle : function(mode, x,y,radius) {
    this.arc(mode, x, y, radius, 0, twoPI);
    this.ctx.closePath();
  },

  arc : function(mode, x,y,radius, startAngle, endAngle) {
    this.ctx.beginPath();
    this.ctx.arc(x,y,radius, startAngle, endAngle, false);
    drawPath(this, mode);
  },

  drawImage : function(img, x, y) {
    if(!img.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + img);
    }
    this.ctx.drawImage(img.source, x, y);
  },

  drawCanvas : function(canvas, x, y) {
    this.ctx.drawImage(canvas.el, x, y);
  }
};

Luv.Graphics = function(el, width, height) {
  var gr = Object.create(GraphicsProto);

  gr.width = width;
  gr.height = height;

  gr.lineWidth = 1;
  gr.lineCap   = "butt";

  gr.color = {};
  gr.setColor(255,255,255);

  gr.backgroundColor = {};
  gr.setBackgroundColor(0,0,0);

  gr.defaultCanvas = Canvas(el, width, height);
  gr.setCanvas();

  gr.Canvas = function(width, height) {
    var el = document.createElement('canvas');
    return Canvas(el, width || gr.width, height || gr.height);
  };

  return gr;
};

