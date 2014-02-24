(function(game) {

  'use strict';

  game.levels = {

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
        [null, null, 0, null],
        [null, 0, 0, 0],
        [0,    0, { floor: 'red' }, 0, 0],
        [null, 0, 0, 0],
        [null, null, 0],
      ],
    },

    'second': {
      name: 'Two Red Tiles',
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
        [0, null, { floor: 'red' }],
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
        z: 3,
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
        [3, 0, null, 0],
        [3, null, 0, null],
        [2, 1, 0, null],
      ],
    },

    /*

    'basic-plane': {
      name: 'Basic Plane',
      description: 'a flat plane makes a boring level',
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
        x: 0,
        y: 3,
        direction: 'downRight',
      },
      terrain: [
        [{ floor: 'red' }, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, { floor: 'red' }],
      ],
    },

    */

    slalom: {
      name: 'Slalom',
      description: 'An advanced level which requires using sub routines',
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
        z: 3,
        direction: 'downRight',
      },
      terrain: [
        [{ level: 2, floor: 'red' }, 2, { level: 2, floor: 'red' }],
        [2, 0, 0],
        [{ level: 2, floor: 'red' }, 2, { level: 2, floor: 'red' }],
        [0, 0, 2],
        [2, 2, { level: 2, floor: 'red' }],
      ],
    },

    /*
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
    */

  };

})(game);
