#!/usr/bin/env bash

function exportSvg {
  inkscape --without-gui --export-png=$2.png --export-area-drawing --export-width=$3 --export-height=$4 $1.svg
}
