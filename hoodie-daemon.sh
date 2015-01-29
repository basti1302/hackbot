#!/bin/sh -e

# start:
# call node_modules/hoodie-server/bin/start manually
# pipe stdout & stderr into files
# send to bg
# capture pid
# write pid to pidfile

# stop
# read pidfile
# if no pidfile,
#   say no process
# kill -INT pid # so couchdb can stop gracefully
# rm the pidfile

apphome=/home/hoodie/hackbot
pidfile=$apphome/run/hoodie.pid
stdoutfile=$apphome/log/hoodie.stdout
stderrfile=$apphome/log/hoodie.stderr
hoodie_user=hoodie

if [ -d "$pidfile" ]; then
  echo "apphome $apphome does not exist"
  exit 1
fi

mkdir -p $apphome/log
mkdir -p $apphome/run

cd $apphome

case "$1" in
  start)

    # if pidfile exists, report and exit
    # expect user to clean up stale pidfile
    if [ -f "$pidfile" ]; then
      echo "Pidfile still exists: $pidfile:"
      cat $pidfile
      exit 2
    fi

    if [ -z "$HOODIE_ADMIN_PASS" ]; then
      echo "Please provide variable HOODIE_ADMIN_PASS"
      echo "Example: "
      echo " HOODIE_ADMIN_PASS=mysupersecretpassword $0"
      echo "(Hint: Start your command with a space to keep your admin password out of the shell history.)"
      exit 2
    fi

    echo "COUCH_URL:         http://127.0.0.1:6000" 
    echo "HOODIE_ADMIN_USER: admin"
    echo "HOME:              $apphome"
    echo
    echo Trying to start you hoodie app...

    # the command
    sudo -u $hoodie_user \
    COUCH_URL=http://127.0.0.1:6000 \
    HOODIE_ADMIN_USER=admin \
    HOODIE_ADMIN_PASS="$HOODIE_ADMIN_PASS" \
    HOME=$apphome \
    node node_modules/hoodie-server/bin/start \
    1>>$stdoutfile \
    2>>$stderrfile \
    &

    pid=$!
    echo $pid > $pidfile
    echo "pid: $pid"
    echo "Started."
  ;;

  stop)
    if [ ! -f "$pidfile" ]; then
      echo "Pidfile $pidfile does not exist."
      exit 3
    fi
    pid=`cat $pidfile`
    set +e # proceed with script if kill is not successful because process is already gone 
    kill_output=`kill -INT $pid 2>&1` # capture stderr
    kill_successful=$?
    echo "$kill_output" | grep -q "No such process"
    no_such_process=$?
    if [ $kill_successful -eq 0 -o $no_such_process -eq 0 ]; then
      echo "Removing $pidfile"
      rm $pidfile
    fi
    set -e
    echo "Stopped."
  ;;

  *)
    echo "Invalid or missing command. Try 'start' or 'stop'."
  ;;
esac

