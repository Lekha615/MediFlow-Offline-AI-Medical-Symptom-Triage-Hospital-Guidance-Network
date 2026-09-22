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

export const SymptomTriagePage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>("cardio");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("LessThan24h");
  const [severity, setSeverity] = useState<number>(3);
  const [hasRedFlags, setHasRedFlags] = useState<boolean>(false);

  const [result, setResult] = useState<TriageResult | null>(null);

  const activeCat = SYMPTOM_CATEGORIES.find((c) => c.id === selectedCategory) || SYMPTOM_CATEGORIES[0];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleEvaluate = () => {
    let urgency: UrgencyLevel = "NON_URGENT";

    const isEmergencyCategory = selectedCategory === "cardio" || selectedCategory === "resp" || selectedCategory === "neuro";
    const hasEmergencySymptom =
      selectedSymptoms.some(
        (s) =>
          s.includes("Chest pressure") ||
          s.includes("Shortness of breath at rest") ||
          s.includes("Coughing up blood") ||
          s.includes("Loss of balance") ||
          s.includes("Bloody or black stools")
      ) || hasRedFlags;

    if (hasEmergencySymptom || (severity >= 8 && isEmergencyCategory)) {
      urgency = "EMERGENCY";
    } else if (severity >= 6 || selectedSymptoms.length >= 3 || hasRedFlags) {
      urgency = "URGENT";
    }

    let res: TriageResult;

    if (urgency === "EMERGENCY") {
      res = {
        urgency: "EMERGENCY",
        title: "Immediate Emergency Care Required",
        description:
          "Your reported symptoms indicate a potential acute medical emergency requiring immediate medical attention.",
        recommendedDepartment: activeCat.department,
        recommendedTimeframe: "Immediate (Go to Emergency Room / Call Emergency Services)",
        actionAdvice: [
          "Do not drive yourself. Have someone drive you or call emergency medical services.",
          "Rest in a comfortable, seated position while waiting.",
          "Keep your identification and health records easily accessible.",
          "Notify hospital staff immediately upon arrival about your acute symptoms.",
        ],
      };
    } else if (urgency === "URGENT") {
      res = {
        urgency: "URGENT",
        title: "Prompt Specialist Assessment Recommended",
        description:
          "Your symptoms require evaluation by a physician within the next 12 to 24 hours to prevent complications.",
        recommendedDepartment: activeCat.department,
        recommendedTimeframe: "Within 12 to 24 Hours",
        actionAdvice: [
          "Book an urgent appointment or visit an outpatient clinic today.",
          "Avoid strenuous physical exertion until cleared by a doctor.",
          "Monitor body temperature and symptom intensity closely.",
          "If symptoms worsen rapidly, proceed to the nearest Emergency Room.",
        ],
      };
    } else {
      res = {
        urgency: "NON_URGENT",
        title: "Routine Medical Consultation",
        description:
          "Your symptoms appear stable. A routine medical appointment is recommended for diagnosis and treatment.",
        recommendedDepartment: activeCat.department,
        recommendedTimeframe: "Within 2 to 5 Days",
        actionAdvice: [
          "Schedule a standard appointment with a specialist or general physician.",
          "Maintain good hydration and adequate sleep.",
          "Track any changes in symptom severity over the coming days.",
        ],
      };
    }

    setResult(res);
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setSeverity(3);
    setHasRedFlags(false);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Clinical Triage Engine</span>
          </div>
          <h1 className="text-2xl font-black">AI Patient Symptom Assessment</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Evaluate your current symptoms to determine recommended care urgency, department routing, and hospital guidance.
          </p>
        </div>

        <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-xl max-w-xs text-xs text-amber-200">
          <p className="font-bold flex items-center gap-1.5 mb-0.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Medical Disclaimer</span>
          </p>
          This triage guidance is an initial assessment and does not constitute a formal medical diagnosis.
        </div>
      </div>

      {/* Main Form or Results */}
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Category Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Select Affected System
            </h3>

            <div className="space-y-2">
              {SYMPTOM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedCategory === cat.id
                      ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 shadow-sm font-semibold"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{cat.name}</p>
                      <p className="text-[11px] text-slate-500">{cat.department}</p>
                    </div>
                  </div>
                  {selectedCategory === cat.id && (
                    <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Side Department Assistant Helper */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-teal-400">
                <HelpCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Department Assistant</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Need help deciding? For <strong className="text-teal-300">{activeCat.name}</strong>, symptoms are routed to{" "}
                <strong className="text-teal-300">{activeCat.department}</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>Clinical Engine Notice</span>
                </p>
                <p>
                  Deterministic clinical rule matrix active. Backend LLM AI service endpoint (`/api/triage`) is not present on backend server.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Specific Symptoms & Details */}
          <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Check All Symptoms That Apply
                </h3>
                {selectedSymptoms.length > 0 && (
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
                    ✓ {selectedSymptoms.length} Selected Total
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Category: <span className="font-bold text-teal-600">{activeCat.name}</span> (Click symptoms to toggle checkbox)
              </p>
            </div>

            {/* Visibly Rendered Checkbox Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeCat.symptoms.map((symptom) => {
                const isChecked = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isChecked
                        ? "bg-teal-50 dark:bg-teal-950/80 border-teal-500 ring-2 ring-teal-500/30 text-teal-950 dark:text-teal-100 font-bold shadow-md"
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400 fill-teal-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <span className="text-xs leading-snug">{symptom}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Duration */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Symptom Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "< 24 Hours", val: "LessThan24h" },
                    { label: "1 to 3 Days", val: "1to3Days" },
                    { label: "> 3 Days", val: "MoreThan3Days" },
                  ].map((dur) => (
                    <button
                      key={dur.val}
                      type="button"
                      onClick={() => setDuration(dur.val)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        duration === dur.val
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Discomfort / Pain Severity (1 - 10)
                  </label>
                  <span className="text-sm font-black text-teal-600">{severity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Red Flags Checkbox */}
              <button
                type="button"
                onClick={() => setHasRedFlags(!hasRedFlags)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  hasRedFlags
                    ? "bg-rose-500/15 border-rose-500 text-rose-300 shadow-xs"
                    : "bg-rose-500/5 border-rose-500/20 text-rose-400 hover:border-rose-500/40"
                }`}
              >
                <div className="mt-0.5 shrink-0 text-rose-500">
                  {hasRedFlags ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    Critical Red Flag Indicators Present
                  </p>
                  <p className="text-[11px] text-rose-600/80 dark:text-rose-400 mt-0.5">
                    Check this if experiencing sudden confusion, severe fainting, uncontrolled bleeding, or acute crushing chest pain.
                  </p>
                </div>
              </button>

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-2"
                onClick={handleEvaluate}
                disabled={selectedSymptoms.length === 0 && !hasRedFlags}
              >
                Analyze Symptoms & Get Guidance
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          {/* Assessment Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {result.urgency === "EMERGENCY" && <AlertTriangle className="w-5 h-5 text-rose-500" />}
                {result.urgency === "URGENT" && <Clock className="w-5 h-5 text-amber-500" />}
                {result.urgency === "NON_URGENT" && <CheckCircle className="w-5 h-5 text-teal-500" />}
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
                  ROUTINE CONSULTATION
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
                Recommended Department
              </span>
              <p className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5">
                {result.recommendedDepartment}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recommended Action Window
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {result.recommendedTimeframe}
              </p>
            </div>
          </div>

          {/* Selected Symptoms Summary */}
          {selectedSymptoms.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Evaluated Symptom Indicators ({selectedSymptoms.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSymptoms.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Advice Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Clinical Action Guidance
            </h4>
            <div className="space-y-2">
              {result.actionAdvice.map((advice, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-teal-50/40 dark:bg-teal-950/20 rounded-xl">
                  <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{advice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
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
                navigate(`/guidance?department=${encodeURIComponent(result.recommendedDepartment)}`)
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
