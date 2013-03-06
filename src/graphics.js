
(function(){

Luv.Graphics = function(el, width, height) {
  var gr = Luv.extend(Object.create(Luv.Graphics), {
    width:     width,
    height:    height,
    lineWidth: 1,
    lineCap:   "butt",
    color:     {},
    backgroundColor: {},
    defaultCanvas: Luv.Graphics.Canvas(el, width, height),
    Canvas: function(width, height) {
      var el = document.createElement('canvas');
      return Luv.Graphics.Canvas(el, width || this.width, height || this.height);
    }
  });

  gr.setColor(255,255,255);
  gr.setBackgroundColor(0,0,0);
  gr.setCanvas();

  return gr;
};

Luv.setType(Luv.Graphics, 'Luv.Graphics');

Luv.extend(Luv.Graphics, {
  setCanvas : function(canvas) {
    canvas = canvas || this.defaultCanvas;
    this.canvas = canvas;
    this.el     = canvas.el;
    this.ctx    = canvas.ctx;
    this.setLineWidth(this.lineWidth);
    this.setLineCap(this.lineCap);
    this.reset();
  },
  getCanvas : function() { return this.canvas; },
  setColor  : function(r,g,b,a) { setColor(this, 'color', r,g,b,a); },
  getColor  : function() { return getColor(this.color); },

  setBackgroundColor : function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); },
  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  getWidth      : function(){ return this.width; },
  getHeight     : function(){ return this.height; },
  getDimensions : function(){ return { width: this.width, height: this.height }; },
  setDimensions : function(width, height) {
    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);
    this.width = width;
    this.height = height;
  },

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
    this.reset();
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

  drawImage : function(img, x, y, sx, sy, angle, ox, oy) {
    var ctx = this.ctx;
    if(!img.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + img);
    }

    sx    = typeof sx    === "undefined" ? 1 : sx;
    sy    = typeof sy    === "undefined" ? 1 : sy;
    angle = typeof angle === "undefined" ? 0 : normalizeAngle(angle);
    ox    = typeof ox    === "undefined" ? 0 : ox;
    oy    = typeof oy    === "undefined" ? 0 : oy;

    if(sx !== 1 || sy !== 1 || angle !== 0 || ox !== 0 || oy !== 0) {
      ctx.save();

      ctx.translate(x,y);

      ctx.translate(ox,oy);
      ctx.rotate(angle);
      ctx.scale(sx,sy);
      ctx.drawImage(img.source, -ox, -oy);

      ctx.restore();
    } else {
      ctx.drawImage(img.source, x, y);
    }
  },

  drawCenteredImage : function(img, x,y, sx, sy, angle) {
    var d = img.getDimensions();
    var ox = d.width / 2,
        oy = d.height / 2;
    this.drawImage(img, x-ox,y-oy, sx,sy, angle, ox, oy);
  },

  drawCanvas : function(canvas, x, y) {
    this.ctx.drawImage(canvas.el, x, y);
  },

  translate : function(x,y) {
    this.ctx.translate(x,y);
  },

  scale : function(sx,sy) {
    this.ctx.scale(sx,sy);
  },

  rotate : function(angle) {
    this.ctx.rotate(angle);
  },

  reset : function() {
    this.ctx.setTransform(1,0,0,1,0,0);
  },

  push : function() {
    this.ctx.save();
  },

  pop : function() {
    this.ctx.restore();
  }

});


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

var normalizeAngle = function(angle) {
  angle = angle % twoPI;
  return angle >= 0 ? angle : angle + twoPI;
};


}());
