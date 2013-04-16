// # tween.js
(function(){

// ## Luv.Timer.Tween
Luv.Timer.Tween = Luv.Class('Luv.Timer.Tween', {

  init: function(timeToFinish, from, to, easingFunction, updateFunction) {
    this.runningTime    = 0;
    this.timeToFinish   = timeToFinish;
    this.subject        = from;
    this.from           = deepCopy({}, from);
    this.to             = deepCopy({}, to);
    this.easing         = getEasingFunction(easingFunction);
    this.updateFunction = updateFunction || this.updateFunction;
  },

  update: function(dt) {

  },

  updateFunction: function(newValues) {

  }

});

Luv.Timer.Tween.easing = {
  linear: function(t, b, c, d){ return c * t / d + b; }
};

var deepEase = function(tween, subject, from, to) {
  if(typeof to === "object") {
    for(var key in to) {
      if(to.hasOwnProperty(key)) {
        subject[key] = deepEase(tween, subject[key], from[key], to[key]);
      }
    }
  } else {
    var t = tween.runningTime,
        b = from,
        c = to - from,
        d = tween.timeeToFinish;
    subject = tween.easing(t,b,c,d);
  }
  return subject;
};

var getEasingFunction= function(easing) {
  easing = easing || "linear";
  return Luv.Timer.Tween.easing[easing];
};

var deepCopy = function(destination, keysObj, valuesObj) {
  valuesObj = valuesObj || keysObj;
  if(typeof keysObj === "object") {
    for(var key in keysObj){
      if(keysObj.hasOwnProperty(key)) {
        destination[key] = valuesObj[key];
      }
    }
  } else {
    destination = valuesObj;
  }
  return destination;
};

}());

