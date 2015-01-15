A little JavaScript based browser game. It's quite unfinished, but already playable.

You can play it at http://basti1302.github.io/hackbot/

The goal of the game is to program the robot's movement so that it walks to all red tiles and toggles each to become a green tile. You can control the robot by placing cards from the source panel (bottom) to the instruction areas on the right side. Actually, the game idea is not mine, it's a clone of a lightbot, which is in turn a clone of robozzle. I just used this idea to play around with game programming in JavaScript. If you want to play something like this, I heartily recommend buying the lightbot app in an AppStore near you, it's very well done. Robozzle also looks very nice, and seems to have tons of (community-created) levels, so give it a try.

The instructions you can use are the following:
* Fat Forward Arrow: Move robot one step in the direction it is facing.
* Fat Left Turn Arrow: Turn robot 90 degrees to the left.
* Fat Right Turn Arrow: Turn robot 90 degrees to the right.
* Small Arrow: If the robot faces a tile that is one level higher or arbitrary levels lower than its current position, you can jump up/down and one tile forward at the same time. If neither is the case, jump has no effect.
* Exclamation mark: Use this to toggle a red tile to become green or vice versa.
* 1: Call the first subroutine (see below).
* 2: Call the first subroutine (see below).

The instruction area on the right has three sections, the main section (top) with 12 slots. Anytime you press execute, the program in this 12 slots is executed. The middle section and the bottom section (each with 8 slots) are subroutines. They are not executed automatically, but only if you call them (for example, from the main program) by using the subroutine cards `1` and `2`.

You can place cards by clicking on them in the source panel (bottom of screen). Once a card is clicked, it is added to the currently active instruction area. You can activate an instruction area (main program or one of the subroutines) by clicking on it. You can also drag and drop cards around to place them in slots or remove cards from the program.

