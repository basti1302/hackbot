TODOs
=====

* [REFACTORING] Make z optional in level.bot position, should default to level of tile at (x, y) + 1
* MOAR LEVELS!!!
* Some levels introducing subroutines gently
* Level selection with multiple hierarchies
* [MOBILE] It looks weird/broken on mobile browsers.
* [REFACTORING] extract into components/entities:
    * source panel
    * program panel
    * each program area
    * button area
* [UX] when dropping cards in occupied spaces, insert them instead of replace them. Cards get destroyed if the move out at the end.
* [UX] improve level solved message:
       - block all buttons (play, reset, clear)
       - navigation: dismiss message (going back to level) / leave leve (go back to level select)
* [VISUAL] better colors for active and inactive instruction area
* [VISUAL] correct instruction area and slot sizes, so that cards fit perfectly
* [VISUAL] put an opaque div below the 'Level Solved!' message
* [VISUAL] Animate bot jump even when its jumping in situ
* [FEATURE] level editor
* [FEATURE] save levels to local storage
* [FEATURE] load levels from local storage
* [FEATURE] export/import levels from local storage to/from file
* [FEATURE/UX] Clicking execute/reset program cards *cancel* current execution - similar to hasWon check
* [TESTS] For pixel positions during bot movements
