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

