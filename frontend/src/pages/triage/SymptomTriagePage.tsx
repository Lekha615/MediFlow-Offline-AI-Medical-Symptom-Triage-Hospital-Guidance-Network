
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Brain,
  Wind,
  Thermometer,
  Zap,
  RotateCcw,
  CheckSquare,
  Square,
  HelpCircle,
  Info,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { triageApi } from "../../api/triageApi";
import { getApiErrorMessage } from "../../api/client";

interface SymptomCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  department: string;
  symptoms: string[];
}

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: "cardio",
    name: "Chest & Heart",
    icon: <HeartPulse className="w-5 h-5 text-rose-500" />,
    department: "Cardiology",
    symptoms: [
      "Chest pressure or pain",
      "Irregular or rapid heartbeat",
      "Shortness of breath with exertion",
      "Dizziness or fainting spells",
      "Swelling in feet or legs",
    ],
  },
  {
    id: "resp",
    name: "Breathing & Respiratory",
    icon: <Wind className="w-5 h-5 text-sky-500" />,
    department: "Pulmonology",
    symptoms: [
      "Persistent cough (> 3 days)",
      "Wheezing or noisy breathing",
      "Shortness of breath at rest",
      "Coughing up mucus or blood",
      "Sore throat with fever",
    ],
  },
  {
    id: "neuro",
    name: "Brain & Nervous System",
    icon: <Brain className="w-5 h-5 text-purple-500" />,
    department: "Neurology",
    symptoms: [
      "Severe or sudden headache",
      "Numbness or tingling in limbs",
      "Vision changes or double vision",
      "Loss of balance or dizziness",
      "Memory confusion or disorientation",
    ],
  },
  {
    id: "general",
    name: "Fever & General Body",
    icon: <Thermometer className="w-5 h-5 text-amber-500" />,
    department: "General Medicine",
    symptoms: [
      "High body temperature (> 101°F / 38.3°C)",
      "Unexplained fatigue or weakness",
      "Body chills and cold sweats",
      "Severe muscle or joint pain",
      "Sudden weight loss or appetite loss",
    ],
  },
  {
    id: "gastro",
    name: "Digestive & Abdomen",
    icon: <Zap className="w-5 h-5 text-teal-500" />,
    department: "Gastroenterology",
    symptoms: [
      "Severe abdominal pain or cramping",
      "Persistent nausea or vomiting",
      "Heartburn or acid reflux",
      "Bloody or black stools",
      "Inability to keep liquids down",
    ],
  },
];

type UrgencyLevel = "EMERGENCY" | "URGENT" | "NON_URGENT";

interface TriageResult {
  urgency: UrgencyLevel;
  title: string;
  description: string;
  recommendedDepartment: string;
  recommendedTimeframe: string;
  actionAdvice: string[];
}

const MODEL_SYMPTOM_MAP: Record<string, string> = {
  "Chest pressure or pain": "chest tightness",
  "Irregular or rapid heartbeat": "palpitations",
  "Shortness of breath with exertion": "shortness of breath on exertion",
  "Dizziness or fainting spells": "dizziness",
  "Persistent cough (> 3 days)": "cough",
  "Wheezing or noisy breathing": "wheezing",
  "Shortness of breath at rest": "shortness of breath",
  "Sore throat with fever": "sore throat",
  "Severe or sudden headache": "headache",
  "Loss of balance or dizziness": "dizziness",
  "High body temperature (> 101°F / 38.3°C)": "fever",
  "Unexplained fatigue or weakness": "fatigue",
  "Body chills and cold sweats": "chills",
  "Severe muscle or joint pain": "body aches",
  "Sudden weight loss or appetite loss": "loss of appetite",
  "Severe abdominal pain or cramping": "abdominal cramps",
  "Persistent nausea or vomiting": "nausea",
  "Heartburn or acid reflux": "heartburn",
};

