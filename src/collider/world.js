// # world.js
(function() {
// ## Luv.Collider.World

var DEFAULT_CELLSIZE = 64;

var AABB = Luv.Collider.AABB;

Luv.Collider.World = Luv.Class('Luv.Collider.World', {
  init: function(cellSize, id) {
    this.cellSize   = cellSize || DEFAULT_CELLSIZE;
    this.id         = id       || 'world';
    this.itemsKey   = '_' + this.id + '_id';
    this.items      = {};
    this.aabbs      = {};
    this.rows       = {};
    this.itemCount  = 0;
    this.maxId      = 0;
  },

  getAABB: function(item) {
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

  countCells: function() {
    var rows = this.rows,
        count = 0;
    for(var y in rows) {
      if(!rows.hasOwnProperty(y)) { continue; }
      var row = rows[y];
      for(var x in row) {
        if(row.hasOwnProperty(x)) { count++; }
      }
    }
    return count;
  },

  add: function(item, l,t,w,h) {

    assertIsObject(item);

    var key = this.itemsKey;
    if(item[key]) {
      throw new Error('item must not have the property ' + key + ' when inserting it in the world');
    }

    assertValidDimensions(l,t,w,h);

    var id  = ++this.maxId;

    item[key] = id;

    this.aabbs[id] = AABB(l,t,w,h);
    this.items[id] = item;
    this.itemCount++;

    addItemToCells(this, id, this.aabbs[id]);

    return this.check(item);
  },

  move: function(item, l,t,w,h) {
    assertIsObject(item);

    var id  = item[this.itemsKey];
    if(!id) {
      throw new Error('item must have the property ' + this.itemsKey + ' in order to be moved');
    }
    var aabb = this.aabbs[id];
    if(!aabb) {
      throw new Error('item ' + id + ' is not in the world. Add it to the world before trying to move it');
    }

    w = (typeof w === 'undefined' ? aabb.w : w);
    h = (typeof h === 'undefined' ? aabb.h : h);

    assertValidDimensions(l,t,w,h);

    var prev_l = aabb.l,
        prev_t = aabb.t;

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
    assertIsObject(item);

    var id = item[this.itemsKey];

    if(!id) { throw new Error('item was not inserted into the world before being checked'); }

    var aabb = this.aabbs[id];

    if(!aabb) { throw new Error('item with id ' + id + ' was not inserted in the world'); }

    var l = aabb.l,
        t = aabb.t;

    prev_l = typeof prev_l === 'undefined' ? l : prev_l;
    prev_t = typeof prev_t === 'undefined' ? t : prev_t;

    var vx          = l - prev_l,
        vy          = t - prev_t,
        collisions  = [],
        len         = 0,
        visited     = {};

    var taabb = aabb;
    if(prev_l !== l || prev_t !== t) {
      var prevaabb = AABB(prev_l, prev_t, aabb.w, aabb.h);
      taabb = aabb.getCoveringAABB(prevaabb);
    }

    var b = taabb.toGrid(this.cellSize);

    visited[id] = true;

    for(var cy = b.t; cy < b.b; cy++) {
      var row = this.rows[cy];
      if(!row) { continue; }
      for(var cx = b.l; cx < b.r; cx++) {
        var cell = row[cx];
        if(!cell || cell.itemCount === 0) { continue; }
        for(var other_id in cell.ids) {
          if(visited[other_id] || !cell.ids.hasOwnProperty(other_id)) {
            continue;
          }
          visited[other_id] = true;
          var oaabb = this.aabbs[other_id],
              col  = collideAABBs(aabb, oaabb, vx, vy);
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
    assertIsObject(item);
    var id  = item[this.itemsKey];
    if(!id) {
      throw new Error('item must have property ' + this.itemsKey + ' in order to be removed from the world');
    }
    var aabb = this.aabbs[id];
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
  },

  drawCells: function(canvas) {
    for(var y in this.rows) {
      if(!this.rows.hasOwnProperty(y)) { continue; }
      var row = this.rows[y];
      for(var x in row) {
        if(!row.hasOwnProperty(x)) { continue; }
        var corner = this.fromGrid(x,y);
        var cell = row[x];
        canvas.strokeRectangle(corner.x, corner.y, this.cellSize, this.cellSize);
        canvas.print(cell.itemCount, corner.x + 5, corner.y + 10);
      }
    }
  },

  drawItems: function(canvas) {
    for(var id in this.aabbs) {
      if(!this.aabbs.hasOwnProperty(id)) { continue; }
      var aabb = this.aabbs[id];
      canvas.strokeRectangle(aabb.l, aabb.t, aabb.w, aabb.h);
    }
  }
});

var collideAABBs = function(aabb, other, vx, vy) {
  var collision, md, point, ti, t0t1, t0, t1;
  var prev_aabb = aabb;

  if(vx !== 0 || vy !== 0) {
    prev_aabb = Luv.Collider.AABB(aabb.l - vx, aabb.t - vy, aabb.w, aabb.h);
  }

  md = prev_aabb.getMinkowskyDifference(other);

  if(md.containsPoint(0,0)) { // prev_aabb was intersecting with other
    point     = md.getNearestPointInPerimeter(0,0);
    collision = {dx: point.x-vx, dy: point.y-vy, ti: 0, tunneling: false };
  } else {
    t0t1 = md.getLiangBarskyIndices(0,0, vx,vy, 0,1);
    if(t0t1) {
      t0 = t0t1.t0;
      t1 = t0t1.t1;
      if     (0 < t0 && t0 < 1) { ti = t0; }
      else if(0 < t1 && t1 < 1) { ti = t1; }

      if(ti) { // this tunnels into other
        collision = {dx: vx*ti-vx, dy: vy*ti-vy, ti: ti, tunneling: true};
      } else {
        md = aabb.getMinkowskyDifference(other);
        if(md.containsPoint(0,0)) {
          point     = md.getNearestPointInPerimeter(0,0);
          collision = {dx: point.x, dy: point.y, ti: 1, tunneling: false };
        }
      }
    }
  }
  return collision;
};

var addItemToCells = function(world, id, aabb) {
  var c   = aabb.toGrid(world.cellSize);

  for(var cy = c.t; cy < c.b; cy++) {
    var row  = world.rows[cy] = world.rows[cy] || {};
    for(var cx = c.l; cx < c.r; cx++) {
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

  for(var cy = c.t; cy < c.b; cy++) {
    var row = world.rows[cy];
    if(!row) { continue; }
    for(var cx = c.l; cx < c.r; cx++) {
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

var assertIsNumber = function(value, name) {
  if(typeof value != 'number' || !isFinite(value)) {
    throw new Error( name + " must be a number, was " + value);
  }
};

var assertIsPositiveNumber = function(value, name) {
  if(typeof value != 'number' || !isFinite(value) || value < 0) {
    throw new Error( name + " must be a positive number, was " + value);
  }
};

var assertValidDimensions = function(l,t,w,h) {
  assertIsNumber(l, 'l');
  assertIsNumber(t, 't');
  assertIsPositiveNumber(w, 'w');
  assertIsPositiveNumber(h, 'h');
};

var assertIsObject = function(obj) {
  if(typeof obj != 'object') {
    throw new Error( "Expected an object, found " + obj);
  }
};

})();
