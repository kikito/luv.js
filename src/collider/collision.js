// # collision.js
(function(){
// ## Luv.Collider.Collision

Luv.Collider.Collision = Luv.Class('Luv.Collider.Collision', {
  init: function(kind, vx, vy, t0, t1) {
    this.kind = kind;
    this.vx   = vx;
    this.vy   = vy;
    this.t0   = t0;
    this.t1   = t1;
  },
  getSimpleDisplacement: function() {
    var vx, vy, t0, t1;
    if        (this.kind == 'touch') {
      return {x: 0, y:0};
    } else if (this.kind == 'intersection') {
      t0 = this.t0;
      t1 = this.t1;
      if(Math.abs(t0) < Math.abs(t1)) {
        return {x: t0, y: 0};
      } else {
        return {x: 0, y: t1};
      }
    }
  }
});

})();
