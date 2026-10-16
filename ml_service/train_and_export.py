import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

DATA_FILE = "mediflow_synthetic_symptom_dataset.csv"

# Mapping each of the 10 conditions in this dataset to their clinical specialist
SPECIALIST_MAP = {
    "Acid reflux-like symptoms": "Gastroenterologist",
    "Allergic rhinitis": "Allergist / Immunologist",
    "Anemia-like symptom pattern": "Hematologist / General Physician",
    "Asthma-like respiratory symptoms": "Pulmonologist",
    "Common cold": "General Physician",
    "Dermatitis-like symptoms": "Dermatologist",
    "Gastroenteritis-like illness": "Gastroenterologist",
    "Influenza-like illness": "General Physician / Pulmonologist",
    "Migraine-like headache": "Neurologist",
    "Urinary tract symptom pattern": "Urologist / Nephrologist"
}

def train_and_export():
    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(f"Could not locate '{DATA_FILE}'. Please place it in the current folder.")

    print(f"Reading '{DATA_FILE}'...")
    df = pd.read_csv(DATA_FILE)

    # 1. Extract unique symptoms from the comma-separated Symptoms column
    all_symptoms = set()
    for entry in df['Symptoms'].dropna():
        for s in entry.split(','):
            cleaned = s.strip().lower()
            if cleaned:
                all_symptoms.add(cleaned)
    
    symptom_catalog = sorted(list(all_symptoms))
    print(f"Found {len(symptom_catalog)} unique symptoms across {df['Disease_Label'].nunique()} condition labels.")

    # 2. Build binary feature vectors (0 or 1 for each symptom)
    rows = []
    labels = []
    for _, row in df.iterrows():
        patient_symptoms = {s.strip().lower() for s in str(row['Symptoms']).split(',')}
        vector = [1 if sym in patient_symptoms else 0 for sym in symptom_catalog]
        rows.append(vector)
        labels.append(str(row['Disease_Label']).strip())

    X = pd.DataFrame(rows, columns=symptom_catalog)
    y = pd.Series(labels)

    # 3. Train/Test split & train Random Forest
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42)
    model.fit(X_train, y_train)

    # 4. Evaluate performance
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nModel Retraining Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred))

    # 5. Export artifact bundle for FastAPI
    bundle = {
        "model": model,
        "symptoms": symptom_catalog,
        "specialist_map": {k.strip().lower(): v for k, v in SPECIALIST_MAP.items()}
    }
    joblib.dump(bundle, "mediflow_triage_engine.pkl")
    print("Saved 'mediflow_triage_engine.pkl' successfully.")

if __name__ == "__main__":
    train_and_export()