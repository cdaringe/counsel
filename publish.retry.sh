#!/bin/bash
for pkg in `ls packages`;
do
  $(cd "packages/$pkg" && npm publish)
done
