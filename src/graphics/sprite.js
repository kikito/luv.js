// # sprite.js
(function() {

// ## Luv.Graphics.Sprite
// Represents a rectangular region of an image
// Useful for spritesheets and animations
Luv.Graphics.Sprite = Luv.Class('Luv.Graphics.Sprite', {
  // The constructor expects an image and the coordinates of the sprite's Bounding box.
  init: function(image, left,top,width,height) {
    this.image = image;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  },

  toString : function() {
    return [
      'instance of Luv.Graphics.Sprite(',
      this.image, ', ',
      this.left, ', ',  this.top, ', ', this.width, ', ', this.height, ')'
    ].join("");
  },

  getImage      : function() { return this.image; },

  getWidth      : function() { return this.width; },

  getHeight     : function() { return this.height; },

  getDimensions : function() {
    return { width: this.width, height: this.height };
  },

  getCenter     : function() {
    return { x: this.width / 2, y: this.height / 2 };
  },

  getBoundingBox : function() {
    return { left: this.left, top: this.top, width: this.width, height: this.height };
  },

  // `drawInCanvas` makes Sprites drawable. It draws only the parts of the image that include the sprite, and nothing else.
  drawInCanvas: function(graphics, x, y) {
    if(!this.image.isLoaded()) {
      throw new Error("Attepted to draw a prite of a non loaded image: " + this);
    }
    graphics.ctx.drawImage(this.image.source, this.left, this.top, this.width, this.height, x, y, this.width, this.height);
  }

});

}());
