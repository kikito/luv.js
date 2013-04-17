// # timer/tween.js
(function(){

// ## Luv.Timer.Tween
Luv.Timer.Tween = Luv.Class('Luv.Timer.Tween', {

  init: function(timeToFinish, subject, to, options) {
    deepParamsCheck(subject,to,[]);

    options = options || {};
    this.easing       = getEasingFunction(options.easing);
    this.step         = options.step       || this.step;
    this.onFinished   = options.onFinished || this.onFinished;

    this.runningTime  = 0;
    this.finished     = false;
    this.timeToFinish = timeToFinish;
    this.subject      = subject;
    this.from         = deepCopy(subject, to);
    this.to           = deepCopy(to);
  },

  update: function(dt) {
    if(this.runningTime >= this.timeToFinish) { return; }
    this.runningTime += dt;
    if(this.runningTime >= this.timeToFinish) {
      this.runningTime = this.timeToFinish;
      this.onFinished();
      this.finished = true;
    }
    this.step(deepEase(this, this.from, this.to));
    return this.finished;
  },

  step: function(values) {
    this.subject = deepMerge(this.subject, values);
  },

  onFinished: function() {
  },

  isFinished: function() {
    return !!this.finished;
  }

});


// ## Easing functions
  // ### linear
var linear= function(t, b, c, d){ return c * t / d + b; },

  // ### quad
  inQuad  = function(t, b, c, d){ return c * Math.pow(t / d, 2) + b; },
  outQuad = function(t, b, c, d){
    t = t / d;
    return -c * t * (t - 2) + b;
  },
  inOutQuad = function(t, b, c, d){
    t = t / d * 2;
    if(t < 1){ return c / 2 * Math.pow(t, 2) + b; }
    return -c / 2 * ((t - 1) * (t - 3) - 1) + b;
  },
  outInQuad = function(t, b, c, d){
    if(t < d / 2) { return outQuad(t * 2, b, c / 2, d); }
    return inQuad((t * 2) - d, b + c / 2, c / 2, d);
  },

  // ### cubic
  inCubic  = function(t, b, c, d){ return c * Math.pow(t / d, 3) + b; },
  outCubic = function(t, b, c, d){ return c * (Math.pow(t / d - 1, 3) + 1) + b; },
  inOutCubic = function(t, b, c, d){
    t = t / d * 2;
    if(t < 1){ return c / 2 * t * t * t + b; }
    t = t - 2;
    return c / 2 * (t * t * t + 2) + b;
  },
  outInCubic = function(t, b, c, d){
    if(t < d / 2){ return outCubic(t * 2, b, c / 2, d); }
    return inCubic((t * 2) - d, b + c / 2, c / 2, d);
  },

  // ### quart
  inQuart = function(t, b, c, d){ return c * Math.pow(t / d, 4) + b; },
  outQuart = function(t, b, c, d){ return -c * (Math.pow(t / d - 1, 4) - 1) + b; },
  inOutQuart = function(t, b, c, d){
    t = t / d * 2;
    if(t < 1){ return c / 2 * Math.pow(t, 4) + b; }
    return -c / 2 * (Math.pow(t - 2, 4) - 2) + b;
  },
  outInQuart = function(t, b, c, d){
    if(t < d / 2){ return outQuart(t * 2, b, c / 2, d); }
    return inQuart((t * 2) - d, b + c / 2, c / 2, d);
  },

  // ### quint
  inQuint = function(t, b, c, d){ return c * Math.pow(t / d, 5) + b; },
  outQuint = function(t, b, c, d){ return c * (Math.pow(t / d - 1, 5) + 1) + b; },
  inOutQuint = function(t, b, c, d){
    t = t / d * 2;
    if(t < 1){ return c / 2 * Math.pow(t, 5) + b; }
    return c / 2 * (Math.pow(t - 2, 5) + 2) + b;
  },
  outInQuint = function(t, b, c, d){
    if(t < d / 2){ return outQuint(t * 2, b, c / 2, d); }
    return inQuint((t * 2) - d, b + c / 2, c / 2, d);
  },

  // ### sine
  inSine = function(t, b, c, d){ return -c * Math.cos(t / d * (Math.PI / 2)) + c + b; },
  outSine = function(t, b, c, d){ return c * Math.sin(t / d * (Math.PI / 2)) + b; },
  inOutSine = function(t, b, c, d){ return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b; },
  outInSine = function(t, b, c, d){
    if(t < d / 2){ return outSine(t * 2, b, c / 2, d); }
    return inSine((t * 2) -d, b + c / 2, c / 2, d);
  },

  // ### expo
  inExpo = function(t, b, c, d){
    if(t === 0){ return b; }
    return c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
  },
  outExpo = function(t, b, c, d){
    if(t == d){ return b + c; }
    return c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
  },
  inOutExpo = function(t, b, c, d){
    if(t === 0){ return b; }
    if(t == d){ return b + c; }
    t = t / d * 2;
    if(t < 1){ return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 0.0005; }
    return c / 2 * 1.0005 * (-Math.pow(2, -10 * (t - 1)) + 2) + b;
  },
  outInExpo = function(t, b, c, d){
    if(t < d / 2){ return outExpo(t * 2, b, c / 2, d); }
    return inExpo((t * 2) - d, b + c / 2, c / 2, d);
  },

  // ### circ
  inCirc = function(t, b, c, d){ return(-c * (Math.sqrt(1 - Math.pow(t / d, 2)) - 1) + b); },
  outCirc = function(t, b, c, d){ return(c * Math.sqrt(1 - Math.pow(t / d - 1, 2)) + b); },
  inOutCirc = function(t, b, c, d){
    t = t / d * 2;
    if(t < 1){ return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b; }
    t = t - 2;
    return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
  },
  outInCirc = function(t, b, c, d){
    if(t < d / 2){ return outCirc(t * 2, b, c / 2, d); }
    return inCirc((t * 2) - d, b + c / 2, c / 2, d);
  },

  // ### elastic
  calculatePAS = function(p,a,c,d) {
    p = typeof p === "undefined" ? d * 0.3 : p;
    a = a || 0;
    if(a < Math.abs(c)){
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c/a);
    }
    return [p,a,s];
  },
  inElastic = function(t, b, c, d, a, p){
    if(t === 0){ return b; }
    t = t / d;
    if(t == 1 ){ return b + c; }
    var pas = calculatePAS(p,a,c,d),
        s = pas[2];
    p = pas[0];
    a = pas[1];
    t = t - 1;
    return -(a * Math.pow(2, 10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  },
  outElastic = function(t, b, c, d, a, p) {
    if(t === 0){ return b; }
    t = t / d;
    if(t == 1 ){ return b + c; }
    var pas = calculatePAS(p,a,c,d),
        s = pas[2];
    p = pas[0];
    a = pas[1];
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
  },
  inOutElastic = function(t, b, c, d, a, p){
    if(t === 0){ return b; }
    t = t / d;
    if(t == 1 ){ return b + c; }
    var pas = calculatePAS(p,a,c,d),
        s = pas[2];
    p = pas[0];
    a = pas[1];

    t = t - 1;
    if(t < 0){ return -0.5 * (a * Math.pow(2, 10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b; }
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p ) * 0.5 + c + b;
  },
  outInElastic = function(t, b, c, d, a, p) {
    if(t < d / 2){ return outElastic(t * 2, b, c / 2, d, a, p); }
    return inElastic((t * 2) - d, b + c / 2, c / 2, d, a, p);
  },

  // ### back
  inBack = function(t, b, c, d, s) {
    s = s || 1.70158;
    t = t / d;
    return c * t * t * ((s + 1) * t - s) + b;
  },
  outBack = function(t, b, c, d, s) {
    s = s || 1.70158;
    t = t / d - 1;
    return c * (t * t * ((s + 1) * t + s) + 1) + b;
  },
  inOutBack = function(t, b, c, d, s){
    s = (s || 1.70158) * 1.525;
    t = t / d * 2;
    if(t < 1){ return c / 2 * (t * t * ((s + 1) * t - s)) + b; }
    t = t - 2;
    return c / 2 * (t * t * ((s + 1) * t + s) + 2) + b;
  },
  outInBack = function(t, b, c, d, s){
    if(t < d / 2){ return outBack(t * 2, b, c / 2, d, s); }
    return inBack((t * 2) - d, b + c / 2, c / 2, d, s);
  },

  // ### bounce
  outBounce = function(t, b, c, d){
    t = t / d;
    if(t < 1 / 2.75){ return c * (7.5625 * t * t) + b; }
    if(t < 2 / 2.75){
      t = t - (1.5 / 2.75);
      return c * (7.5625 * t * t + 0.75) + b;
    } else if(t < 2.5 / 2.75){
      t = t - (2.25 / 2.75);
      return c * (7.5625 * t * t + 0.9375) + b;
    }
    t = t - (2.625 / 2.75);
    return c * (7.5625 * t * t + 0.984375) + b;
  },
  inBounce = function(t, b, c, d){ return c - outBounce(d - t, 0, c, d) + b; },
  inOutBounce = function(t, b, c, d){
    if(t < d / 2){ return inBounce(t * 2, 0, c, d) * 0.5 + b; }
    return outBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
  },
  outInBounce = function(t, b, c, d){
    if(t < d / 2){ return outBounce(t * 2, b, c / 2, d); }
    return inBounce((t * 2) - d, b + c / 2, c / 2, d);
  };

//## Luv.Timer.Tween.easing
Luv.Timer.Tween.easing = {
  linear    : linear,
  inQuad    : inQuad,    outQuad    : outQuad,    inOutQuad    : inOutQuad,    outInQuad    : outInQuad,
  inCubic   : inCubic,   outCubic   : outCubic,   inOutCubic   : inOutCubic,   outInCubic   : outInCubic,
  inQuart   : inQuart,   outQuart   : outQuart,   inOutQuart   : inOutQuart,   outInQuart   : outInQuart,
  inQuint   : inQuint,   outQuint   : outQuint,   inOutQuint   : inOutQuint,   outInQuint   : outInQuint,
  inSine    : inSine,    outSine    : outSine,    inOutSine    : inOutSine,    outInSine    : outInSine,
  inExpo    : inExpo,    outExpo    : outExpo,    inOutExpo    : inOutExpo,    outInExpo    : outInExpo,
  inCirc    : inCirc,    outCirc    : outCirc,    inOutCirc    : inOutCirc,    outInCirc    : outInCirc,
  inElastic : inElastic, outElastic : outElastic, inOutElastic : inOutElastic, outInElastic : outInElastic,
  inBack    : inBack,    outBack    : outBack,    inOutBack    : inOutBack,    outInBack    : outInBack,
  inBounce  : inBounce,  outBounce  : outBounce,  inOutBounce  : inOutBounce,  outInBounce  : outInBounce
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


var deepEase = function(tween, from, to) {
  var result;
  if(typeof to === "object") {
    result = Array.isArray(to) ? [] : {};
    for(var key in to) {
      if(to.hasOwnProperty(key)) {
        result[key] = deepEase(tween, from[key], to[key]);
      }
    }
  } else {
    result = tween.easing(
      tween.runningTime,  // t
      from,               // b
      to - from,          // c
      tween.timeToFinish  // d
    );
  }
  return result;
};

var getEasingFunction= function(easing) {
  easing = easing || "linear";
  return typeof easing == 'string' ? Luv.Timer.Tween.easing[easing] : easing;
};

var deepMerge = function(result, keysObj, valuesObj) {
  valuesObj = valuesObj || keysObj;
  if(typeof keysObj === "object") {
    result = result || (Array.isArray(keysObj) ? [] : {});
    for(var key in keysObj){
      if(keysObj.hasOwnProperty(key)) {
        result[key] = deepMerge(result[key], keysObj[key], valuesObj[key]);
      }
    }
  } else {
    result = keysObj;
  }
  return result;
};

var deepCopy = function(keysObj, valuesObj) {
  return deepMerge(null, keysObj, valuesObj);
};

}());

