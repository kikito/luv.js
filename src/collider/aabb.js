// # collider/aabb.js

// ## Luv.Collider.AABB

Luv.Collider.AABB = Luv.Class('Luv.Collider.AABB', {

  init: function(l,t,w,h) {
    this.t   = t;
    this.l   = l;
    this.w   = w;
    this.h   = h;
    this.w2  = w / 2;
    this.h2  = h / 2;
    this.x   = l + this.w2;
    this.y   = t + this.h2;
  }

});
