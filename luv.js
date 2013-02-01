/*! luv 0.0.1 (2013-02-02) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
luv = {};

luv.run = function(options) {
  options = options || {};
  if(options.load) { options.load(); }
};

luv.graphics = {};
