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

  Game.prototype.loadLevelFromJson = function(jsonString) {
    try {
      this.levelFromJson = JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  Game.prototype.init = function(testMode) {

    /*********************************************
     * Initialize constants and "global" variables
     */

    // if running in a unit test, this is true, otherwise false
    this.testMode = testMode;

    // tile size
    this.baseSize = 64;
    this.floorImgHeight = 48;

    // program card related
    this.defaultCards = [
      'forward',
      'turnLeft',
      'turnRight',
      'jump',
      'action',
    ];
    this.cardColumns = 4;
    this.cardSize = 48;
    this.cardPadding = 4;
    this.areaPadding = 7;

    // buttons
    this.buttonPadding = 5;
    this.buttonWidth = 48;
    this.buttonHeight = 25;
    this.buttons = {
      play: 'SprButtonPlay',
      rewind: 'SprButtonRewind',
      'delete': 'SprButtonDelete',
      leave: 'SprButtonLeave',
      previous: 'SprButtonPrevious',
      next: 'SprButtonNext',
    };

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
    // TODO With crafty 0.6.3 now, there might be a nicer way of loading and
    // defining sprites from the image maps, see
    // http://craftyjs.com/api/Crafty-loader.html and the "sprites" property
    // in the assetsObj in the example there.
    Crafty.load({
      images: [
        'assets/images/floor.png',
        'assets/images/robot.png',
        'assets/images/cards.png',
        'assets/images/buttons.png',
      ]
    }, function onLoad() {
      Crafty.sprite(self.baseSize, self.floorImgHeight, 'assets/images/floor.png', {
        SprFloorGrey: [0, 0],
        SprFloorGreyMouseOver: [1, 0],
        SprFloorGreyTileSelected: [2, 0],
        SprFloorRed: [0, 1],
        SprFloorRedMouseOver: [1, 1],
        SprFloorRedTileSelected: [2, 1],
        SprFloorGreen: [0, 2],
        SprFloorGreenMouseOver: [1, 2],
        SprFloorGreenTileSelected: [2, 2],
        SprFloorBlue: [0, 3],
        SprFloorBlueMouseOver: [1, 3],
        SprFloorBlueTileSelected: [2, 3],
        SprFloorGhost: [0, 4],
        SprFloorGhostMouseOver: [1, 4],
        SprFloorGhostTileSelected: [2, 4],
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
      Crafty.sprite(48, 25, 'assets/images/buttons.png', {
        SprButtonPlay: [0, 0],
        SprButtonPlayDisabled: [1, 0],
        SprButtonRewind: [0, 1],
        SprButtonRewindDisabled: [1, 1],
        SprButtonDelete: [0, 2],
        SprButtonDeleteDisabled: [1, 2],
        SprButtonLeave: [0, 3],
        SprButtonLeaveDisabled: [1, 3],
        SprButtonPrevious: [0, 4],
        SprButtonPreviousDisabled: [1, 4],
        SprButtonNext: [0, 5],
        SprButtonNextDisabled: [1, 5],
      });
      callback();
    });
  };

  Game.prototype.startLevel = function() {
    this.reset();
  };

  Game.prototype.leaveLevel = function() {
    if (!this.editMode) {
      if (this.levelFromJson) {
        history.pushState(null, null, '?#/play');
        Crafty.scene('CategorySelect');
      } else {
        history.pushState(null, null, '?#/play/' + game.category.id);
        Crafty.scene('LevelSelect');
      }
    } else {
      history.pushState(null, null, '?#');
      Crafty.scene('Welcome');
    }
  };

  Game.prototype.reset = function() {
    if (!this.testMode) {
      var level = this._defineLevel();
      this._createMap(level);
      this.bot = this._createBot(level.bot, level);
      this._initSourcePanel(level);
      this._initInstructionAreas(level);
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
    if (this.levelFromJson) {
      // already loaded level from file or from query parameter
      return this.levelFromJson;
    } else {
      // defaults
      if (this.category == null) {
        this.category = this.levels.categories.basics;
      }
      var levelId = this.levelId || 'first';

      var level = this.category.levels[levelId];
      if (!level) {
        throw new Error('Unknown level: ' + levelId);
      }
      return level;
    }
  };

  /*
   * Creates the entities that represent the floor.
   */
  Game.prototype._createMap = function(level) {
    this._originalLevel = Crafty.clone(level);
    if (this.map) {
      this.map.destroyAllEntities();
      this.map.destroy();
    }
    this.map = Crafty.e('Map');
    this.map.map(level);
  };

  /*
   * Creates the bot entity.
   */
  Game.prototype._createBot = function(botPosition) {
    if (this.map) {
      botPosition.z = this.map.getTileZ(botPosition.x, botPosition.y) + 1;
    }
    var botEntity = Crafty.e('Bot').bot(botPosition);
    return botEntity;
  };

  Game.prototype._initSourcePanel = function(level) {
    // Clone cards from level definition or clone default cards.
    // We modify the array (pushing action subroutineX into it) on each reset.
    // Without the clone we would double and triple the subroutine cards on each
    // subsequent reset.
    var cards = level.cards ? level.cards.slice() : this.defaultCards.slice();
    if (level.instructionAreas.subroutine1) {
      cards.push('subroutine1');
    }
    if (level.instructionAreas.subroutine2) {
      cards.push('subroutine2');
    }
    var c = []
    cards.forEach(function(instruction, cardIndex) {
      c.push(Crafty.e('Card').card(instruction).place(cardIndex));
    });
    this.cards = c;
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
      var instructionArea =
        Crafty.e('InstructionArea')
        .instructionArea(name, areaInfo.instructions, yOffset);
      yOffset += instructionArea.height + this.areaPadding;
      this.instructionAreas[name] = instructionArea;
      if (this.editMode && name !== 'main') {
        instructionArea.disable();
      }
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

  Game.prototype.reorderInstructionAreas = function() {
    for (var instrAreaName in this.instructionAreas) {
      if (this.instructionAreas.hasOwnProperty(instrAreaName)) {
        var instructionArea = this.instructionAreas[instrAreaName];
        instructionArea.reorder();
      }
    }
  };

  Game.prototype.toggleCardInSourcePanel = function(instruction) {
    this.cards.forEach(function(card) {
      if (card.instruction === instruction) {
        card.toggleEnabled(true);
      }
    });
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
    var sprite = this.buttons[name];
    var button = Crafty.e('HbSpriteButton')
    .hbSpriteButton(sprite, sprite + 'Disabled')
    .hbButton(x, y, this.buttonWidth, this.buttonHeight)
    .bind('Click', action.bind(game))
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
      this.bot.resetPosition();
      this.pristine = true;
    }
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

  Game.prototype.removeInstructionTypeFromProgram = function(instruction) {
    this._withEachSlot(function(slot) {
      if (slot.card && slot.card.instruction === instruction) {
        var card = slot.card;
        slot.unlinkCard();
        card.destroy();
      }
    });
    this.reorderInstructionAreas();
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
    var self = this;
    setTimeout(function() {
      if (!self.messagePlayerHasWon) {
        self.messagePlayerHasWon = Crafty
        .e('HbMessage')
        .hbMessage('Level Solved!')
        .bind('Click', function() {
          game._removeMessages();
        });
      }
    }, 500);
  };

  Game.prototype._removeMessages = function() {
    if (this.messagePlayerHasWon) {
      this.messagePlayerHasWon.destroy();
      this.messagePlayerHasWon = null;
    }
  };

  Game.prototype.exportLevel = function() {
    var level = {
      name: 'A  new Hackbot level', // TODO input fields
      description: '', // TODO input fields
      instructionAreas: {
        main: {
          instructions: this.instructionAreas.main.numberOfSlots
        },
      },
      bot: this.bot.exportStartPosition(),
      cards: this._exportCards(),
      terrain: this.map.exportTerrain(),
    };
    this._exportSubroutines(level);
    this._startDownload(level);
  };

  Game.prototype._exportCards = function() {
    return this.cards
    .filter(function(card) {
      return card.enabled
    }).filter(function(card) {
      return card.instruction.indexOf('subroutine') !== 0;
    }).map(function(card) {
      return card.instruction;
    });
  };

  Game.prototype._exportSubroutines = function(level) {
    if (this.instructionAreas.subroutine1 &&
        this.instructionAreas.subroutine1.numberOfSlots > 0) {
      level.instructionAreas.subroutine1 = {
        instructions: this.instructionAreas.subroutine1.numberOfSlots
      }
    }
    if (this.instructionAreas.subroutine2 &&
        this.instructionAreas.subroutine2.numberOfSlots > 0) {
      level.instructionAreas.subroutine2 = {
        instructions: this.instructionAreas.subroutine2.numberOfSlots
      }
    }
  };

  Game.prototype._startDownload = function(level) {
    var download = JSON.stringify(level);
    var href = 'data:text/plain,' + encodeURIComponent(download);
    var link = $('<a id="download" href="' + href + '" download="level.json">Download</a>')
    link.click(function() {
      // remove the bogus link once download has started
      link.remove();
    });
    $('#editor-download').append(link);
    link[0].click();
  };

  return new Game();

})();
