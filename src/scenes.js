game = (function() {
  'use strict';

  Crafty.scene('Loading', function() {
    game.loadAssets(function() {
      var scene = hb.router.route();
      Crafty.scene(scene);
    });
  });

  Crafty.scene('Welcome', function() {

    // draw welcome line
    Crafty.e('2D, DOM, Text')
    .text('Welcome to Hackbot')
    .attr({ x: 0, y: 24, w: game.widthPx, z: 3, })
    .textFont({ size: '36px', weight: 'bold' })
    .textColor('#600000')
    .css('text-shadow', '1px 1px 2px black, 0 0 7px #500000');

    Crafty
      .e('HbMenuButton')
      .hbMenuButton(0, 'Play', 'CategorySelect', '#/play');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(1, 'How To Play', 'Instructions1', '#/instructions/1');
    /*
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(2, 'Options', '#/options');
    */
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(2, 'Level Editor', 'LevelEditor', '#/editor');
  });

  Crafty.scene('CategorySelect', function() {
    Crafty.e('2D, DOM, Text')
    .text('Choose a level category')
    .attr({ x: 0, y: 24, w: game.widthPx })
    .textFont({ size: '24px', weight: 'bold' })
    .textColor('#600000')
    ;

    var index = 0;
    for (var categoryId in game.levels.categories) {
      var category = game.levels.categories[categoryId];
      if (category.hidden) {
        continue;
      }
      Crafty
      .e('HbCategorySelectButton')
      .hbCategorySelectButton(index++, category.name, category, categoryId);
    }

    Crafty
    .e('HbTextButton')
    .hbButton(game.widthPx/2 - 128, 120 + (index + 1) * 32, 256, 24)
    .hbTextButton('Load Level From File')
    .onClick(function() {
      $('<input type="file" id="level-upload" style="display: none">')
      .appendTo($('body'))
      .change(function() {
        if (this.files && this.files.length >= 1) {
          var reader = new FileReader();
          reader.onload = (function(file) {
            return function(e) {
              var validLevel = game.loadLevelFromJson(e.target.result);
              if (validLevel) {
                var base64 = btoa(e.target.result);
                history.pushState(null, null,
                    '?level=' + base64 + '#/play');
                Crafty.scene('Play');
              }
            };
          })(this.files[0]);
          reader.readAsText(this.files[0]);
        }
      })
      .click();
    });

    Crafty.e('HbSpriteButton')
    .hbSpriteButton('SprButtonLeave', 'SprButtonLeaveDisabled')
    .hbButton(5, 5, 48, 25)
    .bind('Click', function() {
      history.pushState(null, null, '#');
      Crafty.scene('Welcome');
    });
  });

  Crafty.scene('LevelSelect', function() {
    Crafty.e('2D, DOM, Text')
      .text('Choose a level')
      .attr({ x: 0, y: 24, w: game.widthPx })
      .textFont({ size: '24px', weight: 'bold' })
      .textColor('#600000')
    ;

    var index = 0;
    for (var levelId in game.category.levels) {
      var level = game.category.levels[levelId];
      Crafty
        .e('HbLevelSelectButton')
        .hbLevelSelectButton(index++, level.name, game.category.id, levelId);
      // TODO use levels description?
    }

    Crafty.e('HbSpriteButton')
    .hbSpriteButton('SprButtonLeave', 'SprButtonLeaveDisabled')
    .hbButton(5, 5, 48, 25)
    .bind('Click', function() {
      history.pushState(null, null, '#/play');
      Crafty.scene('CategorySelect');
    });
  });

  Crafty.scene('Play', function() {
    game.startLevel();
  });

  Crafty.scene('LevelEditor', function() {
    editor.startLevelEditing();
  });

})();
