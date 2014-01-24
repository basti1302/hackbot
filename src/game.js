/*
 * TODO
 * - [UX] center map on screen
 * - Get rid of level.maxHeight attribute
 * - Get rid of level.baseHeight attribute
 * - [!] Scenes: welcome scene, level select scene, playing scene
 * - [!] Asset Pre-Loading
 * - [TESTS] For z-index with various heights (probably partly broken)
 * - [TESTS] For pixel positions during bot movements
 * - REVIEW TODOS!
 * - [REFACTORING] extract into components/entities:
 *   - source panel
 *   - program panel
 *   - each program area
 *   - button area
 * - [UX] remove cards by click
 * - [UX] when removing cards from instruction area, all other cards after should go
 *   to their predecessor
 * - [UX] when dropping cards in occupied spaces, insert them instead of replace
 *   them. Cards get destroyed if the move out at the end.
 * - [VISUAL] better colors for active and inactive instruction area * - [VISUAL] correct instruction area and slot sizes, so that cards fit perfectly
 * - [VISUAL] put a opaque div below the 'Level Solved!' message
 * - [VISUAL] make icons for buttons
 * - [VISUAL] Animate bot jump even when its jumping in situ
 * - [FEATURE] let level definition dictate which cards are available
 * - [FEATURE] level editor
 * - [FEATURE] save levels to local storage
 * - [FEATURE] load levels from local storage
 * - [FEATURE] export/import levels from local storage to/from file
 * - [FEATURE] Clicking execute/reset program cards *cancel* current
 *   execution - similar to _hasWon check
 */

