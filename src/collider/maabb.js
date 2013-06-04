// # collider/maabb.js

// ## Luv.Collider.MAABB

Luv.Collider.MAABB = Luv.Class('Luv.Collider.MAABB', {

  init: function(l,t,w,h, dx,dy) {
    this.dx = dx;
    this.dy = dy;
    this.aabb0 = Luv.Collider.AABB(l,t,w,h);
    this.aabb1 = Luv.Collider.AABB(l+dx, t+dy, w,h);
  }

});
