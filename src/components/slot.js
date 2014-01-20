(function() {
  'use strict';

  Crafty.c('Slot', {

    slot: function (row, column, yOffset, instructionArea) {
      this.row = row;
      this.column = column;
      this.instructionArea = instructionArea;
      if (!game.offsetProgramArea) {
        throw new Error('game.offsetProgramArea is not defined, null or 0.');
      }
      this.x1 = game.offsetProgramArea
             + (game.cardSize + game.cardPadding) * column
             + game.cardPadding;
      this.y1 = (game.cardSize + game.cardPadding) * row
              + game.cardPadding
              + yOffset;
      this.x2 = this.x1 + game.cardSize;
      this.y2 = this.y1 + game.cardSize;
      this.div = game.createDiv(this.x1, this.y1, game.cardSize, game.cardSize, 'slot');
      this.div.onclick = instructionArea.onClick.bind(instructionArea);
      return this;
    },

    isEmpty: function() {
      return !this.card;
    },

    isOccupied: function() {
      return !this.isEmpty();
    },

    dropCard: function(card, fromSourcePanel) {
      // occupied? then replace current card
      if (this.isOccupied()) {
        // same card? do nothing
        /*
        if (this.card === card) {
          return;
        }
        */

        // return former occupying card to source panel
        this.card.returnToSourcePanel();
        // drop new card
        this._dropHere(card, fromSourcePanel);

      // empty? drop at a first empty slot, not here, if possible
      } else if (this._delegateToPredecessor(card, fromSourcePanel)) {
        // card already dropped at predecessor slot, nothing to do

      // no empty predecessor? drop here
      } else {
        this._dropHere(card, fromSourcePanel);
      }
    },

    _dropHere: function(card, fromSourcePanel) {
      card.cloneInSourceIfNeeded();
      var tweenTime = fromSourcePanel ? 150 : 50;
      card.tween({ x: this.x1, y: this.y1 }, tweenTime);
      this.unlinkCard();
      this.linkCardToSlot(card);
    },

    _delegateToPredecessor: function(card, fromSourcePanel) {
      var predecessor = this._findPredecessor();
      if (!predecessor) {
        return false;
      }
      if (predecessor.isEmpty()) {
        predecessor.dropCard(card, fromSourcePanel);
        return true;
      }
      return false;
    },

    /* find program card slot just before this one, by going one to the left, or
     * up a row, if beginning of row was reached */
    _findPredecessor: function() {
      var predRow = this.row;
      var predCol = this.column - 1;
      if (predCol < 0) {
        predRow--;
        if (predRow < 0) {
          // already at (0, 0), no predecessor
          return null;
        }
        predCol = this.instructionArea.slots[predRow].length - 1;
      }
      return this.instructionArea.slots[predRow][predCol];
    },

    linkCardToSlot: function(card) {
      card.slot = this;
      this.card = card;
    },

    unlinkCard: function() {
      if (this.card) {
        this.card.slot = null;
      }
      this.card = null;
    },

  });

})();

