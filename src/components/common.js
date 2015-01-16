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
      if (typeof this.enableImg === 'function') {
        this.enableImg();
      }
      return this;
    },

    disable: function() {
      $(this._element).removeClass('button-enabled');
      $(this._element).addClass('button-disabled');
      if (this._onClickHandler) {
        this.unbind('Click');
      }
      if (typeof this.disableImg === 'function') {
        this.disableImg();
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

  Crafty.c('HbImgButton', {
    init: function() {
      this.requires('HbButton, Image');
    },

    hbImgButton: function(name) {
      this._imageName = name;
      this._setImage(name);
      return this;
    },

    _setImage: function(name) {
      var self = this;
      var w = this.attr('w');
      var h = this.attr('h');

      this.image('/assets/images/buttons/' + name + '.png');
      // Overrides Crafty's behaviour to resizes the DOM element to image
      // dimensions unless it is a repeated image. Bad design decision,
      // if you ask me. Next to lines are for the case where image asset is
      // already loaded.
      this.w = w;
      this.h = h;

      // Overrides Crafty's onload handler which also resizes the DOM element,
      // see above.
      this.img.onload = function () {
        self.ready = true;
        self.trigger("Invalidate");
      };
      return this;
    },

    enableImg: function() {
      if (this._imageName) {
        this._setImage(this._imageName);
      }
    },

    disableImg: function() {
      if (this._imageName) {
        this._setImage(this._imageName + '_disabled');
      }
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
        history.pushState(null, null, '#/play/' + categoryId);
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
        history.pushState(null, null, '#/play/' + categoryId + '/' + levelId);
        game.levelId = levelId;
        Crafty.scene('Play');
      });
      return this;
    },
  });

  Crafty.c('HbInstrPrevButton', {
    init: function() {
      this.requires('HbImgButton');
    },

    hbInstrPrevButton: function(index) {
      this
        .hbButton(game.widthPx - 212, game.heightPx - 48, 48, 32)
        .hbImgButton('previous')
        .onClick(function() {
          history.pushState(null, null, '#/instructions/' + (index - 1));
          Crafty.scene('Instructions' + (index - 1));
        })
        .css({ 'background-position': '16px 5px' })
      ;
      return this;
    },
  });

  Crafty.c('HbInstrLeaveButton', {
    init: function() {
      this.requires('HbImgButton');
    },
    hbInstrLeaveButton: function() {
      this
        .hbButton(game.widthPx - 152, game.heightPx - 48, 48, 32)
        .hbImgButton('leave')
        .onClick(function() {
          history.pushState(null, null, '#');
          Crafty.scene('Welcome');
        })
        .css({ 'background-position': '16px 5px' })
      ;
      return this;
    },
  });

  Crafty.c('HbInstrNextButton', {
    init: function() {
      this.requires('HbImgButton');
    },
    hbInstrNextButton: function(index) {
      this
        .hbButton(game.widthPx - 92, game.heightPx - 48, 48, 32)
        .hbImgButton('next')
        .onClick(function() {
          history.pushState(null, null, '#/instructions/' + (index + 1));
          Crafty.scene('Instructions' + (index + 1));
        })
        .css({ 'background-position': '16px 5px' })
      ;
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
