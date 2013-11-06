// # collider.js
(function() {
// ## Luv.Collider

Luv.Collider = Luv.Class('Luv.Collider', {

  World: function(cellSize) {
    return Luv.Collider.World(cellSize);
  },

  AABB: function(l,t,w,h) {
    return Luv.Collider.AABB(l,t,w,h);
  }

});

Luv.Collider.DEFAULT_CELL_SIZE = 64;

})();
