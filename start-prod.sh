#!/usr/bin/env bash
couchadminpass=$1
if [ -z $couchadminpass ]; then
  echo Please provide the CouchDB admin user password as the first argument.
  exit 1
fi

HOODIE_ADMIN_PASS=$couchadminpass ./hoodie-daemon.sh start
