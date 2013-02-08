
// keycodes/ algorithms inspired by http://www.selfcontained.us/2009/09/16/getting-keycode-values-in-javascript/
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

var shiftedKeys = {
  192:"~", 48:")", 49:"!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^", 55:"&", 56:"*", 57:"(", 109:"_", 61:"+",
  219:"{", 221:"}", 220:"|", 59:":", 222:"\"", 188:"<", 189:">", 191:"?",
  96:"insert", 97:"end", 98:"down", 99:"pagedown", 100:"left", 102:"right", 103:"home", 104:"up", 105:"pageup"
};

var rightKeys = {
  16: "rshift", 17: "rctrl", 18: "ralt"
};

var getKeyFromEvent = function(event) {
  var code = event.which;
  var key;
  if(event.keyLocation && event.keyLocation > 1) { key = rightKeys[code]; }
  else if(event.shiftKey) { key = shiftedKeys[code]; }
  else { key = keys[code]; }

  return key || String.fromCharCode(code);
};

Luv.Keyboard = function(el) {
  el.tabIndex = 1;
  this.keysDown = {};

  var keyboard = this;

  el.onkeydown = function(evt) {
    var key  = getKeyFromEvent(evt);
    keyboard.keysDown[key] = true;
    keyboard.onkeydown(key, evt.which);
  };

  el.onkeyup = function(evt) {
    var key  = getKeyFromEvent(evt);
    keyboard.keysDown[key] = false;
    keyboard.onkeyup(key, evt.which);
  };
};

var keyboard = Luv.Keyboard.prototype;

keyboard.onkeyup   = function(key, code) {};
keyboard.onkeydown = function(key, code) {};

keyboard.isDown    = function(key) {
  return !!this.keysDown[key];
};
