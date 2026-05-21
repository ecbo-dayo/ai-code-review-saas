import ast
import math
from typing import List
from app.schemas.analysis import FileInput, FileResult, IssueItem, AnalyzeResponse


def get_issue_weight(issue_type: str) -> int:
    weights = {
        "security": 5,
        "bug": 4,
        "complexity": 3,
        "long_function": 3,
        "naming": 1,
        "comment": 1,
    }
    return weights.get(issue_type, 1)


def detect_issues(code: str, filename: str) -> List[IssueItem]:
    issues = []
    lines = code.split('\n')

    # ネストの深さチェック
    max_indent = 0
    for line in lines:
        if line.strip():
            indent = len(line) - len(line.lstrip())
            max_indent = max(max_indent, indent)
    if max_indent >= 16:
        issues.append(IssueItem(category="Structure", label="ネストが深い", severity="medium"))

    # 関数の長さチェック
    func_lines = 0
    in_func = False
    for line in lines:
        if line.strip().startswith('def '):
            in_func = True
            func_lines = 0
        if in_func:
            func_lines += 1
        if func_lines > 30:
            issues.append(IssueItem(category="Structure", label="関数が長すぎる", severity="medium"))
            in_func = False
            func_lines = 0

    # ハードコードされた認証情報チェック
    for line in lines:
        if ('password' in line.lower() or 'secret' in line.lower()) and '=' in line and '"' in line:
            issues.append(IssueItem(category="Security", label="認証情報がハードコード", severity="high"))
            break

    # 命名規則チェック（1〜2文字の変数名）
    naming_count = 0
    for line in lines:
        stripped = line.strip()
        if '=' in stripped and not stripped.startswith('#'):
            parts = stripped.split('=')[0].strip()
            if len(parts) <= 2 and parts.isalpha():
                naming_count += 1
    if naming_count >= 3:
        issues.append(IssueItem(category="Readability", label="命名が不明確", severity="low"))

    return issues


def calculate_complexity(code: str) -> float:
    complexity = 1
    keywords = ['if ', 'elif ', 'for ', 'while ', 'except', 'and ', 'or ']
    for line in code.split('\n'):
        for kw in keywords:
            if kw in line:
                complexity += 1
    return round(min(complexity, 10), 1)


def get_debt_level(issues: List[IssueItem]) -> str:
    has_heavy = any(i.severity == 'high' for i in issues)
    if has_heavy:
        return "High"
    debt_score = sum(get_issue_weight(
        'security' if i.severity == 'high' else
        'complexity' if i.severity == 'medium' else 'naming'
    ) for i in issues)
    if debt_score >= 10:
        return "Medium"
    return "Low"


def calculate_score(debt: str, complexity: float, issue_count: int) -> int:
    score = 100

    # Debtペナルティ
    base = 25 if debt == "High" else 15 if debt == "Medium" else 5
    score -= min(base, 35)

    # Complexityペナルティ
    score -= min(int(complexity * 3), 30)

    # Issuesペナルティ
    score -= min(int(issue_count * 1.5), 25)

    # High補正
    if debt == "High":
        score = min(score, 70)

    return max(0, score)


def get_status(score: int, debt: str, complexity: float, issues: List[IssueItem]) -> str:
    has_heavy = any(i.severity == 'high' for i in issues)
    if has_heavy:
        return "Bad"
    if complexity >= 9:
        return "Bad"
    if score >= 80:
        return "Good"
    if score >= 60:
        return "Warning"
    return "Bad"


def analyze_code(files: List[FileInput]) -> AnalyzeResponse:
    results = []

    for file in files:
        issues = detect_issues(file.code, file.filename)
        complexity = calculate_complexity(file.code)
        debt = get_debt_level(issues)
        score = calculate_score(debt, complexity, len(issues))
        status = get_status(score, debt, complexity, issues)

        results.append(FileResult(
            name=file.filename,
            score=score,
            issues=len(issues),
            debt=debt,
            complexity=complexity,
            status=status,
            issueList=issues,
        ))

    overall_score = int(sum(r.score for r in results) / len(results)) if results else 0
    total_issues = sum(r.issues for r in results)

    return AnalyzeResponse(
        overallScore=overall_score,
        totalFiles=len(results),
        totalIssues=total_issues,
        files=results,
    )