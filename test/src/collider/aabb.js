describe('Luv.Collider.AABB', function() {

  var AABB = Luv.Collider.AABB;

  it("exists", function() {
    expect(AABB).to.be.a('function');
  });

  describe('constructor', function() {
    it("initializes w,h,l,t,x,y,w2 & h2", function(){
      var b = AABB(10,20,100,200);

      expect([
        b.l, b.t, b.w, b.h, b.r, b.b, b.x, b.y, b.w2, b.h2
      ]).to.deep.equal([
        10,   20, 100, 200,  110, 220, 60,  120, 50, 100
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

  describe('getLiangBarsky', function() {
    it("calculates the (extended) Liang-Barsky algorithm", function() {
      var aabb = AABB(10,20,100,200);
      expect(aabb.getLiangBarsky(20,20,200,20)).to.deep.equal({t0: 0, t1: 0.45});
      expect(aabb.getLiangBarsky(0,20,100,60)).to.deep.equal({t0: 0.1, t1: 1});
    });
  });

});
