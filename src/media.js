// # media.js
(function() {
// ## Luv.Media
Luv.Media = function() {
  // This function creates the `media` object when you create a luv game. It's usually
  // instantiated by the Luv function.

  //       var luv = Luv();
  //       luv.media // this is the media object

  // The media object is an "asset manager". It keeps track of those
  // assets (i.e. images) that load asynchronously, or can fail to load.
  //
  return Luv.create(MediaModule, { pending: 0 });
};

// ## Media Methods
var MediaModule = Luv.module('Luv.Media', {
  // `isLoaded` returns `true` if all the assets have been loaded, `false` if there are assets still being loaded.
  // Useful to wait actively until all assets are finished loading:

  //       var luv = Luv();
  //       var dogImage;
  //       luv.load = function() {
  //         dogImage = luv.graphics.Image('dog.png');
  //       }
  //       luv.draw = function() {
  //         // wait until all images are loaded before drawing anything
  //         if(!luv.media.isLoaded()) { return; }
  //         luv.graphics.drawImage(dogImage, 100, 100);
  //       }
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

  // `onAssetError` is an overridable callback that will be called when an asset can not be loaded (for example,
  // the path to an image does not exist)
  // By default, it throws an error
  onAssetError  : function(asset) { throw new Error("Could not load " + asset); },

  // `onLoaded` is an overridable callback that will be called when the last pending asset is finished loading
  // you can use it instead of `isLoaded` to control the game flow
  onLoaded     : function() {},

  // Pseudo-Internal function. Registers the asset in the media object.
  newAsset  : function(asset) {
    this.pending++;
    asset.status        = "pending";
  },

  // Pseudo-internal function. Assets that have been loaded successfully should call this function
  // (this will trigger onAssetLoaded, etc)
  registerLoad : function(asset) {
    this.pending--;

    asset.status = "loaded";

    this.onAssetLoaded(asset);
    if(this.isLoaded()) { this.onLoaded(); }
  },

  // Pseudo-internal function. Assets that can't be loaded must invoke this method
  registerError: function(asset) {
    this.pending--;

    asset.status = "error";

    this.onAssetError(asset);
  }
});

// This just a method holding object, to be extended by specialized assets
// like Image or Sound. Usage:

//       Luv.extend(MyAwesomeAsset, Luv.Media.Asset)

// See `Luv.Graphics.Image` for an example.
Luv.Media.Asset = {
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

}());


