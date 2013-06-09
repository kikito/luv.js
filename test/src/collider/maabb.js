describe('Luv.Collider.MAABB', function() {

  var MAABB = Luv.Collider.MAABB;

  it("exists", function() {
    expect(MAABB).to.be.a('function');
  });

  describe('constructor', function() {
    it("initializes variables", function(){
      var m = MAABB(10,20,100,200),
          a = m.previous,
          b = m.current,
          c = m.boundaries;

      expect([
        a.l, a.t, a.w, a.h, a.r, a.b, a.x, a.y, a.w2, a.h2,
        b.l, b.t, b.w, b.h, b.r, b.b, b.x, b.y, b.w2, b.h2,
        c.l, c.t, c.w, c.h, c.r, c.b, c.x, c.y, c.w2, c.h2
      ]).to.deep.equal([
        10,  20,  100, 200, 110, 220, 60,  120, 50,   100,
        10,  20,  100, 200, 110, 220, 60,  120, 50,   100,
        10,  20,  100, 200, 110, 220, 60,  120, 50,   100
      ]);
    });
  });

  describe('update', function() {
    describe("when the width/height does not change", function() {
      it("moves the current AABB and boundaries, leaving previous untouched", function(){
        var m = MAABB(10,20,100,200),
            a = m.previous,
            b = m.current,
            c = m.boundaries;

        m.update(100, 20, 100, 200);

        expect([
          a.l, a.t, a.w, a.h, a.r, a.b, a.x, a.y, a.w2, a.h2,
          b.l, b.t, b.w, b.h, b.r, b.b, b.x, b.y, b.w2, b.h2,
          c.l, c.t, c.w, c.h, c.r, c.b, c.x, c.y, c.w2, c.h2
        ]).to.deep.equal([
          10,  20,  100, 200, 110, 220, 60,    120, 50,   100,
          100, 20,  100, 200, 200, 220, 150,   120, 50,   100,
          10,  20,  190, 200, 200, 220, 105,   120, 95,   100
        ]);
      });
    });
    describe("when the width/height changes", function() {
      it("previous gets resized", function(){
        var m = MAABB(10,20,100,200),
            a = m.previous,
            b = m.current,
            c = m.boundaries;

        m.update(100, 20, 150, 200);

        expect([
          a.l, a.t, a.w, a.h, a.r, a.b, a.x,   a.y, a.w2, a.h2,
          b.l, b.t, b.w, b.h, b.r, b.b, b.x,   b.y, b.w2, b.h2,
          c.l, c.t, c.w, c.h, c.r, c.b, c.x,   c.y, c.w2, c.h2
        ]).to.deep.equal([
         -15,  20,  150, 200, 135, 220, 60,    120, 75,   100,
          100, 20,  150, 200, 250, 220, 175,   120, 75,   100,
         -15,  20,  265, 200, 250, 220, 117.5, 120, 132.5,   100
        ]);
      });
    });
  });


});
