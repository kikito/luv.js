// # sprite.js
(function() {

// ## Luv.Graphics.Sprite
// Represents a rectangular region of an image
// Useful for spritesheets and animations
// FIXME: replace ltwh by left top width height
Luv.Graphics.Sprite = Luv.Class('Luv.Graphics.Sprite', {
  init: function(image, l,t,w,h) {
    this.image = image;
    this.l = l;
    this.t = t;
    this.w = w;
    this.h = h;
  },

  toString : function() {
    return 'instance of Luv.Graphics.Sprite(' +
            this.image + ', ' +
            this.l + ', ' +
            this.t + ', ' +
            this.w + ', ' +
            this.h + ')'  ;
  },

  getImage      : function() { return this.image; },

  getWidth      : function() { return this.w; },

  getHeight     : function() { return this.h; },

  getDimensions : function() {
    return { width: this.w, height: this.h };
  },

  getCenter     : function() {
    return { x: this.w / 2, y: this.h / 2 };
  },

  getBoundingBox : function() {
    return { left: this.l, top: this.t, width: this.w, height: this.h };
  },

  draw: function(context, x, y) {
    if(!this.image.isLoaded()) {
      throw new Error("Attepted to draw a prite of a non loaded image: " + this);
    }
    context.drawImage(this.image.source, this.l, this.t, this.w, this.h, x, y, this.w, this.h);
  }

});

}());
