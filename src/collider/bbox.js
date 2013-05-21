// # collider/bbox.js

// ## Luv.Collider.BBox

Luv.Collider.BBox = Luv.Class('Luv.Collider.BBox', {

  init: function(l,t,w,h) {
    this.t = t;
    this.l = l;
    this.w = w;
    this.h = h;
    this.w2 = w / 2;
    this.h2 = h / 2;
    this.x = l + this.w2;
    this.y = t + this.h2;
  }

});
