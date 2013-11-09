// # world.js
(function() {
// ## Luv.Collider.World

var DEFAULT_CELLSIZE = 64;

var AABB = Luv.Collider.AABB;

Luv.Collider.World = Luv.Class('Luv.Collider.World', {
  init: function(cellSize, id) {
    this.cellSize = cellSize || DEFAULT_CELLSIZE;
    this.items      = {};
    this.aabbs      = {};
    this.rows       = {};
    this.itemCount  = 0;
    this.maxId      = 0;
    this.id         = id || 'world';
    this.itemsKey   = '_' + this.id + '_id';
  },

  getaabb: function(item) {
    var key = this.itemsKey;
    if(!item[key]) {
      throw new Error('item must have the property ' + key + ' in order to obtain its aabb');
    }
    var id = item[key];
    return this.aabbs[id];
  },

  count: function() {
    return this.itemCount;
  },

  add: function(item, l,t,w,h) {

    var key = this.itemsKey;
    if(item[key]) {
      throw new Error('item must not have the property ' + key + ' when inserting it in the world');
    }

    var id  = ++this.maxId;

    item[key] = id;

    this.aabbs[id] = AABB(l,t,w,h);
    this.items[id] = item;
    this.itemCount++;

    addItemToCells(this, id, this.aabbs[id]);

    return this.check(item);
  },

  move: function(item, l,t,w,h) {
    var id  = item[this.itemsKey];
    if(!id) {
      throw new Error('item must have the property ' + this.itemsKey + ' in order to be moved');
    }
    var aabb = this.aabbs[id];
    if(!aabb) {
      throw new Error('item ' + id + ' is not in the world. Add it to the world before trying to move it');
    }
    var prev_l = aabb.l,
        prev_t = aabb.t;

    w = (typeof w === 'undefined' ? 0 : aabb.w);
    h = (typeof h === 'undefined' ? 0 : aabb.h);

    if(aabb.w != w || aabb.h != h) {
      var prev_c = aabb.getCenter();
      prev_l = prev_c.x - w/2;
      prev_t = prev_c.y - h/2;
    }

    if(aabb.w != w || aabb.h != h || aabb.l != l || aabb.t != t) {
      removeItemFromCells(this, id, aabb);
      aabb.setDimensions(l,t,w,h);
      addItemToCells(this, id, aabb);
    }

    return this.check(item, prev_l, prev_t);
  },

  check: function(item, prev_l, prev_t) {
    var id = item[this.itemsKey];

    if(!id) { throw new Error('item was not inserted into the world before being checked'); }

    var aabb = this.aabbs[id];

    if(!aabb) { throw new Error('item with id ' + id + ' was not inserted in the world'); }

    var l = aabb.l,
        t = aabb.t;

    prev_l = prev_l || l;
    prev_t = prev_t || t;

    var vx          = l - prev_l,
        vy          = t - prev_t,
        collisions  = [],
        len         = 0,
        visited     = {};

    var swipedaabb = aabb;
    if(prev_l != l || prev_t != t) {
      var prevaabb = AABB(prev_l, prev_t, aabb.w, aabb.h);
      swipedaabb = aabb.getCoveringAABB(prevaabb);
    }

    var b = swipedaabb.toGrid(this.cellSize);

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
          var oaabb = this.aabbs[other_id],
              col  = aabb.collide(oaabb, vx, vy);
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
    var aabb = world.aabbs[id];
    if(!aabb) {
      throw new Error('item ' + id + ' is not in the world. Add it to the world before trying to remove it');
    }

    removeItemFromCells(this, id, aabb);

    delete this.aabbs[id];
    delete this.items[id];
    this.itemCount--;
  },

  toGrid: function(x,y) {
    return {x: Math.floor(x / this.cellSize), y: Math.floor(y / this.cellSize)};
  },

  fromGrid: function(gx, gy) {
    return {x: gx * this.cellSize, y: gy * this.cellSize};
  }
});

var addItemToCells = function(world, id, aabb) {
  var c   = aabb.toGrid(this.cellSize);

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
};

var removeItemFromCells = function(world, id, aabb) {
  var c = aabb.toGrid(world.cellSize);

  for(var cy = c.t; cy <= c.b; cy++) {
    var row = world.rows[cy];
    if(!row) { continue; }
    for(var cx = c.l; cx <= c.r; cx++) {
      var cell = row[cx];
      if(cell && cell.ids[id]) {
        delete cell.ids[id];
        cell.itemCount--;
      }
    }
  }
};

var sortByTi = function(a,b) {
  var diff = a.ti - b.ti;
  return diff ? (diff < 0 ? -1 : 1) : 0;
};

})();
