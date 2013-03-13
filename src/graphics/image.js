// # image.js
(function() {

// ## Luv.Graphics.Image
// This type encapsulates images loaded from the internet
Luv.Graphics.Image = function(path) {
  var media = this.media;
  var image = Luv.create(ImageModule, { path: path });

  media.newAsset(image);

  var source   = new Image(); // html image
  image.source = source;

  source.addEventListener('load',  function(){ media.registerLoad(image); });
  source.addEventListener('error', function(){ media.registerError(image); });
  source.src = path;

  return image;
};

var ImageModule = Luv.module('Luv.Graphics.Image', {
  toString      : function() {
    return 'Luv.Graphics.Image("' + this.path + '")';
  },
  getWidth      : function() { return this.source.width; },
  getHeight     : function() { return this.source.height; },
  getDimensions : function() {
    return { width: this.source.width, height: this.source.height };
  }
});

Luv.extend(ImageModule, Luv.Media.Asset);

}());
