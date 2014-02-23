game = (function() {
  'use strict';

  Crafty.scene('Loading', function() {
    game.loadAssets(function() {
      Crafty.scene('Welcome');
    });
  });

  Crafty.scene('Welcome', function() {

    // draw welcome line with text shadows
    for (var i = 0; i < 3; i++) {
      Crafty.e('2D, DOM, Text')
        .text('Welcome to Hackbot')
        .attr({ x: 0, y: 24 + i, w: game.widthPx, z: 3 - i })
        .textFont({ size: '36px', weight: 'bold' })
        .textColor('#' + (6 - 2*i) + '00000')
        .css('padding', i + 'px')
      ;
    }

    Crafty
      .e('HbMenuButton')
      .hbMenuButton(0, 'Play', 'LevelSelect');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(1, 'How To Play', 'Instructions1');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(2, 'Options');
    Crafty
      .e('HbMenuButton')
      .hbMenuButton(3, 'Level Editor');
  });

  Crafty.scene('LevelSelect', function() {
    Crafty.e('2D, DOM, Text')
      .text('Choose a level')
      .attr({ x: 0, y: 24, w: game.widthPx })
      .textFont({ size: '24px', weight: 'bold' })
      .textColor('#600000')
    ;

    var index = 0;
    for (var levelId in game.levels) {
      var level = game.levels[levelId];
      Crafty
        .e('HbLevelSelectButton')
        .hbMenuButton(index++, level.name, levelId);
      // use levels description?
    }
  });

  Crafty.scene('Play', function() {
    game.startLevel();
  });

  Crafty.scene('LevelSolved', function() {
    throw new Error('Not yet implemented. Sorry.');
  });

  Crafty.scene('LevelEditor', function() {
    throw new Error('Not yet implemented. Sorry.');
  });


})();
