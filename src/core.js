// # core.js
(function() {

// ## Luv.js Class System

// Luv.js has a very minimal (and optional) class system, based on functions and, in
// some cases, prototypes.

// By "optional", I mean that you are not required to "inherit from" Luv objects when
// creating a game with Luv.js. You can build your game entities however you want. You
// can make them hold references to Luv.js objects when needed.
// In other words, the relationship between your objects and Luv.js should
// be composition (`has_a`) not inheritance (`is_a`).

// This said, you can certainly use Luv.js class system as a base, if you like it.

// That is, unless you are programming some sort of Luv.js plugin. Then you will probably
// be better off using Luv.js' class system.

// `extend` is similar to [underscore's extend](http://underscorejs.org/#extend), it
// copies into `dest` all the methods of the objects passed in as extra arguments.
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

// `remove` deletes the elements from an object, given an array of names of methods to be deleted
var remove = function(dest, names) {
  names = Array.isArray(names) ? names : [names];
  for(var i=0; i < names.length; i++) { delete dest[names[i]]; }
  return dest;
};

// `create` expects an object, and creates another one which "points to it" through its `__proto__`
// For now, it's just an alias to Object.create
var create = Object.create;


// `baseMethods` contains the instance methods of a basic object (by default just two: `toString` and `getClass`)
var baseMethods = extend(create(null), {
  toString: function() { return 'instance of ' + this.getClass().getName(); }
});

// ### Base class definition
var Base = extend(function() {
  return create(baseMethods);
}, {
  init    : function() {},
  getName : function() { return "Base"; },
  toString: function() { return "Base"; },
  getSuper: function() { return null; },
  methods : baseMethods,

  // `include` will extend a class with one or more objects. Acts very similarly to what other languages call
  // "mixins". Example usage:

  //       var Flyer = { fly: function(){ console.log('flap flap'); } };
  //       var Bee = Luv.Class('Bee', {...});
  //       Bee.include(Flyer);

  // It returns the class, so a compressed version of the previous example is:

  //       var Flyer = { fly: function(){ console.log('flap flap'); } };
  //       var Bee = Luv.Class('Bee', {...}).include(Flyer);
  include : function() {
    return extend.apply(this, [this.methods].concat(Array.prototype.slice.call(arguments, 0)));
  },

  // `subclass` is used like this:

  //       var Enemy = Luv.Class('Enemy', {
  //         fight: function() { console.log('zap!'); }
  //         shout: function() { console.log('hey!'); }
  //       });
  //
  //       var Ninja = Enemy.subclass('Ninja', {
  //         shout: function() { console.log('...'); }
  //       });
  //
  //       // Luv.js' class system doesn't require "new"
  //       var peter = Ninja();
  //
  //       peter.fight(); // zap!
  //       peter.shout(); // ...
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

// ## Luv definition

// The main Luv class, and the only global variable defined by luv.js
Luv = Base.subclass('Luv', {
// Luv expects a single `options` parameter (see `initializeOptions` for a list of accepted options).
// and returns a game.
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

// The `options` param is optional, so you can start with an empty call to `Luv`, personalize the game variable
// however you want, and then call run:

//       var luv = Luv();
//       ... // do stuff with luv, i.e. define luv.update and luv.draw
//       luv.run(); // start the game
  init: function(options) {

    options = initializeOptions(options);

    var luv = this;

    // `luv.el` contains a reference to the specified DOM element representing the "Main game canvas".
    // If no element was specified via the `options` parameter, then a new DOM element will be created
    // and inserted into the document's body.
    luv.el  = options.el;

    "load update draw run onResize onBlur onFocus".split(" ").forEach(function(name) {
      if(options[name]) { luv[name] = options[name]; }
    });

    // Initialize all the game submodules (see their docs for more info about each one)
    luv.media     = Luv.Media();
    luv.timer     = Luv.Timer();
    luv.keyboard  = Luv.Keyboard(luv.el);
    luv.mouse     = Luv.Mouse(luv.el);
    luv.audio     = Luv.Audio(luv.media);
    luv.graphics  = Luv.Graphics(luv.el, luv.media);

    // Attach onBlur/onFocus
    luv.el.addEventListener('blur',  function() { luv.onBlur(); });
    luv.el.addEventListener('focus', function() { luv.onFocus(); });

    // Attach listeners to the window, if the game is in fullWindow mode, to resize the canvas accordingly
    if(options.fullWindow) {
      var resize = function() {
        luv.graphics.setDimensions(window.innerWidth, window.innerHeight);
        luv.onResize(window.innerWidth, window.innerHeight);
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
      luv.graphics.reset();     // But first set the defaults
      luv.graphics.clear();     // And clear everything
      luv.draw();

      // This enqueues another call to the loop function in the next available frame
      luv.timer.nextFrame(loop);
    };

    // Once the loop function is defined, we call it once, so the cycle begins
    luv.timer.nextFrame(loop);
  },

  // `onResize` gets called when `fullWindow` is active and the window is resized. It can be used to
  // control game resizings, i.e. recalculate your camera's viewports. By default, it does nothing.
  onResize  : function(newWidth, newHeight) {},

  // overridable callback which is called when the main game element loses focus.
  // useful for things like pausing a game when the user clicks outside of it
  // Does nothing by default
  onBlur : function() {},

  // overridable callback called when the main game element gains focus
  // mainly useful for "undoing" the actions done in onBlur, for example unpausing
  // the game
  onFocus : function() {}
});

// ## Luv.Class
// Creates classes; takes two parameters: the class name and an object containing instance methods
// For inheritance, do <BaseClass>.subclass(<name>, <methods>) instead
Luv.Class = function(name, methods) {
  return Base.subclass(name, methods);
};

// ## Luv.Base
// The root of Luv.js' (optional) class system
Luv.Base = Base;

// ## initializeOptions
var initializeOptions = function(options) {
  // Accepted options:

  // * `el`: A canvas DOM element to be used
  // * `id`: A canvas DOM id to be used (Ignored if `el` is provided)
  // * `width`: Sets the width of the canvas, in pixels
  // * `height`: Sets the height of the canvas, in pixels
  // * `fullWindow`: If set to true, the game canvas will ocuppy the whole window, and auto-adjust (off by default)
  // * `load`: A load function (see above for details)
  // * `update`: A update function (see above for details)
  // * `draw`: A draw function (see above for details)
  // * `run`: A run function (see above for details)
  // * `onResize`: A callback that is called when the window is resized (only works when `fullWindow` is active)
  // * `onBlur`: Callback invoked when the user clicks outside the game (useful for pausing the game, for example)
  // * `onFocus`: Callback invoked when the user set the focus back on the game (useful for unpausing after pausing with onBlur)

  // Notes:

  // * All options are ... well, optional.
  // * The options parameter itself is optional (you can do `var luv = Luv();`)
  // * Any other options passed through the `options` hash are ignored
  // * If neither `el` or `id` is specified, a new DOM canvas element will be generated and appended to the window.
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
