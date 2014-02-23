(function(game) {

  'use strict';

  game.levels = {

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

    'new': {
      name: 'Fehlende Kacheln',
      description: '...',
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
        y: 5,
        direction: 'upRight',
      },
      terrain: [
        [0, 1, 0, 0, { floor: 'red' }],
        [1, null, 1, 1, null],
        [0, 1, 0, null, 0],
        [null, 0, 0, 0, 0],
        [0, 0, null, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },

    'drei': {
      name: 'Drei',
      description: '...',
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
        y: 5,
        direction: 'upRight',
      },
      terrain: [
        [0, 2, { floor: 'red' }, 2, 0],
        [1, 0, 1, 0, 0],
        [0, 0, 0, 0, 1],
        [{ floor: 'red', level: 2 }, 0, 0, 0, 2],
        [1, 0, 0, 0, { floor: 'red', level: 3 }],
        [0, 0, 0, 0, 0],
      ],
    },


    'new_2': {
      name: 'Treppe',
      description: '...',
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
        y: 4,
        direction: 'downRight',
      },
      terrain: [
        [0, 0, { floor: 'red' }, 0],
        [{ floor: 'red', level: 3 }, 3, 3, 0],
        [0, 0, 2, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
    },

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
  };

})(game);
