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

class FileResult(BaseModel):
    name: str
    score: int
    issues: int
    debt: str
    complexity: float
    status: str
    issueList: List[IssueItem]

class AnalyzeResponse(BaseModel):
    overallScore: int
    totalFiles: int
    totalIssues: int
    files: List[FileResult]