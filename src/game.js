game = (function() {
  'use strict';

  // prevent arrow keys and space to make the browser scroll around
  window.addEventListener('keydown', function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
  }, false);

  function Game() {
  }

  Game.prototype.start = function() {
    this.init();
    Crafty.scene('Loading');
  };

  Game.prototype.init = function(testMode) {

    /*********************************************
     * Initialize constants and "global" variables
     */

    // if running in a unit test, this is true, otherwise false
    this.testMode = testMode;

    // tile size
    this.baseSize = 64;

    // program card related
    this.cardColumns = 4;
    this.cardSize = 48;
    this.cardPadding = 4;
    this.areaPadding = 7;

    // buttons
    this.buttonPadding = 5;
    this.buttonWidth = 48;
    this.buttonHeight = 24;

    // viewport size
    this.width = 12;
    this.height = 6;
    this.widthPx = this.width * this.baseSize;
    this.heightPx = this.height * this.baseSize;
    this.widthProgramArea = this.cardColumns * (this.cardSize + this.cardPadding) + this.cardPadding;
    this.widthMapArea = this.widthPx - this.widthProgramArea;
    this.heightMapArea = this.heightPx - this.cardSize - 2 * this.cardPadding;
    this.offsetProgramArea = this.widthMapArea;
    this.heightProgramArea = this.heightPx;

    // terrain constants
    this.pixelPerHeightLevel = 16;

    /*********************************************
     * Initialize Crafty engine
     */

    Crafty.init(this.widthPx, this.heightPx);
    this.iso = Crafty.isometric.size(this.baseSize);
  };

  Game.prototype.loadAssets = function(callback) {
    var self = this;
    Crafty.e('2D, DOM, Text')
      .text('Booting Hackbot, please stand by...')
      .attr({ x: 0, y: game.heightPx/2 - 24, w: game.widthPx })
      .textFont({ size: '32px', weight: 'bold' })
      .textColor('#FFFFFF');

    /*********************************************
     * Load & initialize assets
     */
    Crafty.load([
      'assets/images/floor.png',
      'assets/images/robot.png',
      'assets/images/cards.png',
      'assets/images/buttons/leave.png',
      'assets/images/buttons/leave_disabled.png',
      'assets/images/buttons/next.png',
      'assets/images/buttons/previous.png',
      'assets/images/buttons/play_disabled.png',
      'assets/images/buttons/play.png',
      'assets/images/buttons/rewind.png',
      'assets/images/buttons/rewind_disabled.png',
      'assets/images/buttons/delete_disabled.png',
      'assets/images/buttons/delete.png',
    ], function() {
      Crafty.sprite(self.baseSize, 'assets/images/floor.png', {
        SprFloorGrey: [0, 0],
        SprFloorRed: [1, 0],
        SprFloorGreen: [2, 0],
        SprFloorBlue: [3, 0],
      });
      Crafty.sprite(self.baseSize, 'assets/images/robot.png', {
        SprBot: [0, 0],
      });
      Crafty.sprite(self.cardSize, 'assets/images/cards.png', {
        SprCardForward: [0, 0],
        SprCardTurnLeft: [1, 0],
        SprCardTurnRight: [2, 0],
        SprCardJump: [3, 0],
        SprCardAction: [4, 0],
        SprCardSubroutine1: [5, 0],
        SprCardSubroutine2: [6, 0],
      });
      callback();
    });
  };

  Game.prototype.startLevel = function() {
    this.reset();
  };

  Game.prototype.leaveLevel = function() {
    Crafty.scene('LevelSelect');
  };

  Game.prototype.reset = function() {
    if (!this.testMode) {
      var level = this._defineLevel();
      this._createMap(level);
      this.bot = this._createBot(level.bot, level);
      this._initInstructionAreas(level);
      this._initSourcePanel();
      this._initButtons();
    }
    this.pristine = true;
    this.executing = false;
  };

  Game.prototype.stop = function() {
    // remove all entities
    Crafty('*').each(function() {
      this.destroy();
    });
    Crafty.stop();
  };

  Game.prototype._defineLevel = function() {
    var levelId = this.levelId || 'slalom';
    var level = this.levels[levelId];
    if (!level) {
      throw new Error('Unknown level: ' + levelId);
    }
    return level;
  };

  /*
   * Creates the entities that represent the floor.
   */
  Game.prototype._createMap = function(level) {
    this._originalLevel = Crafty.clone(level);
    this.map = Crafty.e('Map');
    this.map.map(level);
  };

  /*
   * Creates the bot entity.
   */
  Game.prototype._createBot = function(botPosition) {
    this._originalBotPosition = Crafty.clone(botPosition);
    var botEntity = Crafty.e('Bot').bot(botPosition);
    return botEntity;
  };

  Game.prototype._initSourcePanel = function() {
    ['forward', 'turnLeft', 'turnRight', 'jump', 'action', 'subroutine1', 'subroutine2']
    .forEach(function(instruction, cardIndex) {
      Crafty.e('Card').card(instruction).place(cardIndex);
    });
  };

  Game.prototype._initInstructionAreas = function(level) {
    // a visual separation of isometric playing field from program area
    Crafty
      .e('2D, DOM')
      .attr({
        x: this.offsetProgramArea,
        y: 0,
        w: this.widthProgramArea,
        h: this.heightProgramArea,
      })
      ._element.className = 'instruction-areas';

    this.instructionAreas = {};
    // create an instruction area for main and each sub routine

    var hasMain = false;
    var yOffset = 0;
    for (var name in level.instructionAreas) {
      if (name === 'main') {
        hasMain = true;
      }
      var areaInfo = level.instructionAreas[name];
      var instructionArea = Crafty.e('InstructionArea').instructionArea(name, areaInfo.instructions, yOffset);
      yOffset += instructionArea.height + this.areaPadding;
      this.instructionAreas[name] = instructionArea;
    }
    if (!hasMain) {
      throw new Error('Every level needs an instructionArea with name main');
    }
    this.activeInstructionArea = this.instructionAreas.main;
  };

  Game.prototype.activateInstructionArea = function(newActiveInstructionArea) {
    for (var instrAreaName in this.instructionAreas) {
      if (this.instructionAreas.hasOwnProperty(instrAreaName)) {
        var instructionArea = this.instructionAreas[instrAreaName];
        instructionArea.deactivate();
      }
    }
    this.activeInstructionArea = newActiveInstructionArea;
    this.activeInstructionArea.activate();
  };

  Game.prototype._initButtons = function() {
    this._buttonLeave = this._createButtonLeft(0, 'leave', this.leaveLevel);
    this._buttonExecute = this._createButtonRight(0, 'play', this.execute);
    this._buttonReset = this._createButtonRight(1, 'rewind', this.resetLevel);
    this._buttonClear = this._createButtonRight(2, 'delete', this.clearProgram);
  };

  Game.prototype._createButtonLeft = function(buttonIndex, name, action) {
    var x = this.buttonPadding;
    var y = buttonIndex * (this.buttonHeight + this.buttonPadding) + this.buttonPadding;
    return this._createButton(x, y, name, action);
  }

  Game.prototype._createButtonRight = function(buttonIndex, name, action) {
    var x = this.offsetProgramArea - this.buttonWidth - this.buttonPadding;
    var y = buttonIndex * (this.buttonHeight + this.buttonPadding) + this.buttonPadding;
    return this._createButton(x, y, name, action);
  };

  Game.prototype._createButton = function(x, y, name, action) {
    var button =
      Crafty.e('HbImgButton')
      .hbButton(x, y, this.buttonWidth, this.buttonHeight)
      .hbImgButton(name)
      .bind('Click', action.bind(game))
      .css({ 'background-position': '14px 3px' })
    ;
    return button;
  };

  Game.prototype.execute = function() {
    var self = this;
    if (!this.executing) {
      this._removeMessages();
      if (!this.pristine) {
        this.resetLevel();
        return setTimeout(function() { self.execute() }, 300);
      }
      this.pristine = false;
      this._blockExecution();

      var program = { };
      this._withEachSlot(function(slot, instrAreaName) {
        if (slot.card) {
          if (!program[instrAreaName]) {
            program[instrAreaName] = [];
          }
          var instructionKey = slot.card.instruction;
          var instruction = self.bot.moves[instructionKey];
          if (instruction) {
            program[instrAreaName].push(instruction);
          } else {
            program[instrAreaName].push(instructionKey);
          }
        }
      });

      var self = this;
      this.bot.program(program, function() {
        if (self.hasWon()) {
          self.onPlayerHasWon();
        }
        self._unblockExecution();
      });
    }
  };

  Game.prototype.resetLevel = function() {
    if (!this.executing) {
      this._removeMessages();
      this.map.reset();
      this._resetBotPosition();
      this.pristine = true;
    }
  };

  Game.prototype._resetBotPosition = function() {
    var position = Crafty.clone(this._originalBotPosition);
    this.bot.setPosition(position);
  };

  Game.prototype.clearProgram = function() {
    this._removeMessages();
    this._withEachSlot(function(slot) {
      if (slot.card) {
        var card = slot.card;
        slot.unlinkCard();
        card.destroy();
      }
    });
  };

  Game.prototype._withEachSlot = function(fn) {
    for (var instrAreaName in this.instructionAreas) {
      if (this.instructionAreas.hasOwnProperty(instrAreaName)) {
        var instructionArea = this.instructionAreas[instrAreaName];
        for (var row = 0; row < instructionArea.slots.length; row++) {
          var rowArray = instructionArea.slots[row];
          for (var column = 0; column < rowArray.length; column++) {
            var slot = rowArray[column];
            fn(slot, instrAreaName);
          }
        }
      }
    }
  };

  Game.prototype._blockExecution = function() {
    this.executing = true;
    this._buttonExecute.disable();
    this._buttonReset.disable();
  };

  Game.prototype._unblockExecution = function() {
    this.executing = false;
    this._buttonExecute.enable();
    this._buttonReset.enable();
  };

  Game.prototype.hasWon = function() {
    return this.map.hasWon();
  };

  Game.prototype.onPlayerHasWon = function() {
    // TODO Something better needs to happen here :-)
    if (!this.messagePlayerHasWon) {
      this.messagePlayerHasWon = Crafty
        .e('2D, DOM, Text')
        .textFont({ size: '60px', weight: 'bold' })
        .textColor('#FF0000')
        .text('Level Solved!');
      var x = (this.widthPx - this.widthProgramArea) / 2 - 125,
          y = this.heightPx/2 - 75;
      this.messagePlayerHasWon.attr({ x: x, y: y, z: 1000 });
    }
  };

  Game.prototype._removeMessages = function() {
    if (this.messagePlayerHasWon) {
      this.messagePlayerHasWon.destroy();
      this.messagePlayerHasWon = null;
    }
  };

  return new Game();

})();
