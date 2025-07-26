#!/bin/bash
#
# Islamic Commit Helper Script
# Usage: ./commit.sh "Your commit message"
# or: ./commit.sh (will open editor for message)
#

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}بِسْمِ الله - Starting commit process...${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Add all changes
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit"
    exit 0
fi

# Show what will be committed
echo -e "${GREEN}Files to be committed:${NC}"
git diff --cached --name-status

echo ""

# Commit with message
if [ -n "$1" ]; then
    # Use provided message
    git commit -m "$1"
else
    # Open editor for message
    git commit
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}الحمدالله - Commit successful!${NC}"
else
    echo "Commit failed"
    exit 1
fi
