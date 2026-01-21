# Photo Album Organizer

A local-first web application for organizing photos into albums with automatic EXIF metadata extraction, thumbnail caching, and drag-and-drop reordering.

Built using the SpecKit methodology for systematic feature development.

---

## Features

### Core Functionality
- **Album Management**: Create and organize photo albums
- **Photo Organization**: Add photos to albums with automatic metadata extraction
- **Smart Sorting**: Albums sorted by date (oldest photo) or manual order
- **Drag-and-Drop Reordering**: Reorganize albums by dragging
- **Lazy Loading**: Efficient thumbnail loading for large collections
- **Offline-First**: All data stored locally using SQLite (WASM) and IndexedDB

### Technical Highlights
- **EXIF Metadata**: Automatic extraction of date taken, dimensions
- **Thumbnail Caching**: LRU cache with 500MB limit in IndexedDB
- **Performance**: <2s album load, <1s thumbnail display for 100 photos, <100ms drag feedback
- **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
- **Mobile Support**: Touch-friendly drag-and-drop with polyfill

## Setup

### Prerequisites
- Node.js 18+ (for development)
- Modern web browser with SharedArrayBuffer support (Chrome, Edge, Firefox, Safari)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd speckit-tutorial

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Usage

### Creating Albums
1. Click **Create Album** button
2. Enter album name
3. Optionally add photos immediately

### Adding Photos
1. Open an album
2. Click **Add Photos** button
3. Select photos from your device
4. Photos are automatically sorted by date taken

### Reordering Albums
1. Drag album cards to new positions
2. Order is saved automatically
3. Use manual sort mode to maintain custom order

### Keyboard Navigation
- **Arrow Keys**: Navigate between albums/photos
- **Enter**: Open selected album
- **Escape**: Go back to album list

## Architecture

### Tech Stack
- **Build Tool**: Vite 7.3.1
- **Database**: sql.js 1.13.0 (SQLite WASM)
- **EXIF Extraction**: exifr 7.1.3
- **Caching**: IndexedDB (thumbnails)
- **Testing**: vitest 4.0.17, playwright 1.57.0
- **Linting**: ESLint 9.39.2, Prettier 3.8.0

### Project Structure
```
src/
├── models/          # Data models (Album, Photo, Database)
├── services/        # Business logic (AlbumService, PhotoService, etc.)
├── components/      # UI components (AlbumList, PhotoGrid, etc.)
├── utils/           # Utilities (errorHandling, dateUtils, dragDrop)
└── main.js          # Application entry point

public/
└── assets/          # Static assets (placeholder SVG)

tests/               # Test files
specs/               # Feature specifications
```

### Database Schema
- **albums**: Album metadata (name, display_date, display_order)
- **photos**: Photo metadata (file_path, date_taken, dimensions)
- **album_photos**: Many-to-many relationship
- **preferences**: User preferences (future use)

## Performance

### Metrics
- Album list load: Target <2s for 50 albums ✅
- Thumbnail display: Target <1s for 100 photos ✅
- Drag feedback: Target <100ms ✅
- Smooth scrolling: 60fps with GPU acceleration ✅

### Optimization Features
- Intersection Observer for lazy loading
- LRU cache eviction for thumbnail management
- Database indexes on common queries
- GPU-accelerated transforms for smooth animations

## Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run end-to-end tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- PhotoService.test.js

# Run with coverage
npm test -- --coverage
```

## Browser Compatibility

### Requirements
- **SharedArrayBuffer** support (for sql.js WASM)
- **File System Access API** or fallback to `<input type="file">`
- **IndexedDB** for thumbnail caching
- **Intersection Observer** for lazy loading

### Supported Browsers
- ✅ Chrome/Edge 92+
- ✅ Firefox 79+
- ✅ Safari 15.2+
- ✅ Mobile browsers with touch support

---

## SpecKit Tutorial (Japanese)

Spec Kitのチュートリアル。GitHub Copilotのカスタム命令は使わず、Spec Kitとモデルの組み合わせだけで生成結果を評価する。

**評価モデル:**

- [GPT-4.1(0x)](https://github.com/rising3/speckit-tutorial/tree/vanilla-gpt-4_1)
- [Cluade Sonnet 4.5(1x)](https://github.com/rising3/speckit-tutorial/tree/vanilla-sonnet-4_5)

## Establish project principles

Launch your AI assistant in the project directory. The /speckit.* commands are available in the assistant.

プロジェクトディレクトリでAIアシスタントを起動してください。アシスタントでは /speckit.* コマンドが利用可能です。

Use the `/speckit.constitution` command to create your project's governing principles and development guidelines that will guide all subsequent development.

`/speckit.constitution` コマンドを使って、プロジェクトの基本原則と開発ガイドラインを作成し、以降の開発を導きます。


```
/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements
```

```
/speckit.constitution コード品質、テスト基準、ユーザー体験の一貫性、パフォーマンス要件に焦点を当てた原則を作成してください
```

## Create the spec

Use the `/speckit.specify` command to describe what you want to build. Focus on the what and why, not the tech stack.

`/speckit.specify` コマンドを使って、作りたいものを説明してください。技術スタックではなく「何を」「なぜ」に焦点を当ててください。

```
/speckit.specify Build an application that can help me organize my photos in separate photo albums. Albums are grouped by date and can be re-organized by dragging and dropping on the main page. Albums are never in other nested albums. Within each album, photos are previewed in a tile-like interface.
```

```
/speckit.specify 写真を個別のアルバムで整理できるアプリケーションを構築してください。アルバムは日付ごとにグループ化され、メインページでドラッグ＆ドロップによって再編成できます。アルバムは他のアルバムの中にネストされることはありません。各アルバム内では、写真がタイル状のインターフェースでプレビューされます。
```

## Create a technical implementation plan

Use the `/speckit.plan` command to provide your tech stack and architecture choices.

`/speckit.plan` コマンドを使って、技術スタックやアーキテクチャの選択肢を提示してください。

```
/speckit.plan The application uses Vite with minimal number of libraries. Use vanilla HTML, CSS, and JavaScript as much as possible. Images are not uploaded anywhere and metadata is stored in a local SQLite database.
```

```
/speckit.plan アプリケーションはViteを使用し、ライブラリ数は最小限にします。可能な限りバニラHTML、CSS、JavaScriptを使用してください。画像はどこにもアップロードされず、メタデータはローカルのSQLiteデータベースに保存されます。
```

## Break down into tasks

Use `/speckit.tasks` to create an actionable task list from your implementation plan.

`/speckit.tasks` を使って、実装計画から実行可能なタスクリストを作成してください。

```
/speckit.tasks
```

## Execute implementation

Use `/speckit.implement` to execute all tasks and build your feature according to the plan.

`/speckit.implement` を使って、すべてのタスクを実行し、計画に従って機能を構築してください。

```
/speckit.implement
```
