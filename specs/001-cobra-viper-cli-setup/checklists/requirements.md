
# 要件仕様品質チェックリスト: cobraとviperを用いたGo CLI雛形

**Purpose**: 仕様の明確性・完全性・一貫性・受け入れ基準の妥当性・カバレッジを検証する
**Created**: 2025-11-16
**Feature**: [spec.md](../spec.md)

## Requirement Completeness
 - [X] CHK001 すべての必須要件（Go 1.25, cobra, viper, internal分離, bin出力, Makefile, TDD, CI, README, LICENSE, .gitignore, 設定ファイルパス等）が明記されているか [Completeness, Spec §Requirements]
 - [X] CHK002 スコープ外（API/Web/DB/GUI/外部サービス等）が明確に除外されているか [Completeness, Spec §スコープ外]
 - [X] CHK003 主要ユーザーストーリー（雛形生成・クロスプラットフォーム・CI/リリース）が網羅されているか [Coverage, Spec §User Scenarios]
 - [X] CHK004 エッジケース（OS差異・設定ファイル有無・Makefile/CIエラー等）が明記されているか [Edge Case, Spec §Edge Cases]

## Requirement Clarity
 - [X] CHK005 CLI名・バージョン・設定ファイル名・パス等の命名規則が明確か [Clarity, Spec §Requirements]
 - [X] CHK006 設定ファイル形式（YAML）・配置パス（ホームディレクトリ/.config/mycli/mycli.yaml）が明記されているか [Clarity, Spec §Requirements]
 - [X] CHK007 help/versionの提供方針が明確か（cobra標準） [Clarity, Spec §plan指示]

## Requirement Consistency
 - [X] CHK008 仕様・clarify・plan間で要件や除外範囲・運用ガイド等に矛盾がないか [Consistency, Spec全体/clarify/plan]

## Acceptance Criteria Quality
 - [X] CHK009 すべてのユーザーストーリーに独立した受け入れ基準・テスト観点が明記されているか [Acceptance Criteria, Spec §User Scenarios]
 - [X] CHK010 成功基準（Measurable Outcomes）が具体的・測定可能か [Measurability, Spec §Success Criteria]

## Scenario Coverage
 - [X] CHK011 開発者・CI運用者・最終CLI利用者の全ユーザータイプに対する要件がカバーされているか [Coverage, Spec §ユーザー定義]
 - [X] CHK012 雛形生成後の運用・拡張ガイド（README/コメント等）が明記されているか [Coverage, Spec §clarify]

## Non-Functional Requirements
 - [X] CHK013 パフォーマンス（CLI応答性）・TDD・CI・フォーマット/リンター要件が明記されているか [Non-Functional, Spec §Requirements]
 - [X] CHK014 セキュリティ・エラーハンドリング方針が明記されているか [Non-Functional, Spec §clarify]

## Dependencies & Assumptions
 - [X] CHK015 依存ライブラリ・外部ツール（cobra, viper, cobra-cli, GoReleaser, GitHub Actions等）が明記されているか [Dependency, Spec §Requirements]
 - [X] CHK016 雛形の再生成・削除・バージョン管理方針が明記されているか [Assumption, Spec §clarify]

## Ambiguities & Conflicts
 - [X] CHK017 曖昧な表現や[NEEDS CLARIFICATION]が残っていないか [Ambiguity, Spec全体]
 - [X] CHK018 仕様・clarify・plan間で矛盾や重複がないか [Conflict, Spec全体/clarify/plan]

## Notes
- 80%以上の項目にSpecセクション参照を付与
- 仕様・clarify・planの同期が取れているかを必ず確認
- チェックリストは要件品質の検証用であり、実装テストではない
