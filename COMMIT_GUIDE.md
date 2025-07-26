# Islamic Commit Message System

This project includes an automated commit message formatting system that prepends **بِسْمِ الله** (Bismillah) and appends **الحمدالله** (Alhamdulillah) to all commit messages.

## Usage

### Method 1: Using the commit script (Recommended)
```bash
# With inline message
./commit.sh "Add new feature"

# Or using npm script
npm run commit "Add new feature"

# Interactive mode (opens editor)
./commit.sh
```

### Method 2: Standard git commands
The Git hook will automatically format messages when using:
```bash
git add .
git commit -m "Your message"
```

### Method 3: Using the commit template
For interactive commits:
```bash
git commit
# This opens your editor with the Islamic template
```

## Output Format

Your commit message:
```
Add new feature
```

Will be automatically formatted as:
```
بِسْمِ الله

Add new feature

الحمدالله
```

## Features

- ✅ Automatic Islamic phrase formatting
- ✅ Duplicate prevention (won't add phrases if already present)
- ✅ Colorized terminal output
- ✅ Shows files being committed
- ✅ Works with both inline messages and interactive editor
- ✅ npm script integration
- ✅ Git hook integration

## Files Created

- `.gitmessage` - Commit message template
- `commit.sh` - Islamic commit helper script
- `.git/hooks/prepare-commit-msg` - Git hook for automatic formatting

## Barakallahu feekum! 🤲
