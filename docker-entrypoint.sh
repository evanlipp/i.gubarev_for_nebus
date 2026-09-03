#!/bin/sh

set -e

if [ ! -f node_modules/.package-lock.json ] || ! cmp -s package-lock.json node_modules/.package-lock.json; then
  npm ci
  cp package-lock.json node_modules/.package-lock.json
fi

exec npm run dev:docker
