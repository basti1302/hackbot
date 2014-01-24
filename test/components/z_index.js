describe('Z-Index in isometric grid', function() {

  'use strict';

  var expect = chai.expect;
  var tile;

  before(function() {
    game.init(true);
  });

  after(function() {
    game.stop();
  });

  beforeEach(function() {
    game.reset(true);
    tile = Crafty.e('IsoTranslator').setLength2d(4);
  });

  describe('non-moving entities', function() {
    it('should order tiles nicely', function() {

      /*
       * z-index is higher when
       * x is higher (same y, same z)
       * y is higher (same x, same z)
       * z is higher (same x, same y)
       * x is higher and y is higher (same z)
       *
       * we don't care about z-index relation when:
       * x is higher and y is lower (same z)
       * x is lower and y is higher (same z)
       *
       * z-index is higher when
       * x is higher and z is higher (same y)
       * x is higher and z is lower (same y)
       * y is higher and z is higher (same x)
       * y is higher and z is lower (same x)
       * x is higher and y is higher and z is higher
       * x is higher and y is higher and z is lower
       *
       * we don't care about z-index relation when:
       * x is higher and y is lower and z is higher
       * x is higher and y is lower and z is lower
       * x is lower and y is higher and z is higher
       * x is lower and y is higher and z is lower
       */
    });
  });

  describe('moving entities', function() {
    it('should order the bot correctly', function() {

      /*
       * the standing bot acts like a tile with level + 1
       *
       * when moving, the bot needs to comply to all constraints given above
       * when compared with "all relevant" surrounding tiles.
       *
       * What are the surrounding relevant tiles?
       *
       * Moving in the plane (z does not change) - 6 tiles
       * - moving down right:
       *   - (0, 0) [origin]
       *   - (1, 0) [target]
       *   - (0, 1)
       *   - (1, 1)
       *   - (0, -1)
       *   - (1, -1)
       *
       * - moving down left:
       *   - (0, 0) [origin]
       *   - (0, 1) [target]
       *   - (1, 0)
       *   - (1, 1)
       *   - (-1,0)
       *   - (-1,1)

       */
    });
  });
});

