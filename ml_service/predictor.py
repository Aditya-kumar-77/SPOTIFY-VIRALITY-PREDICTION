"""
Prediction module - loads trained models and transforms raw song data for inference.
"""

import os
import json
import pandas as pd
import numpy as np
import joblib
from pathlib import Path


class ViralityPredictor:
    """Loads models and artifacts, predicts virality from raw song data."""

    def __init__(self, models_dir='models'):
        self.models_dir = Path(models_dir)
        self.model = None
        self.scaler = None
        self.feature_cols = None
        self.artist_stats = None
        self.target_encoder = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Load model, scaler, feature columns, and feature engineer artifacts."""
        # Model and scaler
        model_path = self.models_dir / 'best_model.joblib'
        scaler_path = self.models_dir / 'scaler.joblib'
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}. Run training first.")
        
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)

        with open(self.models_dir / 'feature_columns.json') as f:
            self.feature_cols = json.load(f)

        # Feature engineer artifacts
        artifacts_path = self.models_dir / 'feature_engineer_artifacts.joblib'
        if artifacts_path.exists():
            artifacts = joblib.load(artifacts_path)
            self.target_encoder = artifacts.get('target_encoder')

        artist_stats_path = self.models_dir / 'artist_stats.csv'
        if artist_stats_path.exists():
            self.artist_stats = pd.read_csv(artist_stats_path)

    def _raw_to_dataframe(self, raw: dict) -> pd.DataFrame:
        """Convert raw song dict to a single-row DataFrame with required columns."""
        defaults = {
            'danceability': 0.5, 'energy': 0.5, 'key': 0, 'loudness': -10,
            'mode': 1, 'speechiness': 0.05, 'acousticness': 0.3,
            'instrumentalness': 0.05, 'liveness': 0.1, 'valence': 0.5,
            'tempo': 120, 'time_signature': 4,
            'duration_ms': 200000, 'explicit': 0,
            'popularity': 50, 'artist_name': 'Unknown',
            'release_date': '2024-01-01'
        }
        row = {**defaults, **{k: v for k, v in raw.items() if v is not None}}
        return pd.DataFrame([row])

    def _transform_single(self, df: pd.DataFrame) -> np.ndarray:
        """Apply feature engineering to single-row dataframe."""
        # Duration
        df = df.copy()
        df['duration_min'] = df['duration_ms'] / 60000
        df['optimal_length'] = ((df['duration_min'] >= 2.5) & (df['duration_min'] <= 4)).astype(int)
        df['energy_valence'] = df['energy'] * df['valence']
        df['danceability_energy'] = df['danceability'] * df['energy']
        df['vocal_instrumental_balance'] = df['speechiness'] - df['instrumentalness']
        df['acoustic_energy_balance'] = df['acousticness'] - df['energy']
        df['is_live'] = (df['liveness'] > 0.8).astype(int)
        df['highly_danceable'] = (df['danceability'] > 0.7).astype(int)
        df['loudness_normalized'] = (df['loudness'] + 60) / 60
        df['is_loud'] = (df['loudness'] > -5).astype(int)
        df['dance_tempo'] = ((df['tempo'] >= 110) & (df['tempo'] <= 130)).astype(int)
        df['tempo_normalized'] = df['tempo'] / 250.0
        df['party_index'] = df['danceability'] * 0.4 + df['energy'] * 0.3 + df['valence'] * 0.3
        df['chill_index'] = df['acousticness'] * 0.4 + (1 - df['energy']) * 0.3 + df['valence'] * 0.3
        df['workout_index'] = df['energy'] * 0.5 + df['tempo'] / 200 * 0.3 + df['loudness_normalized'] * 0.2

        # Temporal
        if 'release_date' in df.columns and pd.notna(df['release_date'].iloc[0]):
            rd = pd.to_datetime(df['release_date'].iloc[0], errors='coerce')
            if pd.notna(rd):
                df['release_year'] = rd.year
                df['release_month'] = rd.month
                df['release_day_of_week'] = rd.dayofweek
            else:
                df['release_year'] = 2024
                df['release_month'] = 1
                df['release_day_of_week'] = 0
        elif 'release_year' in df.columns and pd.notna(df['release_year'].iloc[0]):
            df['release_year'] = int(df['release_year'].iloc[0])
            df['release_month'] = int(df['release_month'].iloc[0]) if 'release_month' in df.columns else 1
            df['release_day_of_week'] = int(df['release_day_of_week'].iloc[0]) if 'release_day_of_week' in df.columns else 0
        else:
            df['release_year'] = 2024
            df['release_month'] = 1
            df['release_day_of_week'] = 0
        df['is_weekend_release'] = (df['release_day_of_week'] >= 5).astype(int)
        df['song_age_years'] = (2026 - df['release_year']).clip(lower=0)

        # Mood
        df['mood'] = 'neutral'
        df.loc[(df['valence'] > 0.6) & (df['energy'] > 0.6), 'mood'] = 'happy_energetic'
        df.loc[(df['valence'] > 0.6) & (df['energy'] <= 0.6), 'mood'] = 'happy_calm'
        df.loc[(df['valence'] <= 0.4) & (df['energy'] > 0.6), 'mood'] = 'sad_energetic'
        df.loc[(df['valence'] <= 0.4) & (df['energy'] <= 0.4), 'mood'] = 'sad_calm'

        # Artist features
        if self.artist_stats is not None and 'artist_name' in df.columns:
            artist = df['artist_name'].iloc[0]
            match = self.artist_stats[self.artist_stats['artist_name'] == artist]
            if len(match) > 0:
                for col in ['artist_avg_popularity', 'artist_song_count', 'artist_max_popularity',
                            'artist_std_popularity', 'artist_has_viral_hit']:
                    df[col] = match[col].values[0]
            else:
                df['artist_avg_popularity'] = 50
                df['artist_song_count'] = 1
                df['artist_max_popularity'] = 50
                df['artist_std_popularity'] = 0
                df['artist_has_viral_hit'] = 0
        else:
            df['artist_avg_popularity'] = 50
            df['artist_song_count'] = 1
            df['artist_max_popularity'] = 50
            df['artist_std_popularity'] = 0
            df['artist_has_viral_hit'] = 0

        # Target encoding
        if self.target_encoder is not None:
            try:
                enc_df = self.target_encoder.transform(df[['key', 'mode', 'time_signature']])
                for col in ['key', 'mode', 'time_signature']:
                    enc_col = f'{col}_target_enc'
                    df[enc_col] = enc_df[col].iloc[0] if col in enc_df.columns else 0.5
            except Exception:
                for col in ['key', 'mode', 'time_signature']:
                    df[f'{col}_target_enc'] = 0.5
        else:
            for col in ['key', 'mode', 'time_signature']:
                df[f'{col}_target_enc'] = 0.5

        # Categorical dummies
        for mood in ['happy_energetic', 'neutral', 'sad_calm', 'sad_energetic']:
            df[f'mood_{mood}'] = 1 if df['mood'].iloc[0] == mood else 0
        for dur_cat in ['short', 'medium', 'long']:
            df[f'duration_category_{dur_cat}'] = 0
        dur_min = df['duration_min'].iloc[0]
        if dur_min < 2:
            df['duration_category_short'] = 1
        elif dur_min < 4:
            df['duration_category_medium'] = 1
        else:
            df['duration_category_long'] = 1
        for tempo_cat in ['moderate', 'fast', 'very_fast']:
            df[f'tempo_category_{tempo_cat}'] = 0
        tempo = df['tempo'].iloc[0]
        if tempo < 90:
            pass
        elif tempo < 120:
            df['tempo_category_moderate'] = 1
        elif tempo < 150:
            df['tempo_category_fast'] = 1
        else:
            df['tempo_category_very_fast'] = 1
        for pop_cat in ['medium', 'high', 'viral']:
            df[f'popularity_bucket_{pop_cat}'] = 0
        pop = df['popularity'].iloc[0] if 'popularity' in df.columns else 50
        if 30 < pop <= 50:
            df['popularity_bucket_medium'] = 1
        elif 50 < pop <= 70:
            df['popularity_bucket_high'] = 1
        elif pop > 70:
            df['popularity_bucket_viral'] = 1

        # Polynomial
        if 'loudness_normalized' in df.columns:
            df['poly_danceability_x_energy'] = df['danceability'] * df['energy']
            df['poly_danceability_x_valence'] = df['danceability'] * df['valence']
            df['poly_danceability_x_loudness_normalized'] = df['danceability'] * df['loudness_normalized']
            df['poly_energy_x_valence'] = df['energy'] * df['valence']
            df['poly_energy_x_loudness_normalized'] = df['energy'] * df['loudness_normalized']
            df['poly_valence_x_loudness_normalized'] = df['valence'] * df['loudness_normalized']

        # Select features in correct order
        X = df[[c for c in self.feature_cols if c in df.columns]]
        for c in self.feature_cols:
            if c not in X.columns:
                X[c] = 0
        X = X[self.feature_cols]
        return X.fillna(0).values

    def predict(self, raw_song: dict) -> dict:
        """Predict virality percentage (0-100) and probability from raw song data using Stacking Classifier."""
        df = self._raw_to_dataframe(raw_song)
        X = self._transform_single(df)
        X_scaled = self.scaler.transform(X)
        
        # Stacking Ensemble: model predicts probability of being viral (class 1)
        proba = self.model.predict_proba(X_scaled)[0]
        prob = float(proba[1]) if len(proba) > 1 else float(proba[0])
        
        pct = prob * 100
        is_viral = bool(self.model.predict(X_scaled)[0])
        
        return {
            'virality_percentage': round(pct, 1),
            'is_viral': bool(is_viral),
            'virality_probability': round(prob, 4),
            'confidence': 'high' if (pct < 30 or pct > 70) else 'medium' if (pct < 45 or pct > 55) else 'low'
        }


# Singleton predictor instance
_predictor = None


def get_predictor(models_dir='models'):
    global _predictor
    if _predictor is None:
        base = Path(__file__).resolve().parent.parent
        _predictor = ViralityPredictor(base / models_dir)
    return _predictor
