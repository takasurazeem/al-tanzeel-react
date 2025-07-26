#!/bin/bash
#
# Islamic Commit Helper Script
# Usage: ./commit.sh "Your commit message"
# or: ./commit.sh (will open editor for message)
#

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Function to format commit message
format_commit_message() {
    local msg="$1"
    
    # Check if message already has Islamic phrases
    if [[ "$msg" == *"بِسْمِ الله"* ]] || [[ "$msg" == *"الحمدالله"* ]]; then
        echo "$msg"
    else
        echo -e "بِسْمِ الله\n\n$msg\n\nالحمدالله"
    fi
}

# Commit with message
if [ -n "$1" ]; then
    # Use provided message and format it
    FORMATTED_MSG=$(format_commit_message "$1")
    echo -e "${YELLOW}Commit message:${NC}"
    echo "$FORMATTED_MSG"
    echo ""
    git commit -m "$FORMATTED_MSG"
else
    # For interactive commits, let the hook handle formatting
    git commit
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}الحمدالله - Commit successful!${NC}"
    echo ""
    echo -e "${BLUE}Latest commit:${NC}"
    git log -1 --oneline
else
    echo "Commit failed"
    exit 1
fi
