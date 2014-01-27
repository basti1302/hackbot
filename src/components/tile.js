(function() {
  'use strict';

  Crafty.c('Tile', {
    init: function() {
      this.requires('IsoDomSprite');
    },

    tile: function(x, y, z, floor, levelInfo) {
      this.levelInfo = levelInfo;
      this.addComponent(floor);
      this.setLength2d(this.levelInfo.length2d)
      var pixelPosition = this._calcPixelCoords(x, y, z);
      this.attr({
          x: pixelPosition.x,
          y: pixelPosition.y
      });

      var zIndex = this.calcLayer(x, y, z, this.levelInfo.maxHeight);
      this.attr('z', zIndex);
      this.height = z;
      return this;
    },

  });

})();
