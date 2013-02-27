// #shims.js

// This file contains browser fixes that make several old browsers compatible
// with some basic html5 functionality via workarounds and clever hacks.

// ## `requestAnimationFrame` polyfill
(function() {
// polyfill by [Erik Möller](http://creativejs.com/resources/requestanimationframe/)
// adding fixes to [Paul Irish](http://paulirish.com/2011/requestanimationframe-for-smart-animating/)
// and [Tino Zijdel](http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating)

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];

  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] ||
                                   window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }
}());
