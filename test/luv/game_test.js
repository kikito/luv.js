describe("luv.Game", function(){
  describe("constructor", function(){
    it("exists", function() {
      expect(new luv.Game).to.be.a('object');
    });
    describe("options param", function() {
      describe("when it is empty", function() {
        it("does not throw errors", function() {
          expect(function(){new luv.Game(); }).to.not.Throw(Error);
        });

        it("creates a game with default characteristics", function() {
          var game = new luv.Game();
          expect(game.graphics.el).to.be.ok;
          expect(game.graphics.width).to.equal(800);
          expect(game.graphics.height).to.equal(600);
        });
      });
    });
  });
});
