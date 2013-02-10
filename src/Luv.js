Luv = function(options) {
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

  this.graphics = new Luv.Graphics(el, width, height);
  this.timer    = new Luv.Timer();
  this.keyboard = new Luv.Keyboard(el);
  this.mouse    = new Luv.Mouse(el);
  this.media    = new Luv.Media();
};

var luv = Luv.prototype;

luv.update = function(dt) {};
luv.draw   = function() {};
luv.load   = function() {};

luv.run    = function() {
  var luv = this;

  luv.load();

  var loop = function(time) {
    luv.timer.step(time);
    var dt = luv.timer.getDeltaTime();

    luv.update(dt);
    luv.graphics.clear();
    luv.draw();

    luv.timer.nextFrame(loop);
  };

  luv.timer.nextFrame(loop);
};