game = (function() {
  'use strict';

  // prevent arrow keys and space to make the browser scroll around
  window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
  }, false);

  function Game() {
  }

  Game.prototype.start = function() {
    this.init();
  }

  Game.prototype.init = function(testMode) {

    /*********************************************
     * Initialize constants and "global" variables
     */

    // tile size
    this.baseSize = 64;

    // program card related
    this.cardColumns = 4;
    this.cardSize = 48;
    this.cardPadding = 4;
    this.areaPadding = 7;

    // viewport size
    this.width = 12;
    this.height = 6;
    this.widthPx = this.width * this.baseSize;
    this.heightPx = this.height * this.baseSize;

    // terrain constants
    this.pixelPerHeightLevel = 16;

    /*********************************************
     * Initialize Crafty engine
     */

    Crafty.init(this.widthPx, this.heightPx);
    this.iso = Crafty.isometric.size(this.baseSize);

    /*********************************************
     * Initialize assets
     */

    Crafty.sprite(this.baseSize, 'assets/images/floor.png', {
      SprFloorGrey: [0, 0],
      SprFloorRed: [1, 0],
      SprFloorGreen: [2, 0],
      SprFloorBlue: [3, 0],
    });
    Crafty.sprite(this.baseSize, 'assets/images/robot.png', {
      SprBot: [0, 0],
    });
    Crafty.sprite(this.cardSize, 'assets/images/cards.png', {
      SprCardForward: [0, 0],
      SprCardTurnLeft: [1, 0],
      SprCardTurnRight: [2, 0],
      SprCardJump: [3, 0],
      SprCardAction: [4, 0],
      SprCardSubroutine1: [5, 0],
      SprCardSubroutine2: [6, 0],
    });

    this.reset(testMode);
  }

  Game.prototype.reset = function(testMode) {
    var botPosition = {
      x: 0,
      y: 4,
      z: 2,
      direction: 'downRight',
    };

    if (!testMode) {
      var level = this._defineLevel();
      this._createMap(level);
      this.bot = this._createBot(botPosition, level);
      this._initInstructionAreas(level);
      this._initSourcePanel();
      this._initButtons();
    }
    this.pristine = true;
    this.executing = false;
  }

  Game.prototype.stop = function() {
    // remove all entities
    Crafty('*').each(function() {
      this.destroy();
    });
    Crafty.stop();
  }

  Game.prototype._defineLevel = function() {
    // define level basics
    var level = {
      baseHeight: -2,
      maxHeight: 2,
      instructionAreas: {
        main: {
          instructions: 9,
        },
        subroutine1: {
          instructions: 3,
        },
        /*
        subroutine2: {
          instructions: 7,
        },
        */
      },
    };

    // define level terrain (map)
    level.terrain = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      /*
      [{ level: 2, floor: 'red' }, 2, { level: 2, floor: 'red' }],
      [2, 0, 0],
      [{ level: 2, floor: 'red' }, 2, { level: 2, floor: 'red' }],
      [0, 0, 2],
      [2, 2, { level: 2, floor: 'red' }],
      */
    ];

    return level;
  }

  /*
   * Creates the entities that represent the floor.
   */
  Game.prototype._createMap = function(level) {
    this._originalLevel = Crafty.clone(level);
    this.map = Crafty.e('Map').map(level);
  }

  /*
   * Creates the bot entity.
   */
  Game.prototype._createBot = function(botPosition) {
    this._originalBotPosition = Crafty.clone(botPosition);
    var botEntity = Crafty.e('Bot').bot(botPosition);
    return botEntity;
  }

  Game.prototype._initSourcePanel = function() {
    ['forward', 'turnLeft', 'turnRight', 'jump', 'action', 'subroutine1', 'subroutine2']
    .forEach(function(instruction, cardIndex) {
      Crafty.e('Card').card(instruction).place(cardIndex);
    });
  }

  Game.prototype._initInstructionAreas = function(level) {
    this.widthProgramArea = this.cardColumns * (this.cardSize + this.cardPadding) + this.cardPadding;
    this.offsetProgramArea =  this.widthPx - this.widthProgramArea;
    this.heightProgramArea = this.heightPx;

    // a visual separation of isometric playing field from program area
    this.createDiv(this.offsetProgramArea, 0, this.widthProgramArea, this.heightProgramArea, 'instruction-areas');

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
  }

  Game.prototype.activateInstructionArea = function(newActiveInstructionArea) {
    for (var instrAreaName in this.instructionAreas) {
      if (this.instructionAreas.hasOwnProperty(instrAreaName)) {
        var instructionArea = this.instructionAreas[instrAreaName];
        instructionArea.deactivate();
      }
    }
    this.activeInstructionArea = newActiveInstructionArea;
    this.activeInstructionArea.activate();
  },

  // TODO Put the creation of the divs into to the Slot entity
  Game.prototype.createDiv = function(x, y, w, h, className) {
    var div = document.createElement('div');
    if (className) {
      div.className = className;
    }
    div.setAttribute('style',
      'width: ' + w + 'px; ' +
      'height: ' + h + 'px; ' +
      'top: ' + y + 'px; ' +
      'left: ' + x + 'px;'
    );
    document.getElementById('cr-stage').appendChild(div);
    return div;
  }

  Game.prototype._initButtons = function() {
    var buttonWidth = 100;
    var buttonHeight = 48;
    this._buttonExecute = this._createButton(0, 'Execute', this.execute, buttonWidth, buttonHeight);
    this._buttonReset = this._createButton(1, 'Reset', this.resetLevel, buttonWidth, buttonHeight);
    this._buttonClear = this._createButton(2, 'Clear Program', this.clearProgram, buttonWidth, buttonHeight);
  }

  Game.prototype._createButton = function(buttonIndex, text, action, width, height) {
    var button = document.createElement('button');
    button.className = 'button';
    button.id = 'button-play';
    var padding = 5;
    var top = buttonIndex * (height + padding) + padding;
    var left = this.offsetProgramArea - width - padding;
    button.setAttribute('style',
      'width: ' + width + 'px; ' +
      'height: ' + height + 'px; ' +
      'top: ' + top + 'px; ' +
      'left: ' + left + 'px;'
    );
    button.appendChild(document.createTextNode(text));
    button.onclick = action.bind(game);
    document.getElementById('cr-stage').appendChild(button);
    return button;
  }

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
  }

  Game.prototype.resetLevel = function() {
    if (!this.executing) {
      this._removeMessages();
      this.map.reset();
      this._resetBotPosition();
      this.pristine = true;
    }
  }

  Game.prototype._resetBotPosition = function() {
    var position = Crafty.clone(this._originalBotPosition);
    this.bot.setPosition(position);
  }

  Game.prototype.clearProgram = function() {
    this._removeMessages();
    this._withEachSlot(function(slot) {
      if (slot.card) {
        var card = slot.card;
        slot.unlinkCard();
        card.destroy();
      }
    });
  }

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
  }

  Game.prototype._blockExecution = function() {
    this.executing = true;
    this._buttonExecute.setAttribute('disabled', true);
    this._buttonReset.setAttribute('disabled', true);
  }

  Game.prototype._unblockExecution = function() {
    this.executing = false;
    this._buttonExecute.removeAttribute('disabled');
    this._buttonReset.removeAttribute('disabled');
  }

  Game.prototype.hasWon = function() {
    return this.map.hasWon();
  }

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
  }

  Game.prototype._removeMessages = function() {
    if (this.messagePlayerHasWon) {
      this.messagePlayerHasWon.destroy();
      this.messagePlayerHasWon = null;
    }
  }

  return new Game();

})();
