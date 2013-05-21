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
    it("checks whether two AABBs are intersecting", function() {
      expect(AABB(10,20,100,200).isIntersecting(AABB(150,200,10,10))).to.equal(false);
      expect(AABB(10,20,100,200).isIntersecting(AABB(15,25,100,200))).to.equal(true);
    });
  });

});
