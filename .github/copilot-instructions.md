# Al-Tanzeel React - Copilot Instructions

## Architecture Overview

This is a **dual-workflow Quran study application** built with Next.js 15 and React 19. The app facilitates two distinct educational workflows through a **two-row grid layout**:

1. **First Row**: "Verses for Translation" - Select chapters → select verses → manage selected verses
2. **Second Row**: "Verses for Words Meanings" - Select verses → extract words → select specific words

## Key Architectural Patterns

### State Management Pattern
- **Central state hub** in `src/app/page.js` with dual verse selection arrays:
  - `selectedVerses` (first row workflow)
  - `secondRowSelectedVerses` (second row workflow)
- **Toggle-based selection**: All selection handlers use `find()` and filter toggle pattern:
  ```js
  const handleVerseSelect = (verse) => {
    setSelectedVerses(prev => {
      if (prev.find(v => v.id === verse.id)) {
        return prev.filter(v => v.id !== verse.id);
      }
      return [...prev, verse];
    });
  };
  ```

### Component Organization
- **Directory structure mirrors UI layout**: `FirstRow/` and `SecondRow/` folders contain workflow-specific components
- **Shared styling approach**: Components import both local styles (`./styles.module.css`) and shared styles (`../../shared/styles/shared.module.css`)
- **Prop drilling pattern**: State flows down from main page component through props

### Data Flow Architecture
1. **Quran data loaded** from `public/Quran_ur.json` on app initialization
2. **Chapter selection** filters verses for both workflows
3. **Word extraction algorithm** in `WordsFromSelectedVerses` splits verse text and creates unique word arrays
4. **Preferences flow** through Sidebar → main page → PDF generator

## Critical Development Workflows

### Font Handling Requirements
- **Dual font system**: PDMS Saleem Quran Font (Arabic) + Noto Nastaliq Urdu (Urdu)
- **Font loading in PDF generation**: Use `await document.fonts.load()` before canvas rendering
- **RTL text support**: Set `ctx.direction = 'rtl'` and `ctx.textAlign = 'center'` for Arabic rendering

### PDF Generation Workflow
Located in `src/app/utils/pdfGenerator.js`:
1. **Canvas-based text rendering** for high-quality Arabic font output
2. **Font embedding process**: Fetch TTF → ArrayBuffer → Base64 → jsPDF
3. **Critical error handling**: PDF generation continues even if font loading fails
4. **Preferences integration**: Masjid name and class name added to PDF headers
5. **Dynamic canvas sizing**: Text measurement algorithms prevent clipping with RTL text
6. **Page size support**: Configurable A4/A3/A5/Letter/Legal with responsive layouts
7. **Intelligent translation lines**: Calculates writing space based on Urdu translation length and page dimensions

### Development Commands
```bash
npm run dev --turbopack  # Uses Turbopack for faster development
npm run build           # Standard Next.js build
npm start              # Production server
```

## Project-Specific Conventions

### Selection UI Pattern
- **Checkbox + click handler**: All verse/word selections use both checkbox state and container click
- **preventDefault pattern**: Use `e.stopPropagation()` to prevent double-triggering
- **Visual feedback**: Selected items use conditional className with `styles.selected`

### Mobile Responsiveness
- **Collapsible columns**: All components implement mobile collapse/expand functionality
- **Auto-collapse**: ChapterList auto-collapses on mobile after chapter selection
- **Responsive visibility**: Use `styles.hiddenOnMobileWhenNoChapter` for conditional mobile display

### Styling Conventions
- **CSS Modules everywhere**: No global styles except fonts and layout
- **Font size prop threading**: Dynamic `fontSize` prop passed down to text-rendering components
- **Shared vs local styles**: Column titles use `sharedStyles.columnTitle`, specific layouts use local styles

### State Persistence
- **localStorage pattern** in Sidebar component for user preferences
- **Callback notification**: `onPreferencesChange` immediately syncs preferences to parent
- **Error boundary**: Try-catch around localStorage operations with console logging

### Arabic Text Handling
- **Word splitting algorithm**: `verse.text.split(' ')` for word extraction
- **Unique word deduplication**: `[...new Set(words.flat())]` pattern
- **RTL-aware styling**: Use CSS `direction: rtl` and proper text-align values
- **Canvas text measurement**: Always measure text width before rendering to prevent clipping

## Integration Points

### External Dependencies
- **jsPDF**: PDF generation with Arabic font embedding and configurable page sizes
- **Canvas API**: High-quality text rendering for PDF export with dynamic sizing
- **Next.js Fonts**: Google Fonts (Geist) + custom font loading
- **CSS Modules**: Component-scoped styling system

### Data Dependencies
- **Quran JSON structure**: Each chapter has `{id, name, transliteration, translation, verses: [{id, text, translation}]}`
- **Font files**: Located in `public/fonts/` directory with QuranFont and NotoNastaliqUrdu
- **LocalStorage keys**: `quranPreferences` for user settings persistence

### Cross-Component Communication
- **Sidebar ↔ Main**: Preferences flow through callback props with immediate sync
- **Search state**: Separate search terms for chapters (`searchTerm`) and verses (`verseSearchTerm`)
- **Font size control**: Global font size state affects all text-rendering components
- **Calendar system**: Hijri/Gregorian date conversion with `src/app/utils/hijriCalendar.js`

## Common Gotchas

- **Dual verse arrays**: Don't confuse `selectedVerses` (first row) with `secondRowSelectedVerses` (second row)
- **Font loading timing**: Always await font loading before canvas operations in PDF generation
- **Arabic text direction**: Ensure RTL support in both CSS and canvas contexts with proper alignment
- **Selection toggle logic**: Use `find()` for existence check, `filter()` for removal
- **Error boundaries**: Wrap localStorage and font operations in try-catch blocks
- **Canvas text clipping**: Use dynamic canvas sizing based on text measurement for Arabic text
- **Mobile layout**: Components must handle mobile collapse state and auto-expand behavior
