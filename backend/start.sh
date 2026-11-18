#!/usr/bin/env bash
cd "$(dirname "$0")/src"
javac *.java || exit 1
java FlowgateServer
