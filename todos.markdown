TODOs
=====

* [BUG] Instruction areas are not removed when leaving the level
* [VISUAL] make level solved a scene of its own, with navigation (go back to menu, play again, ...)
* [MOBILE] It looks weird/broken on mobile browsers.
* [REFACTORING] extract into components/entities:
    * source panel
    * program panel
    * each program area
    * button area
* [REFACTORING] Make z optional in level.bot position, should default to level of tile at (x, y) + 1
* [UX] when removing cards from instruction area, all other cards after should go to their predecessor
* [UX] when dropping cards in occupied spaces, insert them instead of replace them. Cards get destroyed if the move out at the end.
* [VISUAL] better colors for active and inactive instruction area
* [VISUAL] correct instruction area and slot sizes, so that cards fit perfectly
* [VISUAL] put an opaque div below the 'Level Solved!' message
* [VISUAL] make icons for buttons
* [VISUAL] Animate bot jump even when its jumping in situ
* [FEATURE] let level definition dictate which cards are available
* [FEATURE] level editor
* [FEATURE] save levels to local storage
* [FEATURE] load levels from local storage
* [FEATURE] export/import levels from local storage to/from file
* [FEATURE/UX] Clicking execute/reset program cards *cancel* current execution - similar to hasWo check
* [TESTS] For pixel positions during bot movements
