describe("Luv.Keyboard", function() {
  it("exists", function(){
    expect(Luv.Keyboard).to.be.a('function');
  });

  describe("methods", function(){
    var el, keyboard;

    beforeEach(function(){
      el = document.createElement('canvas');
      keyboard = Luv.Keyboard(el);
      expect(el.tabIndex).to.equal(1);
    });

    describe("constructor", function(){
      it("assigns a tab index to the down element it receives", function() {
        expect(el.tabIndex).to.equal(1);
      });
    });

    describe(".onPressed", function(){
      it("exists by default", function(){
        expect(keyboard.onPressed).to.be.a('function');
      });

      it("gets called if keyup is called", function(){
        var onPressed = sinon.spy(keyboard, 'onPressed');
        trigger(el, 'keydown', {which: 32});
        expect(onPressed).to.have.been.calledWith(' ', 32);
      });
    });

    describe(".onReleased", function(){
      it("exists by default", function(){
        expect(keyboard.onReleased).to.be.a('function');
      });

      it("gets called if keyup is called", function(){
        var onReleased = sinon.spy(keyboard, 'onReleased');
        trigger(el, 'keyup', {which: 32});
        expect(onReleased).to.have.been.calledWith(' ', 32);
      });
    });

    describe(".isDown", function(){
      it("returns true if a key is pressed, and false otherwise", function(){
        expect(keyboard.isDown(' ')).to.equal(false);

        trigger(el, 'keydown', {which: 32});
        expect(keyboard.isDown(' ')).to.equal(true);

        trigger(el, 'keyup', {which: 32});
        expect(keyboard.isDown(' ')).to.equal(false);
      });
    });

  }); // methods


});
