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
    return 'Luv.Graphics.Image("' + this.path + '")';
  },

  getWidth      : function() { return this.source.width; },

  getHeight     : function() { return this.source.height; },

  getDimensions : function() {
    return { width: this.source.width, height: this.source.height };
  }
});

Luv.Graphics.Image.include(Luv.Media.Asset);

}());
