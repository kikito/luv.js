trigger = function(el, type, options) {
  options = options || {};

  var evt = document.createEvent("HTMLEvents");
  evt.initEvent(type, false, true);

  for(var k in options) { evt[k] = options[k]; }

  el.dispatchEvent(evt);
};
