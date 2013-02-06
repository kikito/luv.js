describe("Luv.Graphics", function(){
  it("exists", function(){
    expect(Luv.Graphics).to.be.a('function');
  });

  describe("constructor", function() {
    it("initializes parameters", function(){
      var gr = new Luv.Graphics();

      expect(gr.el).to.be.ok;
      expect(gr.width).to.be.equal(800);
      expect(gr.height).to.be.equal(600);

      expect(gr.getColor()).to.deep.equal([255,255,255,255]);
      expect(gr.getBackgroundColor()).to.deep.equal([0,0,0,255]);
    });

    it("accepts an dom element, a width and a height", function() {
      var el = document.createElement('canvas');
      var setAttribute = sinon.spy(el, 'setAttribute');
      var getContext   = sinon.spy(el, 'getContext');

      var gr = new Luv.Graphics(el, 10, 20);
      expect(gr.el).to.be.equal(el);
      expect(setAttribute).to.have.been.calledWith('width', 10);
      expect(setAttribute).to.have.been.calledWith('height', 20);
      expect(getContext).to.have.been.calledWith('2d');

      expect(gr.ctx).to.be.ok;
      expect(gr.width).to.be.equal(10);
      expect(gr.height).to.be.equal(20);
    });
  });

  describe(".clear", function(){
    it("clears the canvas with the background color", function() {
      var gr       = new Luv.Graphics();
      var fillRect = sinon.spy(gr.ctx, 'fillRect');

      gr.clear();
      expect(fillRect).to.have.been.calledWith(0,0,gr.width,gr.height);
    });
  });

  describe(".print", function() {
    it("prints the given string with the correct color", function() {
      var gr       = new Luv.Graphics();
      var fillText = sinon.spy(gr.ctx, 'fillText');

      gr.print("hello, luv", 100, 200);
      expect(fillText).to.have.been.calledWith('hello, luv', 100, 200);
    });
  });

  describe(".line", function(){
    var gr=null, beginPath=null, moveTo=null, lineTo=null, stroke=null;

    before(function() {
      gr        = new Luv.Graphics();
      beginPath = sinon.spy(gr.ctx, 'beginPath');
      moveTo    = sinon.spy(gr.ctx, 'moveTo');
      lineTo    = sinon.spy(gr.ctx, 'lineTo');
      stroke    = sinon.spy(gr.ctx, 'stroke');
    });

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
    var gr=null, stroke=null, fill=null, rect=null, beginPath=null, closePath=null;

    before(function() {
      gr        = new Luv.Graphics();
      stroke    = sinon.spy(gr.ctx, 'stroke');
      fill      = sinon.spy(gr.ctx, 'fill');
      rect      = sinon.spy(gr.ctx, 'rect');
      beginPath = sinon.spy(gr.ctx, 'beginPath');
      closePath = sinon.spy(gr.ctx, 'closePath');
    });

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
    var gr=null, stroke=null, fill=null, moveTo=null, lineTo=null, beginPath=null, closePath=null;

    before(function() {
      gr        = new Luv.Graphics();
      stroke    = sinon.spy(gr.ctx, 'stroke');
      fill      = sinon.spy(gr.ctx, 'fill');
      moveTo    = sinon.spy(gr.ctx, 'moveTo');
      lineTo    = sinon.spy(gr.ctx, 'lineTo');
      beginPath = sinon.spy(gr.ctx, 'beginPath');
      closePath = sinon.spy(gr.ctx, 'closePath');
    });

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




});
