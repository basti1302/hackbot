(function() {
  'use strict';

  Crafty.c('IsoDomSprite', {
    init: function() {
      this.requires('2D, DOM, IsoTranslator');
    },
  });

  Crafty.c('HbButton', {

    init: function() {
      this.requires('2D, DOM, Color, Text, Mouse');
    },

    /*
     * Crafty.c('Color', ...) contains line
     * 6797 e.style.lineHeight = 0;
     * which messes up the vertical alignment of text in the box. Not sure
     * why it has that. I patched it locally for now. See also:
     * https://groups.google.com/forum/#!topic/craftyjs/7uOiHZBNKtQ
     * Should allegedly be fixed in 0.6.2, but I'm not sure about the Color
     * component.
     */

    hbButton: function(x, y, w, h, fontSize, fontWeight) {
      fontSize = fontSize || '16px';
      fontWeight = fontWeight || 'normal';
      this
        .attr({ x : x, y: y, w: w, h: h, })
        .textFont({ size: fontSize, weight: fontWeight, })
        .unselectable()
      ;
      this.enable();
      return this;
    },

    onClick: function(callback) {
      this._onClickHandler = callback;
      this.bind('Click', this._onClickHandler);
    },

    enable: function() {
      $(this._element).addClass('button-enabled');
      $(this._element).removeClass('button-disabled');
      if (this._onClickHandler) {
        this.bind('Click', this._onClickHandler);
      }
    },

    disable: function() {
      $(this._element).removeClass('button-enabled');
      $(this._element).addClass('button-disabled');
    },



  });

  Crafty.c('HbMenuButton', {
    init: function() {
      this.requires('HbButton');
    },
    hbMenuButton: function(index, text, scene) {
      this
        .hbButton(game.widthPx/2 - 128, 120 + index * 48, 256, 32, '24px', 'bold' )
        .text(text)
      ;
      if (scene) {
        this.onClick(function() {
          Crafty.scene(scene);
        });
      } else {
        this.disable();
      }
      return this;
    },
  });

  Crafty.c('HbLevelSelectButton', {
    init: function() {
      this.requires('HbButton');
    },
    hbMenuButton: function(index, text, levelId) {
      this
        .hbButton(game.widthPx/2 - 128, 120 + index * 32, 256, 24)
        .text(text)
      ;
      this.onClick(function() {
        game.levelId = levelId;
        Crafty.scene('Play');
      });
      return this;
    },
  });



  Crafty.c('HbInstrPrevButton', {
    init: function() {
      this.requires('HbButton');
    },
    hbInstrPrevButton: function(index) {
      this
        .hbButton(game.widthPx - 244, game.heightPx - 48, 64, 32)
        .text('<<<')
        .onClick(function() {
          Crafty.scene('Instructions' + (index - 1));
        })
      ;
      return this;
    },
  });

  Crafty.c('HbInstrLeaveButton', {
    init: function() {
      this.requires('HbButton');
    },
    hbInstrLeaveButton: function() {
      this
        .hbButton(game.widthPx - 168, game.heightPx - 48, 32, 32)
        .text('^')
        .onClick(function() {
          Crafty.scene('Welcome');
        })
      ;
      return this;
    },
  });

  Crafty.c('HbInstrNextButton', {
    init: function() {
      this.requires('HbButton');
    },
    hbInstrNextButton: function(index) {
      this
        .hbButton(game.widthPx - 124, game.heightPx - 48, 64, 32)
        .text('>>>')
        .onClick(function() {
          Crafty.scene('Instructions' + (index + 1));
        })
      ;
      return this;
    },
  });


  Crafty.c('HbInstrButtons', {
    hbInstrButtons: function(index) {
      if (index > 1) {
        Crafty.e('HbInstrPrevButton').hbInstrPrevButton(index);
      }
      Crafty.e('HbInstrLeaveButton').hbInstrLeaveButton();
      if (index < 4) {
        Crafty.e('HbInstrNextButton').hbInstrNextButton(index);
      }
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
