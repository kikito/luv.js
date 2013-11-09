describe('Luv.Collider.AABB', function() {

  var AABB = Luv.Collider.AABB;

  it("exists", function() {
    expect(AABB).to.be.a('function');
  });

  describe('constructor', function() {
    it("initializes w,h,l,t,r,b", function(){
      var b = AABB(10,20,100,200);

      expect([
        b.l, b.t, b.w, b.h, b.r, b.b
      ]).to.deep.equal([
        10,   20, 100, 200,  110, 220
      ]);
    });
  });

  describe('clone', function() {
    it("returns a copy of the aabb", function(){
      var a = AABB(10,20,100,200),
          b = a.clone();
      expect([
        b.l, b.t, b.w, b.h, b.r, b.b
      ]).to.deep.equal([
        10,   20, 100, 200,  110, 220
      ]);
    });
  });

  describe('setDimensions', function() {
    it("changes the values of all the important attributes", function() {
      var b = AABB(100,200,10,20);
      b.setDimensions(10,20,100,200);

      expect([
        b.l, b.t, b.w, b.h, b.r, b.b
      ]).to.deep.equal([
        10,   20, 100, 200,  110, 220
      ]);

    });
  });

  describe('isIntersecting', function() {
    it("checks wether two AABBs are intersecting", function() {
      expect(AABB(10,20,100,200).isIntersecting(AABB(150,200,10,10))).to.equal(false);
      expect(AABB(10,20,100,200).isIntersecting(AABB(15,25,100,200))).to.equal(true);
    });
  });

  describe('containsPoint', function() {
    it("checks wether a point is inside the aabb", function() {
      expect(AABB(10,20,100,200).containsPoint(15,25)).to.equal(true);
      expect(AABB(10,20,100,200).containsPoint(0,0)).to.equal(false);
    });
  });

  describe('getMinkowskyDiff', function() {
    it("returns the minkowsky diff of two aabbs", function() {
      var md = AABB(10,20,100,200).getMinkowskyDiff(AABB(45,30, 20, 10));
      expect([md.l, md.t, md.w, md.h]).to.deep.equal([-65,-190,120,210]);
    });
  });

});
