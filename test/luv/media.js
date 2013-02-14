describe("Luv.Media.Image", function() {
  var media;
  beforeEach(function(){ media = new Luv.Media(); });

  it("exists", function(){
    expect(media.Image).to.be.a('function');
  });

  it("invokes a custom callback when loaded", function(){
    var callback = sinon.spy();
    var image = new media.Image(null, callback);
    trigger(image.source, 'load');
    expect(callback).to.have.been.calledWith(image);
    expect(image.isLoaded()).to.be.True;
  });

  it("invokes a custom callback when fails to load", function(){
    media.onLoadError = sinon.stub();
    var callback = sinon.spy();
    var image = new media.Image(null, null, callback);
    trigger(image.source, 'error');
    expect(callback).to.have.been.calledWith(image);
    expect(media.onLoadError).to.have.been.calledWith(image);
    expect(image.isError()).to.be.True;
  });
});

describe("Luv.Media.Resource", function() {
  it("exists", function(){
    expect(Luv.Media.Resource).to.be.a('function');
  });

  it("invokes a custom callback when a resource is loaded", function(){
    var callback = sinon.spy();
    var resource = new Luv.Media.Resource({}, callback);
    resource.markAsLoadWithCallback();
    expect(callback).to.have.been.calledWith(resource);
    expect(resource.isLoaded()).to.be.True;
  });

  it("invokes a custom callback when a resource fails to load", function(){
    var callback = sinon.spy();
    var resource = new Luv.Media.Resource({}, null, callback);
    resource.markAsErrorWithCallback();
    expect(callback).to.have.been.calledWith(resource);
    expect(resource.isError()).to.be.True;
  });
});

describe("Luv.Media", function(){
  var media;
  beforeEach(function(){ media = new Luv.Media(); });

  it("exists", function(){
    expect(Luv.Media).to.be.a('function');
  });

  describe(".onResourceLoaded(resource)", function(){
    it("is called when a new resource is loaded", function() {
      var onResourceLoaded = sinon.spy(media, 'onResourceLoaded');
      var resource = new Luv.Media.Resource({});
      media.registerLoad(resource);
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
      var resource = new Luv.Media.Resource({});
      media.registerError(resource);
      expect(onLoadError).to.have.been.calledWith(resource);
    });
  });

  describe(".onLoaded()", function(){
    it("is called when all resources are loaded", function() {
      var onLoaded = sinon.spy(media, 'onLoaded'),
          r1       = media.registerNew(new Luv.Media.Resource({})),
          r2       = media.registerNew(new Luv.Media.Resource({}));

      media.pending = 2;
      media.registerLoad(r1);
      media.registerLoad(r2);

      expect(onLoaded).to.have.been.calledOnce;
    });
  });

  describe(".isLoaded()", function(){
    it("returns true when all pending resources are loaded", function() {
      expect(media.isLoaded()).to.equal(true);
      var r1       = media.registerNew(new Luv.Media.Resource({})),
          r2       = media.registerNew(new Luv.Media.Resource({}));

      expect(media.isLoaded()).to.equal(false);

      media.registerLoad(r1);
      expect(media.isLoaded()).to.equal(false);

      media.registerLoad(r2);
      expect(media.isLoaded()).to.equal(true);
    });
  });

  describe(".getPending()", function(){
    it("is called when all ", function() {
      expect(media.getPending()).to.equal(0);
      var r1       = media.registerNew(new Luv.Media.Resource({})),
          r2       = media.registerNew(new Luv.Media.Resource({}));
      media.pending = 2;

      media.registerLoad(r1);
      expect(media.getPending()).to.equal(1);

      media.registerLoad(r2);
      expect(media.getPending()).to.equal(0);
    });
  });

});
