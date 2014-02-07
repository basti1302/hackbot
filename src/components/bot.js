(function() {
  'use strict';

  Crafty.c('Bot', {

    botZPxCorrection: -8,

    // movement speed constants
    subStepDuration: 300,
    pauseBetweenSteps: 100,
    pauseBetweenTweens: 0,

    // only for debugging
    manualControl: false,

    // ordinary movement instructions
    moves: {
      forward: 'move:forward',
      turnLeft: 'move:turn-left',
      turnRight: 'move:turn-right',
      jump: 'move:jump',
      action: 'move:action',
    },
    // special control flow instructions
    specialInstructions: {
      'break': 'control-flow:break',
    },
    directions: {
      downLeft: 'downLeft',
      downRight: 'downRight',
      upRight: 'upRight',
      upLeft: 'upLeft',
    },
    _dirSequence: [
      'downLeft',
      'downRight',
      'upRight',
      'upLeft',
    ],

    init: function() {
      this.requires('IsoDomSprite, SpriteAnimation, Tween, SprBot');
      var animationSpeed = this.subStepDuration / 3;

      this.botReels = {};
      this.botReels[this.directions.downLeft] = 'ReelBotDownLeft';
      this.botReels[this.directions.downRight] = 'ReelBotDownRight';
      this.botReels[this.directions.upRight] = 'ReelBotUpRight';
      this.botReels[this.directions.upLeft] = 'ReelBotUpLeft';

      this.setLength2d(game.map.levelInfo.length2d);
      this.reel(this.botReels[this.directions.downLeft], animationSpeed, 0, 0, 1)
          .reel(this.botReels[this.directions.downRight], animationSpeed, 1, 0, 1)
          .reel(this.botReels[this.directions.upRight], animationSpeed, 2, 0, 1)
          .reel(this.botReels[this.directions.upLeft], animationSpeed, 3, 0, 1);
      this.position = {
        x: 0, y: 0, z: 0, direction: this.directions.downRight,
      };

      var logInstructionResult = function(err, moved) {
        if (err) {
          console.error(err);
        }
      }

      // TODO Move this somewhere else... maybe refactor into component
      // ManualControl and make Bot componet require that.
      if (this.manualControl) {
        this.addComponent('Keyboard');
        this.bind('KeyDown', function () {
          if (this.isDown('UP_ARROW') || this.isDown('W')) {
            this.instruct(this.moves.forward, logInstructionResult);
          } else if (this.isDown('LEFT_ARROW') || this.isDown('A')) {
            this.instruct(this.moves.turnLeft, logInstructionResult);
          } else if (this.isDown('RIGHT_ARROW') || this.isDown('D')) {
            this.instruct(this.moves.turnRight, logInstructionResult);
          } else if (this.isDown('SPACE') || this.isDown('S')) {
            this.instruct(this.moves.jump, logInstructionResult);
          } else if (this.isDown('CTRL')) {
            this.instruct(this.moves.action, logInstructionResult);
          }
        });
      }
    },

    bot: function(position) {
      this.setPosition(position);
      return this;
    },

    setPosition: function(position) {
      this.position = position || this.position;
      this.position.x = this.position.x || 0;
      this.position.y = this.position.y || 0;
      if (this.position.z === undefined || this.position.z === null) {
        this.position.z = 1;
      }
      this.position.direction = this.position.direction || this.directions.downRight;
      var pixelPosition = this._calcPixelCoords(this.position.x, this.position.y, this.position.z, this.botZPxCorrection);
      this.attr({
          x: pixelPosition.x,
          y: pixelPosition.y
      });

      var zIndex = this.calcLayer(position.x, position.y, position.z, game.map.levelInfo.maxHeight);
      this.attr('z', zIndex);

      this.animate(this.botReels[position.direction], 0);
      return this;
    },

    /*
     * Gives a set of instructions to the bot for execution. This may also
     * include subroutine calls and loops.
     */
    program: function(instructions, callback) {
      callback = this._ensureCallback(callback);
      if (instructions == null ||
          instructions.main == null ||
          instructions.main.length === 0) {
        return callback();
      }
      this._program(instructions, 'main', 0, callback);
    },

    _program: function(instructions, register, instructionIndex, callback) {
      var instruction = instructions[register][instructionIndex];
      if (instruction == null) {
        return callback();
      }
      var self = this;

      if (this.specialInstructions['break'] === instruction) {
        return callback();
      } else if (!this._isMovementInstruction(instruction)) {
        // everything that is not found in the standard instruction set is
        //interpreted as a subroutine call
        return this._program(instructions, instruction, 0, function(err) {
          if (self._hasWon()) {
            return callback();
          }
          return self._program(instructions, register, ++instructionIndex, function(err) {
            return callback(err);
          });
        });
      }
      this.instruct(instruction, function(err, moved) {
        if (err) { return callback(err); }
        if (self._hasWon()) {
          return callback();
        }
        self._program(instructions, register, ++instructionIndex, callback);
      });
    },

    _hasWon: function() {
      return game.hasWon();
    },

    _isMovementInstruction: function(instruction) {
      for (var k in this.moves) {
        if (this.moves[k] === instruction) {
          return true;
        }
      }
      return false;
    },

    /*
     * Gives a single instruction to the bot, like move one tile forward. This
     * function checks if this is possible and then initiates the appropriate
     * movements. The instruction has to be a proper movement instruction
     * (forward, rotate, jump, action), not a subroutine call or loop
     * instruction.
     */
    instruct: function(instruction, callback) {
      callback = this._ensureCallback(callback);
      var jump = false;
      switch (instruction) {
        case this.moves.jump:
          jump = true;
          // fall through
        case this.moves.forward:
          var step;
          switch (this.position.direction) {
            case this.directions.downLeft:
              step = { y: 1 };
              break;
            case this.directions.downRight:
              step = { x: 1 };
              break;
            case this.directions.upRight:
              step = { y: -1 };
              break;
            case this.directions.upLeft:
              step = { x: -1 };
              break;
            default:
              return callback(new Error('Unknown direction: ' + this.position.direction));
          }
          return this._checkAndMove(step, jump, callback);
        case this.moves.turnLeft:
          // fall through
        case this.moves.turnRight:
          var di = this._dirSequence.indexOf(this.position.direction);
          if (instruction === this.moves.turnLeft) {
            di = (di === this._dirSequence.length - 1) ? 0 : ++di;
          } else {
            di = (di === 0) ? this._dirSequence.length - 1 : --di;
          }
          step = { d: this._dirSequence[di] };
          return this.executeStep(step, function() {
            callback(null, true);
          });
        case this.moves.action:
          return this._doAction(callback);
        default:
          return callback(new Error('Unknown instruction: ' + instruction));
      }
    },

    _ensureCallback: function(callback) {
      if (callback != null && typeof callback !== 'function') {
        throw new Error('callback has to be a function');
      }
      return callback || function() {};
    },

    /*
     * Checks if a movement step is possible (due to map layout and current bot
     * position) and if so, executes it.
     */
    _checkAndMove: function(step, jump, callback) {
      var zNow = this.position.z;
      var newPos = this._calculateNewPosition(step);
      var tileInfoThen = game.map.getTileInfo(newPos.x, newPos.y);
      if (tileInfoThen == null) {
        return callback(null, false);
      }

      var zThen = tileInfoThen.level + 1;
      if (!jump && zNow === zThen) {
        return this.executeStep(step, function() {
          callback(null, true);
        });
      } else if (jump && zNow + 1 === zThen) {
        // jump up one level
        step.z = 1;
        return this.executeStep(step, function() {
          callback(null, true);
        });
      } else if (jump && zNow > zThen) {
        // jump down any number of levels
        step.z = zThen - zNow;
        return this.executeStep(step, function() {
          callback(null, true);
        });
       } else {
        return callback(null, false);
      }
    },

    _doAction: function _doAction(callback) {

      // toggle floor tile red/green
      var tileType = game.map.getTileType(this.position.x, this.position.y);
      if (tileType === game.map.tiles.green || tileType === game.map.tiles.red) {
        game.map.toggleTileType(this.position.x, this.position.y);
        return callback(null, true);
      }
      return callback(null, false);
    },

    /*
     * Executes one movement. Usually this is something like moving one step
     * ahead or rotating or jumping up or down a gap. This function does not
     * check if the move is possible due to the map layout, this must have been
     * checked before calling this function.
     */
    executeStep: function(step, callback) {
      var subSteps = [];
      // execute rotation as first step
      if (step.d != null && step.d !== this.position.direction) {
        subSteps.push({ d: step.d });
      }
      // if the step includes vertical movement (up or down) we separate the
      // step into a sequence of sub steps
      if (step.z) {
        if (step.z > 0) {
          // upward movement -> move straight up first, then move horizontally
          for (var i = 0; i < step.z; i++) {
            subSteps.push({ z: 1 });
          }
          subSteps.push({ x: step.x, y: step.y });
        } else {
          // downward movement -> move horitontally first, then straight down
          subSteps.push({ x: step.x, y: step.y });
          subSteps.push({ z: step.z });
        }
      } else {
        // no vertical movement
        subSteps.push({ x: step.x, y: step.y });
      }
      this.executeSubSteps(subSteps, 0, callback);
    },

    /*
     * Executes a movement sequence which is part of a movement executed by the
     * move function. For example, when jumping one tile forward and down one
     * height level at the same time, this would be separated in a substep
     * moving the bot one tile forward and another substep for the downward
     * movement. This is primarily for animation purposes.
     */
    executeSubSteps: function(subSteps, subStepIndex, callback) {
      var subStep = subSteps[subStepIndex];
      if (subStep == null) {
        if (typeof callback === 'function') {
          return callback();
        } else {
          return;
        }
      }

      // clone old position
      var oldPosition = {
        x: this.position.x, y: this.position.y, z: this.position.z, direction: this.position.direction,
      }

      this.position = this._calculateNewPosition(subStep);

      // turn bot if sub step has direction attribute
      if (subStep.d != null) {
        this.position.direction = subStep.d;
        this.animate(this.botReels[this.position.direction], 0);
      }

      if (oldPosition.x !== this.position.x ||
          oldPosition.y !== this.position.y ||
          oldPosition.z !== this.position.z) {

        // calculate and set z-index
        var layer = this.calcLayerMoving(oldPosition, this.position, game.map.levelInfo.maxHeight);
        this.attr('z', layer);

        // convert to iso coordinates and then to pixel coordinates
        var pixelPosition = this._calcPixelCoords(this.position.x, this.position.y, this.position.z, this.botZPxCorrection);
        this.tween({x: pixelPosition.x, y: pixelPosition.y}, this.subStepDuration);
        this.animate(this.botReels[this.position.direction], -1);
      }

      var self = this;
      setTimeout(function() {
        self.pauseAnimation();
        setTimeout(function() {
          self.executeSubSteps(subSteps, ++subStepIndex, callback);
        }, self.pauseBetweenTweens);
      }, this.subStepDuration );
    },

     /* calculate new position in 2d grid */
    _calculateNewPosition: function(step) {
      return {
        x: this.position.x + (step.x || 0),
        y: this.position.y + (step.y || 0),
        z: this.position.z + (step.z || 0),
        direction: this.position.direction,
      }
    },

  });
})();
