from pydantic import BaseModel
from typing import List

class FileInput(BaseModel):
    filename: str
    code: str

class AnalyzeRequest(BaseModel):
    files: List[FileInput]

class IssueItem(BaseModel):
    category: str
    label: str
    severity: str
    problem: str = ""        # 問題の説明（バック生成）
    count: int = 1           # 何個まとめたか

class FileResult(BaseModel):
    name: str
    score: int
    issues: int
    debt: str
    complexity: float
    complexityLevel: str = "low"   # low/medium/high（警告レベル）
    status: str
    issueList: List[IssueItem]
    code: str = ""                  # AI提案で使うため元コードを保持

class AnalyzeResponse(BaseModel):
    overallScore: int
    totalFiles: int
    totalIssues: int
    files: List[FileResult]