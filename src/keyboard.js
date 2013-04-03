// # keyboard.js
(function() {

// ## Luv.Keyboard
//
// This class encapsulates the functionality which has to do with keyboard handling in Luv.
//
// *Disclaimer*: the code on this module was inspired by [selfcontained.us](http://www.selfcontained.us/2009/09/16/getting-keycode-values-in-javascript/)
Luv.Keyboard = Luv.Class('Luv.Keyboard', {
  // You will almost never need to instantiate this Luv module manually. Instead,
  // you will create a `Luv` object, which will have a `keyboard` attribute. For
  // example:
  //
  //        var luv = Luv();
  //        luv.keyboard // You will use this
  init: function(el) {
    var keyboard = this;

    keyboard.keysDown  = {};
    keyboard.el        = el;

    el.addEventListener('keydown', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      var key  = getKeyFromEvent(evt);
      keyboard.keysDown[key] = true;
      keyboard.onPressed(key, evt.which);
    });

    el.addEventListener('keyup', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

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
  //
  // Similarly to `onPressed`, the first parameter is a key name, while the second
  // one is the browser's internal keycode (a number).
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

// ## key names
//
// This object contains the names used for each key code. Notice that this is not a
// comprehensive list; common ASCII characters like 'a', which can be calculated via
// `String.fromCharCode`, are not included here.
var keys = {
  8: "backspace",
  9: "tab",
  13: "enter",
  16: "shift",
  17: "ctrl",
  18: "alt",
  19: "pause", 20: "capslock", 27: "escape",
  33: "pageup", 34: "pagedown", 35: "end", 36: "home", 45: "insert", 46: "delete",
  37: "left", 38: "up", 39: "right", 40: "down",
  91: "lmeta", 92: "rmeta", 93: "mode",
  96: "kp0", 97: "kp1", 98: "kp2", 99: "kp3", 100: "kp4", 101: "kp5",
  102: "kp6", 103: "kp7", 104: "kp8", 105: "kp9",
  106: "kp*", 107: "kp+", 109: "kp-", 110: "kp.", 111: "kp/",
  112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7",
  119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12",
  144: "numlock", 145: "scrolllock",
  186: ",", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`",
  219: "[", 220: "\\",221: "]", 222: "'"
};

// ## Shifted key names
//
// These names will get passed to onPress and onRelease instead of the default ones
// if one of the two "shift" keys is pressed.
var shiftedKeys = {
  192:"~", 48:")", 49:"!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^", 55:"&", 56:"*", 57:"(", 109:"_", 61:"+",
  219:"{", 221:"}", 220:"|", 59:":", 222:"\"", 188:"<", 189:">", 191:"?",
  96:"insert", 97:"end", 98:"down", 99:"pagedown", 100:"left", 102:"right", 103:"home", 104:"up", 105:"pageup"
};

// ## Right keys
//
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
  if(typeof key === "undefined") {
    key = String.fromCharCode(code);
    if(event.shiftKey) { key = key.toUpperCase(); }
  }

  return key;
};

}());



