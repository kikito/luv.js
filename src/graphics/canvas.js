// # canvas.js
(function() {

// ## Luv.Graphics.Canvas

Luv.Graphics.Canvas = Luv.Class('Luv.Graphics.Canvas', {

// represents aon off-screen drawing surface, useful
// for precalculating costly drawing operations or
// applying effects. Usage:

//       var luv    = Luv();
//       var canvas = luv.graphics.Canvas();
//
//       // set the canvas as the new drawing surface
//       luv.graphics.setCanvas(canvas);
//       luv.graphics.print("This is print off-screen", 100, 100);
//
//       // go back to the default canvas
//       luv.graphics.setCanvas();
//       luv.graphics.print("This is print inscreen", 100, 100);
//
//       // The canvas can be drawn in the default screen like this
//       luv.graphics.draw(canvas, 200, 500);

// The default canvas is reset at the beginning of each draw cycle, before calling luv.draw()

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
  },


  draw: function(canvas, x, y) {
    canvas.ctx.drawImage(this.el, x, y);
  }
});

// Internal function used for setting the foreground and background color
var setColor = function(self, name, r,g,b) {
  var color    = self[name],
      newColor = Luv.Graphics.parseColor(r,g,b);
  Luv.extend(color, newColor);
  self[name + 'Style'] = "rgb(" + [color.r, color.g, color.b].join() + ")";
};

var getColor = function(color) {
  return {r: color.r, g: color.g, b: color.b};
};

// Internal function. If x < min, return min. If x > max, return max. Otherwise, return x.
var clampNumber = function(x, min, max) {
  return Math.max(min, Math.min(max, Number(x)));
};

// Image smoothing helper function
var setImageSmoothing = function(ctx, smoothing) {
  ctx.webkitImageSmoothingEnabled = smoothing;
  ctx.mozImageSmoothingEnabled    = smoothing;
  ctx.imageSmoothingEnabled       = smoothing;
};

}());
