from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.analyze import router as analyze_router
from app.api.routes.suggest import router as suggest_router

app = FastAPI(title="AI Code Review SaaS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-code-review-saas.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/analyze", tags=["analyze"])
app.include_router(suggest_router, prefix="/api/suggest", tags=["suggest"])

@app.get("/")
def root():
    return {"status": "ok"}