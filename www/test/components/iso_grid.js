describe('Coordinate mapping', function() {
  'use strict';

  var expect = chai.expect;
  var tile;

  before(function(done) {
    game.init(true);
    game.loadAssets(done);
  });

  after(function() {
    game.stop();
  });

  beforeEach(function() {
    game.reset(true);
    game.map = {
      levelInfo: {
        xOffset: 3,
        yOffset: 2,
      }
    };
    tile = Crafty.e('IsoTranslator').setLength2d(5);
  });

  describe('from 2D to isometric', function() {

    it('should not assume values without input', function() {
      expect(tile.xIso).to.not.exist;
      expect(tile.yIso).to.not.exist;
    });

    it('should throw error when no length is set', function() {
      tile = Crafty.e('IsoTranslator');
      var call = function() { tile.toIso(0, 0) };
      expect(call).to.throw('2d grid length (range of y-coordinates) is not set');
    });

    it('should throw error when null length is set', function() {
      tile = Crafty.e('IsoTranslator');
      var call = function() { tile.setLength2d(null) };
      expect(call).to.throw(Error);
    });

    it('should throw error when undefined length is set', function() {
      tile = Crafty.e('IsoTranslator');
      var call = function() { tile.setLength2d(undefined) };
      expect(call).to.throw(Error);
    });

    it('should throw error when negative length is set', function() {
      tile = Crafty.e('IsoTranslator');
      var call = function() { tile.setLength2d(-1) };
      expect(call).to.throw(Error);
    });

    it('should throw error when x/y is negative, null or undefined', function() {
      var call = function() { tile.toIso(-1, 0); };
      expect(call).to.throw(Error);
      call = function() { tile.toIso(0, -1); };
      expect(call).to.throw(Error);
      call = function() { tile.toIso(null, 0); };
      expect(call).to.throw(Error);
      call = function() { tile.toIso(0, null); };
      expect(call).to.throw(Error);
      call = function() { tile.toIso(undefined, 0); };
      expect(call).to.throw(Error);
      call = function() { tile.toIso(0, undefined); };
      expect(call).to.throw(Error);
    });

    it('should throw error when y is greater than length', function() {
      var call = function() { tile.toIso(0, 5); };
      expect(call).to.throw(Error);
    });

    it('should set coordinates', function() {
      tile.toIso(0, 0);
      expect(tile.xIso).to.exist;
      expect(tile.yIso).to.exist;
    });

    it('should work for single tile field', function() {
      tile = Crafty.e('IsoTranslator').setLength2d(1);
      check2dToIso(tile, 0, 0, 0, 0);
    });

    it('should work for 2 x 2 tile field', function() {
      tile = Crafty.e('IsoTranslator').setLength2d(2);
      check2dToIso(tile, 0, 0, 1, 0);
      check2dToIso(tile, 0, 1, 0, 1);
      check2dToIso(tile, 1, 0, 1, 1);
      check2dToIso(tile, 1, 1, 1, 2);
    });

    it('should work for 5 x 4 tile field', function() {
      test5x4Field(check2dToIso);
    });

    function check2dToIso(tile, x2d, y2d, xIso, yIso) {
      tile.toIso(x2d, y2d);
      expect(tile.xIso).to.equal(xIso);
      expect(tile.yIso).to.equal(yIso);
    }
  });

  describe('from isometric to 2D', function() {

    it('should throw error when no length is set', function() {
      tile = Crafty.e('IsoTranslator');
      var call = function() { tile.to2d(0, 0) };
      expect(call).to.throw('2d grid length (range of y-coordinates) is not set');
    });

    it('should throw error when x/y is negative, null or undefined', function() {
      var call = function() { tile.to2d(-1, 0); };
      expect(call).to.throw(Error);
      call = function() { tile.to2d(0, -1); };
      expect(call).to.throw(Error);
      call = function() { tile.to2d(null, 0); };
      expect(call).to.throw(Error);
      call = function() { tile.to2d(0, null); };
      expect(call).to.throw(Error);
      call = function() { tile.to2d(undefined, 0); };
      expect(call).to.throw(Error);
      call = function() { tile.to2d(0, undefined); };
      expect(call).to.throw(Error);
    });

    it('should work for single tile field', function() {
      tile = Crafty.e('IsoTranslator').setLength2d(1);
      checkIsoTo2d(tile, 0, 0, 0, 0);
    });

    it('should work for 2 x 2 tile field', function() {
      tile = Crafty.e('IsoTranslator').setLength2d(2);
      checkIsoTo2d(tile, 0, 0, 1, 0);
      checkIsoTo2d(tile, 0, 1, 0, 1);
      checkIsoTo2d(tile, 1, 0, 1, 1);
      checkIsoTo2d(tile, 1, 1, 1, 2);
    });

    it('should work for 5 x 4 tile field', function() {
      test5x4Field(checkIsoTo2d);
    });

    it('should work for 5 x 4 tile field with full roundtrip', function() {
      test5x4Field(check2dToIsoTo2d);
    });

    function checkIsoTo2d(tile, x2d, y2d, xIso, yIso) {
      var coordinates2d = tile.to2d(xIso, yIso);
      expect(coordinates2d.x).to.equal(x2d);
      expect(coordinates2d.y).to.equal(y2d);
    }

    function check2dToIsoTo2d(tile, x2d, y2d) {
      // sets tile.xIso and tile.yIso implicitly
      tile.toIso(x2d, y2d);
      // tile.to2d() without arguments uses tile.xIso and tile.yIso to calculate
      // x2d and y2d
      var coordinates2d = tile.to2d();
      expect(coordinates2d.x).to.equal(x2d);
      expect(coordinates2d.y).to.equal(y2d);
    }


  });

  function test5x4Field(check) {
    check(tile, 0, 0, 2, 0);
    check(tile, 0, 1, 1, 1);
    check(tile, 0, 2, 1, 2);
    check(tile, 0, 3, 0, 3);
    check(tile, 0, 4, 0, 4);

    check(tile, 1, 0, 2, 1);
    check(tile, 1, 1, 2, 2);
    check(tile, 1, 2, 1, 3);
    check(tile, 1, 3, 1, 4);
    check(tile, 1, 4, 0, 5);

    check(tile, 2, 0, 3, 2);
    check(tile, 2, 1, 2, 3);
    check(tile, 2, 2, 2, 4);
    check(tile, 2, 3, 1, 5);
    check(tile, 2, 4, 1, 6);

    check(tile, 3, 0, 3, 3);
    check(tile, 3, 1, 3, 4);
    check(tile, 3, 2, 2, 5);
    check(tile, 3, 3, 2, 6);
    check(tile, 3, 4, 1, 7);
  }

  describe('from isometric to pixel', function() {

    it('should work for 5 x 4 tile field', function() {
      test5x4FieldPixel(check2dToPixel);
    });

    function check2dToPixel(tile, x2d, y2d, xPixel, yPixel) {
      var coordinatesPixel = tile._calcPixelCoords(x2d, y2d, 2, 1);
      expect(coordinatesPixel.x).to.equal(xPixel);
      expect(coordinatesPixel.y).to.equal(yPixel);
    }
  });

  function test5x4FieldPixel(check) {
    // This test coordinates and their respective expecations just represent the
    // status quo. They haven't been checked for correctness.

    check(tile, 0, 0, 131, -29);
    check(tile, 0, 1, 99, -13);
    check(tile, 0, 2, 67, 3);
    check(tile, 0, 3, 35, 19);
    check(tile, 0, 4, 3, 35);

    check(tile, 1, 0, 163, -13);
    check(tile, 1, 1, 131, 3);
    check(tile, 1, 2, 99, 19);
    check(tile, 1, 3, 67, 35);
    check(tile, 1, 4, 35, 51);

    check(tile, 2, 0, 195, 3);
    check(tile, 2, 1, 163, 19);
    check(tile, 2, 2, 131, 35);
    check(tile, 2, 3, 99, 51);
    check(tile, 2, 4, 67, 67);

    check(tile, 3, 0, 227, 19);
    check(tile, 3, 1, 195, 35);
    check(tile, 3, 2, 163, 51);
    check(tile, 3, 3, 131, 67);
    check(tile, 3, 4, 99, 83);
  }

});

