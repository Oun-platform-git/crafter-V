from fastapi import APIRouter, UploadFile, File
import cv2
import numpy as np

router = APIRouter()

@router.post("/generate-thumbnail/")
async def generate_thumbnail(video: UploadFile = File(...)):
    """
    Extracts an AI-powered thumbnail from a video.
    """
    try:
        # Read video
        video_data = await video.read()
        np_arr = np.frombuffer(video_data, np.uint8)
        cap = cv2.VideoCapture(cv2.imdecode(np_arr, cv2.IMREAD_COLOR))

        # Extract middle frame for thumbnail
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        middle_frame = frame_count // 2
        cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
        success, frame = cap.read()

        if success:
            thumbnail_path = f"thumbnails/{video.filename}_thumbnail.jpg"
            cv2.imwrite(thumbnail_path, frame)
            return {"message": "Thumbnail generated!", "thumbnail_path": thumbnail_path}
        else:
            return {"error": "Failed to extract thumbnail."}

    except Exception as e:
        return {"error": str(e)}
