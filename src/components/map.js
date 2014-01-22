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

      if (!level.terrain) {
        throw new Error('Level object has no terrain property.');
      }

      this.length2d = level.terrain.length;
      this.baseHeight = level.baseHeight || 0;
      this.maxHeight = level.maxHeight || 0;

      var levelInfo = {
        length2d: this.length2d,
        baseHeight: this.baseHeight,
        maxHeight: this.maxHeight,
      };

      var terrain = level.terrain;
      this._normalizedMap = [];
      this._toggleTiles =  [];

      for (var y = 0; y < terrain.length; y++) {
        var row = [];
        this._normalizedMap.push(row);
        for (var x = 0; x < terrain[y].length; x++) {
          var tileInfo = terrain[y][x];
          if (tileInfo === null || tileInfo === undefined) {
            row.push(null);
            continue;
          }

          var maxZ;
          var floorType = this.defaultTile;
          if (typeof tileInfo === 'number') {
            maxZ = tileInfo;
          } else if (typeof tileInfo === 'object') {
            maxZ = tileInfo.level || 0;
            floorType = tileInfo.floor || this.defaultTile;
          } else {
            throw new Error('Unknown tile info type: ' + (typeof tileInfo));
          }
          var floor = this.tiles[floorType];

          var stack = [];
          for (var z = 0; z < maxZ; z++) {
            stack.push(Crafty.e('Tile').tile(x, y, z, this.tiles[this.defaultTile], levelInfo).place());
          }
          var topTile = Crafty.e('Tile').tile(x, y, maxZ, floor, levelInfo).place();
          stack.push(topTile);

          var normalizedTileInfo = {
            level: maxZ,
            floor: floor,
            tile: topTile,
            stack: stack,
          };
          row.push(normalizedTileInfo);
          if (floorType === 'red') {
            this._toggleTiles.push(normalizedTileInfo);
          }
        }
      }

      return this;
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

    getTileInfo: function(x, y) {
      var row = this._normalizedMap[y];
      if (row === null || row === undefined) {
        return null;
      }
      return this._normalizedMap[y][x];
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
