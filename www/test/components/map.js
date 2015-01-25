describe('The map', function() {
  'use strict';

  var expect = chai.expect;
  var map;

  var defaultFloorType;
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
    defaultFloorType = map.defaultFloorType;
    redFloor = map.floorTypes.targetInactive;
    greenFloor = map.floorTypes.targetActive;
  });

  describe('initialization', function() {

    it('should accept an empty map', function() {
      map.map({ terrain: [] });
    });

    it('should accept a single tile map', function() {
      map.map({ terrain: [[0]] });
      var tileInfo = map.getTileInfo(0, 0);
      expect(tileInfo).to.exist;
      expect(tileInfo.level).to.equal(0);
      expect(tileInfo.floor).to.equal(map.floorTypes.floor);
      expect(tileInfo.tile._floorType).to.equal(map.floorTypes.floor);
      expect(tileInfo.tile._sprite).to.equal('SprFloorGrey');

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
      var tileInfo00 = map.getTileInfo(0, 0);
      var tileInfo01 = map.getTileInfo(0, 1);
      var tileInfo10 = map.getTileInfo(1, 0);
      var tileInfo11 = map.getTileInfo(1, 1);
      [tileInfo00, tileInfo01, tileInfo10, tileInfo11].forEach(function(tileInfo) {
        expect(tileInfo).to.exist;
        expect(tileInfo.level).to.equal(0);
        expect(tileInfo.floor).to.equal(map.floorTypes.floor);
        expect(tileInfo.tile._floorType).to.equal(map.floorTypes.floor);
        expect(tileInfo.tile._sprite).to.equal('SprFloorGrey');
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
      checkTile(1, 0, 0, map.floorTypes.floor);
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
      checkTile(0, 0, 1, map.floorTypes.targetInactive);
      checkTile(1, 0, 1, map.floorTypes.floor);
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
      map.removeTileStack(1, 0);
      expect(map.getTileInfo(1, 0)).to.not.exist;
    });

    it('should get tile info', function() {
      var tileInfo = map.getTileInfo(0, 0);
      checkTile(0, 0, 0, map.floorTypes.targetInactive);
      checkTile(1, 0, 1, map.floorTypes.floor);
    });

    it('should get tile level', function() {
      expect(map.getTileZ(0, 0)).to.equal(0);
      expect(map.getTileZ(1, 0)).to.equal(1);
    });

    it('should get tile type', function() {
      expect(map.getTileType(0, 0)).to.equal(redFloor);
      expect(map.getTileType(1, 0)).to.equal(defaultFloorType);
    });

    it('should toggle tile type', function() {
      expect(map.getTileType(0, 0)).to.equal(redFloor);
      map.toggleRedGreen(0, 0);
      expect(map.getTileType(0, 0)).to.equal(greenFloor);
      map.toggleRedGreen(0, 0);
      expect(map.getTileType(0, 0)).to.equal(redFloor);
    });

    it('should not toggle default tile type', function() {
      map.toggleRedGreen(1, 0);
      expect(map.getTileType(1, 0)).to.equal(defaultFloorType);
    });

    it('should reset map', function() {
      expect(map.getTileType(0, 0)).to.equal(redFloor);
      map.toggleRedGreen(0, 0);
      expect(map.getTileType(0, 0)).to.equal(greenFloor);
      map.reset();
      expect(map.getTileType(0, 0)).to.equal(redFloor);
    });

    it('should not have won with red tiles', function() {
      expect(map.hasWon()).to.be.false;
    });

    it('should have won with no red tiles left', function() {
      map.toggleRedGreen(0, 0);
      expect(map.hasWon()).to.be.true;
    });
  });

  function checkTile(x, y, level, floorType, sprite) {
    var tileInfo = map.getTileInfo(x, y);
    expect(tileInfo).to.exist;
    expect(tileInfo.x).to.equal(x);
    expect(tileInfo.y).to.equal(y);
    expect(tileInfo.level).to.equal(level);
    expect(tileInfo.floor).to.equal(floorType);
    expect(tileInfo.stack).to.exist;
    expect(tileInfo.stack.length).to.equal(level + 1);
    for (var i = 0; i < tileInfo.stack.length - 1; i++) {
      var stackTile = tileInfo.stack[i];
      expect(stackTile._floorType).to.equal(map.defaultFloorType);
      expect(stackTile.has('SprFloorGrey')).to.be.true;
    }
    var topTile = tileInfo.stack[tileInfo.stack.length - 1];
    expect(topTile._floorType).to.equal(floorType);
    expect(tileInfo.tile).to.exist;
    expect(tileInfo.tile._floorType).to.equal(floorType);
  }

});
