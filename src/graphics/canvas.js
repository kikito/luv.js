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
    var el = document.createElement('canvas');
    el.setAttribute('width', width);
    el.setAttribute('height', height);

    this.el = el;
  },

  getContext    : function(){ return this.el.getContext('2d'); },

  getWidth      : function(){ return Number(this.el.getAttribute('width')); },

  getHeight     : function(){ return Number(this.el.getAttribute('height')); },

  getDimensions : function(){ return { width: this.getWidth(), height: this.getHeight() }; },

  getCenter     : function(){ return { x: this.getWidth()/2, y: this.getHeight() / 2}; },

  setDimensions : function(width, height) {
    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);
  },

  draw: function(context, x, y) {
    context.drawImage(this.el, x, y);
  }
});

}());
