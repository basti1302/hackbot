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
      this.slots = [];
      this.maxSlots = numberOfSlots;
      this.yOffset = yOffset;

      // create the individual slots
      this.drawSlots(numberOfSlots);

     if (game.editMode) {
        this.createEditorControls(name, numberOfSlots);
      }

      this.bind('Click', this.onClick.bind(this));

      if (this.name === 'main') {
        this.activate();
      } else {
        this.deactivate();
      }

      return this;
    },

    createEditorControls: function(name, numberOfSlots) {
      var isMain = name === 'main';
      var checkboxY = this.yOffset + 10;
      var value = numberOfSlots;
      var min = isMain ? 1 : 0;
      var max = numberOfSlots;
      if (isMain) {
        // checkbox collides with play/rewind/delete buttons otherwise
        checkboxY += 90;
      }

      var self = this;
      this.checkbox = $('<input type="checkbox" name="instruction-areas" ' +
        'checked="checked" ' +
        'class="editor-enable-disable" ' +
        'style="' +
        'left: ' + (game.offsetProgramArea - 30) + 'px; ' +
        'top: ' + (checkboxY) + 'px; "/>')
      .appendTo('#cr-stage')
      .change(function() {
        if (self.checkbox.prop('checked')) {
          self.redrawSlots(self.inputNumber.prop('value'));
        } else {
          self.redrawSlots(0);
        }
      });

      this.inputNumber = $('<input type="number" ' +
        'value="' + value + '" ' +
        'min="' + min + '" ' +
        'max="' + max + '" ' +
        'maxlength="2" ' +
        'class="editor-enable-disable editor-instr-slots" ' +
        'style="' +
        'left: ' + (game.offsetProgramArea - 50) + 'px; ' +
        'top: ' + (checkboxY + 20) + 'px; "/>')
      .appendTo('#cr-stage')
      .change(function() {
        this.value = self.redrawSlots(this.value);
      });
    },

    disable: function() {
      this.checkbox.prop('checked', false);
      this.redrawSlots(0);
    },

    redrawSlots: function(numberOfSlots) {
      if (isNaN(numberOfSlots) || !isFinite(numberOfSlots)) {
        numberOfSlots = this.maxSlots;
      }
      numberOfSlots = Math.floor(numberOfSlots); // html number input accepts floats
      if (numberOfSlots > this.maxSlots) {
        numberOfSlots = this.maxSlots;
      }
      if (numberOfSlots < 0) {
        numberOfSlots = 0;
      }
      if (numberOfSlots > 0) {
        this.checkbox.prop('checked', true);
      }

      // Delete superfluous slots
      for (var row = this.slots.length - 1; row >= 0; row--) {
        for (var column = this.slots[row].length - 1; column >= 0; column--) {
          var slot = this.slots[row][column];
          var slotIndex = row * 4 + column;
          if (slotIndex >= numberOfSlots) {
            if (slot.card) {
              slot.card.destroy();
              slot.unlinkCard();
            }
            this.slots[row].splice(column, 1);
            if (column === 0) {
              this.slots.splice(row, 1);
            }
            slot.destroy();
          }
        }
      }

      if (this.name !== 'main') {
        game.toggleCardInSourcePanel(this.name);
      }

      // Let drawSlots() add more slots if needed
      this.drawSlots(numberOfSlots);
      return numberOfSlots;
    },

    drawSlots: function(numberOfSlots) {
      this.cardRows = Math.ceil(numberOfSlots / game.cardColumns);

      var slotCounter = 0;
      for (var row = 0; row < this.cardRows; row++) {
        var rowArray = this.slots[row];
        if (!rowArray) {
          rowArray = [];
          this.slots.push(rowArray);
        }
        for (var column = 0; column < game.cardColumns; column++) {
          var slot = rowArray[column];
          if (!slot) {
            rowArray.push(Crafty.e('Slot').slot(row, column, this.yOffset, this));
          }
          slotCounter++;
          if (slotCounter >= numberOfSlots) {
            break;
          }
        }
      }
      if (numberOfSlots > 0) {
        this.height =
          this.cardRows * (game.cardSize + game.cardPadding) + game.cardPadding;
      } else {
        this.height = 0;
      }

      this.attr({
        x: game.offsetProgramArea,
        y: this.yOffset,
        w: game.widthPx,
        h: this.height,
      });
      this.numberOfSlots = numberOfSlots;
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

    reorder: function() {
      var emptySeen = false;
      for (var row = 0; row < this.slots.length; row++) {
        var rowArray = this.slots[row];
        for (var column = 0; column < rowArray.length; column++) {
          var slot = rowArray[column];
          if (!emptySeen && slot.isEmpty()) {
            emptySeen = true;
          }
          else if (emptySeen && slot.isOccupied()) {
            // triggers slot._delegateToPredecessor
            var card = slot.card;
            slot.unlinkCard();
            slot.dropCard(card, false);
          }
        }
      }
    },

    destroyAllCardsAndSlots: function() {
      for (var row = 0; row < this.slots.length; row++) {
        var rowArray = this.slots[row];
        for (var column = 0; column < rowArray.length; column++) {
          var slot = rowArray[column];
          if (slot.isOccupied()) {
            var card = slot.card;
            slot.unlinkCard();
            card.destroy();
            slot.destroy();
          }
        }
      }
    },

  });

})();

