/*! luv 0.0.1 (2013-03-20) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
// #shims.js
// This file contains browser fixes that make several old browsers compatible
// with some basic html5 functionality via workarounds and clever hacks.

(function() {
// ## `window.performance.now` polyfill
window.performance = window.performance || {};
performance.now = performance.now || performance.webkitNow || performance.msNow || performance.mozNow || Date.now;
}());

(function() {
// ## `requestAnimationFrame` polyfill
// polyfill by [Erik Möller](http://creativejs.com/resources/requestanimationframe/)
// adding fixes to [Paul Irish](http://paulirish.com/2011/requestanimationframe-for-smart-animating/)
// and [Tino Zijdel](http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating)
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];

for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
  window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
  window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] ||
                                 window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback, element) {
    var currTime = performance.now;
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                               timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function(id) { clearTimeout(id); };
}

}());

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

    var luv = this;

    luv.el  = options.el;

    if(options.load)     { luv.load     = options.load; }
    if(options.update)   { luv.update   = options.update; }
    if(options.draw)     { luv.draw     = options.draw; }
    if(options.run)      { luv.run      = options.run; }
    if(options.onResize) { luv.onResize = options.onResize; }

    // Initialize all the game submodules (see their docs for more info about each one)
    luv.media     = Luv.Media();
    luv.timer     = Luv.Timer();
    luv.keyboard  = Luv.Keyboard(luv.el);
    luv.mouse     = Luv.Mouse(luv.el);
    luv.audio     = Luv.Audio(luv.media);
    luv.graphics  = Luv.Graphics(luv.el, luv.media);

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

// # timer.js
(function(){

// ## Luv.Timer
Luv.Timer = Luv.Class('Luv.Timer', {

// In luv, time is managed via instances of this constructor, instead of with
// javascript's setInterval.
// Usually, the timer is something internal that is created by Luv when a game
// is created, and it's used mostly inside luv.js' `run` function.
// luv.js users will rarely need to manipulate objects of this
// library, except to obtain the Frames per second or maybe to tweak the
// deltaTimeLimit (see below)

  init: function() {
    // The time that has passed since the timer was created, in milliseconds
    this.microTime = performance.now();

    // The time that has passed between the last two frames, in seconds
    this.deltaTime = 0;

    // The upper value that deltaTime can have, in seconds. Defaults to 0.25.
    // Can be changed via `setDeltaTimeLimit`.
    // Note that this does *not* magically make a game go faster. If a game has
    // very low FPS, this makes sure that the delta time is not too great (its bad
    // for things like physics simulations, etc).
    this.deltaTimeLimit = Luv.Timer.DEFAULT_DELTA_TIME_LIMIT;
  },

  // updates the timer with a new timestamp.
  step : function() {
    this.update((performance.now() - this.microTime) / 1000);
  },

  // updates the timer with a new deltatime
  update : function(dt) {
    this.deltaTime = Math.max(0, Math.min(this.deltaTimeLimit, dt));
    this.microTime += dt * 1000;
  },

  // `deltaTimeLimit` means "the maximum delta time that the timer will report".
  // It's 0.25 by default. That means that if a frame takes 3 seconds to complete,
  // the *reported* delta time will be 0.25s. This setting doesn't magically make
  // games go faster. It's there to prevent errors when a lot of time passes between
  // frames (for example, if the user changes tabs, the timer could spend entire
  // minutes locked in one frame).
  setDeltaTimeLimit : function(deltaTimeLimit) {
    this.deltaTimeLimit = deltaTimeLimit;
  },

  // returns the `deltaTimeLimit`; the maximum delta time that will be reported.
  // see `setDeltaTimeLimit` for details.
  getDeltaTimeLimit : function() {
    return this.deltaTimeLimit;
  },

  // returns how much time has passed between this frame and the previous one,
  // in seconds. Note that it's capped by `deltaTimeLimit`.
  getDeltaTime : function() {
    return Math.min(this.deltaTime, this.deltaTimeLimit);
  },

  // Returns the frames per second
  getFPS : function() {
    return this.deltaTime === 0 ? 0 : 1 / this.deltaTime;
  },

  // This function is used in the main game loop. For now, it just calls `window.requestAnimationFrame`.
  nextFrame : function(f) {
    window.requestAnimationFrame(f);
  }

});

Luv.Timer.DEFAULT_DELTA_TIME_LIMIT = 0.25;

}());

// # keyboard.js
(function() {

// *Disclaimer*: the code on this module was inspired by [selfcontained.us](http://www.selfcontained.us/2009/09/16/getting-keycode-values-in-javascript/)

// ## Luv.Keyboard
Luv.Keyboard = Luv.Class('Luv.Keyboard', {
  // This luv module manages the keyboard. It is usually instantiated by
  // luv.js itself when it creates a Luv() game. The two most usual ways to
  // interact with it are via the `onPress` and `onRelease` callbacks, or the
  // `isPressed` method (see below).
  init: function(el) {
    var keyboard = this;

    keyboard.keysDown  = {};
    keyboard.el        = el;

    el.tabIndex = 1;
    el.focus();

    el.addEventListener('keydown', function(evt) {
      var key  = getKeyFromEvent(evt);
      keyboard.keysDown[key] = true;
      keyboard.onPressed(key, evt.which);
    });

    el.addEventListener('keyup', function(evt) {
      var key  = getKeyFromEvent(evt);
      keyboard.keysDown[key] = false;
      keyboard.onReleased(key, evt.which);
    });

    return keyboard;
  },

  // `onPressed` is a user-overrideable that is triggered when a keyboard key
  // is pressed.
  //
  // The first parameter is a string with the key human name (for example the
  // arrow keys are named "up", "down", "left" and "right"). The second parameter
  // is a number that browsers use internally to identify keys. I've included both
  // because there is no way I can name all keys that exist (the list of key names
  // that luv.js understands is below).
  //
  // Example of use of onPressed:

  //       var msg = "";
  //       var luv = Luv();
  //       luv.keyboard.onPressed = function(key, code) {
  //         msg = "The key " + key + " with code " + code + " was pressed";
  //       };

  // It does nothing by default.
  onPressed  : function(key, code) {},

  // `onReleased` works the same way as onPressed, except that it gets triggered
  // when a key stops being pressed.
  onReleased : function(key, code) {},

  // `isDown` will return true if a key is pressed, and false otherwise.
  // If used, it will probably be used inside `luv.update`:

  //       var player = {y: 100};
  //       var luv = Luv();
  //       luv.update = function(dt) {
  //         if(luv.keyboard.isPressed('up')) {
  //           player.y -= 10*dt;
  //         };
  //       };

  // Notice that while using `isDown` is easier than using `onPressed` and `onReleased`,
  // it is also less flexible. On medium games that allow things like keyboard configuration,
  // it's recommended to use `onPressed` and `onReleased`.
  isDown     : function(key) {
    return !!this.keysDown[key];
  }
});

// ## Normal keys
var keys = {
  8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt",
  19: "pause", 20: "capslock", 27: "escape", 33: "pageup", 34: "pagedown",
  35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert",
  46: "delete", 91: "lmeta", 92: "rmeta", 93: "mode", 96: "kp0", 97: "kp1",
  98: "kp2", 99: "kp3", 100: "kp4", 101: "kp5", 102: "kp6", 103: "kp7", 104: "kp8",
  105: "kp9", 106: "kp*", 107: "kp+", 109: "kp-", 110: "kp.", 111: "kp/", 112: "f1",
  113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9",
  121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scrolllock", 186: ",",
  187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
  221: "]", 222: "'"
};

// ## Shifted keys
// These names will get passed to onPress and onRelease instead of the default ones
// if one of the two "shift" keys is pressed.
var shiftedKeys = {
  192:"~", 48:")", 49:"!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^", 55:"&", 56:"*", 57:"(", 109:"_", 61:"+",
  219:"{", 221:"}", 220:"|", 59:":", 222:"\"", 188:"<", 189:">", 191:"?",
  96:"insert", 97:"end", 98:"down", 99:"pagedown", 100:"left", 102:"right", 103:"home", 104:"up", 105:"pageup"
};

// ## Right keys
// luv.js will attempt to differentiate rshift from shift, rctrl from ctrl, and
// ralt from alt. This is browser-dependent though, and not completely supported.
var rightKeys = {
  16: "rshift", 17: "rctrl", 18: "ralt"
};

// This function tries to guess the best name for a event.
var getKeyFromEvent = function(event) {
  // Getting the keybode is easy
  var code = event.which;
  var key;
  // See if we are pressing one of the "right keys"
  if(event.keyLocation && event.keyLocation > 1) { key = rightKeys[code]; }
  // otherwise see if we are pressing shift
  else if(event.shiftKey) { key = shiftedKeys[code] || keys[code]; }
  // otherwise, it's a "non-special" key, Try to get its name from the `keys` var.
  else { key = keys[code]; }

  // If everything else fails, try to return [String.fromCharCode](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/fromCharCode)
  // That will return "normal letters", such as 'a', 'b', 'c', '1', '2', '3', etc.
  return key || String.fromCharCode(code);
};

}());




// # mouse.js
(function() {

// ## Luv.Mouse
Luv.Mouse = Luv.Class('Luv.Mouse', {
  // This function creates a mouse handler for a mouse game.
  // It is usually instantiated directly by the main Luv() function,
  // you will probably not need to call `Luv.Mouse()` yourself:

  //       var luv = Luv();
  //       luv.mouse // Already instantiated mouse handler

  init: function(el) {

    var mouse  = this;

    mouse.x               = 0;
    mouse.y               = 0;
    mouse.pressedButtons  = {};
    mouse.wheelTimeOuts   = {};

    // The mouse module works by attaching several event listeners to the
    // given el element. That's how mouse position, button presses and wheel state
    // are detected.

    var handlePress = function(button) {
      mouse.pressedButtons[button] = true;
      mouse.onPressed(mouse.x, mouse.y, button);
    };

    var handleRelease = function(button) {
      mouse.pressedButtons[button] = false;
      mouse.onReleased(mouse.x, mouse.y, button);
    };

    var handleWheel = function(evt) {
      evt.preventDefault();
      var button = getWheelButtonFromEvent(evt);
      // The 'wheel has stopped scrolling' event is triggered via setTimeout, since
      // browsers don't provide a native 'stopped scrolling' event
      clearTimeout(mouse.wheelTimeOuts[button]);
      // The default time it takes the browser to detect that the mouse wheel stopped
      // is 20 milliseconds
      mouse.wheelTimeOuts[button] = setTimeout(function() { handleRelease(button); }, 20);
      handlePress(button);
    };

    // mousemove is particularly laggy in Chrome. I'd love to find a better solution
    el.addEventListener('mousemove', function(evt) {
      var rect = el.getBoundingClientRect();
      mouse.x = evt.pageX - rect.left;
      mouse.y = evt.pageY - rect.top;
    });

    el.addEventListener('mousedown', function(evt) {
      handlePress(getButtonFromEvent(evt));
    });

    el.addEventListener('mouseup', function(evt) {
      handleRelease(getButtonFromEvent(evt));
    });

    el.addEventListener('DOMMouseScroll', handleWheel); // firefox
    el.addEventListener('mousewheel', handleWheel); // everyone else
  },

  // Returns the x coordinate where the mouse is (relative to the DOM element)
  getX: function() { return this.x; },

  // Returns the x coordinate where the mouse is (relative to the DOM element)
  getY: function() { return this.y; },

  // Returns both the x and y coordinates of the mouse, as an object of the form
  // `{x: 100, y:200}
  getPosition: function() {
    return {x: this.x, y: this.y};
  },

  // `onPressed` is an overridable callback that is called when any of the mouse
  // buttons is pressed.
  // `button` is a string representing a button name (`"l"` for left, `"m"` for middle,
  // `"r"` for right).

  //       var luv = Luv();
  //       luv.mouse.onPressed = function(x,y,button) {
  //         console.log("Mouse button " + button + " was pressed in " + x + ", " + y);
  //       }
  onPressed: function(x,y,button) {},

  // Works the same as `onPressed`, but is called when a button stops being pressed.
  onReleased: function(x,y,button) {},

  // Returns true if a button is pressed, false otherwhise. Usually used inside
  // the update loop:

  //       var luv = Luv();
  //       luv.update = function(dt) {
  //         if(luv.mouse.isPressed('l')) {
  //           console.log('Left mouse button pressed');
  //         }
  //       };
  isPressed: function(button) {
    return !!this.pressedButtons[button];
  }
});

// Internal variable + function to transform DOM event magic numbers into human button names
// (left, middle, right)
var mouseButtonNames = {1: "l", 2: "m", 3: "r"};
var getButtonFromEvent = function(evt) {
  return mouseButtonNames[evt.which];
};

// Internal function to determine the mouse weel direction
var getWheelButtonFromEvent = function(evt) {
  var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
  return delta === 1 ? 'wu' : 'wd';
};

}());

// # media.js
(function() {
// ## Luv.Media
Luv.Media = Luv.Class('Luv.Media', {
  // This module creates the `media` object when you create a luv game. It's usually
  // instantiated by the Luv function.

  //       var luv = Luv();
  //       luv.media // this is the media object

  // The media object is an "asset manager". It keeps track of those
  // assets (i.e. images) that load asynchronously, or can fail to load.
  //
  init: function() {
    this.pending = 0;
  },

  // `isLoaded` returns `true` if all the assets have been loaded, `false` if there are assets still being loaded.
  // Useful to wait actively until all assets are finished loading:

  //       var luv = Luv();
  //       var dogImage;
  //       luv.load = function() {
  //         dogImage = luv.graphics.Image('dog.png');
  //       }
  //       luv.draw = function() {
  //         // wait until all images are loaded before drawing anything
  //         if(!luv.media.isLoaded()) { return; }
  //         luv.graphics.drawImage(dogImage, 100, 100);
  //       }
  isLoaded     : function() { return this.pending === 0; },

  // Returns the numbers of assets that are loading, but not yet ready
  getPending   : function() { return this.pending; },

  // `onAssetLoaded` is an overridable callback.
  // It will be called once for each asset (Image, Sound, etc) that is loaded.
  // You may use it for things like displaing a "loaded percentage"

  //       luv.media.onAssetLoaded = function(asset) {
  //         assetsLoaded += 1;
  //       };
  onAssetLoaded: function(asset) {},

  // `onAssetError` is an overridable callback that will be called when an asset can not be loaded (for example,
  // the path to an image does not exist)
  // By default, it throws an error
  onAssetError  : function(asset) { throw new Error("Could not load " + asset); },

  // `onLoaded` is an overridable callback that will be called when the last pending asset is finished loading
  // you can use it instead of `isLoaded` to control the game flow
  onLoaded     : function() {},

  // Pseudo-Internal function. Registers the asset in the media object.
  newAsset  : function(asset) {
    this.pending++;
    asset.status        = "pending";
  },

  // Pseudo-internal function. Assets that have been loaded successfully should call this function
  // (this will trigger onAssetLoaded, etc)
  registerLoad : function(asset) {
    this.pending--;

    asset.status = "loaded";

    this.onAssetLoaded(asset);
    if(this.isLoaded()) { this.onLoaded(); }
  },

  // Pseudo-internal function. Assets that can't be loaded must invoke this method
  registerError: function(asset) {
    this.pending--;

    asset.status = "error";

    this.onAssetError(asset);
  }
});

// This just a method holding object, to be extended by specialized assets
// like Image or Sound. Usage:

//       MyAwesomeClass.include(Luv.Media.Asset)

// See `Luv.Graphics.Image` for an example.
Luv.Media.Asset = {
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

}());



// # audio.js
(function(){

// ## Luv.Audio
Luv.Audio = Luv.Class('Luv.Audio', {
  init: function(media) {
    this.media = media;
  },

  isAvailable: function() { return Luv.Audio.isAvailable(); },

  getSupportedTypes: function() {
    return Luv.Audio.getSupportedTypes();
  },

  canPlayType: function(type) {
    return this.supportedTypes[type.toLowerCase()];
  },

  Sound: function() {
    if(this.isAvailable()) {
      var args = [this.media].concat(Array.prototype.slice.call(arguments, 0));
      return Luv.Audio.Sound.apply(Luv.Audio.Sound, args);
    } else {
      return Luv.Audio.NullSound();
    }
  }

});

Luv.Audio.isAvailable = function() {
  return audioAvailable;
};

Luv.Audio.canPlayType = function(type) {
  return !!supportedTypes[type.toLowerCase()];
};

Luv.Audio.getSupportedTypes = function() {
  return Object.keys(supportedTypes);
};

var el = document.createElement('audio');
var supportedTypes = {};
var audioAvailable = !!el.canPlayType;
if(audioAvailable) {
  supportedTypes.ogg = !!el.canPlayType('audio/ogg; codecs="vorbis"');
  supportedTypes.mp3 = !!el.canPlayType('audio/mpeg;');
  supportedTypes.wav = !!el.canPlayType('audio/wav; codecs="1"');
  supportedTypes.m4a = !!el.canPlayType('audio/x-m4a;');
  supportedTypes.aac = !!el.canPlayType('audio/aac;');
}


})();

// # audio/null_sound.js
(function(){

// ## Luv.Audio.NullSound
Luv.Audio.NullSound = Luv.Class('Luv.Audio.NullSound', {
  play: function() {
    return Luv.Audio.SoundInstance(FakeAudioElement());
  }
});

var nopFunctions = {};
"pause stop setVolume setVolume setLoop setSpeed setTime setExpirationTime".split(" ").forEach(function(name){
  nopFunctions[name] = function(){};
});

var zeroFunctions = {};
"countInstances countPlayingInstances getExpirationTime getVolume getSpeed getTime getDuration".split(" ").forEach(function(name){
  nopFunctions[name] = function(){ return 0; };
});

Luv.Audio.NullSound.include(nopFunctions, zeroFunctions);

var FakeAudioElement = function() {
  return {
    volume: 1,
    playbackRate: 1,
    // loop: undefined
    currentTime: 0,
    play: function(){},
    pause: function(){},
    addEventListener: function(ignored, f) { f(); }
  };
};


})();

// # audio/sound.js
(function(){

// ## Luv.Audio.Sound
Luv.Audio.Sound = Luv.Class('Luv.Audio.Sound', {
  init: function(media) {
    var paths = Array.prototype.slice.call(arguments, 1);
    if(paths.length === 0) {
      throw new Error("Must provide at least one path for the Sound");
    }
    paths = paths.filter(isPathExtensionSupported);
    if(paths.length === 0) {
      throw new Error("None of the provided sound types (" +
                      paths.join(", ") +
                      ") is supported by the browser: (" +
                      Luv.Audio.getSupportedTypes().join(", ") +
                      ")");
    }

    var sound = this;

    sound.path = paths[0];

    media.newAsset(sound);
    var el = sound.el= document.createElement('audio');
    el.preload = "auto";

    el.addEventListener('canplaythrough', function() {
      if(sound.isLoaded()){ return; }
      media.registerLoad(sound);
    });
    el.addEventListener('error', function() { media.registerError(sound); });

    el.src     = sound.path;
    el.load();

    sound.instances = [];
    sound.expirationTime = Luv.Audio.Sound.DEFAULT_EXPIRATION_TIME;
  },

  toString: function() {
    return 'Luv.Audio.Sound("' + this.path + '")';
  },

  play: function(options) {
    if(!this.isLoaded()) {
      throw new Error("Attepted to play a non loaded sound: " + this);
    }
    var instance = this.getReadyInstance(options);
    instance.play();
    return instance;
  },

  pause: function() {
    this.instances.forEach(function(instance){ instance.pause(); });
  },

  stop: function() {
    this.instances.forEach(function(instance){ instance.stop(); });
  },

  countInstances: function() {
    return this.instances.length;
  },

  countPlayingInstances: function() {
    var count = 0;
    this.instances.forEach(function(inst){ count += inst.isPlaying() ? 1 : 0; });
    return count;
  },

  getReadyInstance: function(options) {
    var sound = this;
    var instance = getExistingReadyInstance(this.instances);
    if(instance) {
      instance.reset(options);
    } else {
      instance = Luv.Audio.SoundInstance(this.el.cloneNode(true), options);
      this.instances.push(instance);
    }
    resetInstanceExpirationTimeOut(this, instance);
    return instance;
  },

  getExpirationTime: function() {
    return this.expirationTime;
  },

  setExpirationTime: function(time) {
    this.expirationTime = time;
  }
});

Luv.Audio.Sound.DEFAULT_EXPIRATION_TIME = 3000; // 3 seconds

Luv.Audio.Sound.include(Luv.Media.Asset);

Luv.Audio.SoundMethods = {
  setVolume: function(volume) {
    volume = clampNumber(volume, 0, 1);
    this.el.volume = volume;
  },
  getVolume: function() {
    return this.el.volume;
  },
  setLoop: function(loop) {
    this.loop = !!loop;
    if(loop) {
      this.el.loop = "loop";
    } else {
      this.el.removeAttribute("loop");
    }
  },
  getLoop: function() {
    return this.loop;
  },
  setSpeed: function(speed) {
    this.el.playbackRate = speed;
  },
  getSpeed: function() {
    return this.el.playbackRate;
  },
  setTime: function(time) {
    try {
      this.el.currentTime = time;
    } catch(err) {
      // some browsers throw an error when setting currentTime right after loading
      // a node. See https://bugzilla.mozilla.org/show_bug.cgi?id=465498
    }
  },
  getTime: function() {
    return this.el.currentTime;
  },
  getDuration: function() {
    return this.el.duration;
  }
};

Luv.Audio.Sound.include(Luv.Audio.SoundMethods);

var getExistingReadyInstance = function(instances) {
  var instance;
  for(var i=0; i< instances.length; i++) {
    instance = instances[i];
    if(instance.isReady()) {
      return instance;
    }
  }
};

var resetInstanceExpirationTimeOut = function(sound, instance) {
  clearTimeout(instance.expirationTimeOut);
  instance.expirationTimeOut = setTimeout(function() {
    var index = sound.instances.indexOf(instance);
    if(index != -1){ sound.instances.splice(index, 1); }
  }, sound.expirationTime);
};

var getExtension = function(path) {
  var match = path.match(/.+\.([^?]+)(\?|$)/);
  return match ? match[1].toLowerCase() : "";
};

var isPathExtensionSupported = function(path) {
  return Luv.Audio.canPlayType(getExtension(path));
};

var clampNumber = function(x, min, max) {
  return Math.max(min, Math.min(max, Number(x)));
};

})();

// # audio/sound_instance.js
(function() {

// ## Luv.Audio.SoundInstance

Luv.Audio.SoundInstance = Luv.Class('Luv.Audio.SoundInstance', {
  init: function(el, options) {
    var soundInstance = this;
    soundInstance.el = el;
    soundInstance.el.addEventListener('ended', function(){ soundInstance.stop(); });
    soundInstance.reset(options);
  },
  reset: function(options) {
    options = options || {};
    var el = this.el;
    var volume = typeof options.volume === "undefined" ? el.volume       : options.volume,
        loop   = typeof options.loop   === "undefined" ? !!el.loop       : options.loop,
        speed  = typeof options.speed  === "undefined" ? el.playbackRate : options.speed,
        time   = typeof options.time   === "undefined" ? el.currentTime  : options.time,
        status = typeof options.status === "undefined" ? "ready"         : options.status;

    this.setVolume(volume);
    this.setLoop(loop);
    this.setSpeed(speed);
    this.setTime(time);
    this.status = status;
  },
  play: function() {
    this.el.play();
    this.status = "playing";
  },
  pause: function() {
    if(this.isPlaying()) {
      this.el.pause();
      this.status = "paused";
    }
  },
  stop: function() {
    this.el.pause();
    this.setTime(0);
    this.status = "ready";
  },
  isPaused : function() { return this.status == "paused"; },
  isReady  : function() { return this.status == "ready"; },
  isPlaying: function() { return this.status == "playing"; }
});

Luv.Audio.SoundInstance.include(Luv.Audio.SoundMethods);

}());


(function(){

Luv.Graphics = Luv.Class('Luv.Graphics', {
  init: function(el, media) {
    this.el               = el;
    this.media            = media;
    this.color            = {};
    this.backgroundColor  = {};

    var d = this.getDimensions();
    this.defaultCanvas    = this.Canvas(d.width, d.height);
    this.defaultCanvas.el = el;

    this.setBackgroundColor(0,0,0);
    this.setCanvas();
    this.reset();
  },

  setCanvas : function(canvas) {
    canvas = canvas || this.defaultCanvas;
    this.canvas = canvas;
    this.el     = canvas.el;
    this.ctx    = canvas.getContext();
    this.reset();
  },

  getCanvas : function() { return this.canvas; },

  setColor  : function(r,g,b,a) { setColor(this, 'color', r,g,b,a); },

  getColor  : function() { return getColor(this.color); },

  setBackgroundColor : function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); },

  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  getWidth      : function(){ return parseInt(this.el.getAttribute('width'), 10); },

  getHeight     : function(){ return parseInt(this.el.getAttribute('height'), 10); },

  getDimensions : function(){ return { width: this.getWidth(), height: this.getHeight() }; },

  setDimensions : function(width, height) {
    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);
  },

  setLineWidth : function(width) {
    this.lineWidth = width;
    this.ctx.lineWidth = width;
  },

  getLineWidth : function() {
    return this.lineWidth;
  },

  setLineCap : function(cap) {
    if(cap != "butt" && cap != "round" && cap != "square") {
      throw new Error("Line cap must be either 'butt', 'round' or 'square' (was: " + cap + ")");
    }
    this.ctx.lineCap = cap;
    this.lineCap     = this.ctx.lineCap;
  },

  getLineCap : function() { return this.lineCap; },

  clear : function() {
    this.reset();
    this.ctx.fillStyle = this.backgroundColorStyle;
    this.ctx.fillRect(0, 0, this.getWidth(), this.getHeight());
  },

  print : function(str,x,y) {
    this.ctx.fillStyle = this.colorStyle;
    this.ctx.fillText(str, x, y);
  },

  line : function() {
    var coords = Array.isArray(arguments[0]) ? arguments[0] : arguments;

    this.ctx.beginPath();
    drawPolyLine(this, 'luv.graphics.line', 4, coords);
    drawPath(this, 'line');
  },

  rectangle : function(mode, left, top, width, height) {
    this.ctx.beginPath();
    this.ctx.rect(left, top, width, height);
    drawPath(this, mode);
    this.ctx.closePath();
  },

  polygon : function() {
    var mode   = arguments[0],
        coords = arguments[1];

    if(!Array.isArray(coords)) {
      coords = [];
      for(var i=1;i<arguments.length;i++) { coords[i-1] = arguments[i]; }
    }

    this.ctx.beginPath();

    drawPolyLine(this, 'luv.graphics.polygon', 6, coords);
    drawPath(this, mode);

    this.ctx.closePath();
  },

  circle : function(mode, x,y,radius) {
    this.arc(mode, x, y, radius, 0, twoPI);
    this.ctx.closePath();
  },

  arc : function(mode, x,y,radius, startAngle, endAngle) {
    this.ctx.beginPath();
    this.ctx.arc(x,y,radius, startAngle, endAngle, false);
    drawPath(this, mode);
  },

  draw : function(drawable, x, y, sx, sy, angle, ox, oy) {
    var ctx = this.ctx;

    sx    = typeof sx    === "undefined" ? 1 : sx;
    sy    = typeof sy    === "undefined" ? 1 : sy;
    angle = typeof angle === "undefined" ? 0 : normalizeAngle(angle);
    ox    = typeof ox    === "undefined" ? 0 : ox;
    oy    = typeof oy    === "undefined" ? 0 : oy;

    if(sx !== 1 || sy !== 1 || angle !== 0 || ox !== 0 || oy !== 0) {
      ctx.save();

      ctx.translate(x,y);

      ctx.translate(ox, oy);
      ctx.rotate(angle);
      ctx.scale(sx,sy);
      ctx.translate(-ox, -oy);
      drawable.draw(ctx, 0, 0);

      ctx.restore();
    } else {
      drawable.draw(ctx, x, y);
    }
  },

  drawCentered : function(drawable, x,y, sx, sy, angle) {
    var d = drawable.getDimensions();
    var ox = d.width / 2,
        oy = d.height / 2;
    this.draw(drawable, x-ox,y-oy, sx,sy, angle, ox, oy);
  },

  translate : function(x,y) {
    this.ctx.translate(x,y);
  },

  scale : function(sx,sy) {
    this.ctx.scale(sx,sy);
  },

  rotate : function(angle) {
    this.ctx.rotate(angle);
  },

  reset : function() {
    this.ctx.setTransform(1,0,0,1,0,0);
    this.setColor(255,255,255);
    this.setImageSmoothing(true);
    this.setLineWidth(1);
    this.setLineCap('butt');
  },

  push : function() {
    this.ctx.save();
  },

  pop : function() {
    this.ctx.restore();
  },

  setImageSmoothing: function(smoothing) {
    this.imageSmoothing = smoothing = !!smoothing;
    if(smoothing) {
      this.ctx.webkitImageSmoothingEnabled = smoothing;
      this.ctx.mozImageSmoothingEnabled    = smoothing;
      this.ctx.imageSmoothingEnabled       = smoothing;
    }
  },

  getImageSmoothing: function() {
    return this.imageSmoothing;
  },

  Canvas : function(width, height) {
    return Luv.Graphics.Canvas(width || this.getWidth(), height || this.getHeight());
  },

  Image : function(path) {
    return Luv.Graphics.Image(this.media, path);
  }

});


var twoPI = Math.PI * 2;

var setColor = function(self, name, r,g,b,a) {
  var color = self[name];
  if(Array.isArray(r)) {
    color.r = r[0];
    color.g = r[1];
    color.b = r[2];
    color.a = r[3] || 255;
  } else {
    color.r = r;
    color.g = g;
    color.b = b;
    color.a = a || 255;
  }
  self[name + 'Style'] = "rgba(" + [color.r, color.g, color.b, color.a/255].join() + ")";
};

var getColor = function(color) {
  return [color.r, color.g, color.b, color.a ];
};

var drawPath = function(graphics, mode) {
  switch(mode){
  case 'fill':
    graphics.ctx.fillStyle = graphics.colorStyle;
    graphics.ctx.fill();
    break;
  case 'line':
    graphics.ctx.strokeStyle = graphics.colorStyle;
    graphics.ctx.stroke();
    break;
  default:
    throw new Error('Invalid mode: [' + mode + ']. Should be "fill" or "line"');
  }
};

var drawPolyLine = function(graphics, methodName, minLength, coords) {

  if(coords.length < minLength) { throw new Error(methodName + " requires at least 4 parameters"); }
  if(coords.length % 2 == 1) { throw new Error(methodName + " requires an even number of parameters"); }

  graphics.ctx.moveTo(coords[0], coords[1]);

  for(var i=2; i<coords.length; i=i+2) {
    graphics.ctx.lineTo(coords[i], coords[i+1]);
  }

  graphics.ctx.stroke();
};

var normalizeAngle = function(angle) {
  angle = angle % twoPI;
  return angle >= 0 ? angle : angle + twoPI;
};


}());

// # canvas.js
(function() {

// ## Luv.Graphics.Canvas

Luv.Graphics.Canvas = Luv.Class('Luv.Graphics.Canvas', {

// represents aon off-screen drawing surface, useful
// for precalculating costly drawing operations or
// applying effects. Usage:

//       var luv    = Luv();
//       var canvas = luv.graphics.Canvas();
//
//       // set the canvas as the new drawing surface
//       luv.graphics.setCanvas(canvas);
//       luv.graphics.print("This is print off-screen", 100, 100);
//
//       // go back to the default canvas
//       luv.graphics.setCanvas();
//       luv.graphics.print("This is print inscreen", 100, 100);
//
//       // The canvas can be drawn in the default screen like this
//       luv.graphics.draw(canvas, 200, 500);

// The default canvas is reset at the beginning of each draw cycle, before calling luv.draw()

  init: function(width, height) {
    var el = document.createElement('canvas');
    el.setAttribute('width', width);
    el.setAttribute('height', height);

    this.el = el;
  },

  getContext    : function(){ return this.el.getContext('2d'); },

  getWidth      : function(){ return parseInt(this.el.getAttribute('width'), 10); },

  getHeight     : function(){ return parseInt(this.el.getAttribute('height'), 10); },

  getDimensions : function(){ return { width: this.getWidth(), height: this.getHeight() }; },

  setDimensions : function(width, height) {
    this.el.setAttribute('width', width);
    this.el.setAttribute('height', height);
  },

  draw: function(context, x, y) {
    context.drawImage(this.el, x, y);
  }
});

}());

// # image.js
(function() {

// ## Luv.Graphics.Image
// This class encapsulates images loaded from the internet
Luv.Graphics.Image = Luv.Class('Luv.Graphics.Image', {
  init: function(media, path) {
    var image = this;

    image.path = path;

    media.newAsset(image);

    var source   = new Image(); // html image
    image.source = source;

    source.addEventListener('load',  function(){ media.registerLoad(image); });
    source.addEventListener('error', function(){ media.registerError(image); });
    source.src = path;
  },

  toString      : function() {
    return 'Luv.Graphics.Image("' + this.path + '")';
  },

  getWidth      : function() { return this.source.width; },

  getHeight     : function() { return this.source.height; },

  getDimensions : function() {
    return { width: this.source.width, height: this.source.height };
  },

  draw: function(context, x, y) {
    if(!this.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + this);
    }
    context.drawImage(this.source, x, y);
  }

});

Luv.Graphics.Image.include(Luv.Media.Asset);

}());
