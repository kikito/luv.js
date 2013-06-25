// # collider/aabb.js
(function() {
// ## Luv.Collider.AABB

Luv.Collider.AABB = Luv.Class('Luv.Collider.AABB', {

  init: function(l,t,w,h) {
    this.setDimensions(l,t,w,h);
  },

  setDimensions: function(l,t,w,h) {
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

  clone: function() {
    return Luv.Collider.AABB(this.l, this.t, this.w, this.h);
  },

  resize: function(w,h) {
    if(w !== this.w || h !== this.h) {
      this.setDimensions(this.x - w/2, this.y - h/2, w, h);
    }
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

  getLiangBarsky: function(x,y,dx,dy,minT,maxT) {
    var t0 = minT || 0,
        t1 = maxT || 1,
        p, q, r;

    for(var side = 0; side < 4; side++) {
      switch(side) {
        case 0:
          p = -dx;
          q = x - this.l;
          break;
        case 1:
          p = dx;
          q = this.r - x;
          break;
        case 2:
          p = -dy;
          q = y - this.t;
          break;
        default:
          p = dy;
          q = this.b - y;
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

    return { t0: t0, t1: t1 };
  },

  getSegmentIntersection: function(x0,y0,x1,y1) {
    return getLiangBarskyIntersections(this, x0,y0,x1-x0,y1-y0, 0, 1);
  },

  getLineIntersection: function(x,y,dx,dy) {
    return getLiangBarskyIntersections(this, x,y,dx,dy, Number.MIN_VALUE, Number.MAX_VALUE);
  },

  getRayIntersection: function(x,y,dx,dy) {
    return getLiangBarskyIntersections(this, x,y,dx,dy, 0, Number.MAX_VALUE);
  }

});


var getLiangBarskyIntersections = function(aabb, x,y, dx,dy, minT, maxT) {
  var lb = aabb.getLiangBarsky(x,y,dx,dy,minT,maxT);
  if(lb){
    var t0 = lb.t0,
        t1 = lb.t1;
    lb.x0 = x + t0 * dx;
    lb.y0 = y + t0 * dy;
    lb.x1 = x + t1 * dx;
    lb.y1 = y + t1 * dy;
    lb.dx = dx;
    lb.dy = dy;
    return lb;
  }
};

}());
