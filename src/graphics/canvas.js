// # graphics/canvas.js
(function() {

// ## Luv.Graphics.Canvas
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
Luv.Graphics.Canvas = function(el, width, height) {
  el.setAttribute('width', width);
  el.setAttribute('height', height);
  return Luv.extend(Object.create(Luv.Graphics.Canvas), {
    width:  width,
    height: height,
    el:     el,
    ctx:    el.getContext('2d')
  });
};

Luv.setType(Luv.Graphics.Canvas, 'Luv.Graphics.Canvas');

// ## Luv.Graphics.Canvas methods
Luv.extend(Luv.Graphics.Canvas, {
  getWidth      : function(){ return this.width; },
  getHeight     : function(){ return this.height; },
  getDimensions : function(){ return { width: this.width, height: this.height }; },
  setDimensions : function(width, height) {
    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);
    this.width = width;
    this.height = height;
  }
});

}());
