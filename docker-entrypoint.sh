#!/bin/sh
set -eu

mkdir -p "$(dirname "${DATABASE_URL#file:}")"
./node_modules/.bin/prisma migrate deploy
./node_modules/.bin/tsx prisma/bootstrap-admin.ts
exec node server.js
