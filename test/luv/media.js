describe("Luv.Media", function(){
  it("exists", function(){
    expect(Luv.Media).to.be.a('function');
  });

  describe(".methods", function(){
    var media, source1, source2;
    beforeEach(function(){
      media   = new Luv.Media();
      source1 = {};
      source2 = {};
    });

    describe("Resource", function() {
      it("exists", function(){
        expect(media.Resource).to.be.a('function');
      });

      it("invokes a custom callback for when a resource is loaded", function(){
        var callback = sinon.spy();
        var resource = new media.Resource(source1, callback);
        source1.onload();
        expect(callback).to.have.been.calledWith(resource);
      });
    });

    describe(".onResourceLoaded(resource)", function(){
      it("is called when a new resource is loaded", function() {
        var onResourceLoaded = sinon.spy(media, 'onResourceLoaded');
        var resource = new media.Resource(source1);
        source1.onload();
        expect(onResourceLoaded).to.have.been.calledWith(resource);
      });
    });

    describe(".onLoaded()", function(){
      it("is called when all resources are loaded", function() {
        var onLoaded = sinon.spy(media, 'onLoaded'),
            r1       = new media.Resource(source1),
            r2       = new media.Resource(source2);

        source1.onload();
        source2.onload();

        expect(onLoaded).to.have.been.calledOnce;
      });
    });

    describe(".isLoaded()", function(){
      it("returns true when all pending resources are loaded", function() {
        expect(media.isLoaded()).to.equal(true);
        var r1       = new media.Resource(source1),
            r2       = new media.Resource(source2);

        expect(media.isLoaded()).to.equal(false);

        source1.onload();
        expect(media.isLoaded()).to.equal(false);

        source2.onload();
        expect(media.isLoaded()).to.equal(true);
      });
    });

    describe(".getPending()", function(){
      it("is called when all ", function() {
        expect(media.getPending()).to.equal(0);
        var r1       = new media.Resource(source1),
            r2       = new media.Resource(source2);

        expect(media.getPending()).to.equal(2);

        source1.onload();
        expect(media.getPending()).to.equal(1);

        source2.onload();
        expect(media.getPending()).to.equal(0);
      });
    });

  }); // methods
});
