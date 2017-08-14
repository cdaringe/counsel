#!/bin/bash
for pkg in `ls packages`;
do
  let COUNTER=$(cd "packages/$pkg" && npm publish)
  echo $COUNTER
done
