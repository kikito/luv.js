// # world.js
(function() {
// ## Luv.Collider.World

var DEFAULT_CELLSIZE = 64;

var AABB = Luv.Collider.AABB;

Luv.Collider.World = Luv.Class('Luv.Collider.World', {
  init: function(cellSize, id) {
    this.cellSize = cellSize || DEFAULT_CELLSIZE;
    this.items      = {};
    this.boxes      = {};
    this.rows       = {};
    this.itemCount  = 0;
    this.maxId      = 0;
    this.id         = id || 'world';
    this.itemsKey   = '_' + this.id + '_id';
  },

  getBox: function(item) {
    var key = this.itemsKey;
    if(!item[key]) {
      throw new Error('item must have the property ' + key + ' in order to obtain its box');
    }
    var id = item[key];
    return this.boxes[id];
  },

  count: function() {
    return this.itemCount;
  },

  add: function(item, l,t,w,h) {

    var key = this.itemsKey;
    if(item[key]) {
      throw new Error('item must not have the property ' + key + ' when inserting it in the world');
    }

    this.itemCount++;
    var id  = item[key]      = ++this.maxId,
        box = this.boxes[id] = AABB(l,t,w,h),
        c   = box.toCellBox(this.cellSize);
    this.items[id] = item;

    for(var cy = c.t; cy <= c.b; cy++) {
      var row  = this.rows[cy] = this.rows[cy] || {};
      for(var cx = c.l; cx <= c.r; cx++) {
        var cell = row[cx] = row[cx] || {itemCount: 0, x: cx, y: cy, ids: {}};
        if(!cell.ids[id]) {
          cell.ids[id] = true;
          cell.itemCount++;
        }
      }
    }
    return this.check(item);
  },

  move: function(item, l,t,w,h) {
    var id  = item[this.itemsKey];
    if(!id) {
      throw new Error('item must have the property ' + this.itemsKey + ' in order to be moved');
    }
    var box = this.boxes[id];
    if(!box) {
      throw new Error('item ' + id + ' is not in the world. Add it to the world before trying to move it');
    }
    var prev_l = box.l,
        prev_t = box.t;
    if(box.w != w || box.h != h) {
      var prev_c = box.getCenter();
      prev_l = prev_c.x - w/2;
      prev_t = prev_c.y - h/2;
    }

    if(box.w != w || box.h != h || box.l != l || box.t != t) {
      this.remove(item);
      this.add(item);
    }

    return this.check(item, prev_l, prev_t);
  },

  check: function(item, prev_l, prev_t) {
    var id = item[this.itemsKey];

    if(!id) { throw new Error('item was not inserted into the world before being checked'); }

    var box = this.boxes[id];

    if(!box) { throw new Error('item with id ' + id + ' was not inserted in the world'); }

    var l = box.l,
        t = box.t;

    prev_l = prev_l || l;
    prev_t = prev_t || t;

    var vx          = l - prev_l,
        vy          = t - prev_t,
        collisions  = [],
        len         = 0,
        visited     = {};

    var swipedBox = box;
    if(prev_l != l || prev_t != t) {
      var prevBox = AABB(prev_l, prev_t, box.w, box.h);
      swipedBox = box.getCoveringAABB(prevBox);
    }

    var b = swipedBox.toCellBox(this.cellSize);

    visited[id] = true;

    for(var cy = b.t; cy <= b.b; cy++) {
      var row = this.rows[cy];
      if(!row) { continue; }
      for(var cx = b.l; cx <= b.r; cx++) {
        var cell = row[cx];
        if(!cell || cell.itemCount === 0) { continue; }
        for(var other_id in cell.ids) {
          if(visited[other_id] || !cell.ids.hasOwnProperty(other_id)) {
            continue;
          }
          visited[other_id] = true;
          var oBox = this.boxes[other_id],
              col  = box.collide(oBox, vx, vy);
          if(col) {
            col.item = this.items[other_id];
            collisions.push(col);
          }
        }
      }
    }

    return collisions.sort(sortByTi);
  },

  remove: function(item) {
    var id  = item[this.itemsKey];
    if(!id) {
      throw new Error('item must have property ' + this.itemsKey + ' in order to be removed from the world');
    }
    var box = this.boxes[id];
    if(!box) {
      throw new Error('item ' + id + ' is not in the world. Add it to the world before trying to remove it');
    }

    var c = box.toCellBox(this.cellSize);

    for(var cy = c.t; cy <= c.b; cy++) {
      var row = this.rows[cy];
      if(!row) { continue; }
      for(var cx = c.l; cx <= c.r; cx++) {
        var cell = row[cx];
        if(cell && cell.ids[id]) {
          delete cell.ids[id];
          cell.itemCount--;
        }
      }
    }

    delete this.boxes[id];
    delete this.items[id];
    this.itemCount--;
  }
});

var sortByTi = function(a,b) {
  var diff = a.ti - b.ti;
  return diff ? (diff < 0 ? -1 : 1) : 0;
};

})();
