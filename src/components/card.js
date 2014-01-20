(function() {
  'use strict';

  Crafty.c('Card', {

      // shared by all Card entities to keep track of if which cards are in the
    // source panel and which are currently not there (because the card is
    // currently being dragged from the source panel).
    sourcePanel: {},

    // keeps track of which programming area slot is highlighted during
    // drag'n'drop. Should contain at most one element (but needs to be a
    // non-primitive holding references to be shared among all component
    // instances)
    highlightedSlots: [],

    init: function() {
      var self = this;
      this.requires('2D, DOM, Mouse, Draggable, Tween');
      this.yOrig = game.heightPx - game.cardPadding - game.cardSize;
      this.attr({z: 1000});

      this.bind('Click', function() {
        self._onMouseClick();
      })
      this.bind('Dragging', function() {
        self._onDragging();
      });
      this.bind('StartDrag', function() {
        self._onStartDrag();
      });
      this.bind('StopDrag', function() {
        self._onStopDrag();
      });
    },

    card: function(instruction) {
      this.instruction = instruction;
      switch (instruction) {
        case 'forward':
          this.addComponent('SprCardForward');
          break;
        case 'turnLeft':
          this.addComponent('SprCardTurnLeft');
          break;
        case 'turnRight':
          this.addComponent('SprCardTurnRight');
          break;
        case 'jump':
          this.addComponent('SprCardJump');
          break;
        case 'action':
          this.addComponent('SprCardAction');
          break;
        case 'subroutine1':
          this.addComponent('SprCardSubroutine1');
          break;
        case 'subroutine2':
          this.addComponent('SprCardSubroutine2');
          break;
      }
      return this;
    },

    place: function(cardIndex) {
      this.xOrig = (cardIndex + 1) * game.cardPadding + cardIndex * game.cardSize;
      this.attr({ x: this.xOrig, y: this.yOrig });
      this.sourcePanel[cardIndex] = this;
      this.cardIndex = cardIndex;
    },

    _onMouseClick: function() {
      // when clicking a card the source panel (and it has not been dragged)
      if (this.xOrig === this.x && this.yOrig === this.y) {
        var activeInstructionArea = game.activeInstructionArea;
        if (activeInstructionArea) {
          var lastRow = activeInstructionArea.slots[activeInstructionArea.slots.length - 1];
          var lastSlot = lastRow[lastRow.length - 1];
          if (lastSlot && !lastSlot.card) {
            lastSlot.dropCard(this, true);
            this.sourcePanel[this.cardIndex] = null;
          }
        }
      }
    },

    _onStartDrag: function() {
      this.attr('z', 1001);
      // when dragging from the source panel (as opposed to dragging from a
      // program slot)
      if (this.xOrig === this.x && this.yOrig === this.y) {
        this.sourcePanel[this.cardIndex] = null;
      }
      // when dragging from the program slot
      if (this.x >= game.offsetProgramArea && this.slot) {
        this.slot.unlinkCard();
      }
    },

    _onDragging: function() {
      this._reallyDragging = true;
      var slot = this._getSlot();
      if (slot && slot.div) {
        if (slot.div && (this.highlightedSlots.indexOf(slot.div) < 0)) {
          this._clearHighlightedSlots();
          this.highlightedSlots = [];
          this.highlightedSlots.push(slot.div);
          slot.div.className = 'highlighted-slot';
        }
        return;
      }
      this._clearHighlightedSlots();
    },

    _onStopDrag: function() {
      this.attr('z', 1000);
      if (this._reallyDragging) {

        // clear last highlighted slot
        this._clearHighlightedSlots();

        var slot = this._getSlot();
        if (slot) {
          slot.dropCard(this, false);
        } else {
          this.returnToSourcePanel();
        }
      }
      this._reallyDragging = false;
    },

    _clearHighlightedSlots: function() {
      this.highlightedSlots.forEach(function(oldDiv) {
        oldDiv.className = 'slot';
      });
    },

    /*
    _dropInSlot: function(slot) {
      slot.dropCard(this);
    },
    */

    cloneInSourceIfNeeded: function() {
      if (!this.sourcePanel[this.cardIndex]) {
        Crafty.e('Card').card(this.instruction).place(this.cardIndex);
      }
    },

    returnToSourcePanel: function() {
      // the card was not placed in a slot, so we return it to the source panel
      var returnTweenTime = 250;
      this.tween({ x: this.xOrig, y: this.yOrig }, returnTweenTime);

      // If the card was taken from the source panel, it needs to be returned.
      // If it instead was taken from a program slot we already created a
      // duplicate that has been placed in the source panel.
      if (this.sourcePanel[this.cardIndex]) {
        var self = this;
        setTimeout(function() {
          if (this.slot && this.slot.card === this) {
            this.slot.card = null;
          }
          self.destroy();
        }, returnTweenTime);
      }
    },

    _getSlot: function() {
      var xMidPoint = this.x + game.cardSize / 2;
      var yMidPoint = this.y + game.cardSize / 2;
      if (xMidPoint > game.offsetProgramArea) {

        // Check where exactly it has been dropped and place correctly

        // TODO This is quite a stupid approach, checking for all slots if the
        // card has been dropped there. To be revisited later....
        var slot;
        // TODO Use _withEachSlot function (currently in game.js)
        for (var instrAreaName in  game.instructionAreas) {
          if (game.instructionAreas.hasOwnProperty(instrAreaName)) {
            var instructionArea = game.instructionAreas[instrAreaName];
            for (var row = 0; row < instructionArea.cardRows; row++) {
              var rowArray = instructionArea.slots[row];
              for (var column = 0; column < game.cardColumns; column++) {
                slot = rowArray[column];
                if (xMidPoint >= slot.x1
                    && xMidPoint <= slot.x2 + game.cardPadding
                    && yMidPoint >= slot.y1
                    && yMidPoint <= slot.y2 + game.cardPadding) {
                  return slot;
                }
              }
            }
          }
        }
      }
      return null;
    },

  });

})();
