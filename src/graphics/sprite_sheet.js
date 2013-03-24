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
    var result = [], xCoords, yCoords;

    for(var i=0; i<arguments.length; i+=2) {
      xCoords = parseRange(arguments[i]);
      yCoords = parseRange(arguments[i+1]);
      for(var ix=0; ix < xCoords.length; ix++) {
        for(var iy=0; iy < yCoords.length; iy++) {
          result.push(this.getSprite(xCoords[ix], yCoords[iy]));
        }
      }
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

var parseRange = function(r) {
  if(typeof r == "number") { return [r]; }
  if(typeof r == "string") {
    var split = r.split("-");
    if(split.length != 2) {
      throw new Error("Could not parse from '" + r + "'. Must be of the form 'start-end'");
    }
    var result = [],
        start  = Number(split[0]),
        end    = Number(split[1]),
        i;

    if(start < end) {
      for(i=start; i<=end; i++) { result.push(i); }
    } else {
      for(i=start; i>=end; i--) { result.push(i); }
    }

    return result;
  }
  throw new Error("Ranges must be integers or strings of the form 'start-end'. Got " + r);
};

}());
