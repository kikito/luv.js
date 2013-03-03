// # media/image.js
(function() {

// ## Luv.Media.Image
// Internal object used by the images created inside Luv.Media()
Luv.Media.Image = Object.create(Luv.Media.Asset);

Luv.Media.Image.getWidth       = function() { return this.source.width; };
Luv.Media.Image.getHeight      = function() { return this.source.height; };
Luv.Media.Image.getDimensions  = function() {
  return { width: this.source.width, height: this.source.height };
};
Luv.Media.Image.toString       = function() {
  return 'Luv.Media.Image("' + this.path + '")';
};

}());
