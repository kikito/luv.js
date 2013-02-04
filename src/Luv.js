Luv = function(options) {
  options = options || {};
  var el     = options.el,
      el_id  = options.el_id,
      width  = options.width,
      height = options.height;

  if(!el && el_id) { el = document.getElementById(el_id); }

  this.graphics = new Luv.Graphics(el, width, height);
};

Luv.prototype.update = function(dt) {};
Luv.prototype.draw   = function() {};
Luv.prototype.load   = function() {};
Luv.prototype.run    = function() {
  var luv = this;

  luv.load();

  window.requestAnimationFrame(function(dt){
    luv.update(dt);
    luv.draw();
  });

};


