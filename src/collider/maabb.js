// # collider/maabb.js
(function(){
// ## Luv.Collider.MAABB

Luv.Collider.MAABB = Luv.Class('Luv.Collider.MAABB', {

  init: function(l,t,w,h) {
    this.previous   = Luv.Collider.AABB(l,t,w,h);
    this.current    = this.previous.clone();
    this.boundaries = this.previous.clone();
    this.dx = 0;
    this.dy = 0;
  },

  update: function(l,t,w,h) {
    var c = this.current,
        p = this.previous;

    p.setDimensions(c.l, c.t, c.w, c.h);
    this.adjust(l,t,w,h);
  },

  adjust: function(l,t,w,h) {
    var c = this.current,
        p = this.previous,
        b = this.boundaries,
        left, right, top, bottom;

    p.resize(w,h);
    c.setDimensions(l,t,w,h);

    this.dx = c.x - p.x;
    this.dy = c.y - p.y;

    left   = min(c.l, p.l);
    top    = min(c.t, p.t);
    right  = max(c.r, p.r);
    bottom = max(c.b, p.b);

    b.setDimensions(left, top, right-left, bottom-top);
  },

  getRelativeDisplacement: function(other) {
    return {x: this.dx - other.dx, y: this.dy - other.dy };
  }

});

var min = Math.min,
    max = Math.max;

}());
