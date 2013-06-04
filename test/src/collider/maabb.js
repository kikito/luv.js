describe('Luv.Collider.MAABB', function() {

  var MAABB = Luv.Collider.MAABB;

  it("exists", function() {
    expect(MAABB).to.be.a('function');
  });

  describe('constructor', function() {
    it("initializes variables", function(){
      var m = MAABB(10,20,100,200,20,30),
          a = m.aabb0,
          b = m.aabb1;

      expect([
        m.dx, m.dy,
        a.l, a.t, a.w, a.h, a.r, a.b, a.x, a.y, a.w2, a.h2,
        b.l, b.t, b.w, b.h, b.r, b.b, b.x, b.y, b.w2, b.h2
      ]).to.deep.equal([
        20,   30,
        10,   20, 100, 200,  110, 220, 60,  120, 50, 100,
        30,   50, 100, 200,  130, 250, 80,  150, 50, 100
      ]);
    });
  });


});
