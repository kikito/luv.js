describe('Luv.Graphics.Canvas', function() {

  var newDOMCanvas = function(width, height) {
    var el = document.createElement('canvas');
    el.setAttribute('width', width);
    el.setAttribute('height', height);
    return el;
  };

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
      var el = newDOMCanvas(100,200);
      var c = Luv.Graphics.Canvas(el);
      expect(c.getDimensions()).to.deep.equal({width: 100, height: 200});
    });
  });

  describe(".methods", function(){

    var el, media, c, ctx, stroke, fill, moveTo, lineTo, rect, arc, beginPath, closePath;

    beforeEach(function() {
      el        = newDOMCanvas(100,200);
      media     = Luv.Media();
      c         = Luv.Graphics.Canvas(el);
      ctx       = c.ctx,
      stroke    = sinon.spy(ctx, 'stroke');
      fill      = sinon.spy(ctx, 'fill');
      moveTo    = sinon.spy(ctx, 'moveTo');
      lineTo    = sinon.spy(ctx, 'lineTo');
      rect      = sinon.spy(ctx, 'rect');
      arc       = sinon.spy(ctx, 'arc');
      beginPath = sinon.spy(ctx, 'beginPath');
      closePath = sinon.spy(ctx, 'closePath');
    });

    describe(".clear", function(){
      it("clears the canvas with the background color", function() {
        el.width = 800;
        el.height = 600;
        var fillRect     = sinon.spy(ctx, 'fillRect');
        var setTransform = sinon.spy(ctx, 'setTransform');
        c.clear();
        expect(fillRect).to.have.been.calledWith(0,0,800,600);
        expect(setTransform).to.have.been.calledWith(1,0,0,1,0,0);
      });
    });

    describe(".print", function() {
      it("prints the given string with the correct color", function() {
        var fillText = sinon.spy(ctx, 'fillText');
        c.print("hello, luv", 100, 200);
        expect(fillText).to.have.been.calledWith('hello, luv', 100, 200);
      });
    });

    describe(".line", function(){
      it("draws a line given 2 points, with the chosen color", function() {
        c.setColor(255,0,0);
        c.line(10,20,30,40);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 20);
        expect(lineTo).to.have.been.calledWith(30, 40);
        expect(stroke).to.have.been.called;
        expect(ctx.strokeStyle).to.equal('#ff0000');
      });

      it("draws a polyline given 3 points", function() {
        c.setColor(0,255,0);
        c.line(10,20,30,40,50,60);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 20);
        expect(lineTo).to.have.been.calledWith(30, 40);
        expect(lineTo).to.have.been.calledWith(50, 60);
        expect(stroke).to.have.been.called;
        expect(ctx.strokeStyle).to.equal('#00ff00');
      });

      it("draws a polyline when given an array of points", function() {
        c.setColor(0,0,255);
        c.line([10,20,30,40,50,60]);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 20);
        expect(lineTo).to.have.been.calledWith(30, 40);
        expect(lineTo).to.have.been.calledWith(50, 60);
        expect(stroke).to.have.been.called;
        expect(ctx.strokeStyle).to.equal('#0000ff');
      });

      it("throws an error if given less than 4 points", function() {
       expect(function(){ c.line(1,2); }).to.Throw(Error);
      });

      it("throws an error if given an uneven number of coordinates", function() {
       expect(function(){ c.line(1,2,3,4,5); }).to.Throw(Error);
      });
    });

    describe(".fillRectangle", function(){
      it("draws a filled rectangle", function() {
        c.setColor(255,0,0);
        c.fillRectangle(10, 10, 20, 20);

        expect(beginPath).to.have.been.called;
        expect(rect).to.have.been.calledWith(10, 10, 20, 20);
        expect(fill).to.have.been.called;
        expect(closePath).to.have.been.called;
        expect(ctx.fillStyle).to.equal('#ff0000');
      });
    });

    describe(".strokeRectangle", function(){
      it("draws a colored rectangle outline", function() {
        c.setColor(0,255,0);
        c.strokeRectangle(10, 10, 20, 20);

        expect(beginPath).to.have.been.called;
        expect(rect).to.have.been.calledWith(10, 10, 20, 20);
        expect(stroke).to.have.been.called;
        expect(closePath).to.have.been.called;
        expect(ctx.strokeStyle).to.equal('#00ff00');
      });
    });

    describe(".fillPolygon", function(){
      it("draws a colored filled polygon", function() {
        c.setColor(255,0,0);
        c.fillPolygon([10, 10, 20, 20, 0,50]);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 10);
        expect(lineTo).to.have.been.calledWith(20, 20);
        expect(lineTo).to.have.been.calledWith(0, 50);
        expect(closePath).to.have.been.called;
        expect(fill).to.have.been.called;
        expect(ctx.fillStyle).to.equal('#ff0000');
      });

      it("works with a varargs instead of an array", function() {
        c.setColor(255,0,0);
        c.fillPolygon(10, 10, 20, 20, 0,50);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 10);
        expect(lineTo).to.have.been.calledWith(20, 20);
        expect(lineTo).to.have.been.calledWith(0, 50);
        expect(closePath).to.have.been.called;
        expect(fill).to.have.been.called;
        expect(ctx.fillStyle).to.equal('#ff0000');
      });
    });

    describe(".strokePolygon", function(){
      it("draws a colored polygon outline", function() {
        c.setColor(0,255,0);
        c.strokePolygon([10, 10, 20, 20, 0,50]);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 10);
        expect(lineTo).to.have.been.calledWith(20, 20);
        expect(lineTo).to.have.been.calledWith(0, 50);
        expect(closePath).to.have.been.called;
        expect(stroke).to.have.been.called;
        expect(ctx.strokeStyle).to.equal('#00ff00');
      });
    });

    describe(".fillCircle", function() {
      it("draws a filled circle", function(){
        c.setColor(0,255,0);
        c.fillCircle(10, 10, 20);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, 2 * Math.PI, false);
        expect(closePath).to.have.been.called;
        expect(fill).to.have.been.called;
        expect(ctx.fillStyle).to.equal('#00ff00');
      });
    });

    describe(".strokeCircle", function() {
      it("draws a stroked circle", function(){
        c.setColor(0,255,0);
        c.strokeCircle(10, 10, 20);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, 2 * Math.PI, false);
        expect(closePath).to.have.been.called;
        expect(stroke).to.have.been.called;
        expect(ctx.strokeStyle).to.equal('#00ff00');
      });
    });

    describe(".fillArc", function() {
      it("draws a filled arc", function(){
        c.setColor(0,255,0);
        c.fillArc(10, 10, 20, 0, Math.PI);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, Math.PI, false);
        expect(fill).to.have.been.called;
        expect(ctx.fillStyle).to.equal('#00ff00');
      });
    });


    describe(".strokeArc", function() {
      it("draws a stroked circle", function(){
        c.setColor(0,255,0);
        c.strokeArc(10, 10, 20, 0, Math.PI);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, Math.PI, false);
        expect(stroke).to.have.been.called;
        expect(ctx.strokeStyle).to.equal('#00ff00');
      });
    });

    describe(".translate", function() {
      it("translates the origin of coordinates", function() {
        var translate = sinon.spy(ctx, 'translate');
        c.translate(10,20);
        expect(translate).to.have.been.calledWith(10,20);
      });
    });

    describe(".scale", function() {
      it("scales the canvas", function() {
        var scale = sinon.spy(ctx, 'scale');
        c.scale(1,2);
        expect(scale).to.have.been.calledWith(1,2);
      });
    });

    describe(".rotate", function() {
      it("rotates the canvas", function() {
        var rotate = sinon.spy(ctx, 'rotate');
        c.rotate(Math.PI);
        expect(rotate).to.have.been.calledWith(Math.PI);
      });
    });

    describe(".push", function() {
      it("adds a new transformation level onto the stack", function() {
        var save = sinon.spy(ctx, 'save');
        c.push();
        expect(save).to.have.been.called;
      });
    });

    describe(".pop", function() {
      it("removes a transformation level from the stack", function() {
        var restore = sinon.spy(ctx, 'restore');
        c.pop();
        expect(restore).to.have.been.called;
      });
    });

    describe(".draw", function() {

      it("throws an error when attempting to draw a not loaded image", function(){
        sinon.stub(media, 'onAssetError');
        var img = Luv.Graphics(el, media).Image();
        expect(function(){ c.draw(img, 10, 20); }).to.Throw(Error);
      });

      it("draws an image given two coordinates", function(){
        var drawImage = sinon.spy(ctx, 'drawImage');
        // need a real image here, can not stub it
        var img = Luv.Graphics(el, media).Image('img/foo.png', function() {
          c.draw(img, 10, 20);
          expect(drawImage).to.have.been.calledWith(img.source, 10, 20);
        });
      });

      it("draws a canvas given two coordinates", function(){
        var drawImage = sinon.spy(ctx, 'drawImage');
        var canvas = Luv.Graphics.Canvas(20,20);

        c.draw(canvas, 10, 20);
        expect(drawImage).to.have.been.calledWith(canvas.el, 10, 20);
      });

      // I should also test the animations, but I don't feel like it
    });

  }); // .methods
});
