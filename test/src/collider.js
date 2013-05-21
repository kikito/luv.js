describe("Luv.Collider", function(){
  it('exists', function() {
    expect(Luv.Collider).to.be.a('function');
  });

  describe("constructor", function() {
    it("accepts a cell size", function() {
      var collider = Luv.Collider(32);
      expect(collider.cellSize).to.equal(32);
    });

    it("defaults cell size to 64", function() {
      var collider = Luv.Collider();
      expect(collider.cellSize).to.equal(64);
    });
  });


});
