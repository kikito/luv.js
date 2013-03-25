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
      expect(function(){ Luv.Graphics.Animation('loop', {}, 1); }).to.Throw(Error);
      expect(function(){ Luv.Graphics.Animation('loop', [], 1); }).to.Throw(Error);
    });

    describe('when a number is used for the delays', function() {
      it('sets the same delays for all the sprites', function() {
        var a = Luv.Graphics.Animation('loop', [1,2,3], 4);
        expect([a.mode, a.timer, a.position, a.direction, a.status, a.sprites, a.delays]).to.deep.equal(
               ["loop", 0,       0,          1,          "playing", [1,2,3],   [4,4,4] ]
        );
      });
    });

    describe('when an array is used for the delays', function() {
      it('throws an error if the delays has not the same length as the sprites', function() {
        expect(function(){ Luv.Graphics.Animation('loop', [1,2,3], [1,2]); }).to.Throw(Error);
        expect(function(){ Luv.Graphics.Animation('loop', [1,2,3], [1,2,3,4]); }).to.Throw(Error);
      });
      it('accepts the array values as delays', function() {
        var a = Luv.Graphics.Animation('loop', [1,2,3], [4,5,6]);
        expect([a.mode, a.timer, a.position, a.direction, a.status, a.sprites, a.delays]).to.deep.equal(
               ["loop", 0,       0,          1,          "playing", [1,2,3],   [4,5,6] ]
        );
      });
    });

    describe('when an object is used for the delays', function() {

      describe('when the keys are integers', function() {
        it('uses the values as delays', function() {
          var a = Luv.Graphics.Animation('loop', [1,2,3], {0: 4, 1: 5, 2: 6});
          expect([a.mode, a.timer, a.position, a.direction, a.status, a.sprites, a.delays]).to.deep.equal(
                 ["loop", 0,       0,          1,          "playing", [1,2,3],   [4,5,6] ]
          );
        });
      });

      describe('when the keys are strings', function() {
        it('accepts ranges', function() {
          var a = Luv.Graphics.Animation('loop', [1,2,3,4], {'0-2': 2, 3: 3});
          expect([a.mode, a.timer, a.position, a.direction, a.status, a.sprites, a.delays]).to.deep.equal(
                 ["loop", 0,       0,          1,          "playing", [1,2,3,4],   [2,2,2,3] ]
          );
        });
      });

      it('throws an error if there are missing delays or too many delays', function() {
        expect(function(){ Luv.Graphics.Animation('loop', [1,2,3], {'0-1': 1}); }).to.Throw(Error);
        expect(function(){ Luv.Graphics.Animation('loop', [1,2,3], {'0-10': 1}); }).to.Throw(Error);
      });
    });


  });
});
