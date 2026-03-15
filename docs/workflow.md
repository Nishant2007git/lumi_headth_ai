# Core Workflows

## 1. Symptom Checker

1. User types their symptoms (can be plain text or comma-separated) and hits Analyze.
2. The frontend splits the input into an array and posts it to `POST /api/v1/symptoms/predict`.
3. FastAPI validates the request using the `SymptomPredictionRequest` Pydantic model.
4. `symptom_service.py` hands it off to the PyTorch MLP model in `ai_services/symptom_analyzer/inference.py`, which runs a forward pass and gives back disease probabilities.
5. The highest confidence match and a recommendation gets sent back, and the UI shows it in a color-coded result card.

---

## 2. Lab Report Analyzer

1. User drags and drops a PDF report onto the page.
2. The frontend wraps the file in a `FormData` object and posts it to the backend.
3. FastAPI reads it as an `UploadFile` stream and forwards the content to the report AI service.
4. `report_analyzer/summarizer.py` does a few things in sequence:
   - Extracts text using Tesseract OCR
   - Feeds it into a clinical BERT transformer
   - Spits out three things: a plain-English summary, the key findings, and actionable next steps
5. *(Phase 3 — not live yet)* The PDF gets stored in S3 and the metadata goes into MongoDB's `Reports` collection.
6. The frontend loops over `keyFindings` and renders them as a list.

---

## 3. Mental Health Chat

1. User types something like "I've been feeling really stressed about work lately."
2. The UI immediately shows the message and a typing indicator (optimistic update — no waiting for the server).
3. The message hits the NLP Mental Health Agent in `ai_services/mental_health_bot/nlp_agent.py`.
   - It first checks for crisis keywords — if it finds any, it stops and returns emergency hotline info right away instead of generating a normal reply.
   - If nothing critical is found, it generates an empathetic response.
4. The reply shows up in the chat UI.
