from app.schemas.suggestion import SuggestionRequest, SuggestionResponse


# ============================================
# モック版（今はこれが動く）
# 後でこの関数の中身をClaude呼び出しに差し替える
# ============================================
def generate_suggestion(req: SuggestionRequest) -> SuggestionResponse:
    if req.type == "issue":
        return _mock_issue_suggestion(req)
    elif req.type == "complexity":
        return _mock_complexity_suggestion(req)
    elif req.type == "refactor":
        return _mock_refactor_suggestion(req)
    return SuggestionResponse(suggestion="不明なリクエストです", isMock=True)


def _mock_issue_suggestion(req: SuggestionRequest) -> SuggestionResponse:
    # カテゴリごとに仮の改善文を返す
    templates = {
        "Security": "認証情報は環境変数（.envファイル）に移し、コードから直接読み込まないようにしましょう。例: os.environ.get('PASSWORD') を使い、.envはgit管理から除外します。",
        "Bug": "try に対応する except を追加し、想定されるエラー（例: ValueError, KeyError）を個別に捕捉しましょう。エラー時のログ出力も入れると原因追跡が楽になります。",
        "Structure": "深いネストは早期return（ガード節）で減らせます。条件に合わないケースを先に return して、本処理のインデントを浅く保ちましょう。",
        "Performance": "ネストしたループは、辞書（dict）やset を使った検索に置き換えると計算量を O(n^2) から O(n) に下げられる場合があります。",
        "Design": "条件分岐が多い場合は、処理を関数に切り出すか、辞書による分岐（ディスパッチテーブル）に置き換えると見通しが良くなります。",
        "Naming": "1〜2文字の変数名は、役割がわかる名前（例: i → index, d → data）に変えましょう。読み手が推測する負担が減ります。",
        "Readability": "処理のまとまりごとに、なぜそうするのか（why）を1行コメントで添えましょう。何をするか（what）はコードで読めるので、意図を書くのがコツです。",
    }
    text = templates.get(req.category, "このissueについて、責務を分割し可読性を高める改善を検討しましょう。")
    return SuggestionResponse(suggestion=text, isMock=True)


def _mock_complexity_suggestion(req: SuggestionRequest) -> SuggestionResponse:
    text = (
        f"複雑度が{req.complexity}と高くなっています。"
        "条件分岐やループを関数に切り出して、1つの関数の責務を小さくしましょう。"
        "Pythonなら、複雑な条件は内包表記や itertools の活用で簡潔に書けることがあります。"
    )
    return SuggestionResponse(suggestion=text, isMock=True)


def _mock_refactor_suggestion(req: SuggestionRequest) -> SuggestionResponse:
    text = (
        "# リファクタリング例（モック）\n"
        "# 実際のAI連携後は、ここに書き直したコードが入ります。\n\n"
        + req.code
    )
    return SuggestionResponse(suggestion=text, isMock=True)