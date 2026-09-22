import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  Trash2,
  ChevronRight,
  Stethoscope,
  Info,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { assistantApi, AssistantResponse } from "../../api/assistantApi";
import { Button } from "../common/Button";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  actions?: Array<{ label: string; path?: string }>;
}

interface MediFlowAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediFlowAssistant: React.FC<MediFlowAssistantProps> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Hi! I'm your MediFlow Assistant. I can help you understand medical departments, symptom guidance, live queue status, and how to navigate the platform.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Contextual prompt chips based on route
  const getContextPrompts = (): string[] => {
    const path = location.pathname;
    if (path.includes("triage")) {
      return [
        "Fever & body pain — which department?",
        "Chest tightness & breathing symptoms?",
        "When should I seek emergency care?",
      ];
    }
    if (path.includes("queue")) {
      return [
        "What does my queue token mean?",
        "How often is my queue position refreshed?",
        "What happens when my token is called?",
      ];
    }
    if (path.includes("guidance") || path.includes("hospitals")) {
      return [
        "How do I filter hospitals by specialty?",
        "Which hospital has Cardiology specialists?",
      ];
    }
    if (path.includes("appointments")) {
      return [
        "How do I view my booked appointments?",
        "How do I check in for my appointment?",
      ];
    }
    if (role && role !== "PATIENT") {
      return [
        "How do I call the next queue patient?",
        "How do I onboard a new doctor?",
        "How do I check in walk-in patients?",
      ];
    }
    return [
      "Which department should I choose?",
      "How does live queue tracking work?",
      "How to book a specialist appointment?",
    ];
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputMsg;
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg("");
    setIsLoading(true);

    try {
      const res: AssistantResponse = await assistantApi.queryAssistant(queryText, {
        routePath: location.pathname,
        role,
      });

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "assistant",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isEmergency: res.isEmergencyWarning,
        actions: res.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "assistant",
        text: "I encountered an issue processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const prompts = getContextPrompts();

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 md:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-100 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🤖 MediFlow Assistant</span>
            </h3>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
              Clinical Guidance Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome-1",
                  sender: "assistant",
                  text: "Hi! Conversation cleared. How else can I assist you today?",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                msg.sender === "user"
                  ? "bg-teal-600 text-white rounded-br-none font-medium"
                  : msg.isEmergency
                  ? "bg-rose-950/80 border border-rose-500/50 text-rose-200 rounded-bl-none"
                  : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>

              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-2 border-t border-slate-700/50 mt-2 space-y-1">
                  {msg.actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => act.path && navigate(act.path)}
                      className="w-full py-1 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold text-left flex items-center justify-between"
                    >
                      <span>{act.label}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-teal-400 text-xs py-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing query guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Prompt Chips & Input Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2.5">
        {/* Dynamic Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold whitespace-nowrap border border-slate-700/60 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about symptoms, departments..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSend()}
            isLoading={isLoading}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Medical Disclaimer Notice */}
        <div className="flex items-start gap-1.5 text-[10px] text-slate-500 leading-tight">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            MediFlow AI guidance is for informational department routing only and does not replace medical diagnosis.
          </span>
        </div>
      </div>
    </aside>
  );
};

export default MediFlowAssistant;
