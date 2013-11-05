describe("Luv.Graphics", function(){
  var newDOMCanvas = function(width, height) {
    var el = document.createElement('canvas');
    el.setAttribute('width', width);
    el.setAttribute('height', height);
    return el;
  };

  it("exists", function(){
    expect(Luv.Graphics).to.be.a('function');
  });

  describe("constructor", function() {
    it("initializes parameters", function(){
      var gr = Luv.Graphics(newDOMCanvas(100, 200), Luv.Media());

      expect(gr.getDimensions()).to.deep.equal({width: 100, height: 200});
      expect(gr.getColor()).to.deep.equal({r: 255, g: 255, b: 255});
      expect(gr.getBackgroundColor()).to.deep.equal({r: 0, g: 0, b: 0});
      expect(gr.el).to.be.ok;
      expect(gr.media).to.be.ok;
    });
  });

  describe(".Canvas", function() {
    var el, gr;
    beforeEach(function(){
      el = newDOMCanvas(320, 200);
      gr = Luv.Graphics(el, Luv.Media());
    });
    it("creates a new canvas with the same width and height as the original one", function() {
      var canvas = gr.Canvas();
      expect(canvas.getDimensions()).to.deep.equal({width: 320, height: 200});
      expect(canvas.el).to.be.ok;
    });
    it("creates a new canvas with the given with and height", function() {
      var canvas = gr.Canvas(800, 600);
      expect(canvas.getDimensions()).to.deep.equal({width: 800, height: 600});
      expect(canvas.el).to.be.ok;
    });
  });

});
