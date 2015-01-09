game = (function() {
  'use strict';

  Crafty.scene('Loading', function() {
    game.loadAssets(function() {
      Crafty.scene('Welcome');
    });
  });

  Crafty.scene('Welcome', function() {

    // draw welcome line with text shadows
    Crafty.e('2D, DOM, Text')
    .text('Welcome to Hackbot')
    .attr({ x: 0, y: 24, w: game.widthPx, z: 3, })
    .textFont({ size: '36px', weight: 'bold' })
    .textColor('#600000')
    .css('text-shadow', '1px 1px 2px black, 0 0 7px #500000');

    Crafty
      .e('HbMenuButton')
      .hbMenuButton(0, 'Play', 'CategorySelect');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(1, 'How To Play', 'Instructions1');
    /*
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(2, 'Options');
    */
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(2, 'Level Editor', 'LevelEditor');
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
        .hbCategorySelectButton(index++, category.name, category);
    }

    Crafty.e('HbImgButton')
      .hbButton(5, 5, 48, 24)
      .hbImgButton('leave')
      .bind('Click', function() { Crafty.scene('Welcome'); })
      .css({ 'background-position': '14px 3px' })
    ;
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
        .hbLevelSelectButton(index++, level.name, levelId);
      // use levels description?
    }

    Crafty.e('HbImgButton')
      .hbButton(5, 5, 48, 24)
      .hbImgButton('leave')
      .bind('Click', function() { Crafty.scene('CategorySelect'); })
      .css({ 'background-position': '14px 3px' })
    ;
  });

  Crafty.scene('Play', function() {
    game.startLevel();
  });

  Crafty.scene('LevelSolved', function() {
    throw new Error('Not yet implemented. Sorry.');
  });

  Crafty.scene('LevelEditor', function() {
    editor.startLevelEditing();
  });

})();
