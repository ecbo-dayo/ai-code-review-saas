# 開発ログ

## 2026-03-28

### 実装
ログイン画面作成

### 技術
Figmaで作成

## 2026-04-24

### 実装
コード入力画面、アップロード画面、GitHubリポジトリ入力画面、解析結果全体概要画面、解析結果ファイル概要画面作成

### 技術
Figmaで作成

## 2026-05-4

### 実装
Headerコンポーネント作成、CodeEditorPanelコンポーネント作成、ファイル追加、削除機能Analyzeボタン実装

### 技術
Next.js

## 2026-05-21

### 実装
Summaryタブ（スコア・Insight・Priority・複雑度グラフ）、Fail Summaryタブ（ファイル一覧表・詳細パネル）、ファイルクリックで詳細表示

## 技術
Next.js

## 2026-05-22

### 技術
FastAPI（複雑度計算・Issue検出・スコア算出は自前アルゴリズムで実装）

### 技術
FastAPI

## 2026-05-22

## 実装
axiosでAPI呼び出し実装（lib/api.ts）、Analyzeボタンで実際に解析実行、解析結果をダッシュボードに反映

## 技術
Next.js、FastAPI

## 2026-06-02

### 実装
issueカテゴリ再定義（High: Security・Bug / Medium: Structure・Performance・Design / Low: Naming・Readability）、Debt判定ロジック改善（直しやすさと量で判定）、複雑度計算にネスト深度を反映、コードバリデーション実装（非コード入力を弾く）、AI提案窓口をモックで実装（issue・complexity・refactorの3タイプ）、AI提案タブ実装（High個別・Medium/Lowはカテゴリ別にまとめ・複雑度タブは黄/赤警告時のみ・タブ展開時に遅延生成）、スコア配分確定（Debt40%・複雑度30%・Issue30%）

### 設計判断
- 複雑度は分岐数ではなくネストの深さで重み付け（深いほど読みにくいため）
- AI連携は先にモックで作り、APIキー差し替えだけで本番化できる構造にした（課金前に全体を完成させるため）

### 技術
Next.js、FastAPI