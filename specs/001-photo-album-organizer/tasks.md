---
description: "Task list for Photo Album Organizer (001)"
---

# Tasks: Photo Album Organizer

**Input**: Design documents from `/specs/001-photo-album-organizer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: ユーザーストーリーごとにE2E/UI/ユニットテストを含む（TDD原則）

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create project structure (src/, tests/, public/) per plan.md
- [ ] T002 Initialize Vite project with vanilla JS/HTML/CSS
- [ ] T003 [P] Install sql.js, Vitest, Playwright, ESLint, Prettier, SortableJS
- [ ] T004 [P] Set up ESLint, Prettier config in .eslintrc, .prettierrc
- [ ] T005 [P] Add SQLite schema migration/init script in src/db/schema.js
- [ ] T006 [P] Add basic README.md and update quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T007 Implement SQLite (sql.js) DB bootstrap in src/db/init.js
- [ ] T008 Implement Album/Photo entity models in src/models/
- [ ] T009 Implement DB access service (CRUD) in src/services/dbService.js
- [ ] T010 [P] Implement file picker utility in src/lib/filePicker.js
- [ ] T011 [P] Implement thumbnail generator in src/lib/thumbnail.js
- [ ] T012 [P] Set up Vitest config and basic test runner in tests/unit/
- [ ] T013 [P] Set up Playwright E2E test config in tests/e2e/

---

## Phase 3: User Story 1 (P1) - アルバムの作成と日付グループ化

- [ ] T014 [US1] Implement photo import UI in src/components/PhotoImport.js
- [ ] T015 [US1] Implement date-based album grouping logic in src/services/albumService.js
- [ ] T016 [US1] Implement album creation UI in src/components/AlbumCreate.js
- [ ] T017 [US1] Implement photo-to-album assignment logic in src/services/albumService.js
- [ ] T018 [P] [US1] Unit test: album grouping/creation in tests/unit/albumService.test.js
- [ ] T019 [P] [US1] E2E test: photo import & album grouping in tests/e2e/album-grouping.e2e.js

---

## Phase 4: User Story 2 (P2) - アルバムのドラッグ&ドロップ並べ替え

- [ ] T020 [US2] Implement album list main page UI in src/components/AlbumList.js
- [ ] T021 [US2] Integrate SortableJS for drag & drop in src/components/AlbumList.js
- [ ] T022 [US2] Implement album order persistence in src/services/albumService.js
- [ ] T023 [P] [US2] Unit test: album order logic in tests/unit/albumService.test.js
- [ ] T024 [P] [US2] E2E test: drag & drop reorder in tests/e2e/album-reorder.e2e.js

---

## Phase 5: User Story 3 (P3) - アルバム内の写真タイル表示

- [ ] T025 [US3] Implement album detail page UI in src/components/AlbumDetail.js
- [ ] T026 [US3] Implement photo tile grid UI in src/components/PhotoTileGrid.js
- [ ] T027 [US3] Implement photo preview logic in src/components/PhotoTileGrid.js
- [ ] T028 [P] [US3] Unit test: photo tile logic in tests/unit/photoTileGrid.test.js
- [ ] T029 [P] [US3] E2E test: album photo tile view in tests/e2e/photo-tile.e2e.js

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T030 [P] Add accessibility (a11y) improvements in src/components/
- [ ] T031 [P] Add error handling & notifications in src/lib/notify.js
- [ ] T032 [P] Add responsive CSS for mobile/tablet in src/styles/
- [ ] T033 [P] Add code/documentation comments throughout src/
- [ ] T034 [P] Final performance test & optimization in src/
- [ ] T035 [P] Final E2E regression test in tests/e2e/

---

## Dependencies
- US1 → US2, US3（US1が最小MVP、US2/US3は独立実装・テスト可）
- Foundational phaseは全ユーザーストーリーの前提

## Parallel Execution Examples
- T003, T004, T005, T006は同時実行可
- T010, T011, T012, T013は同時実行可
- 各ユーザーストーリーの[P]タスクは独立並列実行可

## Implementation Strategy
- MVPはUS1（アルバム自動グループ化・作成・写真追加UI）
- 以降、US2（並べ替え）、US3（タイル表示）を独立追加
- 各フェーズでE2E/ユニットテスト・アクセシビリティ・パフォーマンスを必ず検証
