from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import voiceover, shorts, captions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voiceover.router, prefix="/api/voiceover")
app.include_router(shorts.router, prefix="/api/shorts")
app.include_router(captions.router, prefix="/api/captions")

@app.get("/")
def read_root():
    return {"message": "Crafter V Backend Running!"}
