#!/usr/bin/env bash

# create sprite map with all images (via imagemagick)
montage \
 -background \#600000 \
 -geometry 48x25+0+0\> \
 -tile 2x6 \
play.png play_disabled.png \
rewind.png rewind_disabled.png \
delete.png delete_disabled.png \
leave.png leave_disabled.png \
previous.png previous_disabled.png \
next.png next_disabled.png \
buttons_sprite_map.png

# copy to target folder
cp buttons_sprite_map.png ../../assets/images/buttons.png

