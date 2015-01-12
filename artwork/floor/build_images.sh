#!/usr/bin/env bash

dir=`dirname $0`
source $dir/../export_svg.sh

# export SVGs to PNGs (via inkscape)
exportSvg floor_grey floor_grey 64 48
exportSvg floor_red floor_red 64 48
exportSvg floor_green floor_green 64 48
exportSvg floor_blue floor_blue 64 48

exportSvg mouse_over_red mouse_over_red 64 32
exportSvg tile_selected_red tile_selected_red 64 32
exportSvg mouse_over_cyan mouse_over_cyan 64 32
exportSvg tile_selected_cyan tile_selected_cyan 64 32


composite tile_selected_red.png floor_grey.png floor_grey_tile_selected.png
composite mouse_over_cyan.png floor_grey.png floor_grey_mouse_over.png
composite tile_selected_cyan.png floor_red.png floor_red_tile_selected.png
composite mouse_over_cyan.png floor_red.png floor_red_mouse_over.png
composite tile_selected_red.png floor_green.png floor_green_tile_selected.png
composite mouse_over_cyan.png floor_green.png floor_green_mouse_over.png
composite tile_selected_cyan.png floor_blue.png floor_blue_tile_selected.png
composite mouse_over_cyan.png floor_blue.png floor_blue_mouse_over.png

# create sprite map with all images (via imagemagick)
montage -background transparent -geometry 64x48+0+0\> -tile 3x4 \
floor_grey.png floor_grey_mouse_over.png floor_grey_tile_selected.png \
floor_red.png floor_red_mouse_over.png floor_red_tile_selected.png \
floor_green.png floor_green_mouse_over.png floor_green_tile_selected.png \
floor_blue.png floor_blue_mouse_over.png floor_blue_tile_selected.png \
floor_sprite_map.png

# copy to target folder
cp floor_sprite_map.png ../../assets/images/floor.png
