(function() {
  'use strict';

  /*
   * A set of slots representing either the main routine or a sub routine.
   */
  Crafty.c('InstructionArea', {

    init: function() {
      this.requires('2D, DOM');
    },

    instructionArea: function(name, numberOfSlots, yOffset) {
      this.name = name;
      this.cardRows = Math.ceil(numberOfSlots / game.cardColumns);
      this.slots = [];

      // create the individual slots
      var slotCounter = 0;
      for (var row = 0; row < this.cardRows; row++) {
        var rowArray = [];
        for (var column = 0; column < game.cardColumns; column++) {
          rowArray.push(Crafty.e('Slot').slot(row, column, yOffset, this));
          slotCounter++;
          if (slotCounter >= numberOfSlots) {
            break;
          }
        }
        this.slots.push(rowArray);
      }
      this.height =
        this.cardRows * (game.cardSize + game.cardPadding) + game.cardPadding;

      this.attr({
        x: game.offsetProgramArea,
        y: yOffset,
        w: game.widthPx,
        h: this.height,
      });
      this.bind('Click', this.onClick.bind(this));

      if (this.name === 'main') {
        this.activate();
      } else {
        this.deactivate();
      }

      return this;
    },

    onClick: function() {
      game.activateInstructionArea(this);
    },

    deactivate: function() {
      $(this._element)
        .addClass('instruction-area')
        .removeClass('active-instruction-area');
    },

    activate: function() {
      $(this._element)
        .addClass('active-instruction-area')
        .removeClass('instruction-area');
    },

  });

})();

