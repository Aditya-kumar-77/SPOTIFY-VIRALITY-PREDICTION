"""
ML Prediction Service - FastAPI
Exposes /predict endpoint for the Node.js backend to call.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from predictor import get_predictor


class SongInput(BaseModel):
    """Raw song features from Spotify API or manual input."""
    track_id: Optional[str] = None
    track_name: Optional[str] = None
    artist_name: Optional[str] = "Unknown"
    popularity: Optional[float] = 50
    duration_ms: Optional[float] = 200000
    explicit: Optional[int] = 0
    danceability: Optional[float] = 0.5
    energy: Optional[float] = 0.5
    key: Optional[int] = 0
    loudness: Optional[float] = -10
    mode: Optional[int] = 1
    speechiness: Optional[float] = 0.05
    acousticness: Optional[float] = 0.3
    instrumentalness: Optional[float] = 0.05
    liveness: Optional[float] = 0.1
    valence: Optional[float] = 0.5
    tempo: Optional[float] = 120
    time_signature: Optional[int] = 4
    release_date: Optional[str] = "2024-01-01"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    try:
        models_dir = os.getenv("MODELS_DIR", "models")
        get_predictor(models_dir)
        yield
    finally:
        pass


app = FastAPI(
    title="Spotify Virality Prediction API",
    description="ML service for predicting song virality",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check for load balancers and monitoring."""
    return {"status": "ok", "service": "ml-prediction"}


@app.post("/predict")
def predict(song: SongInput):
    """Predict virality probability for a song."""
    try:
        predictor = get_predictor()
        raw = song.model_dump(exclude_none=True)
        result = predictor.predict(raw)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
def predict_batch(songs: list[SongInput]):
    """Predict virality for multiple songs."""
    try:
        predictor = get_predictor()
        results = []
        for song in songs:
            raw = song.model_dump(exclude_none=True)
            result = predictor.predict(raw)
            results.append(result)
        return {"predictions": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
