// # graphics.js
(function(){

// ## Luv.Graphics
//
// Everything graphics-related in Luv is controlled via this class.

Luv.Graphics = Luv.Class('Luv.Graphics', {

  // As a game programmer, you will normally not instantiate the Luv.Graphics
  // class directly. Instead, you will call `Luv({...})`. The variable returned by
  // that call will have a `graphics` attribute which you can use.
  //
  //       var luv = Luv();
  //       luv.graphics // this variable
  init: function(el, media) {
    this.el               = el;
    this.media            = media;
  },

  // `parseColor` transforms a variety of parameters into a "standard js object" of the form
  // `{r: 255, g: 0, b: 120}`.
  //
  // Types of accepted params:
  //
  // * Three integers: `luv.graphics.parseColor(255, 0, 120)`
  // * Array of integers: `luv.graphics.parseColor([255, 0, 120])`
  // * As an object: `luv.graphics.parseColor({r:255, g:0, b:120})`
  // * Strings:
  //   * 6-digit hex: `luv.graphics.setColor("#ff0078")`
  //   * 3-digit hex: `luv.graphics.setColor("#f12")`
  //   * rgb: `luv.graphics.setColor("rgb(255,0,120)")`
  //
  parseColor : function(r,g,b) {
    return Luv.Graphics.parseColor(r,g,b);
  },

  // ### Object Constructors

  // `Canvas` creates an instance of `Luv.Graphics.Canvas`; an invisible object to draw things
  // "off the main drawing canvas". Canvases are drawable objects.
  // The two parameters will define the dimensions of the new canvas, in pixels. If no dimensions
  // are specified, the new canvas will have the same dimensions as the current canvas.
  Canvas : function(width, height) {
    width  = width  || this.el.getAttribute('width');
    height = height || this.el.getAttribute('height');
    return Luv.Graphics.Canvas(width, height);
  },

  // `Image` creates an instance of `Luv.Graphics.Image` and the given path.
  // The advantage of using this method instead of directly instantiating `Luv.Graphics.Image` manually
  // is that the a default media object is passed by default by the graphics library.
  Image : function(path) {
    return Luv.Graphics.Image(this.media, path);
  },

  // `Sprite` just invokes `Luv.Graphics.Sprite` with the same parameters. Please refer to that class'
  // documentation for more details.
  Sprite : function(image, l,t,w,h) {
    return Luv.Graphics.Sprite(image, l,t,w,h);
  },

  // `SpriteSheet` is also a simple redirect. See the documentation of `Luv.Graphics.SpriteSheet` for details.
  SpriteSheet : function(image, w,h,l,t,b) {
    return Luv.Graphics.SpriteSheet(image, w,h,l,t,b);
  }

});

// `Luv.Graphics.parseColor` is a class method implementing `parseColor` at the instance level. See the
// `parseColor` instance method above for details.
Luv.Graphics.parseColor = function(r,g,b) {
  var m, p = parseInt;

  if(Array.isArray(r))      { return { r: r[0], g: r[1], b: r[2] }; }
  if(typeof r === "object") { return { r: r.r, g: r.g, b: r.b }; }
  if(typeof r === "string") {
    r = r.replace(/#|\s+/g,""); // Remove all spaces and #

    // `ffffff` & `#ffffff`
    m = /^([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(r);
    if(m){ return { r: p(m[1], 16), g: p(m[2], 16), b: p(m[3], 16) }; }

    // `fff` & `#fff`
    m = /^([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(r);
    if(m){ return { r: p(m[1], 16) * 17, g: p(m[2], 16) * 17, b: p(m[3], 16) * 17 }; }

    // `rgb(255,3,120)`
    m = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(r);
    if(m){ return { r: p(m[1], 10), g: p(m[2], 10), b: p(m[3], 10) }; }
  }
  return { r: r, g: g, b: b };
};

}());
