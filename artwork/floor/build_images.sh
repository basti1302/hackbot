#!/usr/bin/env bash

dir=`dirname $0`
source $dir/../export_svg.sh

# export SVGs to PNGs (via inkscape)
exportSvg floor_grey floor_grey 64 48
exportSvg floor_red floor_red 64 48
exportSvg floor_green floor_green 64 48
exportSvg floor_blue floor_blue 64 48

# create sprite map with all images (via imagemagick)
montage -background transparent -geometry 64x48+0+0\> -tile 4x1 floor_grey.png floor_red.png floor_green.png floor_blue.png floor_sprite_map.png

# copy to target folder
#cp floor_sprite_map.png ../../assets/images/floor.png
