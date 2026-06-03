from fastapi import APIRouter
from app.schemas.suggestion import SuggestionRequest, SuggestionResponse
from app.services.ai_service import generate_suggestion

router = APIRouter()


@router.post("/", response_model=SuggestionResponse)
async def suggest(request: SuggestionRequest):
    return generate_suggestion(request)