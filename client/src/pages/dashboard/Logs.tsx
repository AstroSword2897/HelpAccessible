import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSessionLogs } from "@/hooks/use-session-logs";
import { format } from "date-fns";
import { MessageSquare, Star, Gamepad2, AlertCircle } from "lucide-react";

export default function Logs() {
  const { data: logs, isLoading } = useSessionLogs();

  const getIcon = (type: string) => {
    if (type === 'communication') return <MessageSquare className="w-4 h-4 text-blue-500" />;
    if (type.includes('prompt')) return <Star className="w-4 h-4 text-yellow-500" />;
    if (type.includes('game')) return <Gamepad2 className="w-4 h-4 text-purple-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground mt-1">History of AAC communications, ABA lesson responses, and game rounds from the child tablet.</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary rounded-full"></div></div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No activity logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-6 py-4 font-semibold text-sm">Time</th>
                  <th className="px-6 py-4 font-semibold text-sm">Event Type</th>
                  <th className="px-6 py-4 font-semibold text-sm">Details</th>
                  <th className="px-6 py-4 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, h:mm:ss a') : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {getIcon(log.eventType)}
                        </div>
                        <span className="font-medium capitalize">{log.eventType.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.details}
                    </td>
                    <td className="px-6 py-4">
                      {log.isCorrect !== null && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${log.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.isCorrect ? 'Correct' : 'Needs Practice'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
