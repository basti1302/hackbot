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

    setLength2d: function(length2d) {
      if (length2d == null || length2d < 1) {
        throw new Error('Illegal length2d: ' + length2d);
      }
      this.length2d = length2d;
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

    /*
     * Calculates the z-index for the DOM entity
     */
    // TODO There are no tests for this :-(
    calcLayer: function(x2d, y2d, z, maxZ) {
      var layer = 2 * (x2d * maxZ
                     + y2d * maxZ
                     + z);
      return layer;
    },

    /*
     * Calculates the z-index for a moving DOM entity, that will cause the
     * moving entity to be shown in the correct z plane when moving from
     * positionFrom to positionTo
     */
    // TODO This method is broken and there are no tests :-(
    calcLayerMoving: function(positionFrom, positionTo, maxZ) {
      // TODO Z-INDEX IS BROKEN FOR MOVING BOT when bot is on level 0 and bot is
      // moving behind a tile with height 1 or higher. During the tween phase
      // the bot sprite "shines" through the higher tile before him. This only
      // occurs with map.baseHeight <= -2. With map.baseHeight >= 3, the bot is
      // below the floor sometimes ?!?!?!?!

      var layerFrom = this.calcLayer(positionFrom.x, positionFrom.y, positionFrom.z, maxZ);
      var layerTo = this.calcLayer(positionTo.x, positionTo.y, positionTo.z, maxZ);
      return Math.max(layerFrom, layerTo) + 1;
    },

    /*
    moveViewPoint: function(viewPointDeltaX, viewPointDeltaY) {
      var center = this.iso.centerAt();
      console.log(JSON.stringify(center, null, 2));
      center = this.iso.px2pos(center.left, center.top);
      console.log(JSON.stringify(center, null, 2));
      center.x = Math.floor(center.x);
      center.y = Math.floor(center.y);
      console.log(center.x + viewPointDeltaX);
      console.log(center.y + viewPointDeltaY);
      this.iso.centerAt(center.x + viewPointDeltaX, center.y + viewPointDeltaY);
      console.log('YYY');
      var center = this.iso.centerAt();
      console.log(JSON.stringify(center, null, 2));
    },
    */

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
