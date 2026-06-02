import re
from typing import List
from app.schemas.analysis import FileInput, FileResult, IssueItem, AnalyzeResponse


# -------------------------
# Issue重み定義
# -------------------------
ISSUE_SEVERITY = {
    "Security": "high",
    "Bug": "high",
    "Structure": "medium",
    "Performance": "medium",
    "Design": "medium",
    "Naming": "low",
    "Readability": "low",
}


# -------------------------
# Issue検出
# -------------------------
def detect_issues(code: str, filename: str) -> List[IssueItem]:
    issues = []
    lines = code.split('\n')

    # ① セキュリティ：ハードコード認証情報
    for line in lines:
        if re.search(r'(password|secret|api_key|token)\s*(==?)\s*["\']', line, re.IGNORECASE):
            issues.append(IssueItem(
                category="Security",
                label="認証情報がハードコードされています",
                severity="high",
                problem="パスワードやAPIキーがソースコード内に直接書かれています。コードが流出した際に認証情報が漏洩する危険があります。",
                count=1,
            ))
            break

    # ② バグ：例外処理なし
    has_try = any('try:' in line for line in lines)
    has_except = any('except' in line for line in lines)
    if has_try and not has_except:
        issues.append(IssueItem(
            category="Bug",
            label="例外処理が不完全です",
            severity="high",
            problem="try に対応する except がありません。想定外のエラーが発生したときに適切に処理されません。",
            count=1,
        ))

    # ③ 構造：ネストの深さ
    max_indent = 0
    for line in lines:
        if line.strip():
            indent = len(line) - len(line.lstrip())
            max_indent = max(max_indent, indent)
    if max_indent >= 20:
        issues.append(IssueItem(
            category="Structure",
            label="ネストが深すぎます",
            severity="medium",
            problem="条件分岐やループが深くネストしており、処理の流れが追いにくくなっています。",
            count=1,
        ))
    elif max_indent >= 12:
        issues.append(IssueItem(
            category="Structure",
            label="ネストがやや深いです",
            severity="medium",
            problem="ネストがやや深く、可読性が下がっています。",
            count=1,
        ))

    # ④ 構造：関数が長すぎる
    func_lines = 0
    in_func = False
    for line in lines:
        if line.strip().startswith('def '):
            if in_func and func_lines > 50:
                issues.append(IssueItem(
                    category="Structure",
                    label="関数が長すぎます",
                    severity="medium",
                    problem="関数が50行を超えています。1つの関数が多くの責務を持ちすぎている可能性があります。",
                    count=1,
                ))
            in_func = True
            func_lines = 0
        if in_func:
            func_lines += 1
    if in_func and func_lines > 50:
        issues.append(IssueItem(
            category="Structure",
            label="関数が長すぎます",
            severity="medium",
            problem="関数が50行を超えています。1つの関数が多くの責務を持ちすぎている可能性があります。",
            count=1,
        ))

    # ⑤ パフォーマンス：ネストしたループ
    loop_depth = 0
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('for ') or stripped.startswith('while '):
            loop_depth += 1
        if loop_depth >= 2:
            issues.append(IssueItem(
                category="Performance",
                label="ネストしたループがあります",
                severity="medium",
                problem="ループが二重以上にネストしています。データ量が増えると処理速度が大きく低下する可能性があります。",
                count=1,
            ))
            break

    # ⑥ 設計：条件分岐が多い
    condition_count = sum(1 for line in lines if re.search(r'\bif\b|\belif\b', line))
    if condition_count >= 10:
        issues.append(IssueItem(
            category="Design",
            label="条件分岐が多すぎます",
            severity="medium",
            problem="条件分岐が多く、処理の見通しが悪くなっています。責務の分割を検討すべきです。",
            count=1,
        ))

    # ⑦ 命名：短すぎる変数名
    naming_count = 0
    for line in lines:
        stripped = line.strip()
        if '=' in stripped and not stripped.startswith('#') and not stripped.startswith('def '):
            var = stripped.split('=')[0].strip()
            if len(var) <= 2 and var.isalpha():
                naming_count += 1
    if naming_count >= 2:
        issues.append(IssueItem(
            category="Naming",
            label="変数名が短すぎます",
            severity="low",
            problem=f"1〜2文字の変数名が{naming_count}個あります。意味のわかる名前にすると可読性が向上します。",
            count=naming_count,
        ))

    # ⑧ 可読性：コメント不足
    total_lines = len([l for l in lines if l.strip()])
    comment_lines = len([l for l in lines if l.strip().startswith('#')])
    if total_lines > 20 and comment_lines == 0:
        issues.append(IssueItem(
            category="Readability",
            label="コメントがありません",
            severity="low",
            problem="コードにコメントが一切ありません。処理の意図が他の人に伝わりにくくなっています。",
            count=1,
        ))

    return issues

# -------------------------
# 複雑度計算
# -------------------------
def calculate_complexity(code: str) -> float:
    complexity = 1
    lines = code.split('\n')

    for line in lines:
        stripped = line.strip()
        # 分岐・ループのカウント
        if re.search(r'\bif\b', stripped): complexity += 1
        if re.search(r'\belif\b', stripped): complexity += 1
        if re.search(r'\bfor\b', stripped): complexity += 1
        if re.search(r'\bwhile\b', stripped): complexity += 1
        if re.search(r'\bexcept\b', stripped): complexity += 1
        # and/orは0.5として計算（実務考慮）
        complexity += stripped.count(' and ') * 0.5
        complexity += stripped.count(' or ') * 0.5

    return round(complexity, 1)


