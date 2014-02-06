(function() {
  'use strict';

  /*
   * Component to translate coordinates between a 2D grid system with finite
   * length (finite range of y-coordinates) and the coordinate system used by
   * Crafty.isometric.
   *
   *
   * The isometric coordinate system used by Crafty isometric looks like this:
   *
   *     |  0   |  1  |  2  |  3  |
   *   -------------------------------> x-axis
   *   |   ^     ^     ^     ^
   *   |  / \   / \   / \   / \
   *   | /   \ /   \ /   \ /   \
   * 0 |X 0,0 X 1,0 X 2,0 X 3,0 X
   *   | \   / \   / \   / \   / \
   *   |  \ /   \ /   \ /   \ /   \
   * 1 |   X 0,1 X 1,1 X 2,1 X 3,1 X
   *   |  / \   / \   / \   / \   /
   *   | /   \ /   \ /   \ /   \ /
   * 2 |X 0,2 X 1,2 X 2,2 X 3,2 X
   *   | \   / \   / \   / \   / \
   *   |  \ /   \ /   \ /   \ /   \
   * 3 |   X 0,3 X 1,3 X 2,3 X 3,3 X
   *   |  / \   / \   / \   / \   /
   *   | /   \ /   \ /   \ /   \ /
   * 4 |X 0,4 X 1,4 X 2,4 X 3,4 X
   *   | \   / \   / \   / \   /
   *   |  \ /   \ /   \ /   \ /
   *   |   V     V     V     V
   *   |
   *   v
   * y-axis
   *
   *
   * The 2D coordinates origin (0, 0) is assumed to be in the upper left corner.
   * The x axis goes to the right, the y axis down. This is how it looks like:
   *
   *     0      1     2     3
   *   -------------------------
   * 0 | 0,0 | 1,0 | 2,0 | 3,0 |
   *   -------------------------
   * 1 | 0,1 | 1,1 | 2,1 | 3,1 |
   *   -------------------------
   * 2 | 0,2 | 1,2 | 2,2 | 3,2 |
   *   -------------------------
   * 3 | 0,3 | 1,3 | 2,3 | 3,3 |
   *   -------------------------
   * 4 | 0,4 | 1,4 | 2,4 | 3,4 |
   *   -------------------------
   *
   *
   * Assuming a finite 2D grid of length 5 (y-coordinates 0 to 4), this is how
   * 2D coordinates are mapped to the isometric grid. The pair in each cell
   * represent the 2D grid coordinates for the given isometric field.
   *
   *     |  0   |  1  |  2  |  3  |
   *   -------------------------------> x-axis
   *   |               ^
   *   |              / \
   *   |             /   \
   * 0 |            X 0,0 X
   *   |           / \   / \
   *   |          /   \ /   \
   * 1 |         X 0,1 X 1,0 X
   *   |        / \   / \   / \
   *   |       /   \ /   \ /   \
   * 2 |      X 0,2 X 1,1 X 2,0 X
   *   |     / \   / \   / \   / \
   *   |    /   \ /   \ /   \ /   \
   * 3 |   X 0,3 X 1,2 X 2,1 X 3,0 X
   *   |  / \   / \   / \   / \   /
   *   | /   \ /   \ /   \ /   \ /
   * 4 |X 0,4 X 1,3 X 2,2 X 3,1 X
   *   | \   / \   / \   / \   /
   *   |  \ /   \ /   \ /   \ / .
   * 5 |   X 1,4 X 2,3 X 3,2 X   .
   *   |    \   / \   / \   /     .
   *   |     \ /   \ /   \ / .
   * 6 |      X 2,4 X 3,3 X   .
   *   |       \   / \   /     .
   *   |        \ /   \ / .
   * 7 |         X 3,4 X   .
   *   |          \   /     .
   *   |           \ / .
   * 8 |            X   .
   *   |                 .
   *   |
   *   v
   * y-axis
   *
   *
   * Vice versa this is how the isometric coordinates are mapped to the 2D grid.
   * The values in each cell represent the isometric coordinates for the given
   * 2D grid field.
   *
   *      0      1     2     3
   *   -------------------------
   * 0 | 2,0 | 2,1 | 3,2 | 3,3 | ...
   *   -------------------------
   * 1 | 1,1 | 2,2 | 2,3 | 3,4 | ...
   *   -------------------------
   * 2 | 1,2 | 1,3 | 2,4 | 2,5 | ...
   *   -------------------------
   * 3 | 0,3 | 1,4 | 1,5 | 2,6 | ...
   *   -------------------------
   * 4 | 0,4 | 0,5 | 1,6 | 1,7 | ...
   *   -------------------------
   *
   */
  Crafty.c('IsoTranslator', {

    // TODO Make this setLevelInfo with length2d and maxHeight
    setLength2d: function(length2d) {
      if (length2d == null || length2d < 0) {
        throw new Error('Illegal length2d: ' + length2d);
      }
      if (length2d % 2 === 0) {
        this.length2d = length2d + 1;
      } else {
        this.length2d = length2d;
      }
      return this;
    },

    /*
     * Takes 2D grid x and y coordinates and sets the corresponding coordinates
     * for Crafty.isometric's grid system as this.xIso and this.yIso.
     *
     * Returns this.
     */
    toIso: function(x, y) {
      checkPreconditions(this.length2d, x, y);
      if (y >= this.length2d) {
        throw new Error('Illegal y, greater or equal to length2d: ' + y);
      }

      this.xIso = Math.floor((this.length2d + x - y - 1) / 2);
      this.yIso = x + y;
      return this;
    },

    /*
     * Takes Crafty.isometric's grid system x and y coordinates and returns the
     * corresponding coordinates in the 2D grid. If no arguments are provided,
     * this.xIso and this.yIso are used as the isometric coordinates.
     */
    to2d: function(xIso, yIso) {
      if (yIso == null) {
        yIso = this.yIso;
      }
      if (xIso == null) {
        xIso = this.xIso;
      }
      checkPreconditions(this.length2d, xIso, yIso);

      var coordinates2d = {};
      coordinates2d.x = xIso + Math.ceil((yIso - this.length2d + 1) / 2);
      coordinates2d.y = yIso - coordinates2d.x;
      return coordinates2d;
    },

    _calcPixelCoords: function(x, y, z, zPxPosition) {
      this.toIso(x, y);
      var pos = game.iso.pos2px(this.xIso, this.yIso);
      // pos.top -= z * (this._tile.height / 2);
      pos.top -= z * game.pixelPerHeightLevel;
      if (!(zPxPosition === null || zPxPosition === undefined)) {
        pos.top += zPxPosition;
      }
      return {
          x: pos.left + game.map.levelInfo.xOffset,
          y: pos.top + game.map.levelInfo.yOffset,
      };
    },


    /*
     * Calculates the z-index for the DOM entity
     */
    // TODO There are no tests for this :-(
    calcLayer: function(x2d, y2d, z, maxHeight) {
      // z-index calculation only works reliably if z < maxHeight
      if (z >= maxHeight) {
        throw new Error('Illegal z: ' + z + ' >= maxHeight: ' + maxHeight);
      }

      // We need to make sure that
      // * a tile with greater x and y coordinates is always visible before a
      // tile with smaller x and y (no matter the z coordinates)
      // * a tile with greater x is visible before a tile with lower x when y is
      // smaller or equal
      // * a tile with greater y is visible before a tile with lower y when x is
      // smaller or equal
      // * we have at least a difference of two between the z-index of two
      // different tiles, even with maxHeight == 0, so we can fit the bot's
      // z-index in between the z-index of two tiles.
      var layer =
        2 * (x2d * maxHeight
           + y2d * maxHeight
           + z);
      return layer;
    },

    /*
     * Calculates the z-index for a moving DOM entity, that will cause the
     * moving entity to be shown in the correct z plane when moving from
     * positionFrom to positionTo
     */
    calcLayerMoving: function(positionFrom, positionTo, maxZ) {

      // To assign a reasonable z-index to the bot when it's moving we calculate
      // the z-index for the position where the movement starts and where it
      // ends and take the max of the two. Since the bot only moves 1 field per
      // step that works. The only situation where a problem arises is when the
      // bot moves up or left and the tiles directly before the bot's target
      // position (x+1 or y+1) are one level higher. In this case they have the
      // same level as the bot and so can have the same z-index. To work around
      // this problem we subtract 1 from the bot's z-index. Since the z-index of
      // the tiles always are calculated as multiples of 2, this works.
      var layerFrom = this.calcLayer(positionFrom.x, positionFrom.y, positionFrom.z, maxZ);
      var layerTo = this.calcLayer(positionTo.x, positionTo.y, positionTo.z, maxZ);
      return Math.max(layerFrom, layerTo) - 1;
    },

  });

  function checkPreconditions(length2d, x, y) {
    if (length2d == null) {
      throw new Error('2d grid length (range of y-coordinates) is not set');
    }
    if (x == null || x < 0) {
      throw new Error('Illegal x: ' + x);
    }
    if (y == null || y < 0) {
      throw new Error('Illegal y: ' + y);
    }
  }

})();
