import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSessionLogs } from "@/hooks/use-session-logs";
import { useChildProfile } from "@/hooks/use-child-profile";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Activity, MessageSquare, Target, Clock } from "lucide-react";
import { format, subDays } from "date-fns";

export default function Overview() {
  const { data: logs, isLoading: logsLoading } = useSessionLogs();
  const { data: profile, isLoading: profileLoading } = useChildProfile();

  if (logsLoading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Data processing for charts
  const communicationLogs = logs?.filter(l => l.eventType === 'communication') || [];
  const promptLogs = logs?.filter(l => l.eventType === 'prompt_started' || l.eventType === 'prompt_response') || [];
  
  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, 'MMM dd');
  });

  const chartData = last7Days.map(dayStr => {
    const count = communicationLogs.filter(l => format(new Date(l.createdAt || Date.now()), 'MMM dd') === dayStr).length;
    return { name: dayStr, value: count };
  });

  // Intent distribution
  const intentCounts = communicationLogs.reduce((acc, log) => {
    acc[log.details] = (acc[log.details] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.entries(intentCounts).map(([name, value], index) => ({
    name, value, fill: ['#4f46e5', '#ef4444', '#f59e0b', '#10b981'][index % 4]
  })).sort((a,b) => b.value - a.value).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's how {profile?.name || 'your child'} is doing today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Interactions" 
          value={logs?.length || 0} 
          icon={<Activity className="text-primary w-6 h-6" />}
          trend="+12% from yesterday"
        />
        <StatCard 
          title="Communications" 
          value={communicationLogs.length} 
          icon={<MessageSquare className="text-accent w-6 h-6" />}
          trend="Active"
        />
        <StatCard 
          title="Prompts Completed" 
          value={promptLogs.length} 
          icon={<Target className="text-secondary w-6 h-6" />}
          trend="Keep it up"
        />
        <StatCard 
          title="Last Active" 
          value={logs?.[0] ? format(new Date(logs[0].createdAt || Date.now()), 'h:mm a') : 'N/A'} 
          icon={<Clock className="text-muted-foreground w-6 h-6" />}
          trend="Today"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-6 font-display">Communication Frequency (7 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <h2 className="text-lg font-semibold mb-6 font-display">Top Requests</h2>
          <div className="flex-1 flex items-center justify-center">
            {pieData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center text-center">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p>Not enough data yet</p>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.fill}}></div>
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-muted-foreground font-medium text-sm">{title}</h3>
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-display">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{trend}</p>
    </div>
  );
}
