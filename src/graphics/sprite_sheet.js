// # sprite_sheet.js
(function() {

// ## Luv.Graphics.SpriteSheet
// A Spritesheet is used to easily divide an image in rectangular blocks (sprites)
// These can later on be used for other means (like animations)
Luv.Graphics.SpriteSheet = Luv.Class('Luv.Graphics.SpriteSheet', {
  init: function(image, width, height, left, top, border) {
    this.image   = image;
    this.width   = width;
    this.height  = height;
    this.left    = left   || 0;
    this.top     = top    || 0;
    this.border  = border || 0;
  },

  getSprites: function() {
    var result = [];

    for(var i=0; i<arguments.length; i+=2) {
      result.push(this.getSprite(arguments[i], arguments[i+1]));
    }
    return result;
  },

  getSprite: function(x,y) {
    return Luv.Graphics.Sprite(
      this.image,
      this.left + this.width * x + this.border * (x+1),
      this.top + this.height * y + this.border * (y+1),
      this.width,
      this.height
    );
  }

});

}());
