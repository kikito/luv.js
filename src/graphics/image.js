// # image.js
(function() {

// ## Luv.Graphics.Image
// This class encapsulates images loaded from the internet
Luv.Graphics.Image = Luv.Class('Luv.Graphics.Image', {
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

  draw: function(context, x, y) {
    if(!this.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + this);
    }
    context.drawImage(this.source, x, y);
  }

});

Luv.Graphics.Image.include(Luv.Media.Asset);

}());
