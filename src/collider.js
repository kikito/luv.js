// # collider.js
(function() {
// ## Luv.Collider

Luv.Collider = Luv.Class('Luv.Collider', {

  init: function(cellSize) {
    this.cellSize = cellSize || Luv.Collider.DEFAULT_CELL_SIZE;
  },

  AABB: function(l,t,w,h) {
    return Luv.Collider.AABB(l,t,w,h);
  },

  MAABB: function(l,t,w,h) {
    return Luv.Collider.MAABB(l,t,w,h);
  }

});

Luv.Collider.DEFAULT_CELL_SIZE = 64;

})();
