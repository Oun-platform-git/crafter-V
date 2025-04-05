from fastapi import APIRouter, UploadFile, File
router = APIRouter()

@router.post("/")
async def generate_voiceover(file: UploadFile = File(...)):
    return {"message": "Mock voiceover generated", "file": file.filename}
