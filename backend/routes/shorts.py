from fastapi import APIRouter, UploadFile, File
router = APIRouter()

@router.post("/")
async def generate_shorts(file: UploadFile = File(...)):
    return {"message": "Mock shorts generated", "file": file.filename}
