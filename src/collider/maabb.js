// # collider/maabb.js
(function(){
// ## Luv.Collider.MAABB

Luv.Collider.MAABB = Luv.Class('Luv.Collider.MAABB', {

  init: function(l,t,w,h) {
    this.previous   = Luv.Collider.AABB(l,t,w,h);
    this.current    = this.previous.clone();
    this.boundaries = this.previous.clone();
  },

  update: function(l,t,w,h) {
    var c = this.current,
        p = this.previous,
        b = this.boundaries,
        left, right, top, bottom;

    p.resize(w,h);
    c.setDimensions(l,t,w,h);

    left   = min(c.l, p.l);
    top    = min(c.t, p.t);
    right  = max(c.r, p.r);
    bottom = max(c.b, p.b);

    b.setDimensions(left, top, right-left, bottom-top);
  }

});

var min = Math.min,
    max = Math.max;

}());
