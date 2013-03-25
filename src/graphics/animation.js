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
  var result=[], r, i, range, value;

  if(Array.isArray(delays)) {
    result = delays.slice(0);

  } else if(typeof delays == "object") {
    result.length = length;
    for(r in delays) {
      if(delays.hasOwnProperty(r)) {
        range = parseRange(r);
        value = Number(delays[r]);
        for(i=0; i<range.length; i++) {
          result[range[i]] = value;
        }
      }
    }
  } else {
    delays = Number(delays);
    for(i=0; i<length; i++) {
      result.push(delays);
    }
  }

  if(result.length != length) {
    throw new Error('The delays table length should be ' + length +
                    ', but it is ' + result.length);
  }

  for(i=0; i<result.length; i++) {
    if(typeof result[i] === "undefined") {
      throw new Error('Missing delay for sprite ' + i);
    }
    if(isNaN(result[i])) {
      throw new Error('Could not parse the delay for sprite ' + i);
    }
  }
  return result;
};

var parseRange = function(r) {
  var match, result, start, end, i;
  if(typeof r != "string") {
    throw new Error("Unknown range type (must be integer or string in the form 'start-end'): " + r);
  }
  match = r.match(/^(\d+)-(\d+)$/);
  if(match) {
    result = [];
    start  = Number(match[1]);
    end    = Number(match[2]);
    if(start < end) {
      for(i=start; i<=end; i++) { result.push(i); }
    } else {
      for(i=start; i>=end; i--) { result.push(i); }
    }
  } else {
    result = [Number(r)];
  }

  return result;
};


}());
