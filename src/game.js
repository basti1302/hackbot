game = (function() {
  'use strict';

  // prevent arrow keys and space to make the browser scroll around
  window.addEventListener('keydown', function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
  }, false);

  Crafty.scene('Loading', function() {
    game.loadAssets(function() {
      Crafty.scene('Welcome');
    });
  });

  Crafty.scene('Welcome', function() {

    // draw welcome line with text shadows
    for (var i = 0; i < 3; i++) {
      Crafty.e('2D, DOM, Text')
        .text('Welcome to Hackbot')
        .attr({ x: 0, y: 24 + i, w: game.widthPx, z: 3 - i })
        .textFont({ size: '36px', weight: 'bold' })
        .textColor('#' + (6 - 2*i) + '00000')
        .css('padding', i + 'px')
      ;
    }

    Crafty
      .e('HbMenuButton')
      .hbMenuButton(0, 'Play', 'Play');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(1, 'How To Play', 'Instructions1');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(2, 'Options');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(3, 'Level Editor');
  });

  // TODO Use card images directly to explain them.
  // TODO Have a scaled down image of the playing screen with explanations of
  // the various areas.
  Crafty.scene('Instructions1', function() {
    Crafty.e('InstructionPage')
      .text('\
Welcome to Hackbot! The goal of the game is simple: Toggle all \
red tiles to green. To achieve this, you will program a little green robot, \
affectionately called "hackbot". At the bottom of the screen you have the \
source panel, from where you draw movement cards and put them into the \
programming areas on the right.\
<p>\
    ');
    Crafty.e('HbInstrButtons').hbInstrButtons(1);
  });

  Crafty.scene('Instructions2', function() {
    Crafty.e('InstructionPage')
      .text('\
These are the movement cards:<p><img src="assets/images/cards.png"><p>\
Each movement card has its own effect. From left to right:<p>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: 0px 0px; background-repeat: no-repeat no-repeat;" alt="straight arrow"></span> \
Move one step in the direction the robot is facing.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -48px 0px; background-repeat: no-repeat no-repeat;" alt="arrow turning left"></span> \
Rotate 90 degrees, counter-clockwise.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -96px 0px; background-repeat: no-repeat no-repeat;" alt="arrow turning left"></span> \
Rotate 90 degrees, clockwise.<br>\
    ');
    Crafty.e('HbInstrButtons').hbInstrButtons(2);
  });

  Crafty.scene('Instructions3', function() {
    Crafty.e('InstructionPage')
      .text('\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: baseline; background-image: url(assets/images/cards.png); background-position: -144px 0px; background-repeat: no-repeat no-repeat;" alt="slim arrow"></span> \
Jump: If the bot stands before a tile that is one level higher, it will jump up and forward onto this tile. If the bot stands before a tile that is one or several levels deeper, it will jump down and forward. But: If the tile in front of the bot is on the same level, it will not jump and also not move forward.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -192px 0px; background-repeat: no-repeat no-repeat;" alt="exclamation mark"></span> \
Toggle a tile, either from red to green or from green to red.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -240px 0px; background-repeat: no-repeat no-repeat;" alt="the digit one"></span> \
Jump to sub routine 1. (More on subroutines below).<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -288px 0px; background-repeat: no-repeat no-repeat;" alt="the digit two"></span> \
Jump to sub routine 2. (More on subroutines below).<br>\
    ');
    Crafty.e('HbInstrButtons').hbInstrButtons(3);
  });

  Crafty.scene('Instructions4', function() {
    Crafty.e('InstructionPage')
      .text('\
Program execution starts at the main program area (top right corner). Each \
card you place in the slots will later be executed, one after the other. \
When all red tiles have been toggled to green, you have solved the leve. \
Otherwise, when program execution has reached the end of the main program \
area, the program will also stop. When you place the card for a sub routine \
(for example for sub routine 1) into a slot, <em>all</em> cards in sub routine \
1 will be executed, and after that, your main program continues. You can also \
call one sub routine from another. Or have a sub routine call itself. This is \
how you can create endless loops (which are required to solve some levels). \
<p>\
More documentation coming soon...<p>\
or later...<p>\
or never. Who knows.\
');
    Crafty.e('HbInstrButtons').hbInstrButtons(4);
  });

  Crafty.scene('LevelSelect', function() {
    throw new Error('Not yet implemented. Sorry.');
  });

  Crafty.scene('Play', function() {
    game.startLevel();
  });

  Crafty.scene('LevelSolved', function() {
    throw new Error('Not yet implemented. Sorry.');
  });

  Crafty.scene('LevelEditor', function() {
    throw new Error('Not yet implemented. Sorry.');
  });

  function Game() {
  }

  Game.prototype.start = function() {
    this.init();
    Crafty.scene('Loading');
  }

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
  }

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
  }

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
  }

  Game.prototype.stop = function() {
    // remove all entities
    Crafty('*').each(function() {
      this.destroy();
    });
    Crafty.stop();
  }

  Game.prototype._defineLevel = function() {
    var levelId = 'slalom';
    var level = this.levels[levelId];
    if (!level) {
      throw new Error('Unknown level: ' + levelId);
    }
    return level;
  }

  /*
   * Creates the entities that represent the floor.
   */
  Game.prototype._createMap = function(level) {
    this._originalLevel = Crafty.clone(level);
    this.map = Crafty.e('Map');
    this.map.map(level);
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
    var buttonWidth = 80;
    var buttonHeight = 40;
    this._buttonExecute = this._createButton(0, 'Execute', this.execute, buttonWidth, buttonHeight);
    this._buttonReset = this._createButton(1, 'Reset', this.resetLevel, buttonWidth, buttonHeight);
    this._buttonClear = this._createButton(2, 'Clear', this.clearProgram, buttonWidth, buttonHeight);
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
