var AssetProto = {
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

var ImageProto = Object.create(AssetProto);

ImageProto.getWidth       = function() { return this.source.width; };
ImageProto.getHeight      = function() { return this.source.height; };
ImageProto.getDimensions  = function() {
  return { width: this.source.width, height: this.source.height };
};
ImageProto.toString       = function() {
  return 'Luv.Media.Image("' + this.path + '")';
};

var MediaProto = {
  isLoaded     : function() { return this.pending === 0; },
  getPending   : function() { return this.pending; },
  onAssetLoaded: function(asset) {},
  onLoadError  : function(asset) { throw new Error("Could not load " + asset); },
  onLoaded     : function() {},
  newAsset  : function(asset, loadCallback, errorCallback) {
    this.pending++;
    asset.loadCallback  = loadCallback;
    asset.errorCallback = errorCallback;
    asset.status        = "pending";
  },
  registerLoad : function(asset) {
    this.pending--;

    asset.status = "loaded";
    if(asset.loadCallback) { asset.loadCallback(asset); }

    this.onAssetLoaded(asset);
    if(this.isLoaded()) { this.onLoaded(); }
  },
  registerError: function(asset) {
    this.pending--;

    asset.status = "error";
    if(asset.errorCallback) { asset.errorCallback(asset); }

    this.onLoadError(asset);
  }
};

Luv.Media = function() {
  var media = Object.create(MediaProto);

  media.pending = 0;

  media.Image = function(path, loadCallback, errorCallback) {
    var image  = Object.create(ImageProto);
    image.path = path;

    media.newAsset(image, loadCallback, errorCallback);

    var source   = new Image(); // html image
    image.source = source;

    source.addEventListener('load',  function(){ media.registerLoad(image); });
    source.addEventListener('error', function(){ media.registerError(image); });
    source.src = path;

    return image;
  };

  return media;
};

