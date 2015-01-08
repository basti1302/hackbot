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
      this.bind('KeyDown', function () {
        if (this.isDown('UP_ARROW')) {
          game.map.raiseSelected();
        } else if (this.isDown('DOWN_ARROW')) {
          game.map.lowerSelected();
        } else if (this.isDown('CTRL')) {
          game.map.toggleFloorForSelected();
        }
      });
    },

  });

  return new Crafty.e('LevelEditor');

})();
