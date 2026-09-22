import { RoleName } from "../types/auth";

export interface AssistantQueryContext {
  routePath: string;
  role: RoleName | null;
  selectedSymptoms?: string[];
}

export interface AssistantResponse {
  reply: string;
  suggestedActions?: Array<{ label: string; path?: string }>;
  isEmergencyWarning?: boolean;
  recommendedDepartment?: string;
}

const DEPARTMENT_MAP: Array<{ keywords: string[]; department: string; guidance: string }> = [
  {
    keywords: ["heart", "chest", "palpitation", "cardio", "cardiac", "pulse"],
    department: "Cardiology",
    guidance: "Symptoms related to chest pressure, heart rate irregularities, or exertion shortness of breath are best evaluated by Cardiology.",
  },
  {
    keywords: ["breath", "cough", "lung", "wheeze", "respiratory", "phlegm", "asthma"],
    department: "Pulmonology",
    guidance: "Persistent cough, wheezing, or breathing difficulties are typically assessed in the Pulmonology department.",
  },
  {
    keywords: ["headache", "dizziness", "brain", "numbness", "tingling", "seizure", "stroke", "memory"],
    department: "Neurology",
    guidance: "Severe headaches, loss of balance, or neurological symptoms should be evaluated by a Neurology specialist.",
  },
  {
    keywords: ["fever", "fatigue", "chill", "weakness", "body pain", "cold", "flu", "faint"],
    department: "General Medicine",
    guidance: "General fever, body aches, fatigue, or common medical ailments are ideally addressed by General Medicine.",
  },
  {
    keywords: ["stomach", "abdomen", "acid", "nausea", "vomit", "gut", "bowel", "diarrhea", "cramp"],
    department: "Gastroenterology",
    guidance: "Digestive discomfort, severe abdominal cramping, or gastrointestinal issues are managed by Gastroenterology.",
  },
  {
    keywords: ["bone", "joint", "fracture", "knee", "spine", "back pain", "ortho"],
    department: "Orthopedics",
    guidance: "Joint pain, bone injuries, or musculoskeletal concerns are handled by the Orthopedics department.",
  },
  {
    keywords: ["child", "infant", "baby", "pediatric", "kid"],
    department: "Pediatrics",
    guidance: "Medical care for children and young adolescents is provided by Pediatric specialists.",
  },
  {
    keywords: ["emergency", "severe bleeding", "unconscious", "crushing", "faint", "collapse"],
    department: "Emergency Care",
    guidance: "Critical red-flag indicators require immediate Emergency Care (ER) or dialing emergency services.",
  },
];

export const assistantApi = {
  queryAssistant: async (
    userMessage: string,
    context: AssistantQueryContext
  ): Promise<AssistantResponse> => {
    // Simulate slight processing delay for natural feel
    await new Promise((resolve) => setTimeout(resolve, 400));

    const lowerMsg = userMessage.toLowerCase().trim();

    // Check for emergency / red flag keywords
    const isEmergency =
      lowerMsg.includes("emergency") ||
      lowerMsg.includes("crushing chest") ||
      lowerMsg.includes("unconscious") ||
      lowerMsg.includes("cannot breathe") ||
      lowerMsg.includes("severe bleeding");

    if (isEmergency) {
      return {
        reply:
          "⚠️ CRITICAL EMERGENCY WARNING: The symptoms or situation you described may require immediate medical intervention. Please do not wait. Call emergency services (108 / ER) or go to the nearest hospital Emergency Department immediately.",
        isEmergencyWarning: true,
        recommendedDepartment: "Emergency Care",
        suggestedActions: [
          { label: "Find Emergency Hospitals", path: "/guidance?department=Emergency%20Care" },
        ],
      };
    }

    // Role-specific customized responses
    if (context.role && context.role !== "PATIENT") {
      if (lowerMsg.includes("queue") || lowerMsg.includes("token") || lowerMsg.includes("call")) {
        return {
          reply:
            `As a ${context.role.replace("_", " ")}, you can manage live patient queue statuses, call the next patient, or check in walk-ins directly from your Live Queue dashboard module.`,
          suggestedActions: [{ label: "Manage Live Queue", path: "/queue" }],
        };
      }
      if (lowerMsg.includes("doctor") || lowerMsg.includes("staff") || lowerMsg.includes("hospital")) {
        return {
          reply:
            `Authorized administrators and staff can onboard doctors, configure availability, and manage facility details through the Hospitals and Doctors directories.`,
          suggestedActions: [{ label: "View Directory", path: "/doctors" }],
        };
      }
      return {
        reply:
          `Hello! As a registered ${context.role.replace("_", " ")}, I am here to assist with platform navigation, patient queue operations, and clinical directory tasks.`,
        suggestedActions: [{ label: "Go to Dashboard", path: "/dashboard" }],
      };
    }

    // Patient Department Keyword Search
    for (const entry of DEPARTMENT_MAP) {
      if (entry.keywords.some((kw) => lowerMsg.includes(kw))) {
        return {
          reply: `Based on your query, **${entry.department}** is generally appropriate. ${entry.guidance} You can also use our clinical symptom assessment engine for detailed recommendations.`,
          recommendedDepartment: entry.department,
          suggestedActions: [
            { label: `Find ${entry.department} Hospitals`, path: `/guidance?department=${encodeURIComponent(entry.department)}` },
            { label: "Start Symptom Assessment", path: "/triage" },
          ],
        };
      }
    }

    // Context-specific default fallbacks
    if (context.routePath.includes("triage")) {
      return {
        reply:
          "You are currently in the **AI Symptom Assessment** module. Select your primary affected system, check all symptoms that apply, set severity (1-10), and click 'Analyze Symptoms' for recommended care windows.",
        suggestedActions: [{ label: "View Guidance", path: "/guidance" }],
      };
    }

    if (context.routePath.includes("queue")) {
      return {
        reply:
          "Your live queue card auto-updates every 10 seconds. It shows your assigned token number, current doctor status, and estimated wait time.",
        suggestedActions: [{ label: "My Appointments", path: "/appointments" }],
      };
    }

    if (context.routePath.includes("guidance")) {
      return {
        reply:
          "Use the search bar and department filter to discover verified hospitals and specialists on call across the network.",
        suggestedActions: [{ label: "Start Symptom Assessment", path: "/triage" }],
      };
    }

    return {
      reply:
        "Hello! I am your MediFlow Healthcare Assistant. You can ask me about symptom-to-department routing, how to track your queue token, or how to navigate the platform.",
      suggestedActions: [
        { label: "Assess Symptoms", path: "/triage" },
        { label: "Hospital Directory", path: "/guidance" },
      ],
    };
  },
};
