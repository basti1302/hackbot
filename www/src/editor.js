editor = (function() {
  'use strict';

  var editorKeyBindings;

  Crafty.c('LevelEditor', {

    init: function() {
      this.requires('Keyboard');
    },

    startLevelEditing: function() {
      game.category = game.levels.categories.special;
      game.levelId = 'level-editor-template';
      this._initEditor();
    },

    _initEditor: function() {
      game.editMode = true;
      game.reset();
      this.reset();
    },

    reset: function() {
      editorKeyBindings = function() {
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
        } else if (this.isDown('X')) {
          game.exportLevel();
        } else if (this.isDown('L')) {
          this._loadLevel(this);
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
          'B: Toggle manual control for bot (to set bot\'s starting position). Use WSAD/&uarr;&darr;&larr;&rarr; to move.<br>' +
          'X: Export, L: Load'
      );

      $('#editor-status').html('<strong>Control Bot: INACTIVE</strong>');

      // TODO use uninit handler instead, that is
      // Crafty.defineScene(name, init, uninit),
      // see http://craftyjs.com/api/Crafty-scene.html
      // Also, use .defineScene() and enterScene() everywhere instead
      // of .scene()
      this.bind('SceneDestroy', this._leaveEditor);
    },

    _leaveEditor: function() {
      game.category = game.levels.categories.basics;
      game.levelId = 'first';
      game.editMode = false;

      this.unbind('KeyDown', editorKeyBindings);
      $('#editor-status').html('');
      $('#editor-help').html('');

      this.unbind('SceneDestroy', this._leaveEditor);

      // Remove checkboxes to enable/disable cards, those have been added via
      // jQuery, not via Crafty
      $('.editor-enable-disable').remove();
      $('.editor-card-overlay').remove();
    },

    _loadLevel: function() {
      // TODO Similar to level loading for playing (scenes.js), refactor
      var self = this;
      $('<input type="file" id="level-upload" style="display: none">')
      .appendTo($('body'))
      .change(function() {
        if (this.files && this.files.length >= 1) {
          var reader = new FileReader();
          reader.onload = (function(file) {
            return function(e) {
              var validLevel = game.loadLevelFromJson(e.target.result);
              if (validLevel) {
                self._destroyAllEntities();
                self._leaveEditor();
                var base64 = btoa(e.target.result);
                history.pushState(null, null,
                    '?level=' + base64 + '#/editor');
                game.category = null;
                game.levelId = null;
                self._initEditor();
              }
            };
          })(this.files[0]);
          reader.readAsText(this.files[0]);
        }
      })
      .click();
    },

    _destroyAllEntities: function() {
      game.destroyAllEntities();
    },

  });

  return new Crafty.e('LevelEditor');

})();
