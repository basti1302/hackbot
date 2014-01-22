#!/usr/bin/env bash

dir=`dirname $0`
source $dir/../export_svg.sh

# export SVGs to PNGs (via inkscape)
# facing down, base size 128 -> w 74 h 64 => base size 64 -> w 37 h 32
exportSvg robot21 robot_down_right 37 32
exportSvg robot22 robot_down_left 37 32
exportSvg robot23 robot_up_left 35 35
exportSvg robot24 robot_up_right 35 35

# create sprite map with all images (via imagemagick)
# geometry is 64x64 even if robot image's actual dimension are 37x32 or 35x35,
# so robot is smaller than tiles but centered in a 64x64 square
montage -background transparent -geometry 64x64+0+0\> -tile 4x1 robot_down_left.png robot_down_right.png robot_up_right.png robot_up_left.png robot_sprite_map.png

# copy to target folder
cp robot_sprite_map.png ../../assets/images/robot.png
