Luv = function(options) {
  options = options || {};
  var el     = options.el,
      el_id  = options.el_id,
      width  = options.width,
      height = options.height;

  if(!el && el_id) { el = document.getElementById(el_id); }

  this.graphics = new Luv.Graphics(el, width, height);
};

var luv = Luv.prototype;

luv.update = function(dt) {};
luv.draw   = function() {};
luv.load   = function() {};
luv.run    = function() {
  var luv = this;

  luv.load();

  var loop = function(dt) {
    luv.update(dt);
    luv.graphics.clear();
    luv.draw();
    window.requestAnimationFrame(loop);
  };

  loop(0);
};


