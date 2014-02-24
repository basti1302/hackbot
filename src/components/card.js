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

    /*
     * Maintenance notice: If we would bind to all four events ('Click',
     * 'StartDrag', 'Dragging', 'StopDrag'), then the following holds:
     * For a single click (no dragging), the sequence of events received is this:
     * - StartDrag
     * - StopDrag
     * - Click
     * All are called immediately after another.
     * When the user drags a card, the sequence is this:
     * - StartDrag
     * - Dragging
     * - Dragging
     * - Dragging
     * - ...
     * - StopDrag
     * - Click
     *
     * Since 'StopDrag' and 'Click' are always fired in both cases and the only
     * difference is that 'Dragging' is fired for real mouse drags, we do not
     * even bother to listen to 'Click' but use some state variables to
     * distinguish clicks from drag events.
     */

    _onStartDrag: function() {
      this._reallyDragging = false;
      this._draggingJustStarted = true;
      if (this.xOrig === this.x && this.yOrig === this.y) {
        this._draggingSource = 'sourcePanel';
      } else if (this.x >= game.offsetProgramArea && this.slot) {
        this._draggingSource = 'programSlot';
      } else {
        this._draggingSource = null;
      }

      this.attr('z', 1001);
    },

    _onDragging: function() {
      // now we know that it is a dragging event and not a simple mouse click
      // without dragging
      this._reallyDragging = true;

      // is it the first 'Dragging' event for this dragging action?
      if (this._draggingJustStarted) {
        if (this._draggingSource === 'sourcePanel') {
          this.sourcePanel[this.cardIndex] = null;
        } else if (this._draggingSource === 'programSlot') {
          this.slot.unlinkCard();
        }
      }
      // remember that we already have seen the first 'Dragging' event
      this._draggingJustStarted = false;

      var slot = this._getSlot();
      if (slot) {
        if (this.highlightedSlots.indexOf(slot) < 0) {
          this._clearHighlightedSlots();
          this.highlightedSlots = [];
          this.highlightedSlots.push(slot);
          slot.highlight();
        }
        return;
      }
      this._clearHighlightedSlots();
    },

    _onStopDrag: function() {
      if (this._reallyDragging) {
        this._handleDragFinished();
      } else {
        this._handleMouseClick();
      }

      // reset dragging state variables
      this._reallyDragging = false;
      this._draggingSource = null;
      this._draggingJustStarted = false;

      this.attr('z', 1000);
    },

    /*
     * handle mouse click (no dragging happened)
     */
    _handleMouseClick: function() {
      if (this._draggingSource === 'sourcePanel') {
        var activeInstructionArea = game.activeInstructionArea;
        if (activeInstructionArea) {
          var lastRow = activeInstructionArea.slots[activeInstructionArea.slots.length - 1];
          var lastSlot = lastRow[lastRow.length - 1];
          if (lastSlot && !lastSlot.card) {
            this.sourcePanel[this.cardIndex] = null;
            lastSlot.dropCard(this, true);
          }
        }
      } else if (this._draggingSource === 'programSlot') {
        this.returnToSourcePanel();
      }
    },

    /*
     * handle proper dragging event (in contrast to simple mouse click without
     * dragging)
     */
    _handleDragFinished: function() {
      // clear last highlighted slot
      this._clearHighlightedSlots();

      var slot = this._getSlot();
      if (slot) {
        slot.dropCard(this, false);
      } else {
        this.returnToSourcePanel();
      }
    },

    _clearHighlightedSlots: function() {
      this.highlightedSlots.forEach(function(slot) {
        slot.unHighlight();
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
                if (slot
                    && xMidPoint >= slot.x1
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
