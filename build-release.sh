#!/usr/bin/env bash
# Build a portable BlogArtifex release for the current OS by default.

set -euo pipefail

TARGET="${1:-current}"
node build-release.js --target "$TARGET"
