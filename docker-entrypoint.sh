#!/bin/sh
set -eu

mkdir -p "$(dirname "${DATABASE_URL#file:}")"
./node_modules/.bin/prisma migrate deploy
exec node server.js
