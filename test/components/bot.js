describe('The bot entity', function() {
  'use strict';

  var expect = chai.expect;
  var bot;

  before(function() {
    game.init(true);
  });

  beforeEach(function() {
    var level = {
      length: 3,
      baseHeight: 0,
      maxHeight: 2,
      terrain: [
      [0, 0,  0],
      [0, { floor: 'red' },  0],
      [0, 0,  0],
    ]};
    game.reset(true);
    game._createMap(level);
    bot = game._createBot({ x: 1, y: 1});
    bot.subStepDuration = 0;
    bot.pauseBetweenSteps = 0;
    bot.pauseBetweenTweens = 0,
    bot.loopMovement = false;
    bot.manualControl = false;
  });

  describe('The bot entity', function() {

    describe('when moving', function() {

      it('should have a default position', function() {
        expect(bot.position).to.exist;
        check(bot, 1, 1);
     });

      it('should have a new position after moving', function(done) {
        bot.executeStep({ x: 1, y: 1 }, function(err) {
          expect(err).to.not.exist;
          check(bot, 2, 2);
          done();
        });
      });

      it('should turn', function(done) {
        bot.executeStep({ d: 1 }, function(err) {
          expect(err).to.not.exist;
          expect(bot.position.direction).to.equal(1);
          done();
        });
      });

    });

    describe('when instructed', function() {

      it('should move on flat ground in direction it faces (down and right)', function(done) {
        bot.instruct(bot.moves.forward, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 2, 1);
          done();
        });
      });

      it('should move on flat ground in direction it faces (down and left)', function(done) {
        bot.position.direction = bot.directions.downLeft;
        bot.instruct(bot.moves.forward, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 1, 2, 0, bot.directions.downLeft);
          done();
        });
      });

      it('should move on flat ground in direction it faces (up and right)', function(done) {
        bot.position.direction = bot.directions.upRight;
        bot.instruct(bot.moves.forward, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 1, 0, 0, bot.directions.upRight);
          done();
        });
      });

      it('should move on flat ground in direction it faces (up and left)', function(done) {
        bot.position.direction = bot.directions.upLeft;
        bot.instruct(bot.moves.forward, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 0, 1, 0, bot.directions.upLeft);
          done();
        });
      });

      it('should not move up', function(done) {
        game.map.setTileZ(2, 1, 1);
        bot.instruct(bot.moves.forward, function(err, moved) {
          expectBotHasNotMoved(err, moved);
          check(bot, 1, 1);
          done();
        });
      });

      it('should not move down', function(done) {
        game.map.setTileZ(2, 1, -1);
        bot.instruct(bot.moves.forward, function(err, moved) {
          expectBotHasNotMoved(err, moved);
          check(bot, 1, 1);
          done();
        });
      });

      it('should not move where no tile is', function(done) {
        game.map.removeTile(2, 1);
        bot.instruct(bot.moves.forward, function(err, moved) {
          expectBotHasNotMoved(err, moved);
          check(bot, 1, 1);
          done();
        });
      });

      it('should not jump where no tile is', function(done) {
        game.map.removeTile(2, 1);
        bot.instruct(bot.moves.jump, function(err, moved) {
          expectBotHasNotMoved(err, moved);
          check(bot, 1, 1);
          done();
        });
      });

      it('should jump up one level', function(done) {
        game.map.setTileZ(2, 1, 1);
        bot.instruct(bot.moves.jump, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 2, 1, 1);
          done();
        });
      });

      it('should not jump up multiple levels', function(done) {
        game.map.setTileZ(2, 1, 2);
        bot.instruct(bot.moves.jump, function(err, moved) {
          expectBotHasNotMoved(err, moved);
          check(bot, 1, 1);
          done();
        });
      });

      it('should jump down one level', function(done) {
        // negative z levels are not allowed, so this test is a bit borked.
        // Hower, currently only rendering would be affected negatively by
        // negative z levels this is somewhat okay.
        game.map.setTileZ(2, 1, -1);
        bot.instruct(bot.moves.jump, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 2, 1, -1);
          done();
        });
      });

      it('should jump down multiple levels', function(done) {
        // negative z levels ... see above
        game.map.setTileZ(2, 1, -2);
        bot.instruct(bot.moves.jump, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 2, 1, -2);
          done();
        });
      });

      // Tutankhamun was here
      it('should turn left', function(done) {
        check(bot, 1, 1, 0, bot.directions.downRight);
        bot.instruct(bot.moves.turnLeft, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 1, 1, 0, bot.directions.upRight);
          bot.instruct(bot.moves.turnLeft, function(err, moved) {
            expectBotHasMoved(err, moved);
            check(bot, 1, 1, 0, bot.directions.upLeft);
            bot.instruct(bot.moves.turnLeft, function(err, moved) {
              expectBotHasMoved(err, moved);
              check(bot, 1, 1, 0, bot.directions.downLeft);
              bot.instruct(bot.moves.turnLeft, function(err, moved) {
                expectBotHasMoved(err, moved);
                check(bot, 1, 1, 0, bot.directions.downRight);
                done();
              });
            });
          });
        });
      });

      // Cleopatra was here, too
      it('should turn right', function(done) {
        check(bot, 1, 1, 0, bot.directions.downRight);
        bot.instruct(bot.moves.turnRight, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 1, 1, 0, bot.directions.downLeft);
          bot.instruct(bot.moves.turnRight, function(err, moved) {
            expectBotHasMoved(err, moved);
            check(bot, 1, 1, 0, bot.directions.upLeft);
            bot.instruct(bot.moves.turnRight, function(err, moved) {
              expectBotHasMoved(err, moved);
              check(bot, 1, 1, 0, bot.directions.upRight);
              bot.instruct(bot.moves.turnRight, function(err, moved) {
                expectBotHasMoved(err, moved);
                check(bot, 1, 1, 0, bot.directions.downRight);
                done();
              });
            });
          });
        });
      });

      it('should toggle tile', function(done) {
        var tileInfo = game.map.getTileInfo(1, 1);

        // check initial state
        expect(tileInfo.floor).to.equal(game.map.tiles.red);
        expect(tileInfo.tile.has(game.map.tiles.green)).to.be.false;
        expect(tileInfo.tile.has(game.map.tiles.red)).to.be.true;

        // toggle from red to green
        bot.instruct(bot.moves.action, function(err, moved) {
          expectBotHasMoved(err, moved);
          check(bot, 1, 1);
          tileInfo = game.map.getTileInfo(1, 1);
          expect(tileInfo.floor).to.equal(game.map.tiles.green);
          expect(tileInfo.tile.has(game.map.tiles.green)).to.be.true;
          expect(tileInfo.tile.has(game.map.tiles.red)).to.be.false;

          // toggle from green to red
          bot.instruct(bot.moves.action, function(err, moved) {
            expectBotHasMoved(err, moved);
            check(bot, 1, 1);
            tileInfo = game.map.getTileInfo(1, 1);
            expect(tileInfo.floor).to.equal(game.map.tiles.red);
            expect(tileInfo.tile.has(game.map.tiles.green)).to.be.false;
            expect(tileInfo.tile.has(game.map.tiles.red)).to.be.true;
            done();
          });
        });
      });

    });

    function expectBotHasMoved(err, moved) {
      expect(err).to.not.exist;
      expect(moved).to.be.true;
    }

    function expectBotHasNotMoved(err, moved) {
      expect(err).to.not.exist;
      expect(moved).to.be.false;
    }

  });

  describe('when programmed', function() {

    it('should follow a single instruction', function(done) {
      bot.program({
        main: [
          bot.moves.forward,
        ],
      }, function(err) {
        expect(err).to.not.exist;
        check(bot, 2, 1);
        done();
      });
    });

    it('should follow a multiple instruction', function(done) {
      bot.program({
        main: [
          bot.moves.forward,
          bot.moves.turnRight,
          bot.moves.forward,
          bot.moves.turnRight,
          bot.moves.forward,
          bot.moves.forward,
        ],
      }, function(err) {
        expect(err).to.not.exist;
        check(bot, 0, 2, 0, bot.directions.upLeft);
        done();
      });
    });

    it('should execute subroutine', function(done) {
      bot.program({
        main: [
          bot.moves.forward,
          'subroutine',
        ],
        subroutine: [
          bot.moves.turnRight,
          bot.moves.forward,
        ],
      }, function(err) {
        expect(err).to.not.exist;
        check(bot, 2, 2, 0, bot.directions.downLeft);
        done();
      });
    });

    it('should continue with main after executing a subroutine', function(done) {
      bot.program({
        main: [
          bot.moves.forward,
          'subroutine',
          bot.moves.turnRight,
          bot.moves.forward,
        ],
        subroutine: [
          bot.moves.turnRight,
          bot.moves.forward,
        ],
      }, function(err) {
        expect(err).to.not.exist;
        check(bot, 1, 2, 0, bot.directions.upLeft);
        done();
      });
    });

    it('should call subroutine from subroutine', function(done) {
      bot.program({
        main: [
          'subroutine1',      // 1,1,0,dl
          bot.moves.forward,  // 1,2,0,dl
        ],
        subroutine1: [
          bot.moves.forward,  // 2,1,0,dr
          'subroutine2',             // 1,1,0,ul
          bot.moves.turnLeft, // 1,1,0,dl
        ],
        subroutine2: [
          bot.moves.turnLeft, // 2,1,0,ur
          bot.moves.turnLeft, // 2,1,0,ul
          bot.moves.forward,  // 1,1,0,ul
        ],
      }, function(err) {
        expect(err).to.not.exist;
        check(bot, 1, 2, 0, bot.directions.downLeft);
        done();
      });
    });

    it('should break out of subroutine', function(done) {
      bot.program({
        main: [
          'subroutine',
        ],
        subroutine: [
          bot.moves.turnLeft, // 1,1,0,ur
          bot.specialInstructions['break'],
          bot.moves.forward,  // should not be executed
        ],
      }, function(err) {
        expect(err).to.not.exist;
        check(bot, 1, 1, 0, bot.directions.upRight);
        done();
      });
    });

  });

  function check(bot, x, y, z, direction) {
    x = x || 0;
    y = y || 0;
    z = z || 0;
    direction = direction || bot.directions.downRight;

    /*
    console.log('expected x: ' + x);
    console.log('actual   x: ' + bot.position.x);
    console.log('expected y: ' + y);
    console.log('actual   y: ' + bot.position.y);
    console.log('expected z: ' + z);
    console.log('actual   z: ' + bot.position.z);
    console.log('expected d: ' + direction);
    console.log('actual   d: ' + bot.position.direction);
    */
    expect(bot.position.y).to.equal(y);
    expect(bot.position.z).to.equal(z);
    expect(bot.position.direction).to.equal(direction);

    expect(bot.position.x).to.equal(x);
    expect(bot.position.y).to.equal(y);
    expect(bot.position.z).to.equal(z);
    expect(bot.position.direction).to.equal(direction);
  }
});

