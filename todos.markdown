TODOs
=====

* More advanced levels
* [UX] it's a SPA - have some after-#-path in URL on navigation (/edit,
  /play/{level}) etc. so that a reload does not make you go to the start screen
  everytime.
* [UX] improve level solved message:
       - block all buttons (play, reset, clear)
       - navigation: dismiss message (going back to level) / leave leve (go back to level select)
* [MOBILE] It looks weird/broken on mobile browsers - Android SDK and/or weinre
* [FEATURE] main-call: a card which calls the main routine
            - don't add it to the default card set
            - make it available through level.cards
* [FEATURE] variables: store a boolean in a (single) register
            - triggered by card?
            - toggled by tile? <- better
            - blue/black tiles toggle the register from blue to black and vice versa
* [FEATURE] conditionals: only execute card if boolean in register is true
            - paint cards blue or black
* [FEATURE] break: a card which returns early from the current sub-routine
            - only makes sense with conditionals
* [REFACTORING] extract into components/entities:
    * source panel
    * program panel
    * each program area
    * button area
* [VISUAL] better colors for active and inactive instruction area!
* [VISUAL] correct instruction area and slot sizes, so that cards fit perfectly
* [VISUAL] Nicer animation for bot jump
* [VISUAL] Animate bot jump even when its jumping in situ
* [FEATURE] save levels to local storage
* [FEATURE] load levels from local storage
* [FEATURE] export/import levels from local storage to/from file
* [FEATURE/UX] Clicking execute/reset program cards *cancel* current execution - similar to hasWon check
* [TESTS] For pixel positions during bot movements
* [UX] when dropping cards in occupied spaces, insert them instead of replace them.
  Cards get destroyed if the move out at the end.


Level Editor
------------

* maxHeight currently needs to be a fixed value, but can change dynamically in edit mode
* Make buttons for raise/lower/mark red/etc.
* Move bot up/down when stack on which bot is sitting is raised/lowered
* Set bot starting position and direction
* Larger maxHeight and centerMapOnScreen is broken
* Highlight and select spots with no tiles (to raise them)
* Expand map (x/y axis)
* Shrink map (x/y)
* Export normalized map to JSON
* Save levels to local storage
* Load levels from local storage in editor
* Load edited levesl from local storage for playing
* Upload levels ... somehwere

