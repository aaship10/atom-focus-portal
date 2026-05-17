import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  CheckSquare, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  Save,
  Filter
} from 'lucide-react';
import { getManagerDashboard, getTeamData, getPendingTeamGoals, approveGoal, rejectGoal, submitManagerCheckin } from '../../api/manager';

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-surface rounded-3xl p-6 shadow-card border border-white/20 flex items-center gap-4">
    <div className={`p-4 rounded-2xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-secondary font-black uppercase tracking-widest text-[10px]">{title}</p>
      <p className="text-3xl font-black text-on-surface">{value}</p>
    </div>
  </div>
);

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-surface-variant rounded-xl ${className}`}></div>
);

// A. ManagerDashboard Component
const ManagerDashboardView = ({ stats, pendingGoals, onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Team Goals" 
          value={stats?.total_team_goals || 0} 
          icon={Users} 
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats?.pending_approvals || 0} 
          icon={Clock} 
          colorClass="bg-amber-500/10 text-amber-600"
        />
        <StatCard 
          title="At-Risk Goals" 
          value={stats?.at_risk_goals || 0} 
          icon={AlertCircle} 
          colorClass="bg-error/10 text-error"
        />
      </div>

      <section className="bg-surface rounded-3xl shadow-card border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-surface-dim flex items-center justify-between">
          <h3 className="text-xl font-black text-on-surface flex items-center gap-2">
            <AlertCircle className="text-error" size={20} />
            Needs Attention
          </h3>
          <button onClick={() => onNavigate('approvals')} className="text-sm font-bold text-primary hover:underline">
            View All
          </button>
        </div>
        <div className="divide-y divide-surface-dim">
          {pendingGoals.length === 0 ? (
            <div className="p-12 text-center text-secondary">
              <CheckCircle size={48} className="mx-auto opacity-20 mb-4" />
              <p className="font-medium italic">Everything looks good! No goals need immediate attention.</p>
            </div>
          ) : (
            pendingGoals.map((goal) => (
              <div key={goal.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-surface-variant transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      goal.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-error/10 text-error'
                    }`}>
                      {goal.status}
                    </span>
                    <h4 className="font-bold text-on-surface">{goal.title}</h4>
                  </div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
                    {goal.owner.name} • {goal.thrust_area?.name}
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('approvals')}
                  className="flex items-center gap-2 text-primary font-bold text-sm hover:translate-x-1 transition-transform"
                >
                  Action <ChevronDown className="-rotate-90" size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

// B. TeamGoalApprovals Component
const TeamGoalApprovalsView = ({ teamData, onApprove, onReject, processingId }) => {
  const [expandedMember, setExpandedMember] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleEditChange = (goalId, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [goalId]: {
        ...(prev[goalId] || {}),
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Goal Approvals</h2>
          <p className="text-secondary text-sm font-medium">Review and approve your team's objectives.</p>
        </div>
      </header>

      <div className="space-y-4">
        {teamData.map((member) => {
          const pendingGoals = member.goals.filter(g => g.status === 'Pending');
          if (pendingGoals.length === 0) return null;

          const isExpanded = expandedMember === member.id;

          return (
            <div key={member.id} className="bg-surface rounded-3xl shadow-card border border-white/20 overflow-hidden">
              <button 
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-surface-variant transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-on-surface">{member.name}</h3>
                    <p className="text-xs text-secondary font-medium">{pendingGoals.length} goals pending approval</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isExpanded && (
                <div className="p-6 pt-0 divide-y divide-surface-dim">
                  {pendingGoals.map((goal) => (
                    <div key={goal.id} className="py-6 first:pt-0 last:pb-0 space-y-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-on-surface">{goal.title}</h4>
                          <p className="text-xs text-secondary mt-1">{goal.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-[10px] font-black text-secondary uppercase bg-surface-variant px-2 py-1 rounded-lg">
                              {goal.thrust_area?.name}
                            </span>
                            <span className="text-[10px] font-black text-secondary uppercase bg-surface-variant px-2 py-1 rounded-lg">
                              UOM: {goal.uom}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-secondary uppercase">Target</label>
                            <input 
                              type="number"
                              value={editValues[goal.id]?.target ?? goal.target}
                              onChange={(e) => handleEditChange(goal.id, 'target', e.target.value)}
                              className="w-24 px-3 py-2 rounded-xl bg-surface-variant border-none focus:ring-2 focus:ring-primary text-sm font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-secondary uppercase">Weight (%)</label>
                            <input 
                              type="number"
                              value={editValues[goal.id]?.weight ?? goal.weight}
                              onChange={(e) => handleEditChange(goal.id, 'weight', e.target.value)}
                              className="w-20 px-3 py-2 rounded-xl bg-surface-variant border-none focus:ring-2 focus:ring-primary text-sm font-bold"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onReject(goal.id)}
                              disabled={processingId === goal.id}
                              className="p-2.5 rounded-xl border border-error/20 text-error hover:bg-error hover:text-white transition-all disabled:opacity-50"
                            >
                              <XCircle size={18} />
                            </button>
                            <button 
                              onClick={() => onApprove(goal.id, editValues[goal.id])}
                              disabled={processingId === goal.id}
                              className="px-6 py-2.5 rounded-xl bg-success text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                              {processingId === goal.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {teamData.every(m => m.goals.filter(g => g.status === 'Pending').length === 0) && (
          <div className="bg-surface rounded-3xl p-12 text-center border border-white/20">
             <CheckCircle size={48} className="mx-auto text-success opacity-20 mb-4" />
             <h3 className="text-xl font-black text-on-surface">No Pending Goals</h3>
             <p className="text-secondary font-medium">All team goals have been reviewed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// C. ManagerCheckIns Component
const ManagerCheckInsView = ({ teamData, onSaveComment, processingId, year, quarter, onFilterChange }) => {
  const [comments, setComments] = useState({});

  useEffect(() => {
    const initialComments = {};
    teamData.forEach(member => {
      member.goals.forEach(goal => {
        const existingCheckin = goal.checkins?.find(c => c.quarter === quarter);
        if (existingCheckin) {
          initialComments[goal.id] = existingCheckin.comment;
        }
      });
    });
    setComments(initialComments);
  }, [teamData, quarter]);

  const handleCommentChange = (goalId, value) => {
    setComments(prev => ({ ...prev, [goalId]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Quarterly Check-ins</h2>
          <p className="text-secondary text-sm font-medium">Conduct performance discussions and log feedback.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface p-2 rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center gap-2 px-3">
            <Calendar size={16} className="text-secondary" />
            <select 
              value={year} 
              onChange={(e) => onFilterChange('year', e.target.value)}
              className="bg-transparent border-none text-xs font-black text-on-surface focus:ring-0 cursor-pointer"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="w-px h-4 bg-surface-dim"></div>
          <div className="flex items-center gap-2 px-3">
            <Filter size={16} className="text-secondary" />
            <select 
              value={quarter} 
              onChange={(e) => onFilterChange('quarter', e.target.value)}
              className="bg-transparent border-none text-xs font-black text-on-surface focus:ring-0 cursor-pointer"
            >
              {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {teamData.map((member) => (
          <div key={member.id} className="bg-surface rounded-3xl shadow-card border border-white/20 overflow-hidden">
            <div className="p-6 bg-surface-variant/50 border-b border-surface-dim flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                 {member.name.charAt(0)}
               </div>
               <h3 className="font-black text-on-surface">{member.name}</h3>
            </div>
            
            <div className="divide-y divide-surface-dim">
              {member.goals.length === 0 ? (
                <div className="p-8 text-center text-secondary italic text-sm">No goals found for this period.</div>
              ) : member.goals.map((goal) => {
                const achievement = goal.achievements?.find(a => a.quarter === quarter);
                const checkin = goal.checkins?.find(c => c.quarter === quarter);
                
                return (
                  <div key={goal.id} className="p-6 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-on-surface">{goal.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-secondary uppercase bg-surface-variant px-2 py-0.5 rounded-lg">
                            Target: {goal.target} {goal.uom}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${
                            goal.status === 'Off Track' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                          }`}>
                            Status: {goal.status}
                          </span>
                        </div>
                      </div>
                      <div className="bg-surface-variant p-4 rounded-2xl min-w-[200px]">
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Employee's Logged Actual</p>
                        <p className="text-2xl font-black text-primary">
                          {achievement ? `${achievement.actual_value} ${goal.uom}` : 'Not Logged'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary uppercase flex items-center gap-2">
                        <MessageSquare size={14} />
                        Manager Feedback ({quarter})
                      </label>
                      <textarea 
                        value={comments[goal.id] || ''}
                        onChange={(e) => handleCommentChange(goal.id, e.target.value)}
                        placeholder="Discuss progress, blockers, and next steps..."
                        className="w-full min-h-[100px] p-4 rounded-2xl bg-surface-variant border-none focus:ring-2 focus:ring-primary text-sm font-medium resize-none placeholder:text-secondary/50"
                      />
                      <div className="flex justify-end">
                        <button 
                          onClick={() => onSaveComment(goal.id, comments[goal.id])}
                          disabled={processingId === `${goal.id}-checkin` || !comments[goal.id]}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {processingId === `${goal.id}-checkin` ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          Save Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function ManagerExperience({ defaultTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [pendingGoals, setPendingGoals] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    quarter: `Q${Math.floor(new Date().getMonth() / 3) + 1}`
  });

  useEffect(() => {
    fetchInitialData();
  }, [filters.year]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsData, teamResult, pendingResult] = await Promise.all([
        getManagerDashboard(),
        getTeamData(filters.year),
        getPendingTeamGoals()
      ]);
      setStats(statsData);
      setTeamData(teamResult);
      setPendingGoals(pendingResult);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (goalId, edits) => {
    setProcessingId(goalId);
    try {
      await approveGoal(goalId, edits || {});
      // Refresh data
      await fetchInitialData();
      // Simple Toast Simulation
      console.log("Goal approved successfully");
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (goalId) => {
    setProcessingId(goalId);
    try {
      await rejectGoal(goalId);
      await fetchInitialData();
      console.log("Goal returned for rework");
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveCheckin = async (goalId, comment) => {
    setProcessingId(`${goalId}-checkin`);
    try {
      await submitManagerCheckin(goalId, filters.quarter, comment);
      await fetchInitialData();
      console.log("Feedback saved successfully");
    } catch (err) {
      console.error("Checkin error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight">Manager Hub</h1>
          <p className="text-secondary font-medium mt-1">Hello, {stats?.user_name}! You have {stats?.pending_approvals} pending approvals.</p>
        </div>
        
        <nav className="flex items-center gap-1 bg-surface-dim p-1 rounded-[2rem] shadow-inset border border-white/5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'approvals', label: 'Approvals', icon: CheckSquare },
            { id: 'checkins', label: 'Check-Ins', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-[1.75rem] text-sm font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-secondary hover:bg-surface hover:text-on-surface'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main>
        {activeTab === 'dashboard' && (
          <ManagerDashboardView 
            stats={stats} 
            pendingGoals={pendingGoals} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'approvals' && (
          <TeamGoalApprovalsView 
            teamData={teamData} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            processingId={processingId}
          />
        )}
        {activeTab === 'checkins' && (
          <ManagerCheckInsView 
            teamData={teamData} 
            onSaveComment={handleSaveCheckin} 
            processingId={processingId}
            year={filters.year}
            quarter={filters.quarter}
            onFilterChange={handleFilterChange}
          />
        )}
      </main>
    </div>
  );
}
