// # image.js
(function() {

// ## Luv.Graphics.Image
// This class encapsulates images loaded from the internet
Luv.Graphics.Image = Luv.Class('Luv.Graphics.Image', {

  // Usually you will not instantiate images directly. Instead, you will use
  // the instance method of Luv.Graphics, like this:
  //
  //       var luv = Luv(...);
  //       var image = luv.graphics.Image('face.png');
  //
  // Notice that this constructor requires an additional parameter (an instance
  // of Luv.Media), which is provided automatically by luv.graphics.Image.
  init: function(media, path) {
    var image = this;

    image.path = path;

    media.newAsset(image);

    var source   = new Image(); // html image
    image.source = source;

    source.addEventListener('load',  function(){ media.registerLoad(image); });
    source.addEventListener('error', function(){ media.registerError(image); });
    source.src = path;
  },

  toString      : function() {
    return 'instance of Luv.Graphics.Image("' + this.path + '")';
  },

  getWidth      : function() { return this.source.width; },

  getHeight     : function() { return this.source.height; },

  getDimensions : function() {
    return { width: this.source.width, height: this.source.height };
  },

  getCenter: function() {
    return { x: this.source.width / 2, y: this.source.height / 2 };
  },

  drawInCanvas: function(graphics, x, y) {
    if(!this.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + this);
    }
    graphics.ctx.drawImage(this.source, x, y);
  }

});

// Add methods like isLoaded, isError, isPending to image
Luv.Graphics.Image.include(Luv.Media.Asset);

}());
