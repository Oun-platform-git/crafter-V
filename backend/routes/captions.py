from fastapi import APIRouter, UploadFile, File
router = APIRouter()

@router.post("/")
async def generate_captions(file: UploadFile = File(...)):
    return {"message": "Mock captions generated", "file": file.filename}
