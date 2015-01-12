(function(game) {

  'use strict';

  var n = null;
  var g = { floor: 'ghost', level: -1 };

  game.levels = {

    categories: {

      special: {
        name: 'Special',
        hidden: true,
        levels: {
          'level-editor-template': {
            name: 'Basic Plane',
            description: 'template for level editor',
            instructionAreas: {
              main: {
                instructions: 12,
              },
              subroutine1: {
                instructions: 8,
              },
              subroutine2: {
                instructions: 8,
              },
            },
            bot: {
              x: 1,
              y: 1,
              direction: 'downLeft',
            },
            terrain: [
              [g, g, g, g, g],
              [g, 0, 0, 0, g],
              [g, 0, 0, 0, g],
              [g, 0, 0, 0, g],
              [g, g, g, g, g],
            ],
          },

          pillars: {
            name: 'Pillars',
            description: 'Test level for z-index calculation',
            instructionAreas: {
              main: { instructions: 12, },
              subroutine1: { instructions: 4, },
              subroutine2: { instructions: 4, },
            },
            bot: { x: 2, y: 6, z: 1, direction: 'upRight', },
            terrain: [
              [6, 7, 6, 7],
              [5, 0, 5, 0],
              [4, 6, 4, 6],
              [3, 0, 3, 0],
              [2, 4, 2, 4],
              [1, 0, 1, 0],
              [{ floor: 'red' }, 2, 0, 2],
            ],
          },
        },
      },

      basics: {

        name: 'Basics',

        levels: {

          'first': {
            name: 'First Level',
            description: 'introduces walking and toggling',
            instructionAreas: {
              main: {
                instructions: 3,
              },
            },
            bot: {
              x: 2,
              y: 0,
              direction: 'downLeft',
            },
            cards: [
              'forward',
              'action',
            ],
            terrain: [
              [n, n, 0, n],
              [n, 0, 0, 0],
              [0, 0, { floor: 'red' }, 0, 0],
              [n, 0, 0, 0],
              [n, n, 0],
            ],
          },

          'second': {
            name: 'Two Red Tiles',
            category: 'basics',
            description: 'now you need to toggle two tiles',
            instructionAreas: {
              main: {
                instructions: 5,
              },
            },
            bot: {
              x: 1,
              y: 0,
              direction: 'downLeft',
            },
            cards: [
              'forward',
              'action',
            ],
            terrain: [
              [0, 0, 0],
              [0, { floor: 'red' }, 0],
              [0, 0, 0],
              [0, { floor: 'red' }, 0],
            ],
          },

          'turning': {
            name: 'Turning the corner',
            description: 'introduces turns',
            instructionAreas: {
              main: {
                instructions: 7,
              },
            },
            bot: {
              x: 0,
              y: 1,
              direction: 'downLeft',
            },
            cards: [
              'forward',
              'action',
              'turnLeft',
              'turnRight',
            ],
            terrain: [
              [0, 0, 0],
              [0, n, { floor: 'red' }],
              [0, 0, 0],
            ],
          },

          'jump-up': {
            name: 'Jump Up',
            description: 'introduces jumping',
            instructionAreas: {
              main: {
                instructions: 3,
              },
            },
            bot: {
              x: 1,
              y: 2,
              direction: 'upRight',
            },
            cards: [
              'forward',
              'action',
              'jump',
            ],
            terrain: [
              [1, { floor: 'red', level: 1 }, 1],
              [1, 1, 1],
              [0, 0, 0],
            ],
          },

          'jump-down': {
            name: 'Jump Down',
            description: 'introduces jumping down',
            instructionAreas: {
              main: {
                instructions: 3,
              },
            },
            bot: {
              x: 1,
              y: 0,
              direction: 'downLeft',
            },
            cards: [
              'action',
              'jump',
            ],
            terrain: [
              [2, 2, 2],
              [2, 1, 2],
              [0, { floor: 'red' }, 0],
            ],
          },

          'gallery': {
            name: 'Gallery',
            description: 'Combines jumping, turning and toggling multiple tiles',
            instructionAreas: {
              main: {
                instructions: 12,
              },
            },
            bot: {
              x: 2,
              y: 3,
              direction: 'upLeft',
            },
            cards: [
              'forward',
              'action',
              'turnLeft',
              'turnRight',
              'jump',
            ],
            terrain: [
              [{ floor: 'red', level: 3 }, 3, 3, { floor: 'red', level: 3 }],
              [3, 0, n, 0],
              [3, n, 0, n],
              [2, 1, 0, n],
            ],
          },
        }, // end of levels object
      }, // end of category basics

      // category subroutines
      subroutines: {

        name: 'Subroutines',

        levels: {

          'the-l': {
            name: 'The L',
            category: 'subroutines',
            description: 'introducing subroutines',
            instructionAreas: {
              main: {
                instructions: 4,
              },
              subroutine1: {
                instructions: 3,
              },
            },
            bot: {
              x: 0,
              y: 0,
              direction: 'downLeft',
            },
            cards: [
              'forward',
              'action',
              'turnLeft',
              'turnRight',
            ],
            terrain: [
              [0, n, n, n],
              [0, n, n, n],
              [0, n, n, n],
              [0, 0, 0, { floor: 'red' }],
            ],
          },

          'horse-shoe': {
            name: 'Horse Shoe',
            category: 'subroutines',
            description: 'introducing subroutines, part 2',
            instructionAreas: {
              main: {
                instructions: 6,
              },
              subroutine1: {
                instructions: 4,
              },
            },
            bot: {
              x: 0,
              y: 0,
              direction: 'downLeft',
            },
            cards: [
              'forward',
              'action',
              'turnLeft',
              'turnRight',
            ],
            terrain: [
              [0, n, { floor: 'red' }],
              [0, n, 0],
              [0, n, 0],
              [{ floor: 'red' }, 0, 0],
            ],
          },

          'walled-garden': {
            name: 'Walled Garden',
            category: 'subroutines',
            description: 'you\'ll need a little trick here',
            instructionAreas: {
              main: {
                instructions: 12,
              },
              subroutine1: {
                instructions: 4,
              },
              subroutine2: {
                instructions: 3,
              },
            },
            bot: {
              x: 0,
              y: 0,
              direction: 'downRight',
            },
            cards: [
              'forward',
              'action',
              'turnLeft',
              'turnRight',
            ],
            terrain: [
              [0, 0, 0, 0, 0],
              [1, 1, 1, 1, 0],
              [{ floor: 'red' }, 0, 0, 0, 0],
              [0, 1, 1, 1, 1],
              [0, 0, 0, 0, 0],
              [1, 1, 1, 1, { floor: 'red' }],
            ],
          },

          slalom: {
            name: 'Slalom',
            category: 'subroutines',
            description: 'An advanced level with subroutines',
            instructionAreas: {
              main: {
                instructions: 9,
              },
              subroutine1: {
                instructions: 3,
              },
            },
            bot: {
              x: 0,
              y: 4,
              direction: 'downRight',
            },
            terrain: [
              [{ level: 1, floor: 'red' }, 1, { level: 1, floor: 'red' }],
              [1],
              [{ level: 1, floor: 'red' }, 1, { level: 1, floor: 'red' }],
              [n, n, 1],
              [1, 1, { level: 1, floor: 'red' }],
            ],
          },

        }, // end of levels object
      }, // end of category subroutines

    } // end of categories object
  }; // end of levels object literal

})(game);
