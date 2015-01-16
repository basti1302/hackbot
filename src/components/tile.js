(function() {
  'use strict';

  Crafty.c('Tile', {

    _spriteNames: {
      floor:   {
        base: 'SprFloorGrey',
        highlighted: 'SprFloorGreyMouseOver',
        selected: 'SprFloorGreyTileSelected',
      },
      targetInactive: {
        base: 'SprFloorRed',
        highlighted: 'SprFloorRedMouseOver',
        selected: 'SprFloorRedTileSelected',
      },
      targetActive: {
        base: 'SprFloorGreen',
        highlighted: 'SprFloorGreenMouseOver',
        selected: 'SprFloorGreenTileSelected',
      },
      ghost:  {
        base: 'SprFloorGhost',
        highlighted: 'SprFloorGhostMouseOver',
        selected: 'SprFloorGhostTileSelected',
      },
    },

    init: function() {
      this.requires('IsoDomSprite');
    },

    tile: function(x, y, z, floorType, levelInfo) {
      this.levelInfo = levelInfo;
      this._floorType = floorType;
      this.isSelected = false;
      this.isHighlighted = false;
      this._setSprite();
      this.setLength2d(this.levelInfo.length2d)
      this.x2d = x;
      this.y2d = y;
      this.height = z;
      this._placeOnStage();

      // events for level editor
      if (game.editMode) {
        this.addComponent('Mouse, Keyboard');

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

    _setSprite: function() {
      // Calculate new floor sprite
      var spriteList = this._spriteNames[this._floorType];
      if (!spriteList) {
        throw new Error('Could not find sprite list for floor type ' +
            this._floorType);
      }
      var sprite;
      if (this.isSelected) {
        sprite = spriteList.selected;
      } else if (this.isHighlighted) {
        sprite = spriteList.highlighted;
      } else {
        sprite = spriteList.base;
      }

      // If different from current floor sprite
      if (sprite !== this._sprite) {
        // remove current sprite, if any
        if (this._sprite) {
          this.removeComponent(this._sprite);
        }
        // set new sprite
        this.addComponent(sprite);
        this._sprite = sprite;
      }
    },

    setFloorType: function(floorType) {
      this._floorType = floorType;
      this._setSprite();
    },

    select: function() {
      this.isSelected = true;
      this._setSprite();
    },

    unSelect: function() {
      this.isSelected = false;
      this._setSprite();
    },

    highlight: function() {
      this.isHighlighted = true;
      this._setSprite();
    },

    unHighlight: function() {
      this.isHighlighted = false;
      this._setSprite();
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
