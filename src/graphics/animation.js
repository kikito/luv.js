// # animation.js
(function() {

// ## Luv.Graphics.Animation
Luv.Graphics.Animation = Luv.Class('Luv.Graphics.Animation', {
  init: function(mode, sprites, delays) {
    if(mode != "loop" && mode != "once" && mode != "bounce") {
      throw new Error("Animation mode must be 'loop', 'once' or 'bounce'. Was " + mode);
    }
    if(!Array.isArray(sprites)) {
      throw new Error('Array of sprites needed. Got ' + sprites);
    }
    if(sprites.length === 0) {
      throw new Error('No sprites where provided. Must provide at least one');
    }
    this.mode      = mode;
    this.sprites   = sprites.slice(0);
    this.timer     = 0;
    this.position  = 0;
    this.direction = 1;
    this.status    = "playing";
    this.delays    = parseDelays(sprites.length, delays);
  }

});


var parseDelays = function(length, delays) {
  var result = [];
  if(typeof delays == "number") {
    for(var i=0; i<length; i++) {
      result.push(delays);
    }
  }
  return result;
};


}());
