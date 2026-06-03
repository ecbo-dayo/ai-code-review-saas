from fastapi import APIRouter
from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse
from app.services.analyzer import analyze_code

router = APIRouter()

@router.post("/", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    return analyze_code(request.files)