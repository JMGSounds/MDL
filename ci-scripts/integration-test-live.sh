#!/bin/bash

# Runs "live"-mode tests against a mdl node that is already running
# "live" mode tests assume the blockchain data is active and may change at any time
# Data is checked for the appearance of correctness but the values themselves are not verified
# The MDL node must be run with -enable-wallet-api=true

#Set Script Name variable
SCRIPT=`basename ${BASH_SOURCE[0]}`
PORT="8320"
RPC_PORT="8330"
HOST="http://0.0.0.0:$PORT"
RPC_ADDR="0.0.0.0:$RPC_PORT"
MODE="live"
TEST=""
UPDATE=""
TIMEOUT="10m"
# run go test with -v flag
VERBOSE=""
# run go test with -run flag
RUN_TESTS=""
# run wallet tests
TEST_LIVE_WALLET=""
# run tests with csrf enabled
USE_CSRF=""
FAILFAST=""


echo "sleeping for startup"
sleep 5
echo "done sleeping"

usage () {
  echo "Usage: $SCRIPT"
  echo "Optional command line arguments"
  echo "-t <string>  -- Test to run, api or cli; empty runs both tests"
  echo "-r <string>  -- Run test with -run flag"
  echo "-u <boolean> -- Update stable testdata"
  echo "-v <boolean> -- Run test with -v flag"
  echo "-w <boolean> -- Run wallet tests."
  echo "-f <boolean> -- Run test with -failfast flag"
  echo "-c <boolean> -- Run tests with CSRF enabled. If not set, node must be run with -disable-csrf"
  exit 1
}

while getopts "h?t:r:uvwfc" args; do
case $args in
    h|\?)
        usage;
        exit;;
    t ) TEST=${OPTARG};;
    r ) RUN_TESTS="-run ${OPTARG}";;
    u ) UPDATE="--update";;
    v ) VERBOSE="-v";;
    w ) TEST_LIVE_WALLET="--test-live-wallet";;
    f ) FAILFAST="-failfast";;
    c ) USE_CSRF="1"
  esac
done

set -euxo pipefail

echo "checking if mdl node is running"

HEALTH="$HOST/api/v1/health"

http_proxy="" https_proxy="" wget -O- $HEALTH 2>&1 >/dev/null

if [ ! $? -eq 0 ]; then
    echo "MDL node is not running on $HOST"
    exit 1
fi

if [[ -z $TEST || $TEST = "api" ]]; then

MDL_INTEGRATION_TESTS=1 MDL_INTEGRATION_TEST_MODE=$MODE MDL_NODE_HOST=$HOST \
    go test ./src/api/integration/... $FAILFAST $UPDATE -timeout=$TIMEOUT $VERBOSE $RUN_TESTS $TEST_LIVE_WALLET

fi

if [[ -z $TEST || $TEST = "cli" ]]; then

MDL_INTEGRATION_TESTS=1 MDL_INTEGRATION_TEST_MODE=$MODE RPC_ADDR=$RPC_ADDR MDL_NODE_HOST=$HOST \
    go test ./src/cli/integration/... $FAILFAST $UPDATE -timeout=$TIMEOUT $VERBOSE $RUN_TESTS $TEST_LIVE_WALLET

fi