def get_complexity_level(complexity: float) -> str:
    if complexity >= 11:
        return "high"    # 赤警告
    if complexity >= 6:
        return "medium"  # 黄色警告
    return "low"         # 警告なし


# -------------------------
# Debt計算
# -------------------------
def get_debt_level(issues: List[IssueItem]) -> str:
    high_count = sum(1 for i in issues if i.severity == 'high')
    medium_count = sum(1 for i in issues if i.severity == 'medium')
    low_count = sum(1 for i in issues if i.severity == 'low')

    # 即High
    if high_count >= 1:
        return "High"

    # Mediumあり
    if medium_count >= 1:
        # Medium起因のHigh
        if medium_count >= 11:
            return "High"
        if medium_count >= 6 and low_count >= 20:
            return "High"
        if medium_count >= 8 and low_count >= 15:
            return "High"
        if medium_count >= 3 and low_count >= 30:
            return "High"
        # Medium 1-2個 かつ Low 0個
        if medium_count <= 2 and low_count == 0:
            return "Low"
        # それ以外はMedium
        return "Medium"

    # Lowのみ
    if low_count <= 15:
        return "Low"
    return "Medium"


# -------------------------
# スコア計算
# -------------------------
def calculate_score(debt: str, complexity: float, issues: List[IssueItem]) -> int:
    score = 100

    # issueの実数（countを合計）= 量
    total_count = sum(i.count for i in issues)

    # Debt（40%）最大40
    base = 30 if debt == "High" else 15 if debt == "Medium" else 3
    debt_bonus = min((total_count * 0.3), 10)
    debt_penalty = min(base + debt_bonus, 40)
    score -= debt_penalty

    # 複雑度（30%）最大30
    complexity_penalty = min(complexity * 2, 30)
    score -= complexity_penalty

    # Issue数（30%）最大30（countベースで量を反映）
    issue_penalty = min(total_count * 1.2, 30)
    score -= issue_penalty

    # High補正
    if debt == "High":
        score = min(score, 65)

    # 複雑度高い場合の補正
    if complexity >= 11:
        score = min(score, 60)
    elif complexity >= 6:
        score = min(score, 80)

    return max(0, round(score))

# -------------------------
# Status判定
# -------------------------
def get_status(score: int, debt: str, complexity: float, issues: List[IssueItem]) -> str:
    has_high = any(i.severity == 'high' for i in issues)

    # 強制Bad
    if has_high:
        return "Bad"
    if complexity >= 11:
        return "Bad"
    if score < 50:
        return "Bad"

    if score >= 75:
        return "Good"
    return "Warning"


# -------------------------
# バリデーション
# -------------------------
def validate_code(code: str) -> bool:
    if not code or len(code.strip()) < 10:
        return False

    code_patterns = [
        r'\bdef \w+\s*\(',
        r'\bclass \w+',
        r'\bif\b.+:',
        r'\bfor\b.+:',
        r'\bwhile\b.+:',
        r'\bimport\b',
        r'\bfunction\b',
        r'\bconst\b',
        r'\bvar\b',
        r'\blet\b',
        r'=>',
        r'\bpublic\b',
        r'\bprivate\b',
        r'\bvoid\b',
        r'\{',
        r'\}',
    ]

    matches = sum(1 for p in code_patterns if re.search(p, code))
    return matches >= 2


# -------------------------
# メイン解析
# -------------------------
def analyze_code(files: List[FileInput]) -> AnalyzeResponse:
    results = []

    for file in files:
        # バリデーション
        if not validate_code(file.code):
            results.append(FileResult(
                name=file.filename,
                score=0,
                issues=0,
                debt="Low",
                complexity=0,
                complexityLevel="low",
                status="Error",
                issueList=[IssueItem(
                    category="Validation",
                    label="有効なコードが入力されていません",
                    severity="high",
                    problem="コードとして認識できる構文が見つかりませんでした。エラー文や文章ではなく、ソースコードを入力してください。",
                    count=1,
                )],
                code=file.code,
            ))
            continue

        issues = detect_issues(file.code, file.filename)
        complexity = calculate_complexity(file.code)
        complexity_level = get_complexity_level(complexity)
        debt = get_debt_level(issues)
        score = calculate_score(debt, complexity, issues)
        status = get_status(score, debt, complexity, issues)

        results.append(FileResult(
            name=file.filename,
            score=score,
            issues=len(issues),
            debt=debt,
            complexity=complexity,
            complexityLevel=complexity_level,
            status=status,
            issueList=issues,
            code=file.code,
        ))

    valid_results = [r for r in results if r.status != "Error"]
    overall_score = int(sum(r.score for r in valid_results) / len(valid_results)) if valid_results else 0
    total_issues = sum(r.issues for r in results)

    return AnalyzeResponse(
        overallScore=overall_score,
        totalFiles=len(results),
        totalIssues=total_issues,
        files=results,
    )