// # tween.js
(function(){

// ## Luv.Timer.Tween
Luv.Timer.Tween = Luv.Class('Luv.Timer.Tween', {

  init: function(timeToFinish, subject, to, easingFunction, updateFunction) {
    deepParamsCheck(subject,to,[]);

    this.runningTime    = 0;
    this.timeToFinish   = timeToFinish;
    this.subject        = subject;
    this.from           = deepCopy(subject, to);
    this.to             = deepCopy(to);
    this.easing         = getEasingFunction(easingFunction);
    this.updateFunction = updateFunction || this.updateFunction;
  },

  update: function(dt) {
    this.runningTime += dt;
    if(this.runningTime >= this.timeToFinish) {
      this.runningTime = this.timeToFinish;
    }
    this.subject = deepEase(this, this.subject, this.from, this.to);
  },

  updateFunction: function(newValues) {

  }

});

Luv.Timer.Tween.easing = {
  linear: function(t, b, c, d){
    return c * t / d + b;
  }
};

var deepParamsCheck = function(subject, to, path) {
  var toType, newPath;
  for(var k in to) {
    if(to.hasOwnProperty(k)) {
      toType  = typeof to[k];
      newPath = path.slice(0);
      newPath.push(String(k));
      if(toType === 'number') {
        if(typeof subject[k] !== 'number') {
          throw new Error("Parameter '" + newPath.join('/') + "' is missing from 'from' or isn't a number");
        }
      } else if(toType === 'object') {
        deepParamsCheck(subject[k], to[k], newPath);
      } else {
        throw new Error("Parameter '" + newPath.join('/') + "' must be a number or string, was " + to[k]);
      }
    }
  }
};


var deepEase = function(tween, subject, from, to) {
  if(typeof to === "object") {
    for(var key in to) {
      if(to.hasOwnProperty(key)) {
        subject[key] = deepEase(tween, subject[key], from[key], to[key]);
      }
    }
  } else {
    subject = tween.easing(
      tween.runningTime,  // t
      from,               // b
      to - from,          // c
      tween.timeToFinish  // d
    );
  }
  return subject;
};

var getEasingFunction= function(easing) {
  easing = easing || "linear";
  return Luv.Timer.Tween.easing[easing];
};

var deepCopy = function(keysObj, valuesObj) {
  var result;
  valuesObj = valuesObj || keysObj;
  if(typeof keysObj === "object") {
    result = Array.isArray(keysObj) ? [] : {};
    for(var key in keysObj){
      if(keysObj.hasOwnProperty(key)) {
        result[key] = deepCopy(keysObj[key], valuesObj[key]);
      }
    }
  } else {
    result = keysObj;
  }
  return result;
};

}());

