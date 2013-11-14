// # collider/aabb.js
(function() {
// ## Luv.Collider.AABB

Luv.Collider.AABB = Luv.Class('Luv.Collider.AABB', {

  init: function(l,t,w,h) {
    this.setDimensions(l,t,w,h);
  },

  setDimensions: function(l,t,w,h) {
    assertIsNumber(l, 'l');
    assertIsNumber(t, 't');
    assertIsPositiveNumber(w, 'w');
    assertIsPositiveNumber(h, 'h');

    this.t   = t;
    this.l   = l;
    this.w   = w;
    this.h   = h;
    this.r   = l + w;
    this.b   = t + h;
  },

  getCenter: function() {
    return { x: this.l + this.w / 2, y: this.t + this.h / 2 };
  },

  clone: function() {
    return Luv.Collider.AABB(this.l, this.t, this.w, this.h);
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

  getSegmentIntersection: function(x0,y0,x1,y1) {
    return getLiangBarskyIntersections(this, x0,y0,x1-x0,y1-y0, 0, 1);
  },

  getLineIntersection: function(x,y,dx,dy) {
    return getLiangBarskyIntersections(this, x,y,dx,dy, Number.MIN_VALUE, Number.MAX_VALUE);
  },

  getRayIntersection: function(x,y,dx,dy) {
    return getLiangBarskyIntersections(this, x,y,dx,dy, 0, Number.MAX_VALUE);
  },

  toGrid: function(cellSize) {
    var l = Math.floor(this.l/cellSize),
        t = Math.floor(this.t/cellSize),
        r = Math.ceil(this.r/cellSize),
        b = Math.ceil(this.b/cellSize);

    return Luv.Collider.AABB(l,t,r-l,b-t);
  },

  getCoveringAABB: function(other) {
    var l = Math.min(this.l, other.l),
        t = Math.min(this.t, other.t),
        r = Math.max(this.r, other.r),
        b = Math.max(this.b, other.b);

    return Luv.Collider.AABB(l,t,r-l,b-t);
  },

  getNearestPointInPerimeter: function(x,y) {
    return {
      x: Math.abs(this.l - x) < Math.abs(this.r - x) ? this.l : this.r,
      y: Math.abs(this.t - y) < Math.abs(this.b - y) ? this.t : this.b
    };
  },

  collide: function(other, vx, vy) {
    var collision, m, p, ti, lbi, t0, t1;
    var pastThis = this;

    if(vx !== 0 || vy !== 0) {
      pastThis = Luv.Collider.AABB(this.l - vx, this.t - vy, this.w, this.h);
    }

    m = pastThis.getMinkowskyDiff(other);

    if(m.containsPoint(0,0)) { // pastThis was intersecting with other
      p         = m.getNearestPointInPerimeter(0,0);
      collision = {dx: p.x-vx, dy: p.y-vy, ti: 0, tunneling: false };
    } else {
      lbi = getLiangBarskyIndices(m, 0,0, vx,vy, 0,1);
      if(lbi) {
        t0 = lbi.t0;
        t1 = lbi.t1;
        if     (0 < t0 && t0 < 1) { ti = t0; }
        else if(0 < t1 && t1 < 1) { ti = t1; }

        if(ti) { // this tunnels into other
          collision = {dx: vx*ti-vx, dy: vy*ti-vy, ti: ti, tunneling: true};
        } else {
          m = this.getMinkowskyDiff(other);
          if(m.containsPoint(0,0)) {
            p         = m.getNearestPointInPerimeter(0,0);
            collision = {dx: p.x, dy: p.y, ti: 1, tunneling: false };
          }
        }
      }
    }
    return collision;
  }

});

var getLiangBarskyIndices = function(aabb, x,y,dx,dy,minT,maxT) {
  var t0 = minT || 0,
      t1 = maxT || 1,
      p, q, r;

  for(var side = 0; side < 4; side++) {
    switch(side) {
      case 0:
        p = -dx;
        q = x - aabb.l;
        break;
      case 1:
        p = dx;
        q = aabb.r - x;
        break;
      case 2:
        p = -dy;
        q = y - aabb.t;
        break;
      default:
        p = dy;
        q = aabb.b - y;
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
};

var getLiangBarskyIntersections = function(aabb, x,y, dx,dy, minT, maxT) {
  var lb = getLiangBarskyIndices(aabb, x,y,dx,dy,minT,maxT);
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

var assertIsNumber = function(value, name) {
  if(!isFinite(value) || isNaN(value)) {
    throw new Error( name + " must be a number, was " + value);
  }
};

var assertIsPositiveNumber = function(value, name) {
  if(!isFinite(value) || isNaN(value) || value < 0) {
    throw new Error( name + " must be a positive number, was " + value);
  }
};

}());
