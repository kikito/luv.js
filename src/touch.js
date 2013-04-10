// # touch.js
(function() {

// ## Luv.Touch
//
// This class encapsulates the functionality which has to do with touch interfaces in Luv
//
Luv.Touch = Luv.Class('Luv.Touch', {
  // You will almost never need to instantiate this Luv module manually. Instead,
  // you will create a `Luv` object, which will have a `touch` attribute. For
  // example:
  //
  //        var luv = Luv();
  //        luv.touch // You will use this
  init: function(el) {
    var touch = this;

    touch.fingers = {};
    touch.el      = el;

    el.addEventListener('touchstart', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      var t, fingerInfo,
          rect = el.getBoundingClientRect();
      for(var i=0; i < evt.touches.length; i++) {
        t = evt.touches[i];
        fingerInfo = touch.fingers[t.identifier] = touch.fingers[t.identifier] || {};
        fingerInfo.x = t.pageX - rect.left;
        fingerInfo.y = t.pageY - rect.top;
        fingerInfo.radius = t.radius;
        touch.onPressed(t.identifier, fingerInfo.x, fingerInfo.y, fingerInfo.radius);
      }
    });

    el.addEventListener('touchend', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      var t, x, y,
          rect = el.getBoundingClientRect();
      for(var i=0; i < evt.touches.length; i++) {
        t = evt.touches[i];
        x = t.pageX - rect.left;
        y = t.pageY - rect.top;
        delete(touch.fingers[t.identifier]);
        touch.onReleased(t.identifier, x, y);
      }
    });

    el.addEventListener('touchmove', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      var t, fingerInfo,
          rect = el.getBoundingClientRect();
      for(var i=0; i < evt.touches.length; i++) {
        t = evt.touches[i];
        fingerInfo = touch.fingers[t.identifier] = touch.fingers[t.identifier] || {};
        fingerInfo.x = t.pageX - rect.left;
        fingerInfo.y = t.pageY - rect.top;
      }
    });
  },

  // `onPressed` is a user-overrideable function that is triggered when the screen
  // is touched.
  //
  // The first parameter is a number indicating the finger touching the screen
  // (usually, 1 is for the index finger, and so on). `x` and `y`
  // are the coordinates on the DOM element where the touching happens. `radius`
  // gives an approximate idea of the area involved on the touch.
  //
  // Example of use of onPressed:

  //       var luv = Luv();
  //       luv.touch.onPressed = function(finger, x, y, radius) {
  //         msg = "Finger " + finger + " in (" + x + "," + y + ") with radius " + radius;
  //       };

  // It does nothing by default.
  onPressed  : function(finger, x, y, radius) {},

  // `onReleased` works the same way as onPressed, except that it gets triggered
  // when a finger stops being pressed. As a result it has no radius. `x` and `y`
  // represent the positions at which the finger stopped touching the screen.
  onReleased : function(finger, x, y) {},

  // `isPressed` returns true if the finger in question is pressing the screen
  isPressed : function(finger) {
    return !!this.fingers[finger];
  },

  // `getFinger` returns the position and radius of a finger, or false if
  // finger is not pressed
  getFinger: function(finger) {
    var info = this.fingers[finger];
    return info && {x: info.x, y: info.y, radius: info.radius};
  }
});

}());



