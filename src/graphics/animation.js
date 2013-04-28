// # animation.js
(function() {

// ## Luv.Graphics.Animation
// Animations are lists of sprites which are swapped as time passes.
Luv.Graphics.Animation = Luv.Class('Luv.Graphics.Animation', {

  // `init` only takes two params.
  //
  // Althrough you can instantiate Animation directly, you will probably want to use
  // Luv.Graphics.SpriteSheet.Animation. Like this:
  //
  //       var image = luv.graphics.Image('player.png'),
  //           sheet = luv.graphics.SpriteSheet(image, 32,32);
  //           anim  = sheet.Animation([0,0, '0-5',1], 0.1);
  //
  // But you can instantiate Animation directly if you want. It needs two parameters.
  //
  // * `sprites` is an array of drawables (normally instances of Luv.Graphics.Sprite)
  //   which will be sequentially updated as the animation rolls. Usually the output
  //   of SpriteSheet.getSprites.
  // * `durations` can be:
  //   * A positive number, representing a duration in seconds. It will be used for
  //     all frames. For example, 0.1 will mean that all frames will take 0.1s.
  //   * An array of numbers, each one representing the duration of one frame. When
  //     providing an array, it must have at least one number per sprite.
  //   * A javascript object. The keys can be integers or strings of the form 'a-b',
  //     where a and b are integers representing an interval.
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

  // `update` changes the internal counters of the animation, and updates the current
  // sprite accordingly to the time that has passed.
  update: function(dt) {
    var loops;

    this.time += dt;
    loops = Math.floor(this.time / this.loopDuration);
    this.time -= this.loopDuration * loops;

    if(loops !== 0) { this.onLoopEnded(loops); }

    this.index = findSpriteIndexByTime(this.intervals, this.time);
  },

  // `gotoStprite` resets the animation to the sprite specified by `newSpriteIndex` (an integer)
  gotoSprite: function(newSpriteIndex) {
    this.index = newSpriteIndex;
    this.time = this.intervals[newSpriteIndex];
  },

  // `getCurrentSprite` returns the sprite currently being shown by the animation.
  getCurrentSprite: function() {
    return this.sprites[this.index];
  },

  // `onLoopEnded` is invoked every time an animation loop ends. It can be reset and used for controlling purposes.
  onLoopEnded: function(how_many) {}
});

// These methods are delegated to the current animation sprite
"getWidth getHeight getDimensions getCenter draw".split(" ").forEach(function(method) {
  Luv.Graphics.Animation.methods[method] = function() {
    var sprite = this.getCurrentSprite();
    return sprite[method].apply(sprite, arguments);
  };
});

// private function. It transforms the durations table into an intervals table, for faster searches
var calculateIntervals = function(durations) {
  var result = [0],
      time   = 0;
  for(var i=0; i<durations.length; i++) {
    time += durations[i];
    result.push(time);
  }
  return result;
};

// private function. Given a time, it returns the index of the sprite which should be
// used to represent it.
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

// Parses the durations param and transforms it into a simple numbers array.
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

// Given the string '1-5', return the array [1,2,3,4,5]
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
