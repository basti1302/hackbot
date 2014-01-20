/*
 * TODO
 * - Fix sprite animation in Chrome
 * - put on github
 * - make it available online?
 * - remove cards by click
 * - disable execution while already executing - broken right now
 *   or better yet, clicking execute/reset/clear program cards *cancel* current
 *   execution - similar to _hasWon check
 * - when removing cards from instruction area, all other cards after should go
 *   to their predecessor
 * - when dropping cards in occupied spaces, insert them instead of replace
 *   them. Cards get destroyed if the move out at the end.
 * - remake tiles and bot with baseSize 64 - bot without animation
 * - redo cards with baseSize 48
 * - correct instruction area and slot sizes, so that cards fit perfectly
 * - extract into components/entities:
 *   - source panel
 *   - program panel
 *   - each program area
 *   - button area
 * - make icons for buttons
 * - relocate buttons to upper right corner of map area, left to program panel,
 *   stacked vertically
 * - Animate bot jump even when its jumping in situ
 * - Scenes
 * - Asset Pre-Loading
 * - Welcome scene
 * - level editor
 * - save levels to local storage
 * - load levels from local storage
 * - export/import levels from local storage to/from file
 * - enable levels to have instr areas with a number of slots that are not a
 *   multiple of 4 - just do not create all slots in the last row
 * - put a opaque div below the 'Level Solved!' message
 * - make 'Level Solved!' message dissappear on reset/execute/clear program area
 * - deactivate manual control
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
    this.baseSize = 128;

    // program card related
    this.cardColumns = 4;
    this.cardSize = 64;
    this.cardPadding = 4;
    this.areaPadding = 7;

    // viewport size
    this.width = 7;
    this.height = 4;
    this.widthPx = this.width * this.baseSize;
    this.heightPx = this.height * this.baseSize;

    // terrain constants
    this.pixelPerHeightLevel = 32;

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
    Crafty.sprite(64, 'assets/images/cards.png', {
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
    // remove all entities
    Crafty('*').each(function() {
      this.destroy();
    });

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
  }

  Game.prototype._defineLevel = function() {
    // define level basics
    var level = {
      baseHeight: -2,
      maxHeight: 3,
      instructionAreas: {
        main: {
          instructions: 12,
        },
        subroutine1: {
          instructions: 8,
        },
        subroutine2: {
          instructions: 8,
        },
      },
    };

    // define level terrain (map)
    level.terrain = [
      [{ level: 2, floor: 'red' }, 2, { level: 2, floor: 'red' }],
      [2, 0, 0],
      [{ level: 2, floor: 'red' }, 2, { level: 2, floor: 'red' }],
      [0, 0, 2],
      [2, 2, { level: 2, floor: 'red' }],
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
    this._createButton(0, 'Execute', this.execute, buttonWidth, buttonHeight);
    this._createButton(1, 'Reset', this.resetLevel, buttonWidth, buttonHeight);
    this._createButton(2, 'Clear Program', this.clearProgram, buttonWidth, buttonHeight);
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
  }

  Game.prototype.execute = function() {
    var self = this;
    if (!this.pristine) {
      this.resetLevel();
      return setTimeout(function() { self.execute() }, 300);
    }
    if (!this.executing) {
      this.pristine = false;

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
        self.executing = false;
        if (self.hasWon()) {
          self.onPlayerHasWon();
        }
      });
    }
  }

  Game.prototype.resetLevel = function() {
    this.map.reset();
    this._resetBotPosition();
    this.pristine = true;
  }

  Game.prototype._resetBotPosition = function() {
    var position = Crafty.clone(this._originalBotPosition);
    this.bot.setPosition(position);
  }

  Game.prototype.clearProgram = function() {
    this._withEachSlot(function(slot) {
      if (slot.card) {
        var card = slot.card;
        slot.unlinkCard();
        card.destroy();
      }
    });
    this.resetLevel();
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

  Game.prototype.hasWon = function() {
    return this.map.hasWon();
  }

  Game.prototype.onPlayerHasWon = function() {
    // TODO Something better needs to happen here :-)
    var message = Crafty
      .e('2D, DOM, Text')
      .textFont({ size: '60px', weight: 'bold' })
      .textColor('#FF0000')
      .text('Level Solved!');
    var x = (this.widthPx - this.widthProgramArea) / 2 - 125,
        y = this.heightPx/2 - 75;
    message.attr({ x: x, y: y, z: 1000 })
  }

  return new Game();

})();
