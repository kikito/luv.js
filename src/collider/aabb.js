// # collider/aabb.js

// ## Luv.Collider.AABB

Luv.Collider.AABB = Luv.Class('Luv.Collider.AABB', {

  init: function(l,t,w,h) {
    this.t   = t;
    this.l   = l;
    this.w   = w;
    this.h   = h;
    this.r   = l + w;
    this.b   = t + h;
    this.w2  = w / 2;
    this.h2  = h / 2;
    this.x   = l + this.w2;
    this.y   = t + this.h2;
  },

  containsPoint: function(x,y) {
    return x > this.l && x < this.r && y > this.t && y < this.b;
  },

  isIntersecting: function(other) {
    return this.l < other.r && this.r > other.l &&
           this.t < other.b && this.b > other.t;
  },

  getMinkowskyDiff: function(other) {
    return Luv.Collider.AABB(
      other.l - this.r,
      other.t - this.b,
      other.w + this.w,
      other.h + this.h
    );
  },

  getLiangBarsky: function(x1,y1,x2,y2,min,max) {
    var dx = x2-x1,
        dy = y2-y1,
        t0 = min || 0,
        t1 = max || 1,
        p, q, r;

    for(var side = 0; side < 4; side++) {
      switch(side) {
        case 0:
          p = -dx;
          q = x1 - this.l;
          break;
        case 1:
          p = dx;
          q = this.r - x1;
          break;
        case 2:
          p = -dy;
          q = y1 - this.t;
          break;
        default:
          p = dy;
          q = this.b - y1;
      }

      if(p === 0){
        if(q < 0) { return; }
      } else {
        r = q / p;
        if(p < 0){
          if(r > t1){ return; }
          else if(r > t0){ t0 = r; }
        } else { // p > 0
          if(r < t0){ return; }
          else if(r < t1){ t1 = r; }
        }
      }
    }

    return { t0: t0, t1: t1, dx: dx, dy: dy };
  }

});
