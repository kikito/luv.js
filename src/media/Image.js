// # media/image.js
(function() {

// ## Luv.Media.Image
// Internal object used by the images created inside Luv.Media()
Luv.Media.Image = Luv.Media.Asset.extend({
  getType       : function() { return 'Luv.Media.Image'; },
  getWidth      : function() { return this.source.width; },
  getHeight     : function() { return this.source.height; },
  getDimensions : function() {
    return { width: this.source.width, height: this.source.height };
  },
  toString      : function() {
    return 'Luv.Media.Image("' + this.path + '")';
  }
});


}());
