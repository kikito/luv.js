
var Resource = {
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};


Luv.Media = function() {
  this.pending = 0;

  var media = this;

  media.Resource = function(source, loadCallback, errorCallback) {
    media.pending++;

    var resource = this;
    resource.source = source;
    resource.status = "pending";

    resource.registerLoad = function() {
      media.pending--;
      resource.status = "loaded";
      if(loadCallback) { loadCallback(resource); }
      media.onResourceLoaded(resource);
      if(media.isLoaded()) { media.onLoaded(); }
    };

    resource.registerError = function(evt) {
      media.pending--;
      resource.status = "error";
      if(errorCallback) { errorCallback(resource); }
      media.onLoadError(resource, evt);
    };
  };

  media.Resource.prototype = Resource;
};

var media = Luv.Media.prototype;

media.isLoaded            = function() { return this.pending === 0; };
media.getPending          = function() { return this.pending; };
media.onResourceLoaded    = function(resource) {};
media.onLoadError         = function(resource) { throw new Error("Could not load " + resource); };
media.onLoaded            = function() {};
