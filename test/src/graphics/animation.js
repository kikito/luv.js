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

    it('sets the mode and delay for each sprite', function() {
      var anim = Luv.Graphics.Animation('loop', [1,2,3], 4);

      expect([anim.mode, anim.timer, anim.position, anim.direction, anim.status, anim.sprites, anim.delays]).to.deep.equal(
             ["loop",    0,          0,             1,              "playing",   [1,2,3],      [4,4,4] ]
      );

    });



  });
});
