// # media.js

// ## Luv.Media
Luv.Media = function() {
  // This function creates the `media` object when you create a luv game. It's usually
  // instantiated by the Luv function.

  //       var luv = Luv();
  //       luv.media // this is the media object
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

// ## MediaProto
// Contains the methods of the luv.media object
var MediaProto = {
  // `isLoaded` returns `true` if all the assets have been loaded, `false` if there are assets still being loaded
  isLoaded     : function() { return this.pending === 0; },

  // Returns the numbers of assets that are loading, but not yet ready
  getPending   : function() { return this.pending; },

  // `onAssetLoaded` is an overridable callback.
  // It will be called once for each asset (Image, Sound, etc) that is loaded.
  // You may use it for things like displaing a "loaded percentage"

  //       luv.media.onAssetLoaded = function(asset) {
  //         assetsLoaded += 1;
  //       };
  onAssetLoaded: function(asset) {},

  // `onLoadError` is an overridable callback that will be called when an asset can not be loaded (for example,
  // the path to an image does not exist)
  // By default, it throws an error
  onLoadError  : function(asset) { throw new Error("Could not load " + asset); },

  // `onLoaded` is an overridable callback that will be called when the last pending asset is finished loading
  // you can use it instead of `isLoaded` to control the game flow
  onLoaded     : function() {},

  // Pseudo-Internal function. Registers the asset in the media object.
  newAsset  : function(asset, loadCallback, errorCallback) {
    this.pending++;
    asset.loadCallback  = loadCallback;
    asset.errorCallback = errorCallback;
    asset.status        = "pending";
  },

  // Pseudo-internal function. Assets that have been loaded successfully should call this function
  // (this will trigger onAssetLoaded, etc)
  registerLoad : function(asset) {
    this.pending--;

    asset.status = "loaded";
    if(asset.loadCallback) { asset.loadCallback(asset); }

    this.onAssetLoaded(asset);
    if(this.isLoaded()) { this.onLoaded(); }
  },

  // Pseudo-internal function. Assets that can't be loaded must invoke this method
  registerError: function(asset) {
    this.pending--;

    asset.status = "error";
    if(asset.errorCallback) { asset.errorCallback(asset); }

    this.onLoadError(asset);
  }
};

// ## Luv.Media.Asset
// This is the superclass of all media assets. It's not supposed to be instantiated, it's just a method holding object
var Asset = {
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};
Luv.Media.Asset = Asset;

// Internal object used by the images created inside Luv.Media()
var ImageProto = Object.create(Asset);

ImageProto.getWidth       = function() { return this.source.width; };
ImageProto.getHeight      = function() { return this.source.height; };
ImageProto.getDimensions  = function() {
  return { width: this.source.width, height: this.source.height };
};
ImageProto.toString       = function() {
  return 'Luv.Media.Image("' + this.path + '")';
};


