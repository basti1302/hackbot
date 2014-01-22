#!/usr/bin/env bash

dir=`dirname $0`
source $dir/../export_svg.sh

# export SVGs to PNGs (via inkscape)
exportSvg action action 48 48
exportSvg forward forward 48 48
exportSvg jump jump 48 48
exportSvg subroutine1 subroutine1 48 48
exportSvg subroutine2 subroutine2 48 48
exportSvg turn_left turn_left 48 48
exportSvg turn_right turn_right 48 48

# create sprite map with all images (via imagemagick)
montage -background transparent -geometry 48x48+0+0\> -tile 7x1 forward.png turn_left.png turn_right.png jump.png action.png subroutine1.png subroutine2.png cards_sprite_map.png

# copy to target folder
cp cards_sprite_map.png ../../assets/images/cards.png

