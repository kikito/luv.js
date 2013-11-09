describe("Luv.Collider.World", function(){
  it('exists', function() {
    expect(Luv.Collider.World).to.be.a('function');
  });

  describe("constructor", function() {
    it("accepts a cell size", function() {
      var w = Luv.Collider.World(32);
      expect(w.cellSize).to.equal(32);
    });

    it("defaults cell size to 64", function() {
      var w = Luv.Collider.World();
      expect(w.cellSize).to.equal(64);
    });
  });

  describe(".count", function() {
    it("starts at 0", function() {
      expect(Luv.Collider.World().count()).to.equal(0);
    });
  });

  describe(".add", function() {
    it("throws an error if the object already exists", function() {
      var obj = {},
          w   = Luv.Collider.World();

      w.add(obj, 0,0, 4,4);

      expect(function() { w.add(obj, 0,0, 4,4); }).to.Throw(Error);
    });
    describe("when the world is empty", function() {
      it("increases count", function() {
        var w = Luv.Collider.World();
        w.add({}, 0,0,1,1);
        expect(w.count()).to.equal(1);
      });
      it("returns an empty array", function() {
        var w = Luv.Collider.World();
        expect(w.add({}, 0,0,1,1)).to.deep.equal([]);
      });
    });
    describe("when the world is not empty", function() {
      it("returns a list with the collisions", function(){
        var w = Luv.Collider.World(),
            a = {n:'a'},
            b = {n:'b'};

        w.add(a, 0,0,10,10);
        var cols = w.add(b, 4,6,10,10);
        expect(cols).to.deep.equal([
          { item: a, dx: 6, dy: 4, tunneling: false, ti: 0 }
        ]);
      });
    });
  });

  describe('.move', function() {

    describe('when the object is not there', function() {
      it('throws an error', function() {
        var world = Luv.Collider.World();
        expect(function(){ world.move({}, 0,0,10,10);}).to.Throw(Error);
      });
    });

    describe('when the world is empty', function() {
      it('returns an empty list of collisions', function() {
        var world = Luv.Collider.World();
        expect(world.add({}, 0,0,10,10)).to.deep.equal([]);
      });
    });

    describe('when the world is not empty', function() {
      it('returns a list of collisions', function() {
        var world = Luv.Collider.World(),
            a     = {n:'a'},
            b     = {n:'b'};

        world.add(a, 0,0,10,10);
        expect(world.add(b, 4,6,10,10)).to.deep.equal([
          { item: a, dx: 6, dy: 4, tunneling: false, ti: 0 }
        ]);
      });
    });

    describe('when no width or height is given', function() {
      it('takes width and height from its previous value', function() {
        var world = Luv.Collider.World(),
            a     = {n:'a'};
        world.add(a, 0,0, 10,10);
        world.move(a, 5,5);
        expect(world.getBox(a)).to.deep.equal({l:5, t:5, w:10, h:10, r:15, b:15});
      });
    });
  });

  describe(':check', function() {
    describe('when the item does not exist', function() {
      it('throws an error', function() {
        var world = Luv.Collider.World();
        expect(function() { world.check({}); }).to.Throw(Error);
      });
    });
    describe('when the world is empty', function() {
      it('returns an empty list of collisions', function() {
        var world = Luv.Collider.World();
        var obj = {};
        world.add(obj, 1,2,3,4);
        expect(world.check(obj)).to.deep.equal([]);
      });
    });

    describe('when the world is not empty', function() {
      it('returns a list of collisions', function() {
        var world = Luv.Collider.World(),
            a     = {n:'a'},
            b     = {n:'b'};

        world.add(a, 0,0,10,10);
        world.add(b, 4,6,10,10);
        expect(world.check(b)).to.deep.equal([
          { item : a, dx : 6, dy : 4, tunneling : false, ti : 0 }
        ]);

      });

      describe('when previous l,t is passed', function() {
        it('still handles intersections as before', function() {
          var world = Luv.Collider.World(),
              a     = {n:'a'},
              b     = {n:'b'};

          world.add(a, 0,0, 2,2);
          world.add(b, 1,1, 2,2);
          expect(world.check(b, 1,1)).to.deep.equal([
            { item : a, dx : 1, dy : 1, tunneling : false, ti : 0 }
          ]);
        });
        it('detects and tags tunneling correctly', function() {
          var world = Luv.Collider.World(),
              a     = {n:'a'},
              b     = {n:'b'};

          world.add(a, 1,0, 2,1);
          world.add(b, 5,0, 4,1);
          expect(world.check(b, -5, 0)).to.deep.equal([
            { item : a, dx : -8, dy : 0, tunneling : true, ti : 0.2 }
          ]);
        });
        it('detects the case where an object was touching another without intersecting, and then penetrates', function() {
          var world = Luv.Collider.World(),
              a     = {n:'a'},
              b     = {n:'b'};

          world.add(a, 30,50,20,20);
          world.add(b, 0,0,32,100);

          expect(world.check(a, 32,50)).to.deep.equal([
            { item : b, dx : 2, dy : 50, tunneling : false, ti : 1 }
          ]);
        });

        it('returns a list of collisions sorted by ti', function() {
          var world = Luv.Collider.World(),
              a     = {n:'a'},
              b     = {n:'b'},
              c     = ['c'],
              d     = ['d'];

          world.add(a, 10,0, 10,10);
          world.add(b, 70,0, 10,10);
          world.add(c, 50,0, 10,10);
          world.add(d, 90,0, 10,10);

          expect(world.check(a, 110, 0)).to.deep.equal([
            { item : d, dx : 90, dy : 0, tunneling : true, ti : 0.1 },
            { item : b, dx : 70, dy : 0, tunneling : true, ti : 0.3 },
            { item : c, dx : 50, dy : 0, tunneling : true, ti : 0.5 }
          ]);
        });
      });
    });
  });

  describe(':remove', function() {
    it('throws an error if the item does not exist', function() {
      var world = Luv.Collider.World();
      expect(function(){ world.remove({}); }).to.Throw(Error);
    });
    it('makes the item disappear from the world', function() {
      var world = Luv.Collider.World(),
          a     = {n:'a'},
          b     = {n:'b'};

      world.add(a, 0,0, 10,10);
      world.add(b, 5,0, 1,1);
      expect(world.check(b)).to.deep.equal([
        { item : a, dx : 5, dy : -1, tunneling : false, ti : 0 }
      ]);
      world.remove(a);
      expect(world.check(b)).to.deep.equal([]);
    });
  });

  describe(':toGrid', function() {
    it('returns the coordinates of the cell containing a point', function() {
      var w = Luv.Collider.World();
      expect(w.toGrid(0,0)).to.deep.equal({x:0, y:0});
      expect(w.toGrid(63.9,63.9)).to.deep.equal({x:0, y:0});
      expect(w.toGrid(64,64)).to.deep.equal({x:1, y:1});
      expect(w.toGrid(-1,-1)).to.deep.equal({x:-1, y:-1});
    });
  });

  describe(':fromGrid', function() {
    it('returns the world left,top corner of the given cell', function() {
      var w = Luv.Collider.World();
      expect(w.fromGrid(0,0)).to.deep.equal({x: 0, y:0});
      expect(w.fromGrid(1,1)).to.deep.equal({x:64, y:64});
      expect(w.fromGrid(-1,1)).to.deep.equal({x:-64, y:64});
    });
  });
});
