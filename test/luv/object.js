describe('Luv.Object', function() {
  it("exists", function() {
    expect(Luv.Object).to.be.a('Object');
  });

  describe('.getType', function(){
    it("returns the expected string", function() {
      expect(Luv.Object.getType()).to.equal('Luv.Object');
    });
  });

  describe('.toString', function(){
    it("returns the type by default", function() {
      expect(Luv.Object.toString()).to.equal('Luv.Object');
    });
  });

  describe('.include', function() {
    it("copies properties inside an object", function() {
      var obj = Luv.Object.extend();
      obj.include({bar: 'baz'});
      expect(obj.bar).to.equal('baz');
      expect(obj.include()).to.equal(obj);
    });
  });

  describe('.extend', function() {
    it("creates new objects with metamethods in Luv.Object", function() {
      var obj = Luv.Object.extend();
      expect(obj.getType()).to.equal('Luv.Object');
    });

    it("copies properties from the given param", function() {
      var obj = Luv.Object.extend({foo: 'bar'});
      expect(obj.foo).to.equal('bar');
    });
  });

});
