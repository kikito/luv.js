Luv.Keyboard = function(el) {
  el.tabIndex = 1;
  this.keysDown = {};

  var keyboard = this;

  el.onkeydown = function(evt) {
    var code = evt.which;
    var key  = String.fromCharCode(code);
    keyboard.keysDown[key] = true;
    keyboard.onkeydown(key, code);
  };

  el.onkeyup = function(evt) {
    var code = evt.which;
    var key  = String.fromCharCode(code);
    keyboard.keysDown[key] = false;
    keyboard.onkeyup(key, code);
  };
};

var keyboard = Luv.Keyboard.prototype;

keyboard.onkeyup   = function(key, code) {};
keyboard.onkeydown = function(key, code) {};

keyboard.isDown    = function(key) {
  return !!this.keysDown[key];
};
