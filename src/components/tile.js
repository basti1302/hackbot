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
      this.toIso(x, y);
      var zIndex = this.calcLayer(x, y, z, this.levelInfo.maxHeight);
      this.attr('z', zIndex);
      this.height = z;
      return this;
    },

    place: function() {
      game.iso.place(this.xIso, this.yIso, this.height + this.levelInfo.baseHeight, this);
      return this;
    },

  });

})();
