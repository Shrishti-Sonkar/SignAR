import base64
import os
from io import BytesIO

import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from gtts import gTTS
from model_utils import predict, load_assets
from temporal_utils import is_temporal_available, predict_sequence

load_dotenv()  # read backend/.env — keys never reach the browser

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

app = Flask(__name__)
CORS(app)  # allow requests from React frontend

load_assets()


@app.route("/predict", methods=["POST"])
def predict_route():
    if "frame" not in request.files:
        return jsonify({"error": "No frame provided"}), 400

    img_bytes = request.files["frame"].read()
    label, conf = predict(img_bytes)

    print("Predicted:", label, "Confidence:", conf)

    return jsonify({
        "prediction": label,
        "confidence": conf,
    })


@app.route("/predict-sequence", methods=["POST"])
def predict_sequence_route():
    """Temporal prediction over a burst of frames (one sign attempt).

    Expects multipart form data with repeated 'frames' files (JPEGs in
    chronological order). Uses the LSTM keypoint model when trained;
    otherwise falls back to majority-voting the per-frame CNN.
    """
    frames = request.files.getlist("frames")
    if not frames:
        return jsonify({"error": "No frames provided"}), 400

    frames_bytes = [f.read() for f in frames]

    if is_temporal_available():
        label, conf = predict_sequence(frames_bytes)
        model_used = "temporal"
    else:
        # Fallback: run CNN per frame, majority-vote the confident ones
        votes = {}
        for b in frames_bytes:
            lbl, c = predict(b)
            if c >= 0.5:
                votes[lbl] = votes.get(lbl, 0) + c
        if not votes:
            return jsonify({"prediction": None, "confidence": 0.0, "model": "cnn-fallback"})
        label = max(votes, key=votes.get)
        conf = votes[label] / len(frames_bytes)
        model_used = "cnn-fallback"

    print(f"Sequence predicted [{model_used}]:", label, "Confidence:", conf)
    return jsonify({"prediction": label, "confidence": conf, "model": model_used})


@app.route("/health", methods=["GET"])
def health_route():
    return jsonify({"status": "ok", "temporal_model": is_temporal_available()})


@app.route("/speak", methods=["POST"])
def speak_route():
    """Generate TTS audio for a confirmed (smoothed) prediction."""
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400

    tts = gTTS(text=text, lang="en")
    buf = BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    audio_b64 = base64.b64encode(buf.read()).decode("utf-8")
    return jsonify({"audio": audio_b64})


# ---------- AI proxy endpoints (keys stay server-side) ----------

@app.route("/api/glosses", methods=["POST"])
def glosses_route():
    """Text → ISL glosses via Groq."""
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not GROQ_API_KEY:
        return jsonify({"error": "GROQ_API_KEY not configured"}), 503

    try:
        r = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an expert in Indian Sign Language (ISL). "
                            "Convert the given English text into ISL glosses. "
                            "Rules: uppercase words, remove articles, simplify grammar "
                            "to basic word order, present tense. "
                            "Return only the glosses separated by spaces."
                        ),
                    },
                    {"role": "user", "content": text},
                ],
                "temperature": 0.3,
                "max_tokens": 150,
            },
            timeout=30,
        )
        r.raise_for_status()
        gloss_string = r.json()["choices"][0]["message"]["content"] or ""
        return jsonify({"glosses": [w for w in gloss_string.split() if w]})
    except Exception as e:
        print("Groq proxy error:", e)
        return jsonify({"error": "Gloss translation failed"}), 502


@app.route("/api/glosses-to-text", methods=["POST"])
def glosses_to_text_route():
    """ISL glosses → natural English via OpenAI."""
    data = request.get_json(silent=True) or {}
    glosses = data.get("glosses") or []
    if not glosses:
        return jsonify({"error": "No glosses provided"}), 400
    if not OPENAI_API_KEY:
        return jsonify({"error": "OPENAI_API_KEY not configured"}), 503

    try:
        r = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "Convert ISL glosses back to natural English. Add proper "
                            "grammar, articles, and natural flow while maintaining "
                            "the original meaning."
                        ),
                    },
                    {"role": "user", "content": " ".join(glosses)},
                ],
                "temperature": 0.4,
                "max_tokens": 200,
            },
            timeout=30,
        )
        r.raise_for_status()
        text = r.json()["choices"][0]["message"]["content"] or " ".join(glosses)
        return jsonify({"text": text})
    except Exception as e:
        print("OpenAI proxy error:", e)
        return jsonify({"error": "Gloss-to-text failed"}), 502


@app.route("/api/search", methods=["POST"])
def search_route():
    """Educational content search via Tavily."""
    data = request.get_json(silent=True) or {}
    query = (data.get("query") or "").strip()
    if not query:
        return jsonify({"error": "No query provided"}), 400
    if not TAVILY_API_KEY:
        return jsonify({"error": "TAVILY_API_KEY not configured"}), 503

    try:
        r = requests.post(
            "https://api.tavily.com/search",
            headers={"Authorization": f"Bearer {TAVILY_API_KEY}"},
            json={
                "query": f"{query} sign language ISL Indian",
                "search_depth": "basic",
                "include_answer": True,
                "max_results": 5,
            },
            timeout=30,
        )
        r.raise_for_status()
        return jsonify({"results": r.json().get("results", [])})
    except Exception as e:
        print("Tavily proxy error:", e)
        return jsonify({"error": "Search failed"}), 502


@app.route("/api/youtube", methods=["POST"])
def youtube_route():
    """YouTube video search."""
    data = request.get_json(silent=True) or {}
    query = (data.get("query") or "").strip()
    if not query:
        return jsonify({"error": "No query provided"}), 400
    if not YOUTUBE_API_KEY:
        return jsonify({"error": "YOUTUBE_API_KEY not configured"}), 503

    try:
        r = requests.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={
                "part": "snippet",
                "q": f"{query} Indian Sign Language ISL",
                "type": "video",
                "maxResults": 10,
                "key": YOUTUBE_API_KEY,
            },
            timeout=30,
        )
        r.raise_for_status()
        items = r.json().get("items", [])
        videos = [
            {
                "id": it["id"]["videoId"],
                "title": it["snippet"]["title"],
                "description": it["snippet"]["description"],
                "thumbnail": it["snippet"]["thumbnails"]["medium"]["url"],
                "url": f"https://www.youtube.com/watch?v={it['id']['videoId']}",
            }
            for it in items
        ]
        return jsonify({"videos": videos})
    except Exception as e:
        print("YouTube proxy error:", e)
        return jsonify({"error": "YouTube search failed"}), 502


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
