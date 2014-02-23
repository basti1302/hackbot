describe('Z-Index in the isometric grid', function() {

  'use strict';

  var expect = chai.expect;

  var levelInfo = {
    length2d: 4,
    maxHeight: 6,
  };
  var floor = 'SprFloorGrey';

  var tile1;
  var tile2;
  var tiles;
  var bot;

  before(function(done) {
    game.init(true);
    game.loadAssets(done);
    game.map = {
      levelInfo: levelInfo,
    };
  });

  after(function() {
    game.stop();
  });

  beforeEach(function() {
    game.reset(true);
    tile1 = Crafty.e('Tile');
    tile2 = Crafty.e('Tile');
    bot = Crafty.e('Bot');
    bot.subStepDuration = 1;
  });

  describe('for tiles', function() {

    it('z-index should be greater when x is greater (same y, same z)', function() {
      tile1.tile(2, 1, 4, floor, levelInfo);
      tile2.tile(1, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when y is greater (same x, same z)', function() {
      tile1.tile(1, 2, 4, floor, levelInfo);
      tile2.tile(1, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when z is greater (same x, same y)', function() {
      tile1.tile(1, 1, 4, floor, levelInfo);
      tile2.tile(1, 1, 3, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when x and y are greater (same z)', function() {
      tile1.tile(2, 2, 4, floor, levelInfo);
      tile2.tile(1, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when x and z are greater (same y)', function() {
      tile1.tile(2, 1, 4, floor, levelInfo);
      tile2.tile(1, 1, 3, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when x is greater and z is lower (same y)', function() {
      tile1.tile(2, 1, 0, floor, levelInfo);
      tile2.tile(1, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when y is greater and z is greater (same x)', function() {
      tile1.tile(1, 2, 4, floor, levelInfo);
      tile2.tile(1, 1, 3, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when y is greater and z is lower (same x)', function() {
      tile1.tile(1, 2, 0, floor, levelInfo);
      tile2.tile(1, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when x, y and z are greater', function() {
      tile1.tile(2, 2, 2, floor, levelInfo);
      tile2.tile(1, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be greater when x and y are greater and z is lower', function() {
      tile1.tile(2, 2, 0, floor, levelInfo);
      tile2.tile(1, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));
    });

    it('z-index should be symmetrical with respect to x and y axis', function() {
      tile1.tile(2, 1, 4, floor, levelInfo);
      tile2.tile(1, 2, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.equal(tile2.attr('z'));

      tile1.tile(1, 2, 4, floor, levelInfo);
      tile2.tile(2, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.equal(tile2.attr('z'));

      tile1.tile(2, 1, 4, floor, levelInfo);
      tile2.tile(1, 2, 3, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));

      tile1.tile(1, 2, 4, floor, levelInfo);
      tile2.tile(2, 1, 3, floor, levelInfo);
      expect(tile1.attr('z')).to.be.above(tile2.attr('z'));

      tile1.tile(2, 1, 3, floor, levelInfo);
      tile2.tile(1, 2, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.below(tile2.attr('z'));

      tile1.tile(1, 2, 3, floor, levelInfo);
      tile2.tile(2, 1, 4, floor, levelInfo);
      expect(tile1.attr('z')).to.be.below(tile2.attr('z'));
    });

  });

  describe('for the standing bot', function() {

    it('z-index of the standing bot should be greater than z-index of the tile it is standing on', function() {
      tile1.tile(1, 1, 0, floor, levelInfo);
      bot.bot({x: 1, y: 1, z: 1});
      expect(bot.attr('z')).to.be.above(tile1.attr('z'));
    });

    it('z-index of the standing bot for high tiles', function() {
      tile1.tile(1, 1, 4, floor, levelInfo);
      bot.bot({x: 1, y: 1, z: 5});
      expect(bot.attr('z')).to.be.above(tile1.attr('z'));
    });

  });

  describe('for the bot moving in the plane', function() {

    beforeEach(function() {
      tiles = [];
      for (var i = 0; i < 6; i++) {
        tiles.push(Crafty.e('Tile'));
      }
    });

    it('moving down right, low', function(done) {
      testMovingBot(
        [0, 0, 0, 0, 1, 1],
        { y: 1, z: 1 },
        { x: 1 },
        [0, 1, 2, 3],
        [4, 5],
        done
      );
    });

    it('moving down right, high', function(done) {
      testMovingBot(
        [3, 3, 3, 3, 4, 4],
        { y: 1, z: 4 },
        { x: 1 },
        [0, 1, 2, 3],
        [4, 5],
        done
      );
    });

    it('moving down left, low', function(done) {
      testMovingBot(
        [0, 0, 0, 1, 1, 1],
        { z: 1 },
        { y: 1 },
        [0, 1, 2],
        [3, 4, 5],
        done
      );
    });

    it('moving down left, high', function(done) {
      testMovingBot(
        [3, 3, 3, 3, 4, 4],
        { z: 4 },
        { y: 1 },
        [0, 1, 2],
        [3, 4, 5],
        done
      );
    });

    it('moving up right, low', function(done) {
      testMovingBot(
        [4, 4, 4, 0, 0, 0],
        { x: 1, y: 2, z: 1 },
        { y: -1 },
        [0, 1, 2, 3, 4, 5],
        [],
        done
      );
    });

    it('moving up right behind a wall', function(done) {
      testMovingBot(
        [4, 4, 0, 4, 0, 4],
        { y: 2, z: 1 },
        { y: -1 },
        [0, 1, 2, 4],
        [3, 5],
        done
      );
    });

    it('moving up right, high', function(done) {
      testMovingBot(
        [4, 4, 4, 4, 4, 4],
        { x: 1, y: 1, z: 5 },
        { y: -1 },
        [0, 1, 2, 3],
        [5],
        done
      );
    });

    it('moving up left, low', function(done) {
      testMovingBot(
        [0, 0, 0, 0, 1, 1],
        { x: 1, y: 1, z: 1 },
        { x: -1 },
        [0, 1, 2, 3],
        [4, 5],
        done
      );
    });

    it('moving up left, high', function(done) {
      testMovingBot(
        [4, 4, 0, 4, 4, 4],
        { x: 1, y: 0, z: 5 },
        { x: -1 },
        [0, 1, 2],
        [3, 4, 5],
        done
      );
    });

    function testMovingBot(heights, botPos, step, above, below, done) {
      tiles[0].tile(0, 0, heights[0], floor, levelInfo);
      tiles[1].tile(1, 0, heights[1], floor, levelInfo);
      tiles[2].tile(0, 1, heights[2], floor, levelInfo);
      tiles[3].tile(1, 1, heights[3], floor, levelInfo);
      tiles[4].tile(0, 2, heights[4], floor, levelInfo);
      tiles[5].tile(1, 2, heights[5], floor, levelInfo);

      bot.bot(botPos);
      bot.executeSubSteps([step], 0, function() {
        done();
      });
      above.forEach(function(index) {
        expect(bot.attr('z')).to.be.above(tiles[index].attr('z'));
      });
      below.forEach(function(index) {
        expect(bot.attr('z')).to.be.below(tiles[index].attr('z'));
      });
    }
  });

  describe('for the bot moving up', function() {
    it.skip('todo', function() {
    });
  });

  describe('for the bot moving down', function() {
    it.skip('todo', function() {
    });
  });
});

