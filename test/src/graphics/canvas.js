describe('Luv.Graphics.Canvas', function() {

  it("exists", function() {
    expect(Luv.Graphics.Canvas).to.be.a('function');
  });

  describe("constructor", function(){
    it("initializes parameters", function() {
      var c = Luv.Graphics.Canvas(100,200);
      expect(c.getDimensions()).to.deep.equal({width: 100, height: 200});
      expect(c.getColor()).to.deep.equal({r: 255, g: 255, b: 255});
      expect(c.getBackgroundColor()).to.deep.equal({r: 0, g: 0, b: 0});
      expect(c.getAlpha()).to.equal(1);
      expect(c.getLineCap()).to.equal('butt');
      expect(c.getLineWidth()).to.equal(1);
      expect(c.getImageSmoothing()).to.equal(true);
      expect(c.el).to.be.ok;
    });
    it("can deduce width and height from an el parameter", function() {
      var el = document.createElement('canvas');
      el.setAttribute('width', 100);
      el.setAttribute('height', 200);
      var c = Luv.Graphics.Canvas(el);
      expect(c.getDimensions()).to.deep.equal({width: 100, height: 200});
    });
  });

});
