// # collider.js
(function() {
// ## Luv.Collider

Luv.Collider = Luv.Class('Luv.Collider', {

  init: function(cellSize) {
    this.cellSize = cellSize || Luv.Collider.DEFAULT_CELL_SIZE;
  }

});

Luv.Collider.DEFAULT_CELL_SIZE = 64;

})();
