import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, RefreshCw, Activity, AlertCircle } from "lucide-react";
import { queueApi } from "../../api/queueApi";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";

export const PatientQueuePage: React.FC = () => {
  const [countdown, setCountdown] = useState<number>(10);

  const { data: queuePosition, isLoading, refetch } = useQuery({
    queryKey: ["patient-queue-page-position"],
    queryFn: () => queueApi.getMyPosition(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600" />
            <span>My Live Queue Status</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time consultation position, waiting count, and estimated wait duration.
          </p>
        </div>

        <button
          onClick={() => {
            setCountdown(10);
            refetch();
          }}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Live Polling Active</span>
          </div>
          <span>Next update in <strong className="text-slate-900 dark:text-slate-100">{countdown}s</strong></span>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
        ) : queuePosition?.inQueue && queuePosition.queueItem ? (
          <div className="space-y-6">
            <div className="text-center py-6 bg-gradient-to-b from-teal-50/80 to-transparent dark:from-teal-950/40 rounded-2xl border border-teal-200/50 dark:border-teal-900/30">
              <span className="text-xs uppercase tracking-widest font-black text-teal-600 dark:text-teal-400">
                Your Token Number
              </span>
              <h2 className="text-6xl font-black text-slate-900 dark:text-slate-100 mt-2">
                #{queuePosition.queueItem.tokenNumber}
              </h2>
              <div className="mt-4 inline-block">
                <Badge variant={queuePosition.queueItem.status.toLowerCase() as any} className="text-sm px-4 py-1">
                  {queuePosition.queueItem.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <p className="text-xs font-semibold text-slate-500">Patients Ahead</p>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {queuePosition.waitingAhead ?? 0}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <p className="text-xs font-semibold text-slate-500">Estimated Wait</p>
                <p className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-1">
                  ~{queuePosition.estimatedWaitMinutes ?? 0} mins
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No active queue entry found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please check in at the reception desk when you arrive at the hospital to receive your live queue token.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
