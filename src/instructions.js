game = (function() {
  'use strict';
  //
// TODO Have a scaled down image of the playing screen with explanations of
  // the various areas.
  Crafty.scene('Instructions1', function() {
    Crafty.e('InstructionPage')
      .text('\
Welcome to Hackbot! The goal of the game is simple: Toggle all \
red tiles to green. To achieve this, you will program a little green robot, \
affectionately called "hackbot". At the bottom of the screen you have the \
source panel, from where you draw movement cards and put them into the \
programming areas on the right.\
<p>\
    ');
    Crafty.e('HbInstrButtons').hbInstrButtons(1);
  });

  Crafty.scene('Instructions2', function() {
    Crafty.e('InstructionPage')
      .text('\
These are the movement cards:<p><img src="assets/images/cards.png"><p>\
Each movement card has its own effect. From left to right:<p>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: 0px 0px; background-repeat: no-repeat no-repeat;" alt="straight arrow"></span> \
Move one step in the direction the robot is facing.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -48px 0px; background-repeat: no-repeat no-repeat;" alt="arrow turning left"></span> \
Rotate 90 degrees, counter-clockwise.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -96px 0px; background-repeat: no-repeat no-repeat;" alt="arrow turning left"></span> \
Rotate 90 degrees, clockwise.<br>\
    ');
    Crafty.e('HbInstrButtons').hbInstrButtons(2);
  });

  Crafty.scene('Instructions3', function() {
    Crafty.e('InstructionPage')
      .text('\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: baseline; background-image: url(assets/images/cards.png); background-position: -144px 0px; background-repeat: no-repeat no-repeat;" alt="slim arrow"></span> \
Jump: If the bot stands before a tile that is one level higher, it will jump up and forward onto this tile. If the bot stands before a tile that is one or several levels deeper, it will jump down and forward. But: If the tile in front of the bot is on the same level, it will not jump and also not move forward.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -192px 0px; background-repeat: no-repeat no-repeat;" alt="exclamation mark"></span> \
Toggle a tile, either from red to green or from green to red.<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -240px 0px; background-repeat: no-repeat no-repeat;" alt="the digit one"></span> \
Jump to sub routine 1. (More on subroutines below).<br>\
<span style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; background-image: url(assets/images/cards.png); background-position: -288px 0px; background-repeat: no-repeat no-repeat;" alt="the digit two"></span> \
Jump to sub routine 2. (More on subroutines below).<br>\
    ');
    Crafty.e('HbInstrButtons').hbInstrButtons(3);
  });

  Crafty.scene('Instructions4', function() {
    Crafty.e('InstructionPage')
      .text('\
Program execution starts at the main program area (top right corner). Each \
card you place in the slots will later be executed, one after the other. \
When all red tiles have been toggled to green, you have solved the leve. \
Otherwise, when program execution has reached the end of the main program \
area, the program will also stop. When you place the card for a sub routine \
(for example for sub routine 1) into a slot, <em>all</em> cards in sub routine \
1 will be executed, and after that, your main program continues. You can also \
call one sub routine from another. Or have a sub routine call itself. This is \
how you can create endless loops (which are required to solve some levels). \
<p>\
More documentation coming soon...<p>\
or later...<p>\
or never. Who knows.\
');
    Crafty.e('HbInstrButtons').hbInstrButtons(4);
  });

})();
