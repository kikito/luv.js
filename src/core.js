// # core.js
(function() {

// ## Class system bootstrapping
// Luv.js has a very minimal (and optional) class system, based on functions and, in
// some cases, in prototypes. The following helper functions are needed for it.

// ### extend
// Similar to [underscore's extend](underscorejs.org/#extend), it copies adds to dest
// all the methods of the objects passed in as extra arguments.
var extend = function(dest) {
  var properties;
  for(var i=1; i < arguments.length; i++) {
    properties = arguments[i];
    for(var property in properties) {
      if(properties.hasOwnProperty(property)) {
        dest[property] = properties[property];
      }
    }
  }
  return dest;
};

// ### remove
// Deletes the elements from an object, given an array of names of methods to be deleted
var remove = function(dest, names) {
  names = Array.isArray(names) ? names : [names];
  for(var i=0; i < names.length; i++) { delete dest[names[i]]; }
  return dest;
};

// ### create
// Expects an object, and creates another one which "points to it" through its __proto__
// For now, it's just an alias to Object.create
var create = Object.create;

// ## Base class definition

// Contains the instance methods of a basic object (by default just two: toString and getClass)
var baseMethods = extend(create(null), {
  toString: function() { return 'instance of ' + this.getClass().getName(); }
});

// Base class definition
var Base = extend(function() {
  return create(baseMethods);
}, {
  // Default constructor
  init    : function() {},
  getName : function() { return "Base"; },
  toString: function() { return "Base"; },
  getSuper: function() { return null; },
  methods : baseMethods,
  // Extend a class with one or more objects, which act as mixins in this case
  include : function() {
    return extend.apply(this, [this.methods].concat(Array.prototype.slice.call(arguments, 0)));
  },
  subclass: function(name, methods) {
    methods = methods || {};
    var superClass = this;

    var getName = function(){ return name; };
    var newMethods = remove(extend(create(superClass.methods), methods), 'init');

    var newClass = extend(function() {
      var instance = create(newMethods);
      newClass.init.apply(instance, arguments);
      return instance;
    },
    superClass,
    methods, {
      getName : getName,
      toString: getName,
      getSuper: function(){ return superClass; },
      methods : newMethods
    });

    newMethods.getClass = function() { return newClass; };

    return newClass;
  }
});

baseMethods.getClass = function() { return Base; };

// ## Main Luv function
Luv = Base.subclass('Luv', {
// The main Luv class, and the only global variable defined by luv.js
// It basically parses the given options (see `initializeOptions` for a list of accepted options).
// Returns a game.
// The recommended name for the variable to store the game is `luv`, but you are free to choose any other.

//       var luv = Luv({...});
//       // options omitted, see below for details

// The game will not start until you execute `luv.run()` (assuming that your game variable name is `luv`).

//       var luv = Luv({...});
//       ... // more code ommited, see LuvProto below for details
//       luv.run();

// If you have initialized your game completely with options, you could just run it straight away,
// without storing it into a variable:

//       Luv({...}).run();
  init: function(options) {

    options = initializeOptions(options);

    this.el  = options.el;

    if(options.load)     { this.load     = options.load; }
    if(options.update)   { this.update   = options.update; }
    if(options.draw)     { this.draw     = options.draw; }
    if(options.run)      { this.run      = options.run; }
    if(options.onResize) { this.onResize = options.onResize; }

    // Initialize all the game submodules (see their docs for more info about each one)
    this.media     = Luv.Media();
    this.timer     = Luv.Timer();
    this.keyboard  = Luv.Keyboard(this.el);
    this.mouse     = Luv.Mouse(this.el);
    this.audio     = Luv.Audio(this.media);
    this.graphics  = Luv.Graphics(this.el, this.media);

    // Attach listeners to the window, if the game is in fullWindow mode, to resize the canvas accordingly
    if(options.fullWindow) {
      var resize = function() {
        this.graphics.setDimensions(window.innerWidth, window.innerHeight);
        this.onResize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', resize, false);
      window.addEventListener('orientationChange', resize, false);
    }
  },

  // Use the `load` function to start loading up resources:

  //       var image;
  //       var luv = Luv();
  //       luv.load = function() {
  //         image = luv.media.Image('cat.png');
  //       };

  // As al alternative, you can override it directly on the options parameter. Note that in that case, you must use
  // `this` instead of `luv` inside the function:

  //       var image;
  //       var luv = Luv({
  //         load: function() {
  //           // notice the usage of this.media instead of luv.media
  //           image = this.media.Image('cat.png');
  //         };
  //       });

  // `load` will be called once at the beginning of the first game cycle, and then never again (see the `run`
  // function below for details). By default, it does nothing (it is an empty function).
  load  : function(){},

  // Use the draw function to draw everything on the canvas. For example:

  //       var luv = Luv();
  //       luv.draw = function() {
  //         luv.graphics.print("hello", 100, 200);
  //       };

  // Alternative syntax, passed as an option:

  //     var luv = Luv({
  //       draw: function() {
  //         // this.graphics instead of luv.graphics
  //         this.graphics.print("hello", 100, 200);
  //       }
  //     });

  // `draw` is called once per frame, after the screen has been erased. See the `run` function below for details.
  draw  : function(){},

  // Use the `update` function to update your game objects/variables between frames.
  // Note that `update` has a parameter `dt`, which is the time that has passed since the last frame.
  // You should use dt to update your entity positions according to their velocity/movement – *Don't assume that
  // the time between frames stays constant*.

  //       var player = { x: 0, y: 0 };
  //       var luv = Luv();
  //       luv.update = function(dt) {
  //         // Player moves to the right 10 pixels per second
  //         player.x += dt * 10;
  //       };

  // Alternative syntax, passed as an option:

  //       var player = { x: 0, y: 0 };
  //       var luv = Luv({
  //         update: function(dt) {
  //         // Player moves to the right 10 pixels per second
  //           player.x += dt * 10;
  //         };
  //       });

  // As with all other luv methods, if you choose this syntax you must use `this` instead of `luv`, since
  // `luv` is still not defined.

  // `update` will be invoked once per frame (see `run` below) and is empty by default (it updates nothing).
  update: function(dt){},

  // The `run` function provides a default game loop. It is usually a good default, and you rarely will need to
  // change it. But you could, if you so desired, the same way you can change `load`, `update` and `draw` (as a
  // field of the `luv` variable or as an option).
  run   : function(){
    var luv = this;

    luv.load(); // luv.run execute luv.load just once, at the beginning

    var loop = function() {

      // The first thing we do is updating the timer with the new frame
      luv.timer.step();

      // We obtain dt (the difference between previous and this frame's timestamp, in seconds) and pass it
      // to luv.update
      var dt = luv.timer.getDeltaTime();
      luv.update(dt);           // Execute luv.update(dt) once per frame

      luv.graphics.setCanvas(); // And then invoke luv.draw()
      luv.graphics.clear();     // Right after setting the default canvas and erasing it
      luv.draw();               // with the default background color

      // This enqueues another call to the loop function in the next available frame
      luv.timer.nextFrame(loop);
    };

    // Once the loop function is defined, we call it once, so the cycle begins
    luv.timer.nextFrame(loop);
  },

  // `onResize` gets called when `fullWindow` is active and the window is resized. It can be used to
  // control game resizings, i.e. recalculate your camera's viewports. By default, it does nothing.
  onResize  : function(newWidth, newHeight) {}
});

// ## Luv.Class
// Creates classes; takes two parameters: the class name and an object containing instance methods
// For inheritance, do <BaseClass>.subclass(<name>, <methods>) instead
Luv.Class = function(name, methods) {
  return Base.subclass(name, methods);
};

// ## initializeOptions
var initializeOptions = function(options) {
  // Accepted options:

  // * `el`: A canvas DOM element to be used
  // * `id`: A canvas DOM id to be used (Ignored if `el` is provided)
  // * `width`: Sets the width of the canvas, in pixels
  // * `height`: Sets the height of the canvas, in pixels
  // * `fullWindow`: If set to true, the game canvas will ocuppy the whole window, and auto-adjust (off by default)
  // * `load`: A load function (see below)
  // * `update`: A load function (see below)
  // * `draw`: A draw function (see below)
  // * `run`: A run function (see below)
  // * `onResize`: A callback that is called when the window is resized (only works when `fullWindow` is active)

  // Notes:

  // * All options are ... well, optional.
  // * The options parameter itself is optional (you can do `var luv = Luv();`)
  // * Any other options passed through the `options` hash are ignored
  // * If neither `el` or `id` is specified, a new DOM canvas element will be generated and appended to the window. Overrides width and height.
  // * `width` and `height` will attempt to get their values from the DOM element. If they can't, and they are not
  //    provided as options, they will default to 800x600px
  options = options || {};
  var el      = options.el,
      id      = options.id,
      width   = options.width,
      height  = options.height,
      body    = document.getElementsByTagName('body')[0],
      html    = document.getElementsByTagName('html')[0],
      fullCss = "width: 100%; height: 100%; margin: 0; overflow: hidden;";

  if(!el && id) { el = document.getElementById(id); }
  if(el) {
    if(!width  && el.getAttribute('width'))  { width = parseInt(el.getAttribute('width'), 10); }
    if(!height && el.getAttribute('height')) { height = parseInt(el.getAttribute('height'), 10); }
  } else {
    el = document.createElement('canvas');
    body.appendChild(el);
  }
  if(options.fullWindow) {
    html.style.cssText = body.style.cssText = fullCss;
    width  = window.innerWidth;
    height = window.innerHeight;
  } else {
    width = width   || 800;
    height = height || 600;
  }
  el.setAttribute('width', width);
  el.setAttribute('height', height);

  options.el      = el;
  options.width   = width;
  options.height  = height;

  return options;
};


}());
