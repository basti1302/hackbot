describe('The map', function() {
  'use strict';

  var expect = chai.expect;
  var map;

  before(function() {
    game.init(true);
  });

  beforeEach(function() {
    game.reset(true);
    map = Crafty.e('Map');
  });

  describe.only('initialization', function() {

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

    it.skip('should not accept map with terrain that is not an array', function() {
      try {
        map.map({ terrain: 'foobar' });
        chai.assert.fail();
      } catch (e) {
        expect(e.message).to.contain('terrain not an array');
      }
    });



    it.skip('should assume base height 0', function() {
    });

    it.skip('should figure out max height level', function() {
    });
  });

});
