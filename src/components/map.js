(function() {
  'use strict';

  Crafty.c('Map', {

    floorTypes: {
      floor: 'floor',
      targetInactive: 'targetInactive',
      targetActive: 'targetActive',
      ghost: 'ghost',
    },

    init: function() {
      this.defaultFloorType = this.floorTypes.floor;
    },

    map: function(level) {
      if (!isArray(level.terrain)) {
        throw new Error('level object has no terrain property or ' +
            'level.terrain is not an array.');
      }

      this._parseLevel(level);
      this._centerView();
      this._createTiles();
      return this;
    },

    _parseLevel: function(level) {
      this.levelInfo = {
        length2d: level.terrain.length,
        maxHeight: 0,
        widthInTiles: 0,
        xOffset: 0,
        yOffset: 0,
      };

      this._normalizedMap = [];
      this._targets =  [];
      var terrain = level.terrain;

      for (var y = 0; y < terrain.length; y++) {
        var row = terrain[y];
        if (!isArray(row)) {
          throw new Error('row ' + y + ' in level.terrain is not an array.');
        }

        var normalizedRow = [];
        this._normalizedMap.push(normalizedRow);
        for (var x = 0; x < row.length; x++) {
          var tileInfo = row[x];

          // handle spots where no tile is
          if (tileInfo === null || tileInfo === undefined) {
            normalizedRow.push(null);
            continue;
          }
          var normalizedTileInfo = this._normalizeTile(x, y, tileInfo);
          normalizedRow.push(normalizedTileInfo);
          this.levelInfo.maxHeight = Math.max(this.levelInfo.maxHeight, normalizedTileInfo.level);
        }
        this.levelInfo.widthInTiles = Math.max(this.levelInfo.widthInTiles, normalizedRow.length);
      }

      // So far, we have recorded the highest tile level. We need maxHeight for
      // the z index calculation. x and y coordinates are both multiplied by
      // maxHeight factor to ensure that both x and y influence the z index more
      // than the z coordinate in the isometric system. We need to add 1 because
      // the bot is always one level above the tile it is standing on (so if it
      // is standing on the highest tile it has level maxHeight +1). We need to
      // add one more so that it is guaranteed that x * maxHeight or y *
      // maxHeight are greater (and not only >=) than z for the highest possible
      // z (for the bot).
      this.levelInfo.maxHeight += 2;

      // if editing a level, we need enough headroom
      if (game.editMode) {
        this.levelInfo.maxHeight = 10;
      }

      // dimension of playing field in y-axis
      this.levelInfo.heightInTiles = this._normalizedMap.length;
    },

    _normalizeTile: function(x, y, tileInfo) {
      var tileLevel;
      var floorType = this.defaultFloorType;

      // parse level and floor type from tile info object
      if (typeof tileInfo === 'number') {
        // we allow tile info in incoming terrain definitions to be simple
        // numbers, interpreted as default floor type with the given level
        tileLevel = tileInfo;
      } else if (typeof tileInfo === 'object') {
        // otherwise it's an object with level and floor properties (both
        // optional)
        tileLevel = tileInfo.level || 0;
        floorType = tileInfo.floor || this.defaultFloorType;
        if (floorType === 'red') {
          floorType = this.floorTypes.targetInactive;
        }
        if (floorType === 'green') {
          floorType = this.floorTypes.targetActive;
        }
      } else {
        throw new Error('position (' + x + ', ' + y + ') has an unknown tile ' +
            'info type (' + (typeof tileInfo) + '): ' +
            JSON.stringify(tileInfo));
      }
      if (tileLevel < -1 || (!game.editMode && tileLevel < 0 )) {
        throw new Error('position (' + x + ', ' + y + ') has an illegal level of ' + tileLevel + '.');
      }
      if (!game.editMode && floorType === 'ghost') {
        throw new Error('position (' + x + ', ' + y + ') has floor type ' +
            'ghost (non-existing tile), which is only allowed in edit mode.');

      }
      var normalizedTileInfo = {
        x: x,
        y: y,
        level: tileLevel,
        floor: floorType,
      };

      // remember where red target tiles are that need to be toggled to win the
      // game
      if (floorType === this.floorTypes.targetInactive) {
        this._targets.push(normalizedTileInfo);
      }
      if (floorType === this.floorTypes.ghost) {
        normalizedTileInfo.floor = this.defaultFloorType;
        normalizedTileInfo.isGhost = true;
      }

      return normalizedTileInfo;
    },

    _createTiles: function() {
      for (var i = 0; i < this._normalizedMap.length; i++) {
        var normalizedRow = this._normalizedMap[i];
        for (var j = 0; j < normalizedRow.length; j++) {
          var tileInfo = normalizedRow[j];
          if (tileInfo) {
            if (!tileInfo.isGhost) {
              var stack = this._createTileStack(
                tileInfo.x,
                tileInfo.y,
                tileInfo.level,
                tileInfo.floor
              );
              tileInfo.stack = stack;
              tileInfo.tile = stack[stack.length - 1];
            } else {
              var ghostTile =
                  Crafty.e('Tile')
                  .tile(tileInfo.x, tileInfo.y, -1,
                        'ghost', this.levelInfo);
              tileInfo.stack = [ghostTile];
              tileInfo.tile = ghostTile;
            }
          }
        }
      }
    },

    _createTileStack: function(x, y, tileLevel, floorType) {
      var stack = [];
      for (var z = 0; z < tileLevel; z++) {
        // tiles below the top tile are always created with the default grey
        // floor type
        stack.push(Crafty.e('Tile').tile(x, y, z, this.defaultFloorType, this.levelInfo));
      }
      var topTile = Crafty.e('Tile').tile(x, y, tileLevel, floorType,
          this.levelInfo);
      stack.push(topTile);
      return stack;
    },

      // Calculate everything needed to center map on in viewport
    _centerView: function() {
      var mapWidthPx = 0;
      var mapHeightPx = 0;
      if (this.levelInfo.widthInTiles > 0 && this.levelInfo.heightInTiles > 0) {
        var upperRightCorner =
          Crafty
          .e('IsoTranslator')
          .setLength2d(this.levelInfo.length2d)
          ._calcPixelCoords(this.levelInfo.widthInTiles - 1, 0, this.levelInfo.maxHeight);
        var lowerLeftCorner =
          Crafty
          .e('IsoTranslator')
          .setLength2d(this.levelInfo.length2d)
          ._calcPixelCoords(0, this.levelInfo.heightInTiles - 1, 0);
        mapWidthPx = upperRightCorner.x - lowerLeftCorner.x;
        mapHeightPx = lowerLeftCorner.y - upperRightCorner.y;
      }
      this.levelInfo.xOffset = Math.floor((game.widthMapArea - mapWidthPx - game.baseSize) / 2);
      this.levelInfo.yOffset = Math.floor((game.heightMapArea - mapHeightPx - game.baseSize) / 2);
    },

    getTileInfo: function(x, y) {
      var row = this._normalizedMap[y];
      if (row === null || row === undefined) {
        return null;
      }
      return this._normalizedMap[y][x];
    },

    getTileZ: function(x, y) {
      return this._withTileInfo(x, y, function(tileInfo) {
        return tileInfo.level;
      });
    },

    /* only for testing purposes */
    _setTileZ: function(x, y, z) {
      if (!game.testMode) {
        throw new Error('_setTileZ must only be called in tests.');
      }
      this._withTileInfo(x, y, function(tileInfo) {
        tileInfo.level = z;
      });
    },

    removeTileStack: function(x, y) {
      this._withEachTileOfStack(x, y, function(tile) {
        tile.destroy();
      });
      this._normalizedMap[y][x] = null;
    },

    isTarget: function(x, y) {
      return this._withTileInfo(x, y, function(tileInfo) {
        return this._isTarget(tileInfo);
      });
    },

    _isTarget: function(tileInfo) {
      return tileInfo.floor === this.floorTypes.targetInactive ||
          tileInfo.floor === this.floorTypes.targetActive;
    },

    getTileType: function(x, y) {
      return this._withTileInfo(x, y, function(tileInfo) {
        return tileInfo.floor;
      });
    },

    toggleRedGreen: function(x, y) {
      this._withTileInfo(x, y, function(tileInfo) {
        this._toggleFloorType(tileInfo,
            this.floorTypes.targetInactive,
            this.floorTypes.targetActive
        );
      });
    },

    _toggleRedGrey: function(tileInfo) {
      this._toggleFloorType(tileInfo,
          this.floorTypes.floor,
          this.floorTypes.targetInactive
      );
    },

   _toggleFloorType: function(tileInfo, floorType1, floorType2) {
      if (tileInfo.floor === floorType1) {
        tileInfo.floor = floorType2;
        tileInfo.tile.setFloorType(floorType2);
      } else if (tileInfo.floor === floorType2) {
        tileInfo.floor = floorType1;
        tileInfo.tile.setFloorType(floorType1);
      }
   },

    _isDefaultFloor: function(tileInfo) {
      return tileInfo.floor === this.defaultFloorType;
    },

    _isTargetInactive: function(tileInfo) {
      return tileInfo.floor === this.floorTypes.targetInactive;
    },

    _isTargetActive: function(tileInfo) {
      return tileInfo.floor === this.floorTypes.targetActive;
    },

    reset: function() {
      for (var i = 0; i < this._targets.length; i++) {
        var tileInfo = this._targets[i];
        if (this._isTargetActive(tileInfo)) {
          tileInfo.floor = this.floorTypes.targetInactive;
          tileInfo.tile.setFloorType(this.floorTypes.targetInactive);
        }
      }
    },

    hasWon: function() {
      if (this._targets.length === 0) {
        return false;
      }
      for (var i = 0; i < this._targets.length; i++) {
        var tileInfo = this._targets[i];
        if (this._isTargetInactive(tileInfo)) {
          return false;
        }
      }
      return true;
    },

    /***************************************************************************
     * Level Editor related
     */

    toggleStackSelectionStatus: function(x, y, appendToSelection) {
      var selected;
      if (!appendToSelection) {
        // de-select all tiles
        this._withSelectedStacks(function(tileInfo) {
          // don't de-select the tile the user just clicked on (if it is
          // selected), this would break toggling of the selection on and off.
          if (tileInfo.x !== x || tileInfo.y !== y) {
            tileInfo.isSelected = false;
            tileInfo.tile.unSelect();
          }
        });
      }
      this._withTileInfo(x, y, function(tileInfo) {
        selected = tileInfo.isSelected = !tileInfo.isSelected;
      });
      this._withEachTileOfStack(x, y, function(tile) {
        if (selected) {
          tile.select();
        } else {
          tile.unSelect();
        }
      });
    },

    highlightStack: function(x, y) {
      this._withEachTileOfStack(x, y, function(tile, tileInfo) {
        if (!tileInfo.isSelected) {
          tile.highlight(x, y);
        }
      });
    },

    unHighlightStack: function(x, y) {
      this._withEachTileOfStack(x, y, function(tile, tileInfo) {
        if (!tileInfo.isSelected) {
          tile.unHighlight(x, y);
        }
      });
    },

    raiseSelected: function() {
      this._withSelectedStacks(function(tileInfo, x, y) {
        this._addTileOnTop(tileInfo, x, y);
      });
    },

    lowerSelected: function() {
      this._withSelectedStacks(function(tileInfo, x, y) {
        this._removeTopMostTile(tileInfo, x, y);
      });
    },

    toggleTargetForSelected: function() {
      this._withSelectedStacks(function(tileInfo) {
        if (tileInfo.isGhost) {
          return;
        }
        if (this._isTarget(tileInfo)) {
          // tile is target, convert to default floor
          tileInfo.floor = this.floorTypes.floor;
          // remove from target array
          var idx = this._targets.indexOf(tileInfo);
          if (idx >= 0) {
            this._targets.splice(idx, 1);
          }
        } else {
          // tile is not a target, convert to target
          tileInfo.floor = this.floorTypes.targetInactive;
          // add to target array
          this._targets.push(tileInfo);
        }
        tileInfo.tile.setFloorType(tileInfo.floor);
      });
    },

    _addTileOnTop: function(tileInfo, x, y) {
      if (!tileInfo) {
        // TODO create a new tile at x, y and add it to _normalizedMap
        return;
      }
      if (tileInfo.level > game.map.levelInfo.maxHeight - 2) {
        return;
      }

      // if the tile with the bot is raised, the bot needs to be raised, too
      if (x === game.bot.position.x && y === game.bot.position.y) {
        // but we also have a smaller upper bound for the height of the tile
        // stack, otherwise the bot entity is too high
        if ( tileInfo.level > game.map.levelInfo.maxHeight - 3) {
          return;
        }
        game.bot.position.z++;
        game.bot.setPosition(game.bot.position);
      }

      // If the tile is not standard floor, we need to convert the former top
      // tile to standard floor. The basic assumption (also when initializing/
      // loading a level) is, that only the top-most tile on a tile stack can be
      // non-standard floor (for example, a target tile), the tiles below are
      // always grey.
      if (!this._isDefaultFloor(tileInfo)) {
        tileInfo.tile.setFloorType(this.floorTypes.floor);
      }

      // raise level
      tileInfo.level++;

      // now create a new tile on top of the stack
      if (tileInfo.isGhost) {
        // empty floor, we need to create a new stack

        // destroy the ghost tile
        tileInfo.tile.destroy();
        // create a new stack
        tileInfo.stack = this._createTileStack(
          x,
          y,
          tileInfo.level,
          tileInfo.floor
         );
         // assign the top tile of the stack (stack has only one tile)
         tileInfo.tile = tileInfo.stack[0];
         if (tileInfo.isSelected) {
           tileInfo.tile.select();
         }
         tileInfo.isGhost = false;
      } else {
        // not empty floor, just add a tile on top of the stack
        var newTile = Crafty.e('Tile').tile(x, y, tileInfo.level,
            tileInfo.floor, this.levelInfo);
        if (tileInfo.isSelected) {
          newTile.select();
        }
        tileInfo.stack.push(newTile);
        tileInfo.tile = newTile;
      }
    },

    _removeTopMostTile: function(tileInfo, x, y) {
      if (!tileInfo) {
        return;
      }
      if (tileInfo.level < 0) {
        return;
      }

      // if the tile with the bot is lowered, the bot needs to be lowered, too.
      if (x === game.bot.position.x && y === game.bot.position.y) {
        game.bot.position.z--;
        game.bot.setPosition(game.bot.position);
      }

      if (tileInfo.level > 0) {
        if (tileInfo.stack.length < 2) {
          throw new Error('Inconsistent map state');
        }
        tileInfo.tile.destroy();
        tileInfo.tile = tileInfo.stack[tileInfo.stack.length - 2];
        tileInfo.stack = tileInfo.stack.slice(0, tileInfo.stack.length - 1);
        tileInfo.level--;

        // Restore the correct floor type on the tile below
        if (!this._isDefaultFloor(tileInfo)) {
          tileInfo.tile.setFloorType(tileInfo.floor);
        }
      } else if (tileInfo.level === 0) {
        // stack of tiles is empty, create a ghost tile underneath to visualize
        // the empty floor
        tileInfo.tile.destroy();
        var ghostTile =
            Crafty.e('Tile')
            .tile(x, y, -1, this.floorTypes.ghost, this.levelInfo);
        tileInfo.isGhost = true;
        if (tileInfo.isSelected) {
          ghostTile.select();
        }
        tileInfo.stack = [ghostTile];
        tileInfo.tile = ghostTile;
        tileInfo.level--;
      } else {
        throw new Error('tileInfo at ' + x + ', ' + y + ' has a weird level: '
          + tileInfo.level);
      }
    },

    _withTileInfo: function(x, y, fn) {
      var tileInfo = this.getTileInfo(x, y);
      if (tileInfo === null || tileInfo === undefined) {
        return;
      }
      return fn.call(this, tileInfo);
    },

    _withEachTileOfStack: function(x, y, fn) {
      this._withTileInfo(x, y, function(tileInfo) {
        for (var i = 0; i < tileInfo.stack.length; i++) {
          fn.call(this, tileInfo.stack[i], tileInfo);
        }
      });
    },

    _withSelectedStacks: function(fn) {
      if (!game.editMode) {
        throw new Error('only available in edit mode');
      }
      for (var i = 0; i < this._normalizedMap.length; i++) {
        var normalizedRow = this._normalizedMap[i];
        for (var j = 0; j < normalizedRow.length; j++) {
          var tileInfo = normalizedRow[j];
          if (tileInfo && tileInfo.isSelected) {
            fn.call(this, tileInfo, tileInfo.x, tileInfo.y);
          }
          // TODO if tileInfo == null call fn with (null, x, y)
        }
      }
    },

  });

  function isArray(obj) {
    if (obj === undefined || obj === null) {
      return false;
    } else if (Object.prototype.toString.call(obj) !== '[object Array]') {
      return false;
    }
    return true;
  }

})();
