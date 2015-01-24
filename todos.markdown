TODOs
=====

Bugs:
* Dragging a card all the way back to the source panel, leaving it "nearly"
  in its original slot leaves the card hanging just there, without putting it
  back in the slot and without killing the superfluous clone in the source
  panel.
* Moving the bot (up arrow) does not work in editor.
* Playing a program in the editor does not observe the same rules as in the game
  but the rules from moving the bot manually.
* Reset bot position/rewind does not correct z-level.

Features:

* More advanced levels
* [UX] when dropping cards in occupied spaces, insert them instead of replace them.
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
* [VISUAL] Nicer animation for bot jump (have a look at http://opengameart.org/content/robo-welder)
* [VISUAL] Animate bot jump even when its jumping in situ
* [FEATURE/UX] Clicking execute/reset program cards *cancel* current execution - similar to hasWon check
* [TESTS] For pixel positions during bot movements
  Cards get destroyed if the move out at the end.
* [Refactoring] All global objects should be moved to the hb namespace, so that hb is the only global object. That is hb.game instead of game etc.
* Build a small non-Crafty SPA around the game (and the editor), so that all other pages (menu, level select, etc.) are not build on Crafty but simple pages. Game is started/initialized by URL parameters.

* Sound? https://www.freesound.org/ , http://opengameart.org/

Level Editor
------------

* Upload levels ... somehwere - Hoodie? Firebase? Gist?

* Save levels to local storage
* Load levels from local storage in editor
* Load edited levesl from local storage for playing

* Make buttons for raise/lower/mark and so forth -> enables using the editor without remembering weird keyboard commands
* maxHeight currently needs to be a fixed value, but can change dynamically in edit mode
* Larger maxHeight and centerMapOnScreen is broken
* Expand map (x/y axis)
* Shrink map (x/y)
