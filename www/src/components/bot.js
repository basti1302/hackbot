(function() {
  'use strict';

  Crafty.c('Bot', {

    botZPxCorrection: -8,

    // movement speed constants
    subStepDuration: 300,
    pauseBetweenSteps: 100,
    pauseBetweenTweens: 0,

    // only for debugging and editor
    manualControl: false,

    // ordinary movement instructions
    moves: {
      forward: 'move:forward',
      backward: 'move:backward', // only in editor
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
      this.requires('IsoDomSprite, SpriteAnimation, Tween, SprBot, Keyboard');
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

      if (this.manualControl) {
        this._enableDisableManualControl();
      }
    },

    bot: function(position) {
      this._startPosition = Crafty.clone(position);
      this.setBotPosition(position);
      return this;
    },

    setBotPosition: function(position, saveAsStartPosition) {
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

      if (saveAsStartPosition) {
        this._startPosition = Crafty.clone(this.position);
      }

      return this;
    },

    resetBotPosition: function() {
      this.setBotPosition(Crafty.clone(this._startPosition));
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

    _program: function(instructions, registerName, instructionIndex, callback) {
      var register = instructions[registerName];
      if (register == null) {
        return callback();
      }
      var instruction = register[instructionIndex];
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
          return self._program(instructions, registerName, ++instructionIndex, function(err) {
            return callback(err);
          });
        });
      }
      this.instruct(instruction, false, function(err, moved) {
        if (err) { return callback(err); }
        if (self._hasWon()) {
          return callback();
        }
        self._program(instructions, registerName, ++instructionIndex, callback);
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
    instruct: function(instruction, manualMove, callback) {
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
          return this._checkAndMove(step, jump, manualMove, callback);
        case this.moves.backward:
          var step;
          switch (this.position.direction) {
            case this.directions.downLeft:
              step = { y: -1 };
              break;
            case this.directions.downRight:
              step = { x: -1 };
              break;
            case this.directions.upRight:
              step = { y: 1 };
              break;
            case this.directions.upLeft:
              step = { x: 1 };
              break;
            default:
              return callback(new Error('Unknown direction: ' + this.position.direction));
          }
          return this._checkAndMove(step, jump, manualMove, callback);

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
    _checkAndMove: function(step, jump, manualMove, callback) {
      var zNow = this.position.z;
      var newPos = this._calculateNewPosition(step);
      var tileInfoThen = game.map.getTileInfo(newPos.x, newPos.y);
      if (tileInfoThen == null) {
        return callback(null, false);
      } else if (game.editMode && tileInfoThen.isGhost) {
        return callback(null, false);
      }

      var zThen = tileInfoThen.level + 1;

      // check if up/down movement is allowed
      if (game.editMode && manualMove) {
        // any vertical movement is allowed in edit mode when manually
        // controlling the bot, even without jumping.
        step.z = zThen - zNow;
        return this.executeStep(step, function() {
          callback(null, true);
        });
      } else if (!jump && zNow === zThen) {
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
      if (game.map.isTarget(this.position.x, this.position.y)) {
        game.map.toggleRedGreen(this.position.x, this.position.y);
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

    /* Only for editor */
    enableManualControl: function() {
      this.manualControl = true;
      this._enableDisableManualControl();
    },

    disableManualControl: function() {
      this.manualControl = false;
      this._enableDisableManualControl();
    },

    // TODO Move everything related to manual control somewhere else...
    // maybe refactor into component ManualControl and make Bot componet
    // require that.
    _enableDisableManualControl: function() {
      if (this.manualControl) {
        this._manualControlHandler = this._manualControlFn.bind(this);

        // If we bind the KeyDown event in the same tick of the event loop,
        // it gets triggered right away because key B is still down and we add
        // another callback to the loop that triggers all callbacks for the key
        // down event. This effectively toggles manual control off and on again
        // immediately. Solution: Guess what, setTimeout ;-)
        var self = this;
        setTimeout(function() {
          self.bind('KeyDown', self._manualControlHandler);
        });
      } else {
        if (this._manualControlHandler) {
          this.unbind('KeyDown', this._manualControlHandler);
        }
        this._manualControlHandler = null;
      }
    },

    _manualControlHandler: null,

    _manualControlFn: function(e) {

      function moveCallback(err, moved) {
        game.bot._startPosition = Crafty.clone(game.bot.position);
        if (err) {
          console.error(err);
        }
      }

      if (game.editMode) {
        // manual controls in edit mode
        if (this.isDown('UP_ARROW')) {
          this.instruct(this.moves.forward, true, moveCallback);
        } else if (this.isDown('DOWN_ARROW')) {
          this.instruct(this.moves.backward, true, moveCallback);
        } else if (this.isDown('LEFT_ARROW')) {
          this.instruct(this.moves.turnLeft, true, moveCallback);
        } else if (this.isDown('RIGHT_ARROW')) {
          this.instruct(this.moves.turnRight, true, moveCallback);
        }
      } else {
        // manual controls in game (instead of edit mode), slightly different than in edit mode
        if (this.isDown('UP_ARROW') || this.isDown('W')) {
          this.instruct(this.moves.forward, true);
        } else if (this.isDown('LEFT_ARROW') || this.isDown('A')) {
          this.instruct(this.moves.turnLeft, true);
        } else if (this.isDown('RIGHT_ARROW') || this.isDown('D')) {
          this.instruct(this.moves.turnRight, true);
        } else if (this.isDown('SPACE')) {
          this.instruct(this.moves.jump, true);
        } else if (this.isDown('CTRL')) {
          this.instruct(this.moves.action, true);
        }
      }
    },

    exportStartPosition: function() {
      return {
        x: this._startPosition.x,
        y: this._startPosition.y,
        direction: this._startPosition.direction,
      }
    },

  });

})();
