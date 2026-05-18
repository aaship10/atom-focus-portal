import React, { useState, useEffect } from 'react';
import { getCompletionDashboard, getAnalytics, getAuditLogs, getEscalations } from '../../api/admin';
import { 
  Users, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Server, 
  Clock, 
  ChevronRight,
  TrendingUp,
  PieChart
} from 'lucide-react';

export default function AdminDashboard() {
  const [completionData, setCompletionData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [completion, analytics, logs, esc] = await Promise.all([
          getCompletionDashboard(),
          getAnalytics(),
          getAuditLogs(),
          getEscalations()
        ]);
        setCompletionData(completion);
        setAnalyticsData(analytics);
        setAuditLogs(logs.slice(0, 5)); // show latest 5
        setEscalations(esc.filter(e => !e.resolved)); // show active escalations
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve control panel analytics. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { 
      label: 'Goal Setting Rate', 
      value: completionData ? `${completionData.summary.goal_setting_rate}%` : '0%', 
      desc: completionData ? `${completionData.summary.completed_goal_setting} / ${completionData.summary.total_employees} Employee Sheets` : '0 Sheets',
      icon: Target,
      color: 'text-primary'
    },
    { 
      label: 'Check-in Compliance', 
      value: completionData ? `${completionData.summary.checkin_rate}%` : '0%', 
      desc: completionData ? `${completionData.summary.completed_quarterly_checkins} Active Check-ins` : '0 Check-ins',
      icon: CheckCircle,
      color: 'text-success'
    },
    { 
      label: 'Active Escalations', 
      value: escalations ? escalations.length.toString() : '0', 
      desc: 'Action items pending review',
      icon: AlertCircle,
      color: escalations.length > 0 ? 'text-error animate-pulse' : 'text-secondary'
    },
    { 
      label: 'System Hierarchy', 
      value: completionData ? (completionData.summary.total_employees + completionData.summary.total_managers).toString() : '0', 
      desc: completionData ? `${completionData.summary.total_managers} Managers | ${completionData.summary.total_employees} Employees` : '0 Users',
      icon: Users,
      color: 'text-tertiary'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-secondary font-bold font-body-lg text-body-lg">Syncing with Governance Systems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface p-8 rounded-2xl neumorphic-outset text-center max-w-lg mx-auto mt-10">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Sync Connection Error</h3>
        <p className="text-secondary mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold neumorphic-button hover:bg-primary/95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-container-padding transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-stack-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Organization Control Panel</h1>
            <p className="text-secondary font-body-lg text-body-lg">Enterprise governance, quarterly cycles, hierarchy updates & audit logs.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 neumorphic-inset rounded-full bg-surface-container w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping"></span>
            <span className="text-xs font-bold text-success">Governance Engine Active</span>
          </div>
        </header>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-surface p-6 rounded-2xl neumorphic-outset flex items-start justify-between hover:translate-y-[-4px] transition-transform duration-350">
                <div className="flex flex-col">
                  <span className="text-secondary font-label-caps text-label-caps mb-2">{stat.label}</span>
                  <span className="text-3xl font-black text-on-surface tracking-tight mb-1">{stat.value}</span>
                  <span className="text-[11px] font-bold text-secondary">{stat.desc}</span>
                </div>
                <div className={`p-3 rounded-xl neumorphic-inset ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-stack-lg">
          {/* Thrust Area Distribution */}
          <div className="bg-surface p-6 rounded-2xl neumorphic-outset lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <PieChart size={20} className="text-primary" />
                <h2 className="font-headline-md text-headline-md text-on-surface">Thrust Area Distributions</h2>
              </div>
              <span className="text-xs font-bold text-secondary uppercase bg-surface-container px-3 py-1 rounded-full">Strategic Goals</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsData?.thrust_area_distribution?.map((ta, idx) => (
                <div key={idx} className="p-4 neumorphic-inset rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-on-surface">{ta.thrust_area}</span>
                    <span className="text-xs font-label-caps text-label-caps text-primary bg-primary-fixed/20 px-2 py-0.5 rounded">
                      {ta.count} Goals
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 bg-surface-dim h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${ta.avg_progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black text-primary min-w-[36px] text-right">{ta.avg_progress}% Avg</span>
                  </div>
                </div>
              ))}
              {(!analyticsData || !analyticsData.thrust_area_distribution || analyticsData.thrust_area_distribution.length === 0) && (
                <div className="col-span-2 text-center py-6 text-secondary italic">
                  No registered thrust areas or goals found.
                </div>
              )}
            </div>
          </div>

          {/* Goal Health Heatmap */}
          <div className="bg-surface p-6 rounded-2xl neumorphic-outset">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                <h2 className="font-headline-md text-headline-md text-on-surface">Progress Brackets</h2>
              </div>
            </div>

            <div className="space-y-4">
              {analyticsData?.progress_heatmap?.map((bracket, idx) => {
                const totalGoals = analyticsData.progress_heatmap.reduce((sum, h) => sum + h.count, 0) || 1;
                const percentage = Math.round((bracket.count / totalGoals) * 100);
                
                let barColor = 'bg-primary';
                if (bracket.range === '76-100%') barColor = 'bg-success';
                if (bracket.range === '0-25%') barColor = 'bg-error/80';
                
                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface">{bracket.range} Bracket</span>
                      <span className="text-secondary">{bracket.count} goals ({percentage}%)</span>
                    </div>
                    <div className="bg-surface-dim h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* System Health Status */}
          <div className="bg-surface p-6 rounded-2xl neumorphic-outset">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">System Operational Integrity</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 neumorphic-inset rounded-xl bg-surface/50">
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-primary" />
                  <div>
                    <span className="font-bold block text-on-surface leading-tight">PostgreSQL Neon DB</span>
                    <span className="text-[10px] text-secondary">Cloud transactional storage</span>
                  </div>
                </div>
                <span className="text-success font-bold flex items-center gap-2 bg-success/10 px-3 py-1 rounded-full text-xs">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center p-4 neumorphic-inset rounded-xl bg-surface/50">
                <div className="flex items-center gap-3">
                  <Server size={20} className="text-primary" />
                  <div>
                    <span className="font-bold block text-on-surface leading-tight">FastAPI Core Router</span>
                    <span className="text-[10px] text-secondary">Endpoints & rule validator</span>
                  </div>
                </div>
                <span className="text-success font-bold flex items-center gap-2 bg-success/10 px-3 py-1 rounded-full text-xs">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-surface p-6 rounded-2xl neumorphic-outset flex flex-col justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Post-Lock Override Audit</h2>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between border-b border-surface-dim/40 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      <Clock size={16} className="text-secondary mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-on-surface">{log.details || log.action}</span>
                        <span className="text-[10px] text-secondary">
                          BY {log.user_name} | {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      log.action.includes('Unlock') 
                        ? 'bg-error-container text-on-error-container' 
                        : 'bg-primary-fixed/20 text-primary'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="text-secondary text-sm italic py-4">
                    No lock bypasses or overrides recorded in audit trail.
                  </div>
                )}
              </div>
            </div>
            
            {auditLogs.length > 0 && (
              <a 
                href="/admin/audit" 
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-4 w-fit"
              >
                View Full Audit Logs <ChevronRight size={14} />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
