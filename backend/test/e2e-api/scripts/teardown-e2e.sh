#!/bin/bash
# =============================================================================
# E2E API Test Teardown Script
# =============================================================================
# Cleans up E2E test environment by stopping and removing containers
#
# Usage:
#   ./teardown-e2e.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

echo ""
echo "=============================================="
echo "E2E API Test Teardown"
echo "=============================================="
echo ""

echo_step "Stopping and removing E2E containers..."
cd "$E2E_DIR"
docker compose -f docker-compose.e2e.yaml down -v --remove-orphans 2>/dev/null || true

echo_info "E2E environment cleaned up successfully"
echo ""
