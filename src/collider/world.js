// # world.js
(function() {
// ## Luv.Collider.World

var DEFAULT_CELLSIZE = 64;

Luv.Collider.World = Luv.Class('Luv.Collider.World', {
  init: function(cellSize) {
    this.cellSize = cellSize || DEFAULT_CELLSIZE;
  }
});

})();
