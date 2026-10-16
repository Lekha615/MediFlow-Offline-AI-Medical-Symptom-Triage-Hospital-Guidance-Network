from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np

app = FastAPI(title="MediFlow Clinical Triage Server")

# Load trained bundle
bundle = joblib.load("mediflow_triage_engine.pkl")
model = bundle["model"]
symptom_catalog = bundle["symptoms"]
specialist_map = bundle["specialist_map"]

class TriageRequest(BaseModel):
    symptoms: List[str]
    severity: int = 5
    has_red_flags: bool = False

@app.get("/symptoms")
def get_available_symptoms():
    return {"symptoms": symptom_catalog}

@app.post("/triage")
def predict_triage(req: TriageRequest):
    # Emergency Red Flag Override
    if req.has_red_flags:
        return {
            "disease": "Acute Emergency Indicator Detected",
            "specialist": "Emergency Medicine / Trauma Care",
            "urgency": "CRITICAL",
            "confidence": 100.0,
            "triage_summary": "Patient reported acute red-flag indicators. Proceed directly to Emergency triage."
        }

    # Normalize incoming strings: convert both spaces and underscores uniformly
    normalized_input = {
        s.strip().lower().replace("_", " ") for s in req.symptoms
    } | {
        s.strip().lower().replace(" ", "_") for s in req.symptoms
    }

    # Build binary feature vector against model catalog
    vector = [
        1 if (sym in normalized_input or sym.replace("_", " ") in normalized_input or sym.replace(" ", "_") in normalized_input) else 0 
        for sym in symptom_catalog
    ]

    if sum(vector) == 0:
        raise HTTPException(
            status_code=400, 
            detail=f"No recognized symptoms were provided. Check /symptoms for the valid list. Received: {req.symptoms}"
        )

    # Model inference
    probabilities = model.predict_proba([vector])[0]
    best_idx = np.argmax(probabilities)
    predicted_disease = model.classes_[best_idx]
    confidence = float(probabilities[best_idx])

    # Specialist lookup
    cleaned_key = str(predicted_disease).strip().lower()
    recommended_doctor = specialist_map.get(cleaned_key, "General Physician")

    # Determine urgency
    if req.severity >= 8:
        urgency = "HIGH"
    elif req.severity >= 4:
        urgency = "MODERATE"
    else:
        urgency = "LOW"

    return {
        "disease": predicted_disease,
        "specialist": recommended_doctor,
        "urgency": urgency,
        "confidence": round(confidence * 100, 2),
        "triage_summary": f"Symptom profile matches {predicted_disease}. Recommended consult: {recommended_doctor}."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)