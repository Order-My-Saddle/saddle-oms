#!/bin/bash
# =============================================================================
# E2E API Test Runner Script
# =============================================================================
# Runs the E2E API tests with proper environment setup
#
# Usage:
#   ./run-e2e-tests.sh              # Run all E2E API tests
#   ./run-e2e-tests.sh --setup      # Setup environment and run tests
#   ./run-e2e-tests.sh --watch      # Run tests in watch mode
#   ./run-e2e-tests.sh data-counts  # Run specific test file
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$(dirname "$(dirname "$E2E_DIR")")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }
echo_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check if Docker containers are running
check_containers() {
    echo_step "Checking E2E containers..."

    if ! docker ps --format '{{.Names}}' | grep -q "oms_postgres_e2e"; then
        echo_error "PostgreSQL E2E container is not running"
        echo_info "Run './scripts/setup-e2e.sh' first to start the environment"
        exit 1
    fi

    if ! docker ps --format '{{.Names}}' | grep -q "oms_redis_e2e"; then
        echo_error "Redis E2E container is not running"
        echo_info "Run './scripts/setup-e2e.sh' first to start the environment"
        exit 1
    fi

    echo_info "E2E containers are running"
}

# Load environment variables
load_env() {
    export DATABASE_HOST=127.0.0.1
    export DATABASE_PORT=5434
    export DATABASE_USERNAME=oms_e2e_user
    export DATABASE_PASSWORD=oms_e2e_password
    export DATABASE_NAME=oms_e2e_test
    export DATABASE_TYPE=postgres
    export REDIS_HOST=127.0.0.1
    export REDIS_PORT=6380
    export APP_PORT=3002
    export NODE_ENV=test
    export AUTH_JWT_SECRET=e2e-test-secret-key-do-not-use-in-production
    export AUTH_JWT_TOKEN_EXPIRES_IN=1h
    export AUTH_REFRESH_TOKEN_EXPIRES_IN=7d
}

# Run tests
run_tests() {
    cd "$BACKEND_DIR"
    load_env

    local test_pattern="$1"
    local watch_mode="$2"

    echo_step "Running E2E API tests..."
    echo ""

    local jest_args="--config ./test/e2e-api/jest.e2e-api.config.js"

    if [ "$watch_mode" = "true" ]; then
        jest_args="$jest_args --watch"
    fi

    if [ -n "$test_pattern" ]; then
        jest_args="$jest_args --testPathPattern=$test_pattern"
    fi

    npx jest $jest_args
}

# Main execution
main() {
    echo ""
    echo "=============================================="
    echo "E2E API Test Runner"
    echo "=============================================="
    echo ""

    case "$1" in
        --setup)
            echo_info "Setting up environment first..."
            "$SCRIPT_DIR/setup-e2e.sh"
            check_containers
            run_tests "$2" "false"
            ;;
        --watch)
            check_containers
            run_tests "$2" "true"
            ;;
        --help)
            echo "Usage:"
            echo "  ./run-e2e-tests.sh              # Run all E2E API tests"
            echo "  ./run-e2e-tests.sh --setup      # Setup environment and run tests"
            echo "  ./run-e2e-tests.sh --watch      # Run tests in watch mode"
            echo "  ./run-e2e-tests.sh data-counts  # Run specific test file"
            exit 0
            ;;
        *)
            check_containers
            run_tests "$1" "false"
            ;;
    esac
}

main "$@"
