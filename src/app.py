import logging
from typing import Literal
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.services.gaze_tracker import HeadlessGazeTracker

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("proctoring_app")

app = FastAPI(
    title="Proctoring & Anti-Cheating Engine",
    description="Headless real-time gaze tracking and browser anomaly detection service.",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize gaze tracker instance
tracker = HeadlessGazeTracker()


class BrowserAnomalyPayload(BaseModel):
    interview_id: str = Field(..., description="Unique interview session ID")
    event_type: Literal["TAB_SWITCHED_AWAY", "SCREEN_SHARE_TERMINATED"] = Field(
        ..., description="Type of browser anomaly event"
    )
    timestamp: str = Field(..., description="ISO timestamp of the event")


@app.get("/health")

def health_check():
    return {"status": "ok", "service": "proctoring-engine"}


@app.post("/api/v1/proctor/analyze-frame")
def analyze_frame(file: UploadFile = File(...)):
    """
    Analyzes an uploaded video snapshot frame for gaze direction and face presence.
    NOTE: Defined as synchronous (def) to allow FastAPI to execute OpenCV processing
    in an external threadpool without blocking the asyncio event loop.
    """
    try:
        frame_bytes = file.file.read()
        if not frame_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image file received.",
            )

        result = tracker.process_frame(frame_bytes)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze image frame.",
        )


@app.post("/api/v1/proctor/log-browser-anomaly")
def log_browser_anomaly(payload: BrowserAnomalyPayload):
    """
    Logs browser-level cheating events such as tab switching or ending screen share.
    """
    logger.warning(
        f"ANOMALY DETECTED | Interview ID: {payload.interview_id} | "
        f"Event: {payload.event_type} | Time: {payload.timestamp}"
    )

    return {
        "status": "success",
        "message": f"Successfully logged anomaly: {payload.event_type}",
        "interview_id": payload.interview_id,
        "event_type": payload.event_type,
        "timestamp": payload.timestamp,
    }
