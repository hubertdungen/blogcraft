#!/usr/bin/env bash
# Build a portable BlogCraft release for the current OS by default.

set -euo pipefail

TARGET="${1:-current}"
node build-release.js --target "$TARGET"
