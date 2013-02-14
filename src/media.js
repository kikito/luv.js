Luv.Media = function() {
  this.pending = 0;

  var media = this;

  media.Image = function(src, loadCallback, errorCallback) {
    Luv.Media.Image.call(this, media, src, loadCallback, errorCallback);
  };
  media.Image.prototype = Luv.Media.Image.prototype;
};

var media = Luv.Media.prototype;

media.isLoaded         = function() { return this.pending === 0; };
media.getPending       = function() { return this.pending; };
media.onResourceLoaded = function(resource) {};
media.onLoadError      = function(resource) { throw new Error("Could not load " + resource); };
media.onLoaded         = function() {};

media.registerNew = function(resource) {
  this.pending++;
  return resource;
};
media.registerLoad = function(resource) {
  this.pending--;
  this.onResourceLoaded(resource);
  if(this.isLoaded()) { this.onLoaded(); }
};
media.registerError = function(resource) {
  this.pending--;
  this.onLoadError(resource);
};

////

Luv.Media.Resource = function(source, loadCallback, errorCallback) {
  this.source         = source;
  this.loadCallback   = loadCallback;
  this.errorCallback  = errorCallback;
  this.status         = "pending";
};

Luv.Media.Resource.prototype = {
  markAsLoadWithCallback: function() {
    this.status = "loaded";
    if(this.loadCallback) { this.loadCallback(this); }
  },
  markAsErrorWithCallback: function() {
    this.status = "error";
    if(this.errorCallback) { this.errorCallback(this); }
  },
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

////

Luv.Media.Image = function(media, src, loadCallback, errorCallback) {
  var image = this,         // Luv image
      source = new Image(); // html image

  Luv.Media.Resource.call(this, source, loadCallback, errorCallback);

  source.addEventListener('load',  function(){
    image.markAsLoadWithCallback();
    media.registerLoad(image);
  });
  source.addEventListener('error', function(){
    image.markAsErrorWithCallback();
    media.registerError(image);
  });
  media.registerNew(this);

  source.src = src;
};

Luv.Media.Image.prototype = new Luv.Media.Resource();

Luv.Media.Image.prototype.getWidth       = function()  { return this.source.width; };
Luv.Media.Image.prototype.getHeight      = function() { return this.source.height; };
Luv.Media.Image.prototype.getDimensions  = function() {
  return {width: this.source.width, height: this.source.height};
};
