editor = (function() {
  'use strict';

  Crafty.c('LevelEditor', {

    init: function() {
      this.requires('Keyboard');
    },

    startLevelEditing: function() {
      game.category = game.levels.categories.special;
      game.levelId = 'level-editor-template';
      game.editMode = true;
      game.reset();
      this.reset();
    },

    reset: function() {
      var editorKeyBindings = function() {
        // don't modify board when bot is in manual control mode
        if (game.bot.manualControl) {
          return;
        }
        if (this.isDown('UP_ARROW')) {
          game.map.raiseSelected();
        } else if (this.isDown('DOWN_ARROW')) {
          game.map.lowerSelected();
        } else if (this.isDown('CTRL')) {
          game.map.toggleTargetForSelected();
        } else if (this.isDown('B')) {
          game.bot.toggleManualControl();
        }
      };
      this.bind('KeyDown', editorKeyBindings);

      $('#editor-status').html('<strong>Control Bot: INACTIVE</strong>');
      $('#editor-help').html(
          '<h3>Editor help</h3>' +
          'Use mouse to select tiles,' +
          'Use Shift to select multiple tiles at once<br>' +
          'Arrow up: Raise selected tile(s), ' +
          'Arrow down: Lower tile(s), ' +
          'CTRL: Toggle tile\'s color (red/grey).<br>' +
          'B: Toggle manual control for bot (to set bot\'s starting position). Use WSAD/&uarr;&darr;&larr;&rarr; to move.<br>'
      );

      $('#editor-status').html('<strong>Control Bot: INACTIVE</strong>');

      // TODO use uninit handler instead, that is
      // Crafty.defineScene(name, init, uninit),
      // see http://craftyjs.com/api/Crafty-scene.html
      // Also, use .defineScene() and enterScene() everywhere instead
      // of .scene()
      var leaveEditor = function() {
        game.category = game.levels.categories.basics;
        game.levelId = 'first';
        game.editMode = false;

        this.unbind('KeyDown', editorKeyBindings);
        $('#editor-status').html('');
        $('#editor-help').html('');

        this.unbind('SceneDestroy', leaveEditor);

        // Remove checkboxes to enable/disable cards, those have been added via
        // jQuery, not via Crafty
        $('.card-enable-disable').remove();
        $('.card-overlay').remove();
      };
      this.bind('SceneDestroy', leaveEditor);
    },
  });

  return new Crafty.e('LevelEditor');

})();
