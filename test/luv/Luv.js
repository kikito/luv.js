describe("Luv", function(){
  it("exists", function(){
    expect(Luv).to.be.a('function');
  });
  describe("options param", function() {
    describe("when it is empty", function() {
      it("does not throw errors", function() {
        expect(function(){new Luv(); }).to.not.Throw(Error);
      });

      it("creates a game with default characteristics", function() {
        var luv = new Luv();
        expect(luv.graphics.el).to.be.ok;
        expect(luv.graphics.width).to.equal(800);
        expect(luv.graphics.height).to.equal(600);
        expect(luv.draw).to.be.a('function');
        expect(luv.update).to.be.a('function');
        expect(luv.run).to.be.a('function');
      });
    });
  });
});
