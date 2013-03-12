describe("Luv.Mouse", function(){
  it("exists", function(){
    expect(Luv.Mouse).to.be.a('function');
  });


  describe("methods", function(){
    var el, mouse;
    beforeEach(function(){
      el    = document.createElement('canvas');
      mouse = Luv.Mouse(el);
    });

    describe(".getPosition()", function() {
      it("starts on 0,0", function() {
        expect(mouse.getPosition()).to.deep.equal({x:0, y:0});
      });

      it("moves with the mouse", function() {
        trigger(el, "mousemove", {pageX:10, pageY:20});
        expect(mouse.getPosition()).to.deep.equal({x:10, y:20});
      });
    });

    describe('.onPressed', function(){
      it("gets called when a mouse button is pressed", function() {
        var onPressed = sinon.spy(mouse, 'onPressed');

        trigger(el, "mousedown", {which: 1});
        expect(onPressed).to.have.been.calledWith(0,0,'l');

        trigger(el, "mousedown", {which: 2});
        expect(onPressed).to.have.been.calledWith(0,0,'m');
      });

      it("gets called when the mouse wheel is pressed up/down", function() {
        var onPressed = sinon.spy(mouse, 'onPressed');

        trigger(el, "mousewheel", {wheelDelta: 1});
        expect(onPressed).to.have.been.calledWith(0,0,'wu');

        trigger(el, "mousewheel", {wheelDelta: -1});
        expect(onPressed).to.have.been.calledWith(0,0,'wd');
      });

      it("gets called when the mouse wheel is pressed up/down in Firefox", function() {
        var onPressed = sinon.spy(mouse, 'onPressed');

        trigger(el, "DOMMouseScroll", {detail: -1});
        expect(onPressed).to.have.been.calledWith(0,0,'wu');

        trigger(el, "DOMMouseScroll", {detail: 1});
        expect(onPressed).to.have.been.calledWith(0,0,'wd');
      });
    });

    describe('.onReleased', function(){
      it("gets called when a mouse button is pressed", function() {
        var onReleased = sinon.spy(mouse, 'onReleased');

        trigger(el, "mouseup", {which: 1});
        expect(onReleased).to.have.been.calledWith(0,0,'l');

        trigger(el, "mouseup", {which: 2});
        expect(onReleased).to.have.been.calledWith(0,0,'m');
      });

      it("gets called after the mouse is pressed up/down", function() {
        this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");
        var onReleased = sinon.spy(mouse, 'onReleased');

        trigger(el, "mousewheel", {wheelDelta: 1});
        this.clock.tick(21);
        expect(onReleased).to.have.been.calledWith(0,0,'wu');

        trigger(el, "mousewheel", {wheelDelta: -1});
        this.clock.tick(21);
        expect(onReleased).to.have.been.calledWith(0,0,'wd');

        this.clock.restore();
      });

      it("gets called after the mouse is pressed up/down on firefox", function() {
        this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");
        var onReleased = sinon.spy(mouse, 'onReleased');

        trigger(el, "DOMMouseScroll", {detail: -1});
        this.clock.tick(21);
        expect(onReleased).to.have.been.calledWith(0,0,'wu');

        trigger(el, "DOMMouseScroll", {detail: 1});
        this.clock.tick(21);
        expect(onReleased).to.have.been.calledWith(0,0,'wd');

        this.clock.restore();
      });
    });

    describe('.isPressed', function() {
      it("returns true when a button is pressed, false otherwise", function() {
        expect(mouse.isPressed('l')).to.equal(false);

        trigger(el, "mousedown", {which: 1});
        expect(mouse.isPressed('l')).to.equal(true);

        trigger(el, "mouseup", {which: 1});
        expect(mouse.isPressed('l')).to.equal(false);
      });

    });
  });
});
