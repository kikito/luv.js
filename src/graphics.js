
(function(){

Luv.Graphics = Luv.Class('Luv.Graphics', {
  init: function(el, media) {
    this.el               = el;
    this.media            = media;
    this.color            = {};
    this.backgroundColor  = {};
    this.lineCap          = "butt";
    this.lineWidth        = 1;
    this.imageSmoothing   = true;

    var d = this.getDimensions();
    this.defaultCanvas    = this.Canvas(d.width, d.height);
    this.defaultCanvas.el = el;

    this.setCanvas();

    this.setBackgroundColor(0,0,0);
    this.setColor(255,255,255);
  },

  setCanvas : function(canvas) {
    canvas = canvas || this.defaultCanvas;
    this.canvas = canvas;
    this.el     = canvas.el;
    this.ctx    = canvas.getContext();
    resetCanvas(this, this.ctx);
  },

  getCanvas : function() { return this.canvas; },

  setColor  : function(r,g,b,a) { setColor(this, 'color', r,g,b,a); },

  getColor  : function() { return getColor(this.color); },

  setBackgroundColor : function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); },

  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  getWidth      : function(){ return parseInt(this.el.getAttribute('width'), 10); },

  getHeight     : function(){ return parseInt(this.el.getAttribute('height'), 10); },

  getDimensions : function(){ return { width: this.getWidth(), height: this.getHeight() }; },

  setDimensions : function(width, height) {
    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);
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
      throw new Error("Line cap must be either 'butt', 'round' or 'square' (was: " + cap + ")");
    }
    this.ctx.lineCap = cap;
    this.lineCap     = this.ctx.lineCap;
  },

  getLineCap : function() { return this.lineCap; },

  clear : function() {
    this.ctx.save();
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.fillStyle = this.backgroundColorStyle;
    this.ctx.fillRect(0, 0, this.getWidth(), this.getHeight());
    this.ctx.restore();
  },

  print : function(str,x,y) {
    this.ctx.fillStyle = this.colorStyle;
    this.ctx.fillText(str, x, y);
  },

  line : function() {
    var coords = Array.isArray(arguments[0]) ? arguments[0] : arguments;

    this.ctx.beginPath();
    drawPolyLine(this, 'luv.graphics.line', 4, coords);
    drawPath(this, MODE.STROKE);
  },

  strokeRectangle : function(left, top, width, height) { rectangle(this, MODE.STROKE, left, top, width, height); },
  fillRectangle   : function(left, top, width, height) { rectangle(this, MODE.FILL, left, top, width, height); },

  strokePolygon   : function(coordinates) { polygon(this, MODE.STROKE, coordinates); },
  fillPolygon     : function(coordinates) { polygon(this, MODE.FILL, coordinates); },

  strokeCircle    : function(x,y,radius)  { circle(this, MODE.STROKE, x,y, radius); },
  fillCircle      : function(x,y,radius)  { circle(this, MODE.FILL, x,y, radius); },

  strokeArc       : function(x,y,radius, startAngle, endAngle)  { arc(this, MODE.STROKE, x,y, radius, startAngle, endAngle); },
  fillArc         : function(x,y,radius, startAngle, endAngle)  { arc(this, MODE.FILL, x,y, radius, startAngle, endAngle); },

  draw : function(drawable, x, y, angle, sx, sy, ox, oy) {
    var ctx = this.ctx;

    angle = typeof angle === "undefined" ? 0 : normalizeAngle(angle);
    sx    = typeof sx    === "undefined" ? 1 : sx;
    sy    = typeof sy    === "undefined" ? 1 : sy;
    ox    = typeof ox    === "undefined" ? 0 : ox;
    oy    = typeof oy    === "undefined" ? 0 : oy;

    if(angle !==0 || sx !== 1 || sy !== 1 || ox !== 0 || oy !== 0) {
      ctx.save();

      ctx.translate(x,y);

      ctx.translate(ox, oy);
      ctx.rotate(angle);
      ctx.scale(sx,sy);
      ctx.translate(-ox, -oy);
      drawable.draw(ctx, 0, 0);

      ctx.restore();
    } else {
      drawable.draw(ctx, x, y);
    }
  },

  drawCentered : function(drawable, x,y, angle, sx, sy) {
    var w = drawable.getWidth();
        h = drawable.getHeight();
    var ox = w / 2,
        oy = h / 2;
    this.draw(drawable, x-ox,y-oy, angle, sx, sy, ox, oy);
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

  },

  push : function() {
    this.ctx.save();
  },

  pop : function() {
    this.ctx.restore();
  },

  setImageSmoothing: function(smoothing) {
    this.imageSmoothing = smoothing = !!smoothing;
    setImageSmoothing(this.ctx, smoothing);
  },

  getImageSmoothing: function() {
    return this.imageSmoothing;
  },

  Canvas : function(width, height) {
    return Luv.Graphics.Canvas(width || this.getWidth(), height || this.getHeight());
  },

  Image : function(path) {
    return Luv.Graphics.Image(this.media, path);
  },

  Sprite : function(image, l,t,w,h) {
    return Luv.Graphics.Sprite(image, l,t,w,h);
  },

  SpriteSheet : function(image, w,h,l,t,b) {
    return Luv.Graphics.SpriteSheet(image, w,h,l,t,b);
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
  case MODE.FILL:
    graphics.ctx.fillStyle = graphics.colorStyle;
    graphics.ctx.fill();
    break;
  case MODE.STROKE:
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

var resetCanvas = function(graphics, ctx) {
  ctx.setTransform(1,0,0,1,0,0);
  setImageSmoothing(ctx, graphics.getImageSmoothing());
  ctx.lineWidth = graphics.getLineWidth();
  ctx.lineCap = graphics.getLineCap();
};

var setImageSmoothing = function(ctx, smoothing) {
  ctx.webkitImageSmoothingEnabled = smoothing;
  ctx.mozImageSmoothingEnabled    = smoothing;
  ctx.imageSmoothingEnabled       = smoothing;
};

var rectangle = function(graphics, mode, left, top, width, height) {
  graphics.ctx.beginPath();
  graphics.ctx.rect(left, top, width, height);
  drawPath(graphics, mode);
  graphics.ctx.closePath();
};

var polygon = function(graphics, mode, coordinates) {
  graphics.ctx.beginPath();

  drawPolyLine(graphics, 'luv.graphics.polygon', 6, coordinates);
  drawPath(graphics, mode);

  graphics.ctx.closePath();
};

var arc = function(graphics, mode, x,y,radius, startAngle, endAngle) {
  graphics.ctx.beginPath();
  graphics.ctx.arc(x,y,radius, startAngle, endAngle, false);
  drawPath(graphics, mode);
};

var circle = function(graphics, mode, x,y,radius) {
  arc(graphics, mode, x, y, radius, 0, twoPI);
  graphics.ctx.closePath();
};

var MODE = {
  STROKE: 1,
  FILL  : 2
};


}());
