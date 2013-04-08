// # animation.js
(function() {

// ## Luv.Graphics.Animation
Luv.Graphics.Animation = Luv.Class('Luv.Graphics.Animation', {
  init: function(sprites, durations) {
    if(!Array.isArray(sprites)) {
      throw new Error('Array of sprites needed. Got ' + sprites);
    }
    if(sprites.length === 0) {
      throw new Error('No sprites where provided. Must provide at least one');
    }
    this.sprites      = sprites.slice(0);
    this.time         = 0;
    this.index        = 0;
    this.durations    = parseDurations(sprites.length, durations);
    this.intervals    = calculateIntervals(this.durations);
    this.loopDuration = this.intervals[this.intervals.length - 1];
  },

  update: function(dt) {
    var loops;

    this.time += dt;
    loops = Math.floor(this.time / this.loopDuration);
    this.time -= this.loopDuration * loops;

    if(loops !== 0) { this.onLoopEnded(loops); }

    this.index = findSpriteIndexByTime(this.intervals, this.time);
  },

  gotoSprite: function(newSpriteIndex) {
    this.index = newSpriteIndex;
    this.time = this.intervals[newSpriteIndex];
  },

  getCurrentSprite: function() {
    return this.sprites[this.index];
  },

  onLoopEnded: function(how_many) {}
});

"getWidth getHeight getDimensions getCenter draw".split(" ").forEach(function(method) {
  Luv.Graphics.Animation.methods[method] = function() {
    var sprite = this.getCurrentSprite();
    return sprite[method].apply(sprite, arguments);
  };
});


var calculateIntervals = function(durations) {
  var result = [0],
      time   = 0;
  for(var i=0; i<durations.length; i++) {
    time += durations[i];
    result.push(time);
  }
  return result;
};

var findSpriteIndexByTime = function(frames, time) {
  var high = frames.length - 2,
      low = 0,
      i = 0;

  while (low <= high) {
    i = Math.floor((low + high) / 2);
    if (time >= frames[i+1]) { low  = i + 1; continue; }
    if (time < frames[i])   { high = i - 1; continue; }
    break;
  }

  return i;
};

var parseDurations = function(length, durations) {
  var result=[], r, i, range, value;

  if(Array.isArray(durations)) {
    result = durations.slice(0);

  } else if(typeof durations == "object") {
    result.length = length;
    for(r in durations) {
      if(durations.hasOwnProperty(r)) {
        range = parseRange(r);
        value = Number(durations[r]);
        for(i=0; i<range.length; i++) {
          result[range[i]] = value;
        }
      }
    }
  } else {
    durations = Number(durations);
    for(i=0; i<length; i++) {
      result.push(durations);
    }
  }

  if(result.length != length) {
    throw new Error('The durations table length should be ' + length +
                    ', but it is ' + result.length);
  }

  for(i=0; i<result.length; i++) {
    if(typeof result[i] === "undefined") { throw new Error('Missing delay for sprite ' + i); }
    if(isNaN(result[i])) { throw new Error('Could not parse the delay for sprite ' + i); }
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
