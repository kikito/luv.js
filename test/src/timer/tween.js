describe("Luv.Timer.Tween", function(){

  it('exists', function() {
    expect(Luv.Timer.Tween).to.be.a('function');
  });

  describe(".init", function() {
    it("initializes the tween", function() {
      var tween = Luv.Timer.Tween(1, 0, 10);
      expect(tween.runningTime).to.equal(0);
      expect(tween.timeToFinish).to.equal(1);
      expect(tween.from).to.equal(0);
      expect(tween.to).to.equal(10);
      expect(tween.easing).to.equal(Luv.Timer.Tween.easing.linear);
      expect(tween.updateFunction).to.be.ok;
    });

    it("creates references from, but creates a copy of to", function() {
        var from = {color: {r:1,g:1,b:1}, alpha: 0};
        var to   = {color: {r:255,g:255,b:255}, alpha: 1};
        var tween = Luv.Timer.Tween(1, from, to);
        expect(tween.from).to.equal(from);
        expect(tween.to).to.not.equal(to);
        expect(tween.to).to.deep.equal(to);
    });
  });

  describe(".update", function() {

  });


});
