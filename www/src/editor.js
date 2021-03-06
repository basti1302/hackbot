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
      game.bot.enableManualControl();
      this.reset();
    },

    reset: function() {
      editorKeyBindings = function(e) {

        if (this.isDown('PLUS')) {
          game.map.raiseSelected();
        } else if (this.isDown('MINUS')) {
          game.map.lowerSelected();
        } else if (this.isDown('T')) {
          game.map.toggleTargetForSelected();
        } else if (this.isDown('L')) {
          this._loadLevelFromHoodie();
        } else if (this.isDown('S')) {
          game.saveLevelToHoodie();
        } else if (this.isDown('P')) {
          game.publishLevel(this);
        } else if (this.isDown('X')) {
          game.exportLevelToFile();
        } else if (this.isDown('O')) {
          this._openLevelFromFile();
        }
      };
      this.bind('KeyDown', editorKeyBindings);

      $('.hoodie-accountbar').css('visibility', 'visible');
      $('#editor-help').html(
          '<h3>Editor help</h3>' +
          'Use mouse to select tiles,' +
          'Use Shift to select multiple tiles at once<br>' +
          '+ (plus): Raise selected tile(s), - (minus): Lower tile(s),' +
          'T: Toggle tile\'s color (red/grey).<br>' +
          'Use arrow keys &uarr;&darr;&larr;&rarr; to set bot\'s starting position.<br>' +
          'L: Load, S: Save, P: Publish, X: Export to file, O: Open from file'
      );

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

      game.bot.disableManualControl();
      this.unbind('KeyDown', editorKeyBindings);
      $('#editor-help').html('');
      $('.hoodie-accountbar').css('visibility', 'hidden');

      this.unbind('SceneDestroy', this._leaveEditor);

      // Remove checkboxes to enable/disable cards, those have been added via
      // jQuery, not via Crafty
      $('.editor-enable-disable').remove();
      $('.editor-card-overlay').remove();
    },

    _openLevelFromFile: function() {
      // TODO Similar to level loading for playing (scenes.js), refactor
      var self = this;
      $('<input type="file" id="level-upload" style="display: none">')
      .appendTo($('body'))
      .change(function() {
        if (this.files && this.files.length >= 1) {
          var reader = new FileReader();
          reader.onload = (function(file) {
            return function(e) {
              self._loadLevelFromJsonString(e.target.result);
            };
          })(this.files[0]);
          reader.readAsText(this.files[0]);
        }
      })
      .click();
    },

    _loadLevelFromJsonString: function(levelAsJsonString) {
      var validLevel = game.loadLevelFromJsonString(levelAsJsonString);
      if (validLevel) {
        this._destroyAllEntities();
        this._leaveEditor();
        var base64 = btoa(levelAsJsonString);
        history.pushState(null, null,
            '?level=' + base64 + '#/editor');
        game.category = null;
        game.levelId = null;
        this._initEditor();
      }
    },

    _loadLevelFromHoodie: function() {
      var self = this;

      // TODO Ugh, this pyramid needs some unfucking very urgently!
      hoodie.global.findAll('hb-level')
      .then(function(sharedLevels) {
        if (sharedLevels) {
          sharedLevels = sharedLevels.filter(function(level) {
            return level.createdBy !== hoodie.id();
          });
        }

        hoodie.store.findAll('hb-level')
        .done(function(levels) {
          // Remove that here and put it into a event listener for 'show' in the
          // modal form
          self.unbind('KeyDown', editorKeyBindings);
          var form = $.loadLevelForm(levels, sharedLevels);
          if (!form) {
            editor.rebindKeys();
          } else {
            form.on('submit', function(event, inputs) {
              if (!inputs.levelId) {
                form.modal('hide');
                editor.rebindKeys();
                return;
              }
              var promise;
              if (inputs.levelId.indexOf('/') >= 0) {
                var sharedLevelId = inputs.levelId.substring(inputs.levelId.indexOf('/') + 1);
                promise = hoodie.global.find('hb-level', sharedLevelId);
              } else {
                promise = hoodie.store.find('hb-level', inputs.levelId);
              }
              promise
              .done(function(level) {
                game.hoodieLevelId = level.id;
                game.hoodieLevelName = level.name;
                game.hoodieLevelDescription = level.description;
                form.modal('hide');
                editor.rebindKeys();
                if (level) {
                  game.loadLevel(level);
                  self._destroyAllEntities();
                  self._leaveEditor();
                  // TODO Remember hoodie id in query param, history.pushState
                  game.category = null;
                  game.levelId = null;
                  self._initEditor();
                }
              }).fail(function(err) {
                // TODO Proper error handling
                console.log(err);
                form.modal('hide');
                editor.rebindKeys();
              });

            });
          }
        }).fail(function(err) {
          // TODO proper error handling
          console.log(err);
        });

      }, function(err) {
        // TODO proper error handling
        console.log(err);
      });
    },

    _destroyAllEntities: function() {
      game.destroyAllEntities();
    },

    unbindKeys: function() {
      this.unbind('KeyDown', editorKeyBindings);
    },

    rebindKeys: function() {
      this.bind('KeyDown', editorKeyBindings);
    },

  });

  return new Crafty.e('LevelEditor');

})();
