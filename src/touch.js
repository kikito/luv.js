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

    var preventDefault = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    };

    el.addEventListener('gesturestart',  preventDefault);
    el.addEventListener('gesturechange', preventDefault);
    el.addEventListener('gestureend',    preventDefault);

    el.addEventListener('touchstart', function(evt) {
      preventDefault(evt);

      var t, finger,
          rect = el.getBoundingClientRect();
      for(var i=0; i < evt.targetTouches.length; i++) {
        t = evt.targetTouches[i];
        finger = getFingerByIdentifier(touch, t.identifier);
        if(!finger){
          finger = {
            identifier: t.identifier,
            position: getNextAvailablePosition(touch),
            x: t.pageX - rect.left,
            y: t.pageY - rect.top
          };
          touch.fingers[finger.position] = finger;
          touch.onPressed(finger.position, finger.x, finger.y);
        }
      }
    });

    var touchend = function(evt) {
      preventDefault(evt);

      var t, finger,
          rect = el.getBoundingClientRect();
      for(var i=0; i < evt.changedTouches.length; i++) {
        t = evt.changedTouches[i];
        finger = getFingerByIdentifier(touch, t.identifier);
        if(finger) {
          delete(touch.fingers[finger.position]);
          touch.onReleased(finger.position, finger.x, finger.y);
        }
      }
    };
    el.addEventListener('touchend',    touchend);
    el.addEventListener('touchleave',  touchend);
    el.addEventListener('touchcancel', touchend);

    el.addEventListener('touchmove', function(evt) {
      preventDefault(evt);

      var t, finger,
          rect = el.getBoundingClientRect();
      for(var i=0; i < evt.targetTouches.length; i++) {
        t = evt.targetTouches[i];
        finger = getFingerByIdentifier(touch, t.identifier);
        if(finger) {
          finger.x = t.pageX - rect.left;
          finger.y = t.pageY - rect.top;
          touch.onMoved(finger.position, finger.x, finger.y);
        }
      }
    });
  },

  // `onPressed` is a user-overrideable function that is triggered when the screen
  // is touched.
  //
  // The first parameter is a number indicating the finger touching the screen
  // (usually, 1 is for the index finger, and so on). `x` and `y`
  // are the coordinates on the DOM element where the touching happens.
  //
  // Example of use of onPressed:

  //       var luv = Luv();
  //       luv.touch.onPressed = function(finger, x, y) {
  //         msg = "Finger " + finger + " in (" + x + "," + y + ")";
  //       };

  // It does nothing by default.
  onPressed  : function(finger, x, y) {},

  // `onReleased` works the same way as onPressed, except that it gets triggered
  // when a finger stops being pressed. `x` and `y`
  // represent the positions at which the finger stopped touching the screen.
  onReleased : function(finger, x, y) {},

  onMoved: function(finger, x, y) {},

  // `isPressed` returns true if the finger in question is pressing the screen
  isPressed : function(finger) {
    return !!this.fingers[finger];
  },

  // `getFinger` returns the position of a finger, or false if the finger
  // in question is not pressed
  getFinger: function(position) {
    var finger = this.fingers[position];
    return finger && {position: finger.position,
                      identifier: finger.identifier,
                      x: finger.x, y: finger.y};
  },

  // `getFingers` returns an array with all the fingers information, with the following
  // syntax: `[ {position: 1, x: 2, y:2}, {position: 5, x: 120, y:40} ]
  getFingers: function() {
    var result = [],
        positions = Object.keys(this.fingers).sort(),
        finger, position;
    for(var i=0; i < positions.length; i++) {
      position = positions[i];
      finger   = this.fingers[position];
      result.push({position: position, x: finger.x, y: finger.y});
    }
    return result;
  }
});

var getMaxPosition = function(touch) {
  var positions = Object.keys(touch.fingers);
  if(positions.length === 0) { return 0; }
  return Math.max.apply(Math, positions);
};

var getNextAvailablePosition = function(touch) {
  var maxPosition = getMaxPosition(touch);
  for(var i=1; i < maxPosition; i++) {
    if(!touch.isPressed(i)){ return i; }
  }
  return maxPosition + 1;
};

var getFingerByIdentifier = function(touch, identifier) {
  var fingers = touch.fingers;
  for(var position in fingers) {
    if(fingers.hasOwnProperty(position) &&
       fingers[position].identifier == identifier) {
      return fingers[position];
    }
  }
};

}());



