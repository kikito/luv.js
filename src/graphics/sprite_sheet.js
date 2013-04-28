// # sprite_sheet.js
(function() {

// ## Luv.Graphics.SpriteSheet
// A Spritesheet is used to easily divide an image in rectangular blocks (sprites)
// Their most important use is animations (see Luv.Graphics.Animation for details)
Luv.Graphics.SpriteSheet = Luv.Class('Luv.Graphics.SpriteSheet', {

  // `init` has the following parameters:
  //
  // * `image` is the image from which the spriteSheet takes its sprites. It's mandatory.
  // * `width` and `height` are the dimensions (in pixels) of all the sprites that the
  //   spriteSheet will generate. They are mandatory.
  // * `left` and `top` are the coordinates where the spritesheet starts inside the image;
  //   an "offset" (they default to 0,0)
  // * `border` is the distance in pixels between each sprite and its neighbors. Defaults to 0.
  init: function(image, width, height, left, top, border) {
    this.image   = image;
    this.width   = width;
    this.height  = height;
    this.left    = left   || 0;
    this.top     = top    || 0;
    this.border  = border || 0;
  },

  // `getSprites` accepts a variable number of parameters and returns an array of sprites (instances of
  // `Luv.Graphics.Sprite`). The parameters can be either integers or strings of the form 'A-B', where A and
  // B are integers, too. It's parsed as follows:
  //
  // * Two integers reference one sprite. For example `sheet.getSprites(1,1)` will return the sprite on the
  //   second row and second column of the spritesheet in one array. `sheet.getSprites(0,0, 0,1)` will return
  //   the first two sprites of the first column of the spritesheet.
  // * An integer and a string will "iterate" over the string, between A and B. For example,
  //   `sheet.getSprites('0-9', 0)` will return the first 9 sprites of the first row of the sheet (y remains fixed
  //   at 0, and x iterates from 0 to 9). You can also iterate over columns: `sheet.getSprites(0, '0-9')`. If you
  //   want to iterate backwards (from right to left or from bottom to top) just switch the numbers of the string:
  //   `sheet.getSprites('9-0', 0)`.
  // * Two strings will iterate over a set of rows and columns (rows will get iterated over first). This means that
  //   `sheet.getSprites('5-10', '2-3')` will return the sprites in [5,2], [5,3], [6,2], [6,3] ... [10,2], [10,3].
  //
  // Finally, take into accont that you can get as many rows/columns as you want
  // in a single call, and even add individual spritesheets. For example, this call will get the 10 first sprites
  // of the first two rows, and then the sprite in 10,10: `sheet.getSprites('0-9',0, '0-9',1, 10,10)`.
  getSprites: function() {
    var result = [], xCoords, yCoords;

    for(var i=0; i<arguments.length; i+=2) {
      xCoords = parseRange(arguments[i]);
      yCoords = parseRange(arguments[i+1]);
      for(var iy=0; iy < yCoords.length; iy++) {
        for(var ix=0; ix < xCoords.length; ix++) {
          result.push(this.Sprite(xCoords[ix], yCoords[iy]));
        }
      }
    }
    return result;
  },

  // `Sprite` returns the instance of Luv.Graphics.Sprite which is on column x, row y of the SpriteSheet.
  Sprite: function(x,y) {
    return Luv.Graphics.Sprite(
      this.image,
      this.left + this.width * x + this.border * (x+1),
      this.top + this.height * y + this.border * (y+1),
      this.width,
      this.height
    );
  },

  // `Animation` returns an instance of Luv.Graphics.Animation.
  //
  // * `spriteInfo` is an array of indexes for sprites, following the same rules as the parameters of getSprites.
  // * `durations` follows the same rules as it does in Luv.Graphics.Animation.init. See Luv.Graphics.Animation.init
  //   for details
  Animation: function(spriteInfo, durations) {
    var sprites = this.getSprites.apply(this, spriteInfo);
    return Luv.Graphics.Animation(sprites, durations);
  }

});

// Transform a string of type '2-5' in an array of type [2,3,4,5].
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
