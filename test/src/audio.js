describe("Luv.Audio", function(){

  it("exists", function() {
    expect(Luv.Audio).to.be.a('function');
  });

  describe("constructor", function() {
    it("initializes the audio object", function() {
      var audio = Luv.Audio(Luv.Media());

      expect(audio.media).to.be.ok;
    });
  });

});

