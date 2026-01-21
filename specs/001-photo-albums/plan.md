# Implementation Plan: Photo Album Organizer

**Branch**: `001-photo-albums` | **Date**: 2026-01-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-photo-albums/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a local photo album organizer using Vite with vanilla HTML/CSS/JavaScript. Users can create albums, add photos (multi-select file picker), view photos in tile grids, and manually reorder albums via drag-and-drop. Albums are automatically organized by date (earliest photo), with metadata stored in SQLite. Photos remain in their original locations (reference model) and can belong to multiple albums. The application emphasizes minimal dependencies, local-first architecture, and performance (<2s album load, <1s thumbnail display for 100 photos).

## Technical Context

**Language/Version**: JavaScript (ES2022+), HTML5, CSS3  
**Primary Dependencies**: 
  - Vite (build tool and dev server)
  - sql.js or better-sqlite3 (SQLite for metadata storage)
  - exifr (EXIF metadata extraction from photos)
  - Minimal CSS for base styling
**Storage**: SQLite database (local file) for album metadata, photo references, and user preferences  
**Testing**: Vitest (unit tests), Playwright (integration/E2E tests)  
**Target Platform**: Desktop browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Single-page web application (SPA)  
**Performance Goals**: 
  - Album list load: <2 seconds for 50 albums
  - Thumbnail display: <1 second for 100 photos
  - Drag-and-drop response: <100ms feedback
  - Smooth scrolling at 60 fps for tile grids
**Constraints**: 
  - No external services or cloud uploads
  - Photos remain in original file system locations
  - File system API for local file access
  - Offline-capable (no network required)
  - <100MB memory usage for typical usage (20 albums, 1000 photos)
**Scale/Scope**: 
  - Target: 50 albums, 500 photos per album max
  - 3 main views: Album list, Album detail, Photo tile grid
  - ~2000 lines of code estimated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Code Quality First (NON-NEGOTIABLE)

- ✅ **Modularity**: Vanilla JS approach enables small, single-purpose modules without framework overhead
- ✅ **Readability**: Minimal dependencies = less abstraction layers, clearer code paths
- ✅ **Static Analysis**: ESLint + Prettier for code quality enforcement
- ⚠️ **NEEDS RESEARCH**: File System Access API browser compatibility and fallback strategies
- ⚠️ **NEEDS RESEARCH**: Best practices for vanilla JS module organization in Vite projects

### Gate 2: Test-Driven Development (NON-NEGOTIABLE)

- ✅ **Test-First**: Vitest for unit tests, Playwright for E2E tests support TDD workflow
- ✅ **Coverage**: 80% minimum achievable with focused testing of business logic
- ⚠️ **NEEDS RESEARCH**: Testing strategies for File System API interactions (mocking/stubbing)
- ⚠️ **NEEDS RESEARCH**: Visual regression testing for tile grid layouts

### Gate 3: User Experience Consistency

- ✅ **Accessibility**: Native HTML controls, keyboard navigation, ARIA labels
- ✅ **Response Times**: Constitution requires <200ms for critical actions; spec targets <100ms for drag feedback
- ✅ **Error Handling**: Placeholder icons for missing photos, clear "No photos" states
- ⚠️ **NEEDS RESEARCH**: Native drag-and-drop API best practices and touch device compatibility

### Gate 4: Performance Requirements

- ✅ **Baselines Defined**: Spec provides clear performance targets (SC-001 through SC-007)
- ✅ **Performance Budget**: FCP <1.5s, TTI <3.5s aligns with constitution
- ⚠️ **NEEDS RESEARCH**: Thumbnail generation and caching strategies for 500 photos
- ⚠️ **NEEDS RESEARCH**: Virtual scrolling implementation for large photo grids
- ⚠️ **NEEDS RESEARCH**: SQLite query optimization for fast album filtering and sorting

### Pre-Research Status: ✅ CONDITIONAL PASS

**Reasoning**: Core architecture aligns with all constitutional principles. The 8 items marked "NEEDS RESEARCH" are implementation details, not principle violations. Phase 0 research will resolve these before design begins.

**No complexity violations** - Simple single-app architecture with vanilla technologies.

---

### Post-Design Re-Evaluation: ✅ FULL PASS

**Gate 1: Code Quality First** - ✅ PASS
- All research completed: File System API with fallbacks, ES6 module patterns established
- Project structure defined (models/services/components/utils separation)
- ESLint + Prettier configured in quickstart
- Service contracts document all public APIs with clear interfaces

**Gate 2: Test-Driven Development** - ✅ PASS
- Vitest configured for unit tests with mocking strategies defined
- Playwright configured for E2E tests with file dialog support
- Testing approach documented in research.md (unit + integration)
- Sample test included in quickstart (Database.test.js)

**Gate 3: User Experience Consistency** - ✅ PASS
- Drag-and-drop implementation researched (HTML5 DnD + touch polyfill)
- Empty state handling specified (placeholder + "No photos" text)
- Error handling patterns defined in service contracts
- Accessibility: Native HTML controls, keyboard nav planned

**Gate 4: Performance Requirements** - ✅ PASS
- All research items resolved (thumbnails, lazy loading, SQLite optimization)
- Specific performance targets documented in quickstart (verify section)
- Database schema optimized with indexes
- Lazy loading strategy avoids premature virtual scrolling

**No Complexity Violations**: Single-app architecture, minimal dependencies (Vite, sql.js, exifr, drag-drop-touch), vanilla JS approach maintains simplicity.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── Album.js           # Album entity and business logic
│   ├── Photo.js           # Photo entity and metadata handling
│   └── Database.js        # SQLite database wrapper and queries
├── services/
│   ├── AlbumService.js    # Album CRUD operations
│   ├── PhotoService.js    # Photo operations and EXIF extraction
│   ├── FileService.js     # File system access and validation
│   └── ThumbnailService.js # Thumbnail generation and caching
├── components/
│   ├── AlbumList.js       # Main page album grid component
│   ├── AlbumCard.js       # Individual album display card
│   ├── PhotoGrid.js       # Photo tile grid component
│   ├── PhotoTile.js       # Individual photo tile
│   └── FilePickerDialog.js # File selection UI
├── utils/
│   ├── dragDrop.js        # Drag-and-drop helper functions
│   ├── dateUtils.js       # Date formatting and sorting
│   └── errorHandling.js   # Error display and logging
├── main.js                # Application entry point
├── app.js                 # Main application controller
└── style.css              # Global styles

tests/
├── unit/
│   ├── models/            # Model tests
│   ├── services/          # Service tests
│   └── utils/             # Utility tests
└── integration/
    ├── album-workflows.spec.js  # Album creation and management E2E
    ├── photo-workflows.spec.js  # Photo addition and viewing E2E
    └── drag-drop.spec.js        # Drag-and-drop reordering E2E

public/
├── index.html
└── assets/
    └── placeholder-image.svg    # Empty album placeholder

vite.config.js
package.json
.eslintrc.js
.prettierrc
```

**Structure Decision**: Single-page web application using Vite's standard structure. Source code organized by layer (models, services, components, utils) for clear separation of concerns. Components are vanilla JS modules that manipulate DOM directly. Tests mirror source structure with unit tests for business logic and Playwright integration tests for user workflows.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
