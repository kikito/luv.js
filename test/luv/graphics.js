describe("Luv.Graphics", function(){
  it("exists", function(){
    expect(Luv.Graphics).to.be.a('function');
  });

  describe("constructor", function() {
    it("initializes parameters", function(){
      var el = document.createElement('canvas');
      var gr = Luv.Graphics(el, 10, 20);

      expect(gr.getColor()).to.deep.equal([255,255,255,255]);
      expect(gr.getBackgroundColor()).to.deep.equal([0,0,0,255]);
    });

    it("accepts an dom element, a width and a height", function() {
      var el         = document.createElement('canvas');
      var getContext = sinon.spy(el, 'getContext');

      var gr = Luv.Graphics(el, 10, 20);
      expect(gr.el).to.be.equal(el);
      expect(gr.ctx).to.be.ok;
      expect(getContext).to.have.been.calledWith('2d');
    });
  });

  describe(".Canvas", function() {
    var el, gr;
    beforeEach(function(){
      el = document.createElement('canvas');
      gr = Luv.Graphics(el, 320, 200);
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

  describe(".methods", function(){

    var el, gr, stroke, fill, moveTo, lineTo, rect, arc, beginPath, closePath;

    beforeEach(function() {
      var el = document.createElement('canvas');
      gr        = Luv.Graphics(el, 100, 200);
      stroke    = sinon.spy(gr.ctx, 'stroke');
      fill      = sinon.spy(gr.ctx, 'fill');
      moveTo    = sinon.spy(gr.ctx, 'moveTo');
      lineTo    = sinon.spy(gr.ctx, 'lineTo');
      rect      = sinon.spy(gr.ctx, 'rect');
      arc       = sinon.spy(gr.ctx, 'arc');
      beginPath = sinon.spy(gr.ctx, 'beginPath');
      closePath = sinon.spy(gr.ctx, 'closePath');
    });

    describe(".set/getCanvas", function() {
      describe("when given a new canvas", function() {
        it("uses the new canvas in all operations", function() {
          var canvas = gr.Canvas();
          gr.setCanvas(canvas);
          expect(gr.ctx).to.equal(canvas.ctx);
        });
      });
      describe("when given no canvas", function() {
        it("Goes back to the default canvas", function() {
          gr.setCanvas(gr.Canvas());
          gr.setCanvas();
          expect(gr.canvas).to.equal(gr.defaultCanvas);
        });
      });
    });

    describe(".clear", function(){
      it("clears the canvas with the background color", function() {
        var fillRect = sinon.spy(gr.ctx, 'fillRect');
        gr.clear();
        expect(fillRect).to.have.been.calledWith(0,0,gr.width,gr.height);
      });
    });

    describe(".print", function() {
      it("prints the given string with the correct color", function() {
        var fillText = sinon.spy(gr.ctx, 'fillText');
        gr.print("hello, luv", 100, 200);
        expect(fillText).to.have.been.calledWith('hello, luv', 100, 200);
      });
    });

    describe(".line", function(){
      it("draws a line given 2 points, with the chosen color", function() {
        gr.setColor(255,0,0);
        gr.line(10,20,30,40);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 20);
        expect(lineTo).to.have.been.calledWith(30, 40);
        expect(stroke).to.have.been.called;
        expect(gr.ctx.strokeStyle).to.equal('#ff0000');
      });

      it("draws a polyline given 3 points", function() {
        gr.setColor(0,255,0);
        gr.line(10,20,30,40,50,60);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 20);
        expect(lineTo).to.have.been.calledWith(30, 40);
        expect(lineTo).to.have.been.calledWith(50, 60);
        expect(stroke).to.have.been.called;
        expect(gr.ctx.strokeStyle).to.equal('#00ff00');
      });

      it("draws a polyline when given an array of points", function() {
        gr.setColor(0,0,255);
        gr.line([10,20,30,40,50,60]);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 20);
        expect(lineTo).to.have.been.calledWith(30, 40);
        expect(lineTo).to.have.been.calledWith(50, 60);
        expect(stroke).to.have.been.called;
        expect(gr.ctx.strokeStyle).to.equal('#0000ff');
      });

      it("throws an error if given less than 4 points", function() {
       expect(function(){ gr.line(1,2); }).to.Throw(Error);
      });

      it("throws an error if given an uneven number of coordinates", function() {
       expect(function(){ gr.line(1,2,3,4,5); }).to.Throw(Error);
      });
    });

    describe(".rectangle", function(){
      it("draws a colored rectangle when the mode is 'fill'", function() {
        gr.setColor(255,0,0);
        gr.rectangle('fill', 10, 10, 20, 20);

        expect(beginPath).to.have.been.called;
        expect(rect).to.have.been.calledWith(10, 10, 20, 20);
        expect(fill).to.have.been.called;
        expect(closePath).to.have.been.called;
        expect(gr.ctx.fillStyle).to.equal('#ff0000');
      });

      it("draws a colored rectangle outline the mode is 'line'", function() {
        gr.setColor(0,255,0);
        gr.rectangle('line', 10, 10, 20, 20);

        expect(beginPath).to.have.been.called;
        expect(rect).to.have.been.calledWith(10, 10, 20, 20);
        expect(stroke).to.have.been.called;
        expect(closePath).to.have.been.called;
        expect(gr.ctx.strokeStyle).to.equal('#00ff00');
      });

      it("throws en error if given an invalid mode", function() {
        expect(function(){ gr.rect('foo', 1,2,3,4); }).to.Throw(Error);
      });
    });

    describe(".polygon", function(){
      it("draws a colored polygon when the mode is 'fill'", function() {
        gr.setColor(255,0,0);
        gr.polygon('fill', 10, 10, 20, 20, 0,50);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 10);
        expect(lineTo).to.have.been.calledWith(20, 20);
        expect(lineTo).to.have.been.calledWith(0, 50);
        expect(closePath).to.have.been.called;
        expect(fill).to.have.been.called;
        expect(gr.ctx.fillStyle).to.equal('#ff0000');
      });

      it("draws a colored polygon when the mode is 'fill' and the coords an array", function() {
        gr.setColor(255,0,0);
        gr.polygon('fill', [10, 10, 20, 20, 0,50]);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 10);
        expect(lineTo).to.have.been.calledWith(20, 20);
        expect(lineTo).to.have.been.calledWith(0, 50);
        expect(closePath).to.have.been.called;
        expect(fill).to.have.been.called;
        expect(gr.ctx.fillStyle).to.equal('#ff0000');
      });


      it("draws a colored polygon outline the mode is 'line'", function() {
        gr.setColor(0,255,0);
        gr.polygon('fill', 10, 10, 20, 20, 0,50);

        expect(beginPath).to.have.been.called;
        expect(moveTo).to.have.been.calledWith(10, 10);
        expect(lineTo).to.have.been.calledWith(20, 20);
        expect(lineTo).to.have.been.calledWith(0, 50);
        expect(closePath).to.have.been.called;
        expect(fill).to.have.been.called;
        expect(gr.ctx.fillStyle).to.equal('#00ff00');
      });

      it("throws en error if given an invalid mode", function() {
        expect(function(){ gr.polygon('foo', 1,2,3,4,5,6); }).to.Throw(Error);
      });

      it("throws an error if given less than 3 points", function() {
       expect(function(){ gr.polygon('fill', 1,2,3,4); }).to.Throw(Error);
      });

      it("throws an error if given an uneven number of coordinates", function() {
       expect(function(){ gr.polygon('fill', 1,2,3,4,5,6,7); }).to.Throw(Error);
      });
    });

    describe(".circle", function() {
      it("draws a filled circle when the mode is 'fill'", function(){
        gr.setColor(0,255,0);
        gr.circle('fill', 10, 10, 20);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, 2 * Math.PI, false);
        expect(closePath).to.have.been.called;
        expect(fill).to.have.been.called;
        expect(gr.ctx.fillStyle).to.equal('#00ff00');
      });

      it("draws a stroked circle when the mode is 'line'", function(){
        gr.setColor(0,255,0);
        gr.circle('line', 10, 10, 20);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, 2 * Math.PI, false);
        expect(closePath).to.have.been.called;
        expect(stroke).to.have.been.called;
        expect(gr.ctx.strokeStyle).to.equal('#00ff00');
      });
    });

    describe(".arc", function() {
      it("draws a filled arc when the mode is 'fill'", function(){
        gr.setColor(0,255,0);
        gr.arc('fill', 10, 10, 20, 0, Math.PI);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, Math.PI, false);
        expect(fill).to.have.been.called;
        expect(gr.ctx.fillStyle).to.equal('#00ff00');
      });

      it("draws a stroked circle when the mode is 'line'", function(){
        gr.setColor(0,255,0);
        gr.arc('line', 10, 10, 20, 0, Math.PI);

        expect(beginPath).to.have.been.called;
        expect(arc).to.have.been.calledWith(10, 10, 20, 0, Math.PI, false);
        expect(stroke).to.have.been.called;
        expect(gr.ctx.strokeStyle).to.equal('#00ff00');
      });
    });

    describe(".drawImage", function() {
      var media;
      beforeEach(function(){
        media = Luv.Media();
      });

      it("throws an error when attempting to draw a not loaded image", function(){
        sinon.stub(media, 'onAssetError');
        var img = media.Image();
        expect(function(){ gr.drawImage(img, 10, 20); }).to.Throw(Error);
      });

      it("draws an image given two coordinates", function(){
        var drawImage = sinon.spy(gr.ctx, 'drawImage');
        // need a real image here, can not stub it
        var img = media.Image('img/foo.png', function() {
          gr.drawImage(img, 10, 20);
          expect(drawImage).to.have.been.calledWith(img.source, 10, 20);
        });
      });
    });

    describe(".drawCanvas", function() {
      it("calls drawImage on the context", function(){
        var drawImage = sinon.spy(gr.ctx, 'drawImage');
        var canvas = gr.Canvas();

        gr.drawCanvas(canvas, 10, 20);
        expect(drawImage).to.have.been.calledWith(canvas.el, 10, 20);
      });
    });

  }); // .methods
});