export const SymptomTriagePage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("cardio");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState("LessThan24h");
  const [severity, setSeverity] = useState(3);
  const [hasRedFlags, setHasRedFlags] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const activeCat =
    SYMPTOM_CATEGORIES.find((category) => category.id === selectedCategory) ??
    SYMPTOM_CATEGORIES[0];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((previous) =>
      previous.includes(symptom)
        ? previous.filter((item) => item !== symptom)
        : [...previous, symptom]
    );
    setEvaluationError(null);
  };

  const handleEvaluate = async () => {
    setEvaluationError(null);

    // Emergency warning takes priority over a model prediction.
    if (hasRedFlags) {
      setResult({
        urgency: "EMERGENCY",
        title: "Immediate Emergency Care Required",
        description:
          "A critical warning indicator has been reported. Seek emergency medical care immediately. Do not wait for an AI assessment.",
        recommendedDepartment: "Emergency Medicine / Trauma Care",
        recommendedTimeframe: "Immediate emergency care",
        actionAdvice: [
          "Contact local emergency services or go to the nearest emergency department.",
          "Do not rely on this demo model to assess an emergency.",
          "Ask someone to assist you if you need help reaching medical care.",
        ],
      });
      return;
    }

    if (selectedSymptoms.length === 0) {
      setEvaluationError("Please select at least one symptom.");
      return;
    }

    const mappedSymptoms = [
      ...new Set(
        selectedSymptoms
          .map((symptom) => MODEL_SYMPTOM_MAP[symptom])
          .filter((symptom): symptom is string => Boolean(symptom))
      ),
    ];

    if (mappedSymptoms.length === 0) {
      setEvaluationError(
        "The selected symptoms are not supported by this demo model. Please consult a healthcare professional."
      );
      return;
    }

    setIsEvaluating(true);

    try {
      const response = await triageApi.evaluate({
        symptoms: mappedSymptoms,
        severity,
        has_red_flags: false,
      });

      const prediction = response.data;

      const urgency: UrgencyLevel =
        prediction.urgency === "CRITICAL"
          ? "EMERGENCY"
          : prediction.urgency === "HIGH"
            ? "URGENT"
            : "NON_URGENT";

      setResult({
        urgency,
        title:
          urgency === "EMERGENCY"
            ? "Emergency Assessment Recommended"
            : urgency === "URGENT"
              ? "Prompt Medical Assessment Recommended"
              : "ML-Assisted Symptom Assessment",
        description:
          `Demo model estimate: ${prediction.disease}. ` +
          "This synthetic-data model has not been clinically validated and cannot diagnose a medical condition.",
        recommendedDepartment: prediction.specialist,
        recommendedTimeframe:
          urgency === "EMERGENCY"
            ? "Seek emergency medical care immediately"
            : urgency === "URGENT"
              ? "Seek prompt medical assessment"
              : "Consult a healthcare professional for appropriate assessment",
        actionAdvice: [
          `Model confidence score: ${prediction.confidence}%. This is not a calibrated probability that you have the condition.`,
          "The model was trained using synthetic demo data and is not validated for clinical decisions.",
          "Consult a qualified healthcare professional for diagnosis and treatment.",
          "If symptoms become severe or you develop emergency warning signs, seek urgent medical care.",
        ],
      });
    } catch (error) {
      setEvaluationError(getApiErrorMessage(error));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setSeverity(3);
    setHasRedFlags(false);
    setResult(null);
    setEvaluationError(null);
    setDuration("LessThan24h");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              ML-Assisted Triage Demo
            </span>
          </div>
          <h1 className="text-2xl font-black">
            AI Patient Symptom Assessment
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Review your symptoms and receive a demo model estimate and
            specialist guidance. This is not a medical diagnosis.
          </p>
        </div>

        <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-xl max-w-xs text-xs text-amber-200">
          <p className="font-bold flex items-center gap-1.5 mb-0.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Medical Disclaimer</span>
          </p>
          The model uses synthetic data and is not clinically validated.
          Do not use its output to make medical decisions.
        </div>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Select Affected System
            </h3>

            <div className="space-y-2">
              {SYMPTOM_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedCategory === category.id
                      ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 shadow-sm font-semibold"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {category.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{category.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {category.department}
                      </p>
                    </div>
                  </div>
                  {selectedCategory === category.id && (
                    <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-teal-400">
                <HelpCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Department Assistant
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Selected system:{" "}
                <strong className="text-teal-300">{activeCat.name}</strong>.
                The model may recommend a different specialist based on its
                predicted label.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>Demo Model Notice</span>
                </p>
                <p>
                  Predictions are generated by a model trained on synthetic
                  data. They are not clinically validated.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Check All Symptoms That Apply
                </h3>
                {selectedSymptoms.length > 0 && (
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
                    {selectedSymptoms.length} Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Category:{" "}
                <span className="font-bold text-teal-600">
                  {activeCat.name}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeCat.symptoms.map((symptom) => {
                const checked = selectedSymptoms.includes(symptom);
                const supported = Boolean(MODEL_SYMPTOM_MAP[symptom]);

                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      checked
                        ? "bg-teal-50 dark:bg-teal-950/80 border-teal-500 ring-2 ring-teal-500/30 text-teal-950 dark:text-teal-100 font-bold shadow-md"
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {checked ? (
                        <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <span className="text-xs leading-snug">
                      {symptom}
                      {!supported && (
                        <span className="block text-[10px] font-normal text-amber-600 mt-1">
                          Not mapped to demo model
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Symptom Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "< 24 Hours", value: "LessThan24h" },
                    { label: "1 to 3 Days", value: "1to3Days" },
                    { label: "> 3 Days", value: "MoreThan3Days" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDuration(item.value)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        duration === item.value
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Duration is collected for the interface; the current model
                  API does not use it.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Discomfort / Pain Severity (1–10)
                  </label>
                  <span className="text-sm font-black text-teal-600">
                    {severity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(event) => setSeverity(Number(event.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setHasRedFlags((previous) => !previous);
                  setEvaluationError(null);
                }}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  hasRedFlags
                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300"
                    : "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:border-rose-500/40"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {hasRedFlags ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold">
                    Critical Red Flag Indicators Present
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Select if you have sudden confusion, severe fainting,
                    uncontrolled bleeding, or acute crushing chest pain.
                  </p>
                </div>
              </button>

              {evaluationError && (
                <p role="alert" className="text-sm text-rose-600">
                  {evaluationError}
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-2"
                onClick={handleEvaluate}
                disabled={
                  isEvaluating ||
                  (selectedSymptoms.length === 0 && !hasRedFlags)
                }
              >
                {isEvaluating
                  ? "Analyzing..."
                  : "Analyze Symptoms & Get Guidance"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {result.urgency === "EMERGENCY" && (
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                )}
                {result.urgency === "URGENT" && (
                  <Clock className="w-5 h-5 text-amber-500" />
                )}
                {result.urgency === "NON_URGENT" && (
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Triage Result
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {result.title}
              </h2>
            </div>

            <div className="self-start sm:self-center">
              {result.urgency === "EMERGENCY" && (
                <Badge variant="skipped" className="text-sm px-4 py-1.5 font-bold uppercase">
                  EMERGENCY CARE
                </Badge>
              )}
              {result.urgency === "URGENT" && (
                <Badge variant="suspended" className="text-sm px-4 py-1.5 font-bold uppercase">
                  URGENT CARE
                </Badge>
              )}
              {result.urgency === "NON_URGENT" && (
                <Badge variant="active" className="text-sm px-4 py-1.5 font-bold uppercase">
                  DEMO ASSESSMENT
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            {result.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recommended Specialist
              </span>
              <p className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5">
                {result.recommendedDepartment}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Suggested Next Step
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {result.recommendedTimeframe}
              </p>
            </div>
          </div>

          {selectedSymptoms.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Selected Symptoms ({selectedSymptoms.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSymptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-semibold"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Guidance & Limitations
            </h4>
            <div className="space-y-2">
              {result.actionAdvice.map((advice, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-teal-50/40 dark:bg-teal-950/20 rounded-xl"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {advice}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleReset}
            >
              Re-evaluate Symptoms
            </Button>

            <Button
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() =>
                navigate(
                  `/guidance?department=${encodeURIComponent(
                    result.recommendedDepartment
                  )}`
                )
              }
            >
              Find Hospitals offering {result.recommendedDepartment}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomTriagePage;
