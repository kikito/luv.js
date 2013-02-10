describe("Luv.Media", function(){
  it("exists", function(){
    expect(Luv.Media).to.be.a('function');
  });

  describe(".methods", function(){
    var media, source1, source2;
    beforeEach(function(){
      media   = new Luv.Media();
      source1 = new Image();
      source2 = new Image();
    });

    describe("Resource", function() {
      it("exists", function(){
        expect(media.Resource).to.be.a('function');
      });

      it("invokes a custom callback for when a resource is loaded", function(){
        var callback = sinon.spy();
        var resource = new media.Resource(source1, callback);
        trigger(source1, "load");
        expect(callback).to.have.been.calledWith(resource);
      });
    });

    describe(".onResourceLoaded(resource)", function(){
      it("is called when a new resource is loaded", function() {
        var onResourceLoaded = sinon.spy(media, 'onResourceLoaded');
        var resource = new media.Resource(source1);
        trigger(source1, "load");
        expect(onResourceLoaded).to.have.been.calledWith(resource);
      });
    });

    describe(".onLoadError(resource)", function(){
      it("throws an error by default", function() {
        var peter = {toString: function(){return "Peter"; }};
        expect(function(){ media.onLoadError(peter); }).to.Throw(Error);
      });

      it("is called when a new resource fails to load", function() {
        var onLoadError = sinon.stub(media, 'onLoadError');
        var resource = new media.Resource(source1);
        trigger(source1, "error");
        expect(onLoadError).to.have.been.calledWith(resource);
      });
    });

    describe(".onLoaded()", function(){
      it("is called when all resources are loaded", function() {
        var onLoaded = sinon.spy(media, 'onLoaded'),
            r1       = new media.Resource(source1),
            r2       = new media.Resource(source2);

        trigger(source1, "load");
        trigger(source2, "load");

        expect(onLoaded).to.have.been.calledOnce;
      });
    });

    describe(".isLoaded()", function(){
      it("returns true when all pending resources are loaded", function() {
        expect(media.isLoaded()).to.equal(true);
        var r1       = new media.Resource(source1),
            r2       = new media.Resource(source2);

        expect(media.isLoaded()).to.equal(false);

        trigger(source1, "load");
        expect(media.isLoaded()).to.equal(false);

        trigger(source2, "load");
        expect(media.isLoaded()).to.equal(true);
      });
    });

    describe(".getPending()", function(){
      it("is called when all ", function() {
        expect(media.getPending()).to.equal(0);
        var r1       = new media.Resource(source1),
            r2       = new media.Resource(source2);

        expect(media.getPending()).to.equal(2);

        trigger(source1, "load");
        expect(media.getPending()).to.equal(1);

        trigger(source2, "load");
        expect(media.getPending()).to.equal(0);
      });
    });

  }); // methods
});
