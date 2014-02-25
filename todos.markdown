ODOs
=====

* [FEATURE] level editor
* More advanced levels
* [UX] improve level solved message:
       - block all buttons (play, reset, clear)
       - navigation: dismiss message (going back to level) / leave leve (go back to level select)
* [MOBILE] It looks weird/broken on mobile browsers.
* [FEATURE] main-call: a card which calls the main routine
            - don't add it to the default card set
            - make it available through level.cards
* [FEATURE] variables: store a boolean in a (single) register
            - triggerd by card?
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
* [VISUAL] better colors for active and inactive instruction area
* [VISUAL] correct instruction area and slot sizes, so that cards fit perfectly
* [VISUAL] Animate bot jump even when its jumping in situ
* [FEATURE] save levels to local storage
* [FEATURE] load levels from local storage
* [FEATURE] export/import levels from local storage to/from file
* [FEATURE/UX] Clicking execute/reset program cards *cancel* current execution - similar to hasWon check
* [TESTS] For pixel positions during bot movements
* [UX] when dropping cards in occupied spaces, insert them instead of replace them. Cards get destroyed if the move out at the end.
