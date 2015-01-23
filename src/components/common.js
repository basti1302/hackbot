(function() {
  'use strict';

  Crafty.c('IsoDomSprite', {
    init: function() {
      this.requires('2D, DOM, IsoTranslator');
    },
  });

  Crafty.c('HbMessage', {
    init: function() {
      this.requires('2D, DOM, Text, Mouse');
      var x = (game.widthPx - game.widthProgramArea) / 2 - 175,
          y = game.heightPx/2 - 75;
      this.attr({
        x: x,
        y: y,
        w: 350,
        h: 150,
        z: 1000
      });
    },

    hbMessage: function(text) {
      this.textFont({ size: '60px', weight: 'bold' })
      this.text(text);
      this.alpha = 0.9;
      return this;
    },
  });

  Crafty.c('HbButton', {

    init: function() {
      this.requires('2D, DOM, Color, Mouse');
    },

    hbButton: function(x, y, w, h) {
      // console.log(x, y, w, h);
      this.attr({ x : x, y: y, w: w, h: h, });
      this.enable();
      return this;
    },

    onClick: function(callback) {
      this._onClickHandler = callback;
      this.bind('Click', this._onClickHandler);
      return this;
    },

    enable: function() {
      $(this._element).addClass('button-enabled');
      $(this._element).removeClass('button-disabled');
      if (this._onClickHandler) {
        this.bind('Click', this._onClickHandler);
      }
      if (typeof this.enableSprite === 'function') {
        this.enableSprite();
      }
      return this;
    },

    disable: function() {
      $(this._element).removeClass('button-enabled');
      $(this._element).addClass('button-disabled');
      if (this._onClickHandler) {
        this.unbind('Click');
      }
      if (typeof this.disableSprite === 'function') {
        this.disableSprite();
      }
      return this;
    },
  });

  Crafty.c('HbTextButton', {
    init: function() {
      this.requires('HbButton, Text');
    },

    hbTextButton: function(text, fontSize, fontWeight) {
      fontSize = fontSize || '16px';
      fontWeight = fontWeight || 'normal';
      this
        .textFont({ size: fontSize, weight: fontWeight, })
        .unselectable()
        .text(text)
      ;
      return this;
    },
  });

  Crafty.c('HbMenuButton', {
    init: function() {
      this.requires('HbTextButton');
    },

    hbMenuButton: function(index, text, scene, url) {
      this
        .hbButton(game.widthPx/2 - 128, 120 + index * 48, 256, 32)
        .hbTextButton(text, '24px', 'bold')
      ;
      if (scene) {
        this.onClick(function() {
          if (url) {
            history.pushState(null, null, url);
          }
          Crafty.scene(scene);
        });
      } else {
        this.disable();
      }
      return this;
    },
  });

  Crafty.c('HbSpriteButton', {
    init: function() {
      this.requires('HbButton');
    },

    hbSpriteButton: function(spriteEnabled, spriteDisabled) {
      this._spriteEnabled = spriteEnabled;
      this._spriteDisabled = spriteDisabled;
      this.enableSprite();
      return this;
    },

    enableSprite: function() {
      this.removeComponent(this._spriteDisabled);
      this.addComponent(this._spriteEnabled);
    },

    disableSprite: function() {
      this.removeComponent(this._spriteEnabled);
      this.addComponent(this._spriteDisabled);
    },
  });

  Crafty.c('HbCategorySelectButton', {
    init: function() {
      this.requires('HbTextButton');
    },

    hbCategorySelectButton: function(index, text, category, categoryId) {
      this
        .hbButton(game.widthPx/2 - 128, 120 + index * 32, 256, 24)
        .hbTextButton(text)
      ;
      this.onClick(function() {
        history.pushState(null, null, '?#/play/' + categoryId);
        game.category = category;
        game.category.id = categoryId;
        Crafty.scene('LevelSelect');
      });
      return this;
    },
  });

  Crafty.c('HbLevelSelectButton', {
    init: function() {
      this.requires('HbTextButton');
    },

    hbLevelSelectButton: function(index, text, categoryId, levelId) {
      this
        .hbButton(game.widthPx/2 - 128, 120 + index * 32, 256, 24)
        .hbTextButton(text)
      ;
      this.onClick(function() {
        history.pushState(null, null, '?#/play/' + categoryId + '/' + levelId);
        game.levelId = levelId;
        Crafty.scene('Play');
      });
      return this;
    },
  });

  Crafty.c('HbInstrPrevButton', {
    init: function() {
      this.requires('HbSpriteButton');
    },

    hbInstrPrevButton: function(index) {
      this
      .hbSpriteButton('SprButtonPrevious', 'SprButtonPreviousDisabled')
      .hbButton(game.widthPx - 212, game.heightPx - 48, 48, 25)
      .onClick(function() {
        history.pushState(null, null, '?#/instructions/' + (index - 1));
        Crafty.scene('Instructions' + (index - 1));
      });
      return this;
    },
  });

  Crafty.c('HbInstrLeaveButton', {
    init: function() {
      this.requires('HbSpriteButton');
    },
    hbInstrLeaveButton: function() {
      this
      .hbSpriteButton('SprButtonLeave', 'SprButtonLeaveDisabled')
      .hbButton(game.widthPx - 152, game.heightPx - 48, 48, 25)
      .onClick(function() {
        history.pushState(null, null, '?#');
        Crafty.scene('Welcome');
      });
      return this;
    },
  });

  Crafty.c('HbInstrNextButton', {
    init: function() {
      this.requires('HbSpriteButton');
    },
    hbInstrNextButton: function(index) {
      this
      .hbSpriteButton('SprButtonNext', 'SprButtonNextDisabled')
      .hbButton(game.widthPx - 92, game.heightPx - 48, 48, 25)
      .onClick(function() {
        history.pushState(null, null, '?#/instructions/' + (index + 1));
        Crafty.scene('Instructions' + (index + 1));
      });
      return this;
    },
  });


  Crafty.c('HbInstrButtons', {
    hbInstrButtons: function(index) {
      var prev = Crafty.e('HbInstrPrevButton').hbInstrPrevButton(index);
      Crafty.e('HbInstrLeaveButton').hbInstrLeaveButton();
      var next = Crafty.e('HbInstrNextButton').hbInstrNextButton(index);
      if (index ===  1) {
        prev.disable();
      }
      if (index === 4) {
        next.disable();
      }
      return this
    },
  });

  Crafty.c('InstructionPage', {
    init: function() {
      this.requires('2D, DOM, Text');
      this
        .attr({ x: 0, y: 0, w: game.widthPx - 50 })
        .textFont({ size: '16px' })
        .textColor('#FFFFFF')
        .css({ 'padding': '20px', 'text-align': 'left' })
      ;
    },
  });

})();
