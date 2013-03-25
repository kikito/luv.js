describe('Luv.Graphics.Animation', function() {

  it("exists", function() {
    expect(Luv.Graphics.Animation).to.be.a('function');
  });

  describe("constructor", function() {

    it('throws an error if the mode is not valid', function() {
      expect(Luv.Graphics.Animation).to.Throw(Error);
      expect(function(){ Luv.Graphics.Animation('foo', [{}], 1); }).to.Throw(Error);
    });

    it('throws an error if no sprites were provided', function() {
      expect(function(){ Luv.Graphics.Animation({}, 1); }).to.Throw(Error);
      expect(function(){ Luv.Graphics.Animation([], 1); }).to.Throw(Error);
    });

    describe('when a number is used for the delays', function() {
      it('sets the same delays for all the sprites', function() {
        var a = Luv.Graphics.Animation([1,2,3], 4);
        expect(a.delays).to.deep.equal([4,4,4]);
      });
    });

    describe('when an array is used for the delays', function() {
      it('throws an error if the delays has not the same length as the sprites', function() {
        expect(function(){ Luv.Graphics.Animation([1,2,3], [1,2]); }).to.Throw(Error);
        expect(function(){ Luv.Graphics.Animation([1,2,3], [1,2,3,4]); }).to.Throw(Error);
      });
      it('accepts the array values as delays', function() {
        var a = Luv.Graphics.Animation([1,2,3], [4,5,6]);
        expect(a.delays).to.deep.equal([4,5,6]);
      });
    });

    describe('when an object is used for the delays', function() {
      describe('when the keys are integers', function() {
        it('uses the values as delays', function() {
          var a = Luv.Graphics.Animation([1,2,3], {0: 4, 1: 5, 2: 6});
          expect(a.delays).to.deep.equal([4,5,6]);
        });
      });

      describe('when the keys are strings', function() {
        it('accepts ranges', function() {
          var a = Luv.Graphics.Animation([1,2,3,4], {'0-2': 2, 3: 3});
          expect(a.delays).to.deep.equal([2,2,2,3]);
        });
      });

      it('throws an error if there are missing delays or too many delays', function() {
        expect(function(){ Luv.Graphics.Animation([1,2,3], {'0-1': 1}); }).to.Throw(Error);
        expect(function(){ Luv.Graphics.Animation([1,2,3], {'0-10': 1}); }).to.Throw(Error);
      });
    });

    describe('when delays is not a number, an array or an object', function() {
      it('tries to convert it to a number', function() {
        var a = Luv.Graphics.Animation([1,2,3], '1');
        expect(a.delays).to.deep.equal([1,1,1]);
      });
      it('throws an error if its not convertible to number', function() {
        expect(function() { Luv.Graphics.Animation([1,2,3], 'foo'); }).to.Throw(Error);
      });
    });
  });

  describe('.update', function() {
    var a;
    beforeEach(function() {
      a = Luv.Graphics.Animation([1,2,3,4], 1);
    });

    it('starts on the first frame', function() {
      expect(a.spriteIndex).to.equal(0);
    });

    it('does not update the frame until it is needed', function() {
      a.update(0.5);
      expect(a.spriteIndex).to.equal(0);

      a.update(0.5);
      expect(a.spriteIndex).to.equal(1);

      a.update(0.1);
      expect(a.spriteIndex).to.equal(1);
    });

    it('skips frames if needed', function() {
      a.update(2.1);
      expect(a.spriteIndex).to.equal(2);
    });

    describe('when a loop ends', function() {
      it('goes back to the first frame when the first loop ends', function() {
        a.update(4.5);
        expect(a.spriteIndex).to.equal(0);
      });

      it('invokes the endLoop callback as many times as needed', function() {
        var count = 0;
        a.loopEnded = function(){ count ++; };
        a.update(10);
        expect(count).to.equal(2);
      });
    });

  });

  describe('.gotoSprite', function() {
    it('updates the sprite index and the internal time counter', function() {
      var a = Luv.Graphics.Animation([1,2,3,4], 1);
      a.gotoSprite(2);
      expect(a.spriteIndex).to.equal(2);
      expect(a.time).to.equal(2);
    });
  });

});
