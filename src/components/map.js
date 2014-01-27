(function() {
  'use strict';

  Crafty.c('Map', {

    init: function() {
      this.defaultTile = 'grey';
      this.tiles = {
        grey: 'SprFloorGrey',
        red: 'SprFloorRed',
        green: 'SprFloorGreen',
        blue: 'SprFloorBlue',
      }
    },

    map: function(level) {
      if (!this._isArray(level.terrain)) {
        throw new Error('level object has no terrain property or level.terrain is not an array.');
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
      this._toggleTiles =  [];
      var terrain = level.terrain;

      for (var y = 0; y < terrain.length; y++) {
        var row = terrain[y];
        if (!this._isArray(row)) {
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
      this.levelInfo.heightInTiles = this._normalizedMap.length;
    },

    _normalizeTile: function(x, y, tileInfo) {
      var tileLevel;
      var floorType = this.defaultTile;

      // parse level and floor type from tile info object
      if (typeof tileInfo === 'number') {
        // we allow tile info in incoming terrain definitions to be simple
        // numbers, interpreted as default floor type with the given level
        tileLevel = tileInfo;
      } else if (typeof tileInfo === 'object') {
        // otherwise it's an object with level and floor properties (both
        // optional)
        tileLevel = tileInfo.level || 0;
        floorType = tileInfo.floor || this.defaultTile;
      } else {
        throw new Error('position (' + x + ', ' + y + ') has an unknown tile info type (' + (typeof tileInfo) + '): ' + JSON.stringify(tileInfo));
      }
      if (tileLevel < 0) {
        throw new Error('position (' + x + ', ' + y + ') has an illegal level of ' + tileLevel + '.');
      }
      var floor = this.tiles[floorType];
      var normalizedTileInfo = {
        x: x,
        y: y,
        level: tileLevel,
        floor: floor,
      };

      // remember where red tiles are that need to be toggled to win the game
      if (floorType === 'red') {
        this._toggleTiles.push(normalizedTileInfo);
      }

      return normalizedTileInfo;
    },

    _createTiles: function() {
      for (var i = 0; i < this._normalizedMap.length; i++) {
        var normalizedRow = this._normalizedMap[i];
        for (var j = 0; j < normalizedRow.length; j++) {
          var tileInfo = normalizedRow[j];
          if (tileInfo) {
            var stack = this._createTileStack(
              tileInfo.x,
              tileInfo.y,
              tileInfo.level,
              tileInfo.floor
            );
            tileInfo.stack = stack;
            tileInfo.tile = stack[stack.length - 1];
          }
        }
      }
    },

    _createTileStack: function(x, y, tileLevel, floor) {
      var stack = [];
      for (var z = 0; z < tileLevel; z++) {
        stack.push(Crafty.e('Tile').tile(x, y, z, this.tiles[this.defaultTile], this.levelInfo));
      }
      var topTile = Crafty.e('Tile').tile(x, y, tileLevel, floor, this.levelInfo);
      stack.push(topTile);
      return stack;
    },

    _isArray: function(obj) {
      if (obj === undefined || obj === null) {
        return false;
      } else if (Object.prototype.toString.call(obj) !== '[object Array]') {
        return false;
      }
      return true;
    },

      // Calculate everything needed to center map on in viewport
    _centerView: function() {
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
      var mapWidthPx = upperRightCorner.x - lowerLeftCorner.x;
      var mapHeightPx = lowerLeftCorner.y - upperRightCorner.y;
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
      var tileInfo = this.getTileInfo(x, y);
      if (tileInfo === null || tileInfo === undefined) {
        return null;
      } else {
        return tileInfo.level;
      }
    },

    setTileZ: function(x, y, z) {
      var tileInfo = this.getTileInfo(x, y);
      if (tileInfo === null || tileInfo === undefined) {
        return null;
      } else {
        tileInfo.level = z;
      }
    },

    removeTile: function(x, y, z) {
      var tileInfo = this.getTileInfo(x, y);
      if (tileInfo === null || tileInfo === undefined) {
        return null;
      } else {
        for (var i = 0; i < tileInfo.stack.length; i++) {
          tileInfo.stack[i].destroy();
        }
        this._normalizedMap[y][x] = null;
      }
    },

    getTileType: function(x, y) {
      var tileInfo = this.getTileInfo(x, y);
      if (tileInfo === null || tileInfo === undefined) {
        return null;
      } else {
        return tileInfo.floor;
      }
    },

    toggleTileType: function(x, y) {
      var tileInfo = this.getTileInfo(x, y);
      if (tileInfo === null || tileInfo === undefined) {
        return;
      }
      if (this._isGreen(tileInfo)) {
        tileInfo.floor = this.tiles.red;
        tileInfo.tile.removeComponent(this.tiles.green);
        tileInfo.tile.addComponent(this.tiles.red);
      } else if (this._isRed(tileInfo)) {
        tileInfo.floor = this.tiles.green;
        tileInfo.tile.removeComponent(this.tiles.red);
        tileInfo.tile.addComponent(this.tiles.green);
      }
    },

    _isRed: function(tileInfo) {
      return tileInfo.floor === this.tiles.red;
    },

    _isGreen: function(tileInfo) {
      return tileInfo.floor === this.tiles.green;
    },

    reset: function() {
      for (var i = 0; i < this._toggleTiles.length; i++) {
        var tileInfo = this._toggleTiles[i];
        if (this._isGreen(tileInfo)) {
          tileInfo.floor = this.tiles.red;
          tileInfo.tile.removeComponent(this.tiles.green);
          tileInfo.tile.addComponent(this.tiles.red);
        }
      }
    },

    hasWon: function() {
      for (var i = 0; i < this._toggleTiles.length; i++) {
        var tileInfo = this._toggleTiles[i];
        if (this._isRed(tileInfo)) {
          return false;
        }
      }
      return true;
    },

  });
})();
