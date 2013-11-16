describe("Luv.Collider.Collision", function(){
  var Collision = Luv.Collider.Collision;

  it('exists', function(){
    expect(Collision).to.be.a('function');
  });

  describe("constructor", function() {
    it('sets kind, vx, vy, t0 and t1', function() {
      var c = Luv.Collider.Collision('touch', 1,2,3,4);
      expect(c.kind).to.equal('touch');
      expect(c.vx).to.equal(1);
      expect(c.vy).to.equal(2);
      expect(c.t0).to.equal(3);
      expect(c.t1).to.equal(4);
    });
  });

  describe(".getSimpleDisplacement", function() {
    describe("when it's a touch", function() {
      it('returns 0,0', function() {
        var c = Collision('touch', 1,2,3,4);
        expect(c.getSimpleDisplacement()).to.deep.equal({x: 0, y: 0});
      });
    });
    describe("when it's an intersect", function(){
      it('returns t0,0 or 0,t1, whatever is smaller', function() {
        var c = Collision('intersection', 1,2,3,4);
        expect(c.getSimpleDisplacement()).to.deep.equal({x: 3, y: 0});
        c = Collision('intersection', 4,3,2,1);
        expect(c.getSimpleDisplacement()).to.deep.equal({x: 0, y: 1});
      });
    });
    describe("when it's a tunnel", function() {
      // This depends on who is/isn't 1
      it('returns vx * t0, vy * t0', function() {
      });
    });
  });
});
