#!/usr/bin/env bash
# Deploy rsvquick: pull latest code → rebuild & restart container.
# Usage (di server): ./build.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "==> git pull"
git pull --ff-only

echo "==> docker compose down"
docker compose down

echo "==> docker compose up -d --build"
docker compose up -d --build

echo "==> done"
docker compose ps
