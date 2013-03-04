/*! luv 0.0.1 (2013-03-04) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
// #shims.js
(function() {
// This file contains browser fixes that make several old browsers compatible
// with some basic html5 functionality via workarounds and clever hacks.

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
    var currTime = new Date().getTime();
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

// # Luv.js
(function() {

// ## Main Luv function
Luv = function(options) {
// The main Luv function, and the only global variable defined by luv.js
// It basically parses the given options (see `initializeOptions` for a list of accepted options).
// Returns a game.
// The recommended name for the variable to store the game is `luv`, but you are free to choose any other.

//       var luv = Luv({...});
//       // options omitted, see initializeOptions & LuvProto below

// The game will not start until you execute `luv.run()` (assuming that your game variable name is `luv`).

//       var luv = Luv({...});
//       ... // more code ommited, see LuvProto below for details
//       luv.run();

// If you have initialized your game completely with options, you could just run it straight away,
// without storing it into a variable:

//       Luv({...}).run();

  options = initializeOptions(options);

  var luv = Object.create(LuvProto);
  luv.el  = options.el;

  if(options.load)  { luv.load   = options.load; }
  if(options.update){ luv.update = options.update; }
  if(options.draw)  { luv.draw   = options.draw; }
  if(options.run)   { luv.run    = options.run; }

  // Initialize all the game submodules (see their docs for more info about each one)
  luv.graphics  = Luv.Graphics(luv.el, options.width, options.height);
  luv.timer     = Luv.Timer();
  luv.keyboard  = Luv.Keyboard(luv.el);
  luv.mouse     = Luv.Mouse(luv.el);
  luv.media     = Luv.Media();

  return luv;
};

// ## initializeOptions
var initializeOptions = function(options) {
// Accepted options:

// * `el`: A canvas DOM element to be used
// * `id`: A canvas DOM id to be used (Ignored if `el` is provided)
// * `width`: Sets the width of the canvas, in pixels
// * `height`: Sets the height of the canvas, in pixels
// * `load`: A load function (see above)
// * `update`: A load function (see above)
// * `draw`: A draw function (see above)
// * `run`: A run function (see above)

// Notes:

// * All options are ... well, optional.
// * The options parameter itself is optional (you can do `var luv = Luv();`)
// * Any other options passed through the `options` hash are ignored
// * If neither `el` or `id` is specified, a new DOM canvas element will be generated and appended to the `body` of the page.
// * `width` and `height` will attempt to get their values from the DOM element. If they can't, and they are not
//    provided as options, they will default to 800x600px
  options = options || {};
  var el     = options.el,
      id     = options.id,
      width  = options.width,
      height = options.height;

  if(!el && id) { el = document.getElementById(id); }
  if(el) {
    if(!width  && el.getAttribute('width'))  { width = parseInt(el.getAttribute('width'), 10); }
    if(!height && el.getAttribute('height')) { height = parseInt(el.getAttribute('height'), 10); }
  } else {
    el = document.createElement('canvas');
    document.getElementsByTagName('body')[0].appendChild(el);
  }
  width = width || 800;
  height = height || 600;
  el.setAttribute('width', width);
  el.setAttribute('height', height);

  options.el      = el;
  options.width   = width;
  options.height  = height;

  return options;
};





// ## LuvProto
// Contains the default implementation of Luv.load, Luv.draw, Luv.update and Luv.run
var LuvProto = {
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

    var loop = function(time) {

      // The first thing we do is updating the timer with the new frame
      luv.timer.step(time);

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
  }
};

}());

// # object.js
(function() {

// ## Luv.Object
// The base object that provides common functionality amongst all objects in Luv

Luv.Object = {
  getType : function() { return 'Luv.Object'; },
  toString: function() { return this.getType(); },
  include : function(properties) {
    for(var property in properties) {
      if(properties.hasOwnProperty(property)) {
        this[property] = properties[property];
      }
    }
    return this;
  },
  extend  : function(properties) {
    return Object.create(this).include(properties);
  }
};

}());

// # timer.js
(function(){

// ## Luv.Timer
Luv.Timer = function() {

// In luv, time is managed via instances of this constructor, instead of with
// javascript's setInterval.
// Usually, the timer is something internal that is created by Luv when a game
// is created, and it's used mostly inside luv.js' `run` function.
// luv.js users will rarely need to manipulate objects of this
// library, except to obtain the Frames per second or maybe to tweak the
// deltaTimeLimit (see below)

  return TimerProto.extend({
    // The time that has passed since the timer was created, in milliseconds
    microTime : 0,

    // The time that has passed between the last two frames, in seconds
    deltaTime : 0,

    // The upper value that deltaTime can have, in seconds. Defaults to 0.25.
    // Can be changed via `setDeltaTimeLimit`.
    // Note that this does *not* magically make a game go faster. If a game has
    // very low FPS, this makes sure that the delta time is not too great (its bad
    // for things like physics simulations, etc).
    deltaTimeLimit : 0.25
  });
};

// ## TimerProto
// The `timer` methods go here
var TimerProto = Luv.Object.extend({
  getType: function() { return 'Luv.Timer'; },

  // updates the timer with a new timestamp.
  step : function(time) {
    // In some rare cases (the first couple frames) the time readings might
    // overflow. This conditional makes sure that case does not happen.
    if(time > this.microTime) {
      this.deltaTime = (time - this.microTime) / 1000;
      this.microTime = time;
    }
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

  // Returns how much time has passed since the timer was created, in milliseconds
  getMicroTime : function() {
    return this.microTime;
  },

  // Returns how much time has passed since the timer was created, in seconds
  getTime : function() {
    return this.getMicroTime() / 1000;
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

}());

// # keyboard.js
(function() {

// *Disclaimer*: the code on this module was inspired by [selfcontained.us](http://www.selfcontained.us/2009/09/16/getting-keycode-values-in-javascript/)

// ## Luv.Keyboard
Luv.Keyboard = function(el) {
  // This luv module manages the keyboard. It is usually instantiated by
  // luv.js itself when it creates a Luv() game. The two most usual ways to
  // interact with it are via the `onPress` and `onRelease` callbacks, or the
  // `isPressed` method (see below).
  var keyboard = KeyboardProto.extend({
    keysDown : {},
    el: el
  });

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
};

// ## KeyboardProto
// provides the three main keyboard methods
var KeyboardProto = Luv.Object.extend({
  getType: function(){ return 'Luv.Keyboard'; },

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
Luv.Mouse = function(el) {
  // This function creates a mouse handler for a mouse game.
  // It is usually instantiated directly by the main Luv() function,
  // you will probably not need to call `Luv.Mouse()` yourself:

  //       var luv = Luv();
  //       luv.mouse // Already instantiated mouse handler
  var mouse = MouseProto.extend({
    x: 0,
    y: 0,
    pressedButtons: {},
    wheelTimeOuts: {}
  });

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

  return mouse;
};


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

// ## MouseProto
// Shared mouse functions go here
var MouseProto = Luv.Object.extend({
  getType: function() { return 'Luv.Mouse'; },

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

}());

// # media.js
(function() {
// ## Luv.Media
Luv.Media = function() {
  // This function creates the `media` object when you create a luv game. It's usually
  // instantiated by the Luv function.

  //       var luv = Luv();
  //       luv.media // this is the media object
  return MediaProto.extend({
    pending: 0,
    Image  : function(path, loadCallback, errorCallback) {
      var media = this;
      var image  = Luv.Media.Image.extend({path: path});

      media.newAsset(image, loadCallback, errorCallback);

      var source   = new Image(); // html image
      image.source = source;

      source.addEventListener('load',  function(){ media.registerLoad(image); });
      source.addEventListener('error', function(){ media.registerError(image); });
      source.src = path;

      return image;
    }
  });
};

// ## MediaProto
// Contains the methods of the luv.media object
var MediaProto = Luv.Object.extend({
  getType      : function() { return 'Luv.Media'; },

  // `isLoaded` returns `true` if all the assets have been loaded, `false` if there are assets still being loaded
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
  newAsset  : function(asset, loadCallback, errorCallback) {
    this.pending++;
    asset.loadCallback  = loadCallback;
    asset.errorCallback = errorCallback;
    asset.status        = "pending";
  },

  // Pseudo-internal function. Assets that have been loaded successfully should call this function
  // (this will trigger onAssetLoaded, etc)
  registerLoad : function(asset) {
    this.pending--;

    asset.status = "loaded";
    if(asset.loadCallback) { asset.loadCallback(asset); }

    this.onAssetLoaded(asset);
    if(this.isLoaded()) { this.onLoaded(); }
  },

  // Pseudo-internal function. Assets that can't be loaded must invoke this method
  registerError: function(asset) {
    this.pending--;

    asset.status = "error";
    if(asset.errorCallback) { asset.errorCallback(asset); }

    this.onAssetError(asset);
  }
});

}());

// # media/asset.js
(function() {

// ## Luv.Media.Asset
// This is the superclass of all media assets. It's not supposed to be instantiated, it's just a method holding object
Luv.Media.Asset = Luv.Object.extend({
  getType:   function() { return 'Luv.Media.Asset'; },
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
});

}());

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


(function(){

var CanvasProto = Luv.Object.extend({
  getType       : function(){ return 'Luv.Graphics.Canvas'; },
  getWidth      : function(){ return this.width; },
  getHeight     : function(){ return this.height; },
  getDimensions : function(){ return { width: this.width, height: this.height }; }
});

var Canvas = function(el, width, height) {
  el.setAttribute('width', width);
  el.setAttribute('height', height);
  return CanvasProto.extend({
    width:  width,
    height: height,
    el:     el,
    ctx:    el.getContext('2d')
  });
};

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
  angle = angle % (2 * Math.PI);
  return angle >= 0 ? angle : angle + 2 * Math.PI;
};


var GraphicsProto = Luv.Object.extend({
  getType : function() { return 'Luv.Graphics'; },
  setCanvas : function(canvas) {
    canvas = canvas || this.defaultCanvas;
    this.canvas = canvas;
    this.el     = canvas.el;
    this.ctx    = canvas.ctx;
    this.setLineWidth(this.lineWidth);
    this.setLineCap(this.lineCap);
    this.reset();
  },
  getCanvas : function() { return this.canvas; },
  setColor  : function(r,g,b,a) { setColor(this, 'color', r,g,b,a); },
  getColor  : function() { return getColor(this.color); },

  setBackgroundColor : function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); },
  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  setLineWidth : function(width) {
    this.lineWidth = width;
    this.ctx.lineWidth = width;
  },

  getLineWidth : function() {
    return this.lineWidth;
  },

  setLineCap : function(cap) {
    if(cap != "butt" && cap != "round" && cap != "square") {
      throw new Error("Line cap must be either 'butt', 'round' or 'square'");
    }
    this.ctx.lineCap = cap;
    this.lineCap     = this.ctx.lineCap;
  },

  getLineCap : function() { return this.lineCap; },

  clear : function() {
    this.reset();
    this.ctx.fillStyle = this.backgroundColorStyle;
    this.ctx.fillRect(0, 0, this.width, this.height);
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

  drawImage : function(img, x, y, sx, sy, angle, ox, oy) {
    var ctx = this.ctx;
    if(!img.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + img);
    }

    sx    = typeof sx    === "undefined" ? 1 : sx;
    sy    = typeof sy    === "undefined" ? 1 : sy;
    angle = typeof angle === "undefined" ? 0 : normalizeAngle(angle);
    ox    = typeof ox    === "undefined" ? 0 : ox;
    oy    = typeof oy    === "undefined" ? 0 : oy;

    if(sx !== 1 || sy !== 1 || angle !== 0 || ox !== 0 || oy !== 0) {
      ctx.save();

      ctx.translate(x,y);

      ctx.translate(ox,oy);
      ctx.rotate(angle);
      ctx.scale(sx,sy);
      ctx.drawImage(img.source, -ox, -oy);

      ctx.restore();
    } else {
      ctx.drawImage(img.source, x, y);
    }
  },

  drawCenteredImage : function(img, x,y, sx, sy, angle) {
    var d = img.getDimensions();
    var ox = d.width / 2,
        oy = d.height / 2;
    this.drawImage(img, x-ox,y-oy, sx,sy, angle, ox, oy);
  },

  drawCanvas : function(canvas, x, y) {
    this.ctx.drawImage(canvas.el, x, y);
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
  },

  push : function() {
    this.ctx.save();
  },

  pop : function() {
    this.ctx.restore();
  }

});

Luv.Graphics = function(el, width, height) {
  var gr = GraphicsProto.extend({
    width:     width,
    height:    height,
    lineWidth: 1,
    lineCap:   "butt",
    color:     {},
    backgroundColor: {},
    defaultCanvas: Canvas(el, width, height),
    Canvas: function(width, height) {
      var el = document.createElement('canvas');
      return Canvas(el, width || this.width, height || this.height);
    }
  });

  gr.setColor(255,255,255);
  gr.setBackgroundColor(0,0,0);
  gr.setCanvas();

  return gr;
};

}());
