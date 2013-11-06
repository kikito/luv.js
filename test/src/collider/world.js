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
});
