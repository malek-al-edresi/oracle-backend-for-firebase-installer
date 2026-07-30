#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# Oracle Backend for Firebase Installer — Quick Start (Linux/macOS)
# ══════════════════════════════════════════════════════════════

set -e

echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed."
    echo "Please install Node.js 18.0.0 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2)
echo "Node.js version $NODE_VERSION found."

echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "npm is required but not installed."
    exit 1
fi

if [ ! -f .env ]; then
    echo "Generating .env from .env.example..."
    cp .env.example .env
    echo "Please configure .env and run this script again."
    exit 0
fi

echo "Installing dependencies..."
npm install --silent

echo "Starting Installer..."
node bin/obf-installer.js install
