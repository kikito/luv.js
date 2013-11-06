// # canvas.js
(function() {

// ## Luv.Graphics.Canvas

Luv.Graphics.Canvas = Luv.Class('Luv.Graphics.Canvas', {

// represents a  drawing surface, useful
// for precalculating costly drawing operations or
// applying effects.
//
// Any Luv instance comes with a default canvas in `luv.canvas`.
// Anything drawn into that canvas is made visible on the screen.
//
// In addition to that, it's possible to create canvases for off-screen
// image manipulations. This can be done by invoking:
//
// * `luv.graphics.Canvas() to obtain a canvas as big as the current main canvas.
// * `luv.graphics.Canvas(width, height) to obtain a canvas with the given dimensions.
// * `luv.graphics.Canvas(el) to obtain a canvas attached to a given DOM element. The
//   dimendions will be obtained from the element.
//
//       var luv    = Luv();
//
//       // print on the default canvas (visible
//       luv.canvas.print("This is print off-screen", 100, 100);
//
//       // create an off-screen canvas
//       var buffer = luv.graphics.Canvas(320,200);
//
//       // print on the off-screen canvas
//       buffer.print("This is print inscreen", 100, 100);
//
//       // Draw the off-screen canvas on the screen
//       luv.canvas.draw(buffer, 200, 500);
//
// The main canvas is cleared at the beginning of each draw cycle, before calling luv.draw()

  init: function(width, height) {
    var el;
    if(width.getAttribute) {
      el     = width;
      width  = el.getAttribute('width');
      height = el.getAttribute('height');
    } else {
      el = document.createElement('canvas');
      el.setAttribute('width', width);
      el.setAttribute('height', height);
    }
    this.el               = el;
    this.ctx              = el.getContext('2d');
    this.color            = {};
    this.backgroundColor  = {};

    this.setBackgroundColor(0,0,0);
    this.setColor(255,255,255);
    this.setLineCap("butt");
    this.setLineWidth(1);
    this.setImageSmoothing(true);
    this.setAlpha(1);
  },

  // `clear` fills the whole canvas with the background color, effectively clearing
  // up the screen. See `setBackgroundColor` for details.
  clear : function() {
    this.ctx.save();
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = this.backgroundColorStyle;
    this.ctx.fillRect(0, 0, this.getWidth(), this.getHeight());
    this.ctx.restore();
  },

  // ### Text-related functions

  // `print` is the function that prints text on the screen. It expects a string
  // and the two coordinates of the upper-left corner from which the text will
  // be written.
  print : function(str,x,y) {
    this.ctx.fillStyle = this.colorStyle;
    this.ctx.fillText(str, x, y);
  },

  // ### Primitive drawing

  // `line` draws a line using the currently selected color, line width and line cap
  // (see `setColor`, `setLineWidth` and `setLineCap` for details about those).
  //
  // On it simplest form, it expects 4 numbers in the form `x1,y1,x2,y2`. It draws
  // a line between the points `x1,y1` and `x2,y2`.
  //
  // It's possible to add more points (`x1,y1,x2,y2,x3,y3 ...`), in which case `line`
  // will draw a line between `x1,y1` and `x2,y2`, then a line between `x2,y2` and `x3,y3`,
  // and so on.
  //
  // The coordinate list must be all numbers, and have an even number of elements. It
  // can also be passed as a JS array (`luv.graphics.line(10,20,30,40)` draws the same as
  // `luv.graphics.line([10,20,30,40])`
  line : function() {
    var coords = Array.isArray(arguments[0]) ? arguments[0] : arguments;

    this.ctx.beginPath();
    drawPolyLine(this, 'luv.graphics.line', 4, coords);
    drawPath(this, MODE.STROKE);
  },

  // `strokeRectangle` draws a the perimeter of a rectangle using the specified
  // coordinates in pixels, using the current color, line width and line cap.
  strokeRectangle : function(left, top, width, height) { rectangle(this, MODE.STROKE, left, top, width, height); },

  // `fillRectangle` draws a rectangle filled with the currently selected color.
  fillRectangle   : function(left, top, width, height) { rectangle(this, MODE.FILL, left, top, width, height); },

  // `strokePolygon` draws a the perimeter of a polygon using the specified
  // coordinates in pixels, using the current color, line width and line cap.
  // The polygon coordinates must be an even number of numbers, in the form
  // `x1,y1,x2,y2,x3,y3...`.
  //
  //        var luv = Luv();
  //        luv.strokePolygon(0,0, 10,20, 20,0);
  //
  // You must specify at least three points (6 coordinates) or else the function
  // will fail.
  //
  // The point coordinates can be specified as plain arguments (as above) or
  // inside an array. This would print the same as in the previous example:
  //
  //        var luv = Luv();
  //        luv.strokePolygon([0,0, 10,20, 20,0]);
  strokePolygon   : function() { polygon(this, MODE.STROKE, arguments); },

  // `fillPolygon` takes the same parameters as `strokePolygon`, but it fills the
  // polygon with the current color instead of drawing its perimeter.
  fillPolygon     : function() { polygon(this, MODE.FILL, arguments); },

  // `strokeCircle` draws the perimeter of a circle using the current line width and color.
  // It expects the coordinates of the circle's center in pixels, and its radius.
  strokeCircle    : function(x,y,radius)  { circle(this, MODE.STROKE, x,y, radius); },

  // `fillCircle` works the same way as `strokeCircle`, but draws a circle filled with
  // the current color instead of drawing its perimeter.
  fillCircle      : function(x,y,radius)  { circle(this, MODE.FILL, x,y, radius); },

  // `strokeArc` draws a section of the perimeter of a circle. Takes the same
  // parameter as `strokeCircle`, plus the start and end of the angles of the arc,
  // in radians.
  strokeArc       : function(x,y,radius, startAngle, endAngle)  { arc(this, MODE.STROKE, x,y, radius, startAngle, endAngle); },

  // `fillArc` draws an "applepie" or a "pacman" filled with the currently selected
  // color. Takes the same parameters as `strokeArc`.
  fillArc         : function(x,y,radius, startAngle, endAngle)  { arc(this, MODE.FILL, x,y, radius, startAngle, endAngle); },

  // ### Drawables

  // `draw` can be used to draw what Luv calls "drawable" objects.
  //
  // Currently, the following objects are drawable:
  //
  // * Images
  // * Sprites
  // * Animations
  // * Canvases
  //
  // Parameters:
  //
  // * `drawable` is an object implementing the drawable interface (see below). It is the only required param.
  // * `x` and `y` are the coordinates of the top-left corner where the drawable will be drawn. They default to 0,0.
  // * `angle` is the angle at which the drawable wil be turned, in radians. Defaults to 0.
  // * `sx and sy` are the horizontal and vertical scales. They default to 1,1 (no scale). If you set them to `2,2`, then
  //   the drawable will be drawn "double sized". If you set them to `0.5,1`, it will have its default height but its width will
  //   be halved.
  // * `ox and oy` are the coordinates of the point used as center of rotation when an angle is specified. By default they are
  //   0,0. The center of rotation is relative to the top-left corner (specified by the x,y params). So if `x,y` = `10,10` ,
  //   and `ox,oy` = `5,5`, then the rotation will occur around the point in 15,15.
  //
  // You can implement other drawable objects if you want. Drawable objects must implement a `draw` method with the following signature:
  //
  //       obj.drawInCanvas(canvas, x, y)
  //
  // Where context is a js canvas 2d context, and x and y are the coordinates of the
  // object's top left corner.
  //
  // It is also recommended that your drawable objects implement a `getCenter` function, so they can be used by `drawCentered` (see
  // details below)
  //
  // Note that javascript canvases try to "minimize the amount of pixellation" when doing transformations in images, so they
  // apply an "image smoothing" algorithm to rotated/translated images. See
  // `setImageSmoothing` for more details.
  draw : function(drawable, x, y, angle, sx, sy, ox, oy) {
    var ctx = this.ctx;

    x     = x  || 0;
    y     = y  || 0;
    sx    = sx || 1;
    sy    = sy || 1;
    ox    = ox || 0;
    oy    = oy || 0;
    angle = normalizeAngle(angle || 0);

    if(angle !== 0 || sx !== 1 || sy !== 1 || ox !== 0 || oy !== 0) {
      ctx.save();

      ctx.translate(x,y);

      ctx.translate(ox, oy);
      ctx.rotate(angle);
      ctx.scale(sx,sy);
      ctx.translate(-ox, -oy);
      drawable.drawInCanvas(this, 0, 0);

      ctx.restore();
    } else {
      drawable.drawInCanvas(this, x, y);
    }
  },

  // `drawCentered` draws a drawable object (images, sprites, animations, canvases ...
  // see the `draw` method for more info) but centering it on its center instead of
  // using the top-left coordinates.
  //
  // The drawables must implement a method called `getCenter()` that should return
  // a JS object with two properties called `x` and `y`, representing the geometrical
  // center of the object.
  //
  //       var c = obj.getCenter();
  //       console.log(c.x, c.y);
  //
  // Note that the center must be expressed relatively to the top-left corner of the object,
  // not the origin of coordinates.
  //
  // All drawable objects in Luv also implement a getCenter function.
  drawCentered : function(drawable, x,y, angle, sx, sy) {
    var c = drawable.getCenter();
    this.draw(drawable, x-c.x,y-c.y, angle, sx, sy, c.x, c.y);
  },

  // `drawInCanvas` makes Canvases drawable - it allows you to be able to draw one canvas inside
  // another canvas
  drawInCanvas: function(canvas, x, y) {
    canvas.ctx.drawImage(this.el, x, y);
  },

  // ### Transformations

  // `translate` displaces the origin of coordinates `x` pixels to the right and `y` down.
  // This means that it can be used to simulate things like scrolling or camera.
  // The origin of coordinates is in 0,0 by default.
  translate : function(x,y) {
    this.ctx.translate(x,y);
  },

  // `scale` sets the world scale on both the x and y axes. 2,2 will make everything look
  // bigger, and 0.5,0.5 will make everything look half its size; so it can be used for
  // zooming in an out.
  // The default scale is 1 in both axes. That means no scale.
  scale : function(sx,sy) {
    this.ctx.scale(sx,sy);
  },

  // `rotate` transforms the origin of coordinates with an angle (specified in radians).
  rotate : function(angle) {
    this.ctx.rotate(angle);
  },

  // `push` inserts the current state of the transformation matrix (things like translate, rotate
  // and scale configuration) in a stack. This means you can add further transformations later on, and
  // then "come back to the current state" by invoking `pop`
  push : function() {
    this.ctx.save();
  },

  // `pop` is the opposite of `push`: it removes the current transformation settings from the
  // graphics canvas and replaces it with the one at the top of the stack, which is "popped" out.
  // `pop` can be invoked several times, as long as there are transformations left on the stack.
  pop : function() {
    this.ctx.restore();
  },


  // ### Getters and setters

  // `getDimensions` returns a JS object containing two components: `width` and `height`,
  // with the width and height of the canvas in pixels.
  //
  //        var luv = Luv();
  //        var d = luv.getDimensions();
  //        console.log(d.width, d.height);
  getDimensions : function(){ return { width: this.getWidth(), height: this.getHeight() }; },

  setDimensions : function(width, height) {
    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);
  },

  // `getWidth` returns the width of the canvas, in pixels.
  getWidth      : function(){ return Number(this.el.getAttribute('width')); },

  // `getHeight` returns the height of the canvas, in pixels.
  getHeight     : function(){ return Number(this.el.getAttribute('height')); },

  getCenter     : function(){ return { x: this.getWidth()/2, y: this.getHeight() / 2}; },

  // `setColor` just sets an internal variable with the color to be used for
  // during the next graphical operations. If you set the color to `255,0,0`
  // (pure red) and then draw a line or a rectangle, they will be red.
  //
  // Admits the same parameters as `parseColor` (see below)
  setColor  : function(r,g,b) { setColor(this, 'color', r,g,b); },

  // `getColor` returns the currently selected color. See `setColor` for details.
  // The current color is returned like a JS object whith the properties
  // `r`, `g` & `b`, similar to what parseColor returns.
  //
  //        var luv = Luv();
  //        var c = luv.graphics.getColor();
  //        console.log(c.red, c.green, c.blue, c.alpha);
  getColor  : function() { return getColor(this.color); },

  // `setBackgroundColor` changes the color used to clear the screen at the beginning
  // of each frame. It takes the same parameters as `setColor`.
  // The default background color is black (`0,0,0`)
  setBackgroundColor : function(r,g,b) { setColor(this, 'backgroundColor', r,g,b); },

  // `getBackgroundColor` returns the background color the same way as
  // `getColor` returns the foreground color. See `setBackgroundColor` and `getColor`
  // for more info.
  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  // `setAlpha` acceps a number from 0 (full transparency) to 1 (full opaqueness).
  // Call setAlpha before drawing things to alter how transparent they are.
  //
  //       var luv = Luv();
  //       luv.graphics.setAlpha(0.5);
  //       // draw a semi-transparent line
  //       luv.graphics.line(0,0,20,20);
  //
  // Alpha defaults to 1 (no transparency).
  setAlpha: function(alpha) {
    this.alpha = clampNumber(alpha, 0, 1);
    this.ctx.globalAlpha = this.alpha;
  },

  // `getAlpha` returns the current alpha. See `setAlpha` for details
  getAlpha: function() { return this.alpha; },

  // `setLineWidth` changes the width of the lines used for drawing lines with the `line` method,
  // as well as the various stroke methods (`strokeRectangle`, `strokePolygon`, etc). It expects
  // a number, in pixels. The number must be positive.
  setLineWidth : function(width) {
    this.lineWidth = width;
    this.ctx.lineWidth = width;
  },

  // `getLineWidth` returns the line width, in pixels.
  getLineWidth : function() {
    return this.lineWidth;
  },

  // `setLineCap` changes the line "endings" when drawing lines. It expects a string.
  // It can have three values:
  //
  // * `"butt"`: The lines have "no special ending". Lines behave like small oriented rectangles
  //   connecting two coordinates.
  // * '"round"': Adds a semicircle to the end of each line. This makes corners look "rounded".
  // * '"square"': Adds a small square to the end of each line. Lines are "a big longer" than when
  //   using the `"butt"` line cap. As a result, rectangles and squares' corners look "complete".
  //
  // The default value is "butt".
  setLineCap : function(cap) {
    if(cap != "butt" && cap != "round" && cap != "square") {
      throw new Error("Line cap must be either 'butt', 'round' or 'square' (was: " + cap + ")");
    }
    this.ctx.lineCap = cap;
    this.lineCap     = this.ctx.lineCap;
  },

  // `getLineCap` returns the line cap as a string. See `setLineCap` for details.
  getLineCap : function() { return this.lineCap; },

  // `setImageSmoothing` accepts either true or false. It activates or deactivates the image
  // smoothing algorithms that browsers use in images, particularly when they are rendered in
  // non-integer locations or with transformations like scales or rotations.
  // It is `true` by default.
  setImageSmoothing: function(smoothing) {
    this.imageSmoothing = smoothing = !!smoothing;
    setImageSmoothing(this.ctx, smoothing);
  },

  // `getImageSmoothing` returns whether the graphics have image smoothing active or not, in a boolean.
  // See `setImageSmoothing` for a further explanation.
  getImageSmoothing: function() {
    return this.imageSmoothing;
  }

});

// ### Private functions and constants

var twoPI = Math.PI * 2;

// Internal function used for setting the foreground and background color
var setColor = function(self, name, r,g,b) {
  var color = self[name],
      newColor = Luv.Graphics.parseColor(r,g,b);
  Luv.extend(color, newColor);
  self[name + 'Style'] = "rgb(" + [color.r, color.g, color.b].join() + ")";
};

var getColor = function(color) {
  return {r: color.r, g: color.g, b: color.b};
};

// Strokes a polyline given an array of methods.
var drawPolyLine = function(self, methodName, minLength, coords) {

  if(coords.length < minLength) { throw new Error(methodName + " requires at least 4 parameters"); }
  if(coords.length % 2 == 1) { throw new Error(methodName + " requires an even number of parameters"); }

  self.ctx.moveTo(coords[0], coords[1]);

  for(var i=2; i<coords.length; i=i+2) {
    self.ctx.lineTo(coords[i], coords[i+1]);
  }

  self.ctx.stroke();
};

// Given an angle in radians, return an equivalent angle in the [0 - 2*PI) range.
var normalizeAngle = function(angle) {
  angle = angle % twoPI;
  return angle < 0 ? angle + twoPI : angle;
};

// This function makes sure that `ctx` (a 2d canvas context) is configured to have
// the same properties as graphics. This makes sure that the graphics instance is the main
// "authority". It's called after each canvas is used with `setCanvas`.
var resetCanvas = function(self, ctx) {
  ctx.setTransform(1,0,0,1,0,0);
  setImageSmoothing(ctx, self.getImageSmoothing());
  ctx.lineWidth    = self.getLineWidth();
  ctx.lineCap      = self.getLineCap();
  ctx.globalAlpha  = self.getAlpha();
};

// Image smoothing helper function
var setImageSmoothing = function(ctx, smoothing) {
  ctx.webkitImageSmoothingEnabled = smoothing;
  ctx.mozImageSmoothingEnabled    = smoothing;
  ctx.imageSmoothingEnabled       = smoothing;
};

// Internal function by all the primitive drawing functions. It fills or strokes the current path
// in the current canvas 2d context.
var drawPath = function(self, mode) {
  switch(mode){
  case MODE.FILL:
    self.ctx.fillStyle = self.colorStyle;
    self.ctx.fill();
    break;
  case MODE.STROKE:
    self.ctx.strokeStyle = self.colorStyle;
    self.ctx.stroke();
    break;
  default:
    throw new Error('Invalid mode: [' + mode + ']. Should be "fill" or "line"');
  }
};

// Rectangle drawing implementation
var rectangle = function(self, mode, left, top, width, height) {
  self.ctx.beginPath();
  self.ctx.rect(left, top, width, height);
  drawPath(self, mode);
  self.ctx.closePath();
};

// Polygon drawing implementation
var polygon = function(self, mode, args) {
  var coordinates = Array.isArray(args[0]) ? args[0] : Array.prototype.slice.call(args, 0);
  self.ctx.beginPath();

  drawPolyLine(self, 'luv.Graphics.Canvas.polygon', 6, coordinates);
  drawPath(self, mode);

  self.ctx.closePath();
};

// Arc drawing implementation
var arc = function(self, mode, x,y,radius, startAngle, endAngle) {
  self.ctx.beginPath();
  self.ctx.arc(x,y,radius, startAngle, endAngle, false);
  drawPath(self, mode);
};

// Circle implementation (mainly it invokes `arc`)
var circle = function(self, mode, x,y,radius) {
  arc(self, mode, x, y, radius, 0, twoPI);
  self.ctx.closePath();
};

// Private "constant" for magic numbers
var MODE = {
  STROKE: 1,
  FILL  : 2
};

// Internal function. If x < min, return min. If x > max, return max. Otherwise, return x.
var clampNumber = function(x, min, max) {
  return Math.max(min, Math.min(max, Number(x)));
};


}());
