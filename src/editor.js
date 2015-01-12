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
        if (this.isDown('UP_ARROW')) {
          game.map.raiseSelected();
        } else if (this.isDown('DOWN_ARROW')) {
          game.map.lowerSelected();
        } else if (this.isDown('CTRL')) {
          game.map.toggleFloorForSelected();
        }
      };
      this.bind('KeyDown', editorKeyBindings);

      $('#editor-help').html(
          '<h3>Editor help</h3>' +
          '<ul class="inline-block">' +
            '<li>Use mouse to select tiles</li>' +
            '<li>Use Shift to select multiple tiles at once</li>' +
            '<li>Arrow up: Raise selected tile(s).</li>' +
            '<li>Arrow down: Lower tile(s).</li>' +
            '<li>CTRL: Toggle tile\'s color (red/grey).</li>' +
          '</ul>'
      );

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
        $('#editor-help').html('');

        this.unbind('SceneDestroy', leaveEditor);
      };
      this.bind('SceneDestroy', leaveEditor);
    },
  });

  return new Crafty.e('LevelEditor');

})();
