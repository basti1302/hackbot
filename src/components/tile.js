(function() {
  'use strict';

  Crafty.c('Tile', {
    init: function() {
      this.requires('IsoDomSprite');
    },

    tile: function(x, y, z, floor, levelInfo) {
      this.levelInfo = levelInfo;
      this.floor = floor;
      this.addComponent(this.floor);
      this.setLength2d(this.levelInfo.length2d)
      this.x2d = x;
      this.y2d = y;
      this.height = z;
      this._placeOnStage();

      // events for level editor
      if (game.editMode) {
        this.addComponent('Mouse, Keyboard');

        this.isSelected = false;
        this.floorMouseOver = floor + 'MouseOver';
        this.floorTileSelected = floor + 'TileSelected';

        this.bind('Click', function(e) {
          if (this.isDown('SHIFT')) {
            game.map.toggleStackSelectionStatus(x, y, true);
          } else {
            game.map.toggleStackSelectionStatus(x, y, false);
          }
        });
        this.bind('MouseOver', function(e) {
          if (!this.isSelected) {
            game.map.highlightStack(x, y);
          }
        });
        this.bind('MouseOut', function(e) {
          if (!this.isSelected) {
            game.map.unHighlightStack(x, y);
          }
        });
      }
      return this;
    },

    select: function() {
      this.removeComponent(this.floor);
      this.removeComponent(this.floorMouseOver);
      this.addComponent(this.floorTileSelected);
    },

    unSelect: function() {
      this.addComponent(this.floor);
      this.removeComponent(this.floorMouseOver);
      this.removeComponent(this.floorTileSelected);
    },

    highlight: function() {
      this.removeComponent(this.floor);
      this.addComponent(this.floorMouseOver);
    },

    unHighlight: function() {
      this.addComponent(this.floor);
      this.removeComponent(this.floorMouseOver);
    },

    _placeOnStage: function() {
      var pixelPosition = this._calcPixelCoords(this.x2d, this.y2d, this.height);
      var zIndex = this.calcLayer(this.x2d, this.y2d, this.height, this.levelInfo.maxHeight);
      this.attr({
        x: pixelPosition.x,
        y: pixelPosition.y,
        z: zIndex,
      });
    },

  });

})();
