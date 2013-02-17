var initializeOptions = function(options) {
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

var LuvProto = {
  update: function(dt){},
  draw  : function(){},
  load  : function(){},
  run   : function(){
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
  }
};


Luv = function(options) {
  options = initializeOptions(options);

  var luv = Object.create(LuvProto);
  luv.el  = options.el;

  if(options.load)  { luv.load   = options.load; }
  if(options.update){ luv.update = options.update; }
  if(options.draw)  { luv.draw   = options.draw; }
  if(options.run)   { luv.run    = options.run; }

  luv.graphics  = Luv.Graphics(luv.el, options.width, options.height);
  luv.timer     = Luv.Timer();
  luv.keyboard  = Luv.Keyboard(luv.el);
  luv.mouse     = Luv.Mouse(luv.el);
  luv.media     = Luv.Media();

  return luv;
};


