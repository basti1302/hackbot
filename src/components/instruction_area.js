(function() {
  'use strict';

  /*
   * A set of slots representing either the main routine or a sub routine.
   */
  Crafty.c('InstructionArea', {

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


      var cssClass = 'instruction-area';
      if (this.name === 'main') {
        cssClass = 'active-instruction-area';
      }
      this.div = game.createDiv(
        game.offsetProgramArea,
        yOffset,
        game.widthPx,
        this.height,
        cssClass
      );
      this.div.onclick = this.onClick.bind(this);

      return this;
    },

    onClick: function() {
      game.activateInstructionArea(this);
    },

    deactivate: function() {
      this.div.className = 'instruction-area';
    },

    activate: function() {
      this.div.className = 'active-instruction-area';
    },

  });

})();

