describe('The map', function() {
  'use strict';

  var expect = chai.expect;
  var map;

  var defaultFloor;
  var redFloor;
  var greenFloor;

  before(function(done) {
    game.init(true);
    game.loadAssets(done);
  });

  after(function() {
    game.stop();
  });

  beforeEach(function() {
    game.reset(true);
    map = Crafty.e('Map');
    game.map = map;
    defaultFloor = map.tiles[map.defaultTile];
    redFloor = map.tiles['red'];
    greenFloor = map.tiles['green'];
  });

  describe('initialization', function() {

    it('should accept an empty map', function() {
      map.map({ terrain: [] });
    });

    it('should accept a single tile map', function() {
      map.map({ terrain: [[0]] });
      var tile = map.getTileInfo(0, 0);
      expect(tile).to.exist;
      expect(tile.level).to.equal(0);
      expect(tile.floor).to.equal('SprFloorGrey');

      expect(map.getTileInfo(-1, 0)).to.not.exist;
      expect(map.getTileInfo(0, -1)).to.not.exist;
      expect(map.getTileInfo(1, 0)).to.not.exist;
      expect(map.getTileInfo(0, 1)).to.not.exist;
    });

    it('should initialise a simple map', function() {
      var level = {
        terrain : [
          [0, 0],
          [0, 0],
        ],
      }
      map.map(level);
      var tile00 = map.getTileInfo(0, 0);
      var tile01 = map.getTileInfo(0, 1);
      var tile10 = map.getTileInfo(1, 0);
      var tile11 = map.getTileInfo(1, 1);
      [tile00, tile01, tile10, tile11].forEach(function(tile) {
        expect(tile).to.exist;
        expect(tile.level).to.equal(0);
        expect(tile.floor).to.equal('SprFloorGrey');
      });
      expect(map.getTileInfo(-1, 0)).to.not.exist;
      expect(map.getTileInfo(0, -1)).to.not.exist;
      expect(map.getTileInfo(2, 0)).to.not.exist;
      expect(map.getTileInfo(0, 2)).to.not.exist;
    });

    it('should not accept map without terrain', function() {
      try {
        map.map({});
        chai.assert.fail();
      } catch (e) {
        expect(e.message).to.contain('no terrain');
      }
    });

    it('should not accept map with terrain that is not an array', function() {
      try {
        map.map({ terrain: 'foobar' });
        chai.assert.fail();
      } catch (e) {
        expect(e.message).to.contain('terrain is not an array');
      }
    });

    it('each row needs to be an array', function() {
      try {
        map.map({ terrain: [0] });
        chai.assert.fail();
      } catch (e) {
        expect(e.message).to.contain('row 0');
        expect(e.message).to.contain('is not an array');
      }
    });

    it('should not accept negative level', function() {
      try {
        map.map({ terrain: [[-1]] });
        chai.assert.fail();
      } catch (e) {
        expect(e.message).to.contain('position (0, 0)');
        expect(e.message).to.contain('illegal level');
        expect(e.message).to.contain('-1');
      }
    });

    it('should not accept negative level from tile info', function() {
      try {
        map.map({ terrain: [[{ level: -1 }]] });
        chai.assert.fail();
      } catch (e) {
        expect(e.message).to.contain('position (0, 0)');
        expect(e.message).to.contain('illegal level');
        expect(e.message).to.contain('-1');
      }
    });

    it('tile must be either number or object', function() {
      try {
        map.map({ terrain: [['fail']] });
        chai.assert.fail();
      } catch (e) {
        expect(e.message).to.contain('position (0, 0)');
        expect(e.message).to.contain('unknown tile info type');
      }
    });

    it('should accept null tiles', function() {
      map.map({ terrain: [[null, 0]] });
      expect(map.getTileInfo(0, 0)).to.not.exist;
      checkTile(1, 0, 0, 'grey');
    });

    it('should figure out max height level', function() {
      var level = {
        terrain : [
          [2, 3],
        ],
      };
      map.map(level);
      expect(map.levelInfo.maxHeight).to.equal(5);
    });

    it('tile info objects should be normalized', function() {
      var level = {
        terrain : [
          [{ level: 1, floor: 'red' }, 1],
        ],
      };
      map.map(level);
      checkTile(0, 0, 1, 'red');
      checkTile(1, 0, 1, 'grey');
    });

    it('should figure out dimension in tiles', function() {
      var level = {
        terrain : [
          [null, 1],
          [0, 0],
          [0],
        ],
      };
      map.map(level);
      expect(map.levelInfo.widthInTiles).to.equal(2);
      expect(map.levelInfo.heightInTiles).to.equal(3);
    });
  });

  describe('map interaction', function() {

    beforeEach(function() {
      var level = {
        terrain : [
          [{ level: 0, floor: 'red' }, 1],
        ],
      };
      map.map(level);
    });

    it('should remove tile', function() {
      map.removeTile(1, 0);
      expect(map.getTileInfo(1, 0)).to.not.exist;
    });

    it('should get tile info', function() {
      var tileInfo = map.getTileInfo(0, 0);
      checkTile(0, 0, 0, 'red');
      checkTile(1, 0, 1, 'grey');
    });

    it('should get tile level', function() {
      expect(map.getTileZ(0, 0)).to.equal(0);
      expect(map.getTileZ(1, 0)).to.equal(1);
    });

    it('should get tile type', function() {
      expect(map.getTileType(0, 0)).to.equal(redFloor);
      expect(map.getTileType(1, 0)).to.equal(defaultFloor);
    });

    it('should toggle tile type', function() {
      expect(map.getTileType(0, 0)).to.equal(redFloor);
      map.toggleTileType(0, 0);
      expect(map.getTileType(0, 0)).to.equal(greenFloor);
      map.toggleTileType(0, 0);
      expect(map.getTileType(0, 0)).to.equal(redFloor);
    });

    it('should not toggle default tile type', function() {
      map.toggleTileType(1, 0);
      expect(map.getTileType(1, 0)).to.equal(defaultFloor);
    });

    it('should reset map', function() {
      expect(map.getTileType(0, 0)).to.equal(redFloor);
      map.toggleTileType(0, 0);
      expect(map.getTileType(0, 0)).to.equal(greenFloor);
      map.reset();
      expect(map.getTileType(0, 0)).to.equal(redFloor);
    });

    it('should not have won with red tiles', function() {
      expect(map.hasWon()).to.be.false;
    });

    it('should have won with no red tiles left', function() {
      map.toggleTileType(0, 0);
      expect(map.hasWon()).to.be.true;
    });
  });

  function checkTile(x, y, level, floor) {
    var tile = map.getTileInfo(x, y);
    expect(tile).to.exist;
    expect(tile.x).to.equal(x);
    expect(tile.y).to.equal(y);
    expect(tile.level).to.equal(level);
    expect(tile.floor).to.equal(map.tiles[floor]);
    expect(tile.stack).to.exist;
    expect(tile.stack.length).to.equal(level + 1);
    for (var i = 0; i < tile.stack.length - 1; i++) {
      var stackTile = tile.stack[i];
      expect(stackTile.has(defaultFloor)).to.be.true;
    }
    expect(tile.stack[tile.stack.length - 1].has(map.tiles[floor])).to.be.true;
    expect(tile.tile).to.exist;
    expect(tile.tile.has(map.tiles[floor])).to.be.true;
  }

});
