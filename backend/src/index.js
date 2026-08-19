require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const mlRes = await fetch(`${ML_SERVICE_URL}/health`);
    const mlOk = mlRes.ok;
    const dbRes = await pool.query('SELECT 1');
    const dbOk = !!dbRes.rows;
    res.json({
      status: 'ok',
      services: { ml: mlOk, database: dbOk },
    });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// Predict virality - calls ML service
app.post('/api/predict', async (req, res) => {
  try {
    const songData = req.body;
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json(err);
    }
    const result = await response.json();

    // Optionally save prediction to DB
    if (songData.track_id || songData.track_name) {
      try {
        await pool.query(
          `INSERT INTO predictions (track_id, track_name, artist_name, virality_probability, is_viral, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            songData.track_id || null,
            songData.track_name || songData.artist_name || 'Unknown',
            songData.artist_name || 'Unknown',
            result.virality_percentage != null ? result.virality_percentage / 100 : result.virality_probability,
            result.is_viral,
          ]
        );
      } catch (dbErr) {
        console.warn('Could not save prediction to DB:', dbErr.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get songs from database (for browse/history)
app.get('/api/songs', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await pool.query(
      `SELECT id, track_id, track_name, artist_name, virality_probability, is_viral, created_at
       FROM predictions
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    res.json({ songs: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sample songs from processed data - pass FULL raw features for accurate prediction
app.get('/api/sample-songs', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const csvPath = path.join(__dirname, '../../data/processed/features.csv');
  if (!fs.existsSync(csvPath)) {
    return res.json({ songs: [] });
  }
  const csv = fs.readFileSync(csvPath, 'utf8');
  const lines = csv.trim().split('\n');
  const header = lines[0].split(',');
  const parseNum = (v) => (v === '' || v == null ? null : parseFloat(v));
  const songs = lines.slice(1, 11).map((line) => {
    const vals = line.split(',');
    const row = {};
    header.forEach((h, i) => (row[h] = vals[i]));
    return {
      track_id: row.track_id,
      track_name: row.track_name,
      artist_name: row.artist_name,
      popularity: parseNum(row.popularity) ?? 50,
      duration_ms: parseNum(row.duration_ms) ?? 200000,
      explicit: parseInt(row.explicit, 10) || 0,
      danceability: parseNum(row.danceability) ?? 0.5,
      energy: parseNum(row.energy) ?? 0.5,
      key: parseInt(row.key, 10) || 0,
      loudness: parseNum(row.loudness) ?? -10,
      mode: parseInt(row.mode, 10) ?? 1,
      speechiness: parseNum(row.speechiness) ?? 0.05,
      acousticness: parseNum(row.acousticness) ?? 0.3,
      instrumentalness: parseNum(row.instrumentalness) ?? 0.05,
      liveness: parseNum(row.liveness) ?? 0.1,
      valence: parseNum(row.valence) ?? 0.5,
      tempo: parseNum(row.tempo) ?? 120,
      time_signature: parseInt(row.time_signature, 10) || 4,
      release_year: parseInt(row.release_year, 10) || 2024,
      release_month: parseInt(row.release_month, 10) || 1,
      release_day_of_week: parseInt(row.release_day_of_week, 10) || 0,
    };
  });
  res.json({ songs });
});

app.post('/api/train', (req, res) => {
  // Set request timeout to 10 minutes to allow pipeline to complete
  req.setTimeout(600000);
  const { num_songs } = req.body;
  const numParams = parseInt(num_songs) || 500;
  
  const { exec } = require('child_process');
  
  exec(`python ../run_pipeline.py --num-songs ${numParams}`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Training error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, stdout });
  });
});

app.get('/api/stats', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const csvPath = path.join(__dirname, '../../data/processed/features.csv');
  try {
    if (fs.existsSync(csvPath)) {
      const csv = fs.readFileSync(csvPath, 'utf8');
      const lines = csv.trim().split('\n');
      const count = Math.max(0, lines.length - 1);
      return res.json({ songsAnalyzed: count });
    }
  } catch (err) {
    console.error('Error reading stats:', err);
  }
  res.json({ songsAnalyzed: 500 });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
