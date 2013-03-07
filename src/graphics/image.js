// # media/image.js
(function() {

// ## Luv.Graphics.Image
// This type encapsulates images loaded from the internet
Luv.Graphics.Image = function(path) {
  var media = this.media;
  var image = Luv.extend(Object.create(Luv.Graphics.Image), {
    path: path
  });

  media.newAsset(image);

  var source   = new Image(); // html image
  image.source = source;

  source.addEventListener('load',  function(){ media.registerLoad(image); });
  source.addEventListener('error', function(){ media.registerError(image); });
  source.src = path;

  return image;
};

Luv.setType(Luv.Graphics.Image, 'Luv.Graphics.Image');

// ## Luv.Graphics.Image methods
Luv.extend(Luv.Graphics.Image, Luv.Media.Asset, {
  toString      : function() {
    return 'Luv.Graphics.Image("' + this.path + '")';
  },
  getWidth      : function() { return this.source.width; },
  getHeight     : function() { return this.source.height; },
  getDimensions : function() {
    return { width: this.source.width, height: this.source.height };
  }
});


}());
