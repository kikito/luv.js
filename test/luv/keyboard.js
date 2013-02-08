describe("luv.keyboard", function() {
  it("exists", function(){
    expect(Luv.Keyboard).to.be.a('function');
  });

  describe("methods", function(){
    var el, keyboard;

    beforeEach(function(){
      el = document.createElement('canvas');
      var focus = sinon.spy(el, 'focus');
      keyboard = new Luv.Keyboard(el);
      expect(el.tabIndex).to.equal(1);
      expect(focus).to.have.been.called;
    });

    describe("constructor", function(){
      it("assigns a tab index to the down element it receives", function() {
        expect(el.tabIndex).to.equal(1);
      });
    });

    describe(".onkeydown", function(){
      it("exists by default", function(){
        expect(keyboard.onkeydown).to.be.a('function');
      });

      it("gets called if keyup is called", function(){
        var keyPressed, codePressed;
        keyboard.onkeydown = function(key,code) {
          keyPressed = key;
          codePressed = code;
        };
        el.onkeydown({which: 32});
        expect(codePressed).to.equal(32);
        expect(keyPressed).to.equal(' ');
      });
    });

    describe(".onkeyup", function(){
      it("exists by default", function(){
        expect(keyboard.onkeyup).to.be.a('function');
      });

      it("gets called if keyup is called", function(){
        var keyReleased, codeReleased;
        keyboard.onkeyup = function(key,code) {
          keyReleased = key;
          codeReleased = code;
        };
        el.onkeyup({which: 32});
        expect(codeReleased).to.equal(32);
        expect(keyReleased).to.equal(' ');
      });
    });

    describe(".isDown", function(){
      it("returns true if a key is pressed, and false otherwise", function(){
        expect(keyboard.isDown(' ')).to.equal(false);

        el.onkeydown({which: 32});
        expect(keyboard.isDown(' ')).to.equal(true);

        el.onkeyup({which: 32});
        expect(keyboard.isDown(' ')).to.equal(false);
      });
    });

  }); // methods


});
