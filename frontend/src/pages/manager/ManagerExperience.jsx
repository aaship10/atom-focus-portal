import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filter,
  Info
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
                        <div className="flex flex-wrap items-center lg:items-end gap-4 lg:gap-6 bg-surface-dim/20 p-4 rounded-2xl border border-white/20 shadow-inner">
                          <div className="flex flex-col gap-1.5 min-w-[100px]">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-wider block">Target</label>
                            <input 
                              type="number"
                              value={editValues[goal.id]?.target ?? goal.target}
                              onChange={(e) => handleEditChange(goal.id, 'target', e.target.value)}
                              className="w-28 px-3 py-2.5 rounded-xl bg-surface-variant border border-white/10 focus:ring-2 focus:ring-primary text-sm font-bold focus:outline-none"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5 min-w-[90px]">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-wider block">Weight (%)</label>
                            <input 
                              type="number"
                              value={editValues[goal.id]?.weight ?? goal.weight}
                              onChange={(e) => handleEditChange(goal.id, 'weight', e.target.value)}
                              className="w-24 px-3 py-2.5 rounded-xl bg-surface-variant border border-white/10 focus:ring-2 focus:ring-primary text-sm font-bold focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-end flex-1 lg:flex-none">
                            <button 
                              onClick={() => onReject(goal.id)}
                              disabled={processingId === goal.id}
                              className="p-3 rounded-xl border border-error/30 text-error hover:bg-error hover:text-white transition-all disabled:opacity-50 shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 duration-150"
                              title="Reject & return for rework"
                            >
                              <XCircle size={18} />
                            </button>
                            <button 
                              onClick={() => onApprove(goal.id, editValues[goal.id])}
                              disabled={processingId === goal.id}
                              className="px-6 py-3 rounded-xl bg-success text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 duration-150"
                            >
                              {processingId === goal.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                              <span>Approve</span>
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
const ManagerCheckInsView = ({ 
  teamData, 
  onSaveComment, 
  processingId, 
  year, 
  quarter, 
  onFilterChange, 
  bypassRestrictions, 
  setBypassRestrictions 
}) => {
  const [comments, setComments] = useState({});
  const [localMsg, setLocalMsg] = useState({ type: '', text: '' });
  const currentMonth = new Date().getMonth(); // 0-11

  const getQuarterWindowStatus = (q) => {
    if (bypassRestrictions) return { isOpen: true };

    const statusMap = {
      'Q1': { open: currentMonth === 6 || currentMonth === 7 || currentMonth === 8, openMonth: 'July', months: 'July - September' },
      'Q2': { open: currentMonth === 9 || currentMonth === 10 || currentMonth === 11, openMonth: 'October', months: 'October - December' },
      'Q3': { open: currentMonth === 0 || currentMonth === 1, openMonth: 'January', months: 'January - February' },
      'Q4': { open: currentMonth === 2 || currentMonth === 3, openMonth: 'March / April', months: 'March - April' }
    };
    return {
      isOpen: statusMap[q]?.open || false,
      openMonth: statusMap[q]?.openMonth,
      months: statusMap[q]?.months
    };
  };

  const windowStatus = getQuarterWindowStatus(quarter);
  const isWindowOpen = windowStatus.isOpen;

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

      {localMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-wider text-center border animate-in fade-in duration-300 ${
          localMsg.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
        }`}>
          {localMsg.text}
        </div>
      )}

      {/* Check-in Schedule Card */}
      <div className="bg-surface rounded-3xl p-6 shadow-card border border-white/20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-on-surface flex items-center gap-2">
              <Calendar className="text-primary" size={22} />
              Check-in Window Schedule
            </h2>
            <p className="text-secondary text-xs font-medium mt-0.5">Enforced quarterly windows for manager progress evaluation and feedback.</p>
          </div>
          
          {/* Demo Bypass Switch */}
          <div className="flex items-center gap-3 bg-surface-dim p-2.5 rounded-xl border border-white/10 shadow-inner">
            <span className="text-[10px] font-black text-secondary uppercase tracking-wider">Demo Override Mode</span>
            <button 
              onClick={() => {
                const newState = !bypassRestrictions;
                setBypassRestrictions(newState);
                setLocalMsg({
                  type: 'success',
                  text: newState ? 'Demo Override Mode Enabled: All check-in windows bypassed for testing.' : 'Demo Override Mode Disabled: Enforced windows active.'
                });
                setTimeout(() => setLocalMsg({ type: '', text: '' }), 4000);
              }}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                bypassRestrictions ? 'bg-primary' : 'bg-surface-dim shadow-inner border border-white/10'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                bypassRestrictions ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {[
            { id: 'Phase 1', label: 'Phase 1 - Goal Setting', window: '1st May', action: 'Creation & Approval', active: currentMonth === 4 || currentMonth === 5 },
            { id: 'Q1', label: 'Q1 Check-in', window: 'July', action: 'Manager Evaluation', active: currentMonth === 6 || currentMonth === 7 || currentMonth === 8 },
            { id: 'Q2', label: 'Q2 Check-in', window: 'October', action: 'Manager Evaluation', active: currentMonth === 9 || currentMonth === 10 || currentMonth === 11 },
            { id: 'Q3', label: 'Q3 Check-in', window: 'January', action: 'Manager Evaluation', active: currentMonth === 0 || currentMonth === 1 },
            { id: 'Q4', label: 'Q4 / Annual', window: 'March / April', action: 'Final Evaluation & Capture', active: currentMonth === 2 || currentMonth === 3 }
          ].map((period) => (
            <div 
              key={period.id} 
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28 ${
                period.active 
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-lg ring-1 ring-primary/20' 
                  : 'bg-surface border-white/5 opacity-40 hover:opacity-60 text-secondary'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider block opacity-75">{period.id}</span>
                <span className="text-xs font-bold leading-tight block text-on-surface">{period.label}</span>
              </div>
              <div className="space-y-0.5">
                <span className={`text-[9px] font-bold block ${period.active ? 'text-primary' : 'text-secondary'}`}>Opens: {period.window}</span>
                <span className="text-[8px] font-medium block opacity-80">{period.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closed Warning Banner */}
      {!isWindowOpen && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <Info size={22} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-wider">Evaluation Closed</h4>
            <p className="text-xs font-semibold">
              The {quarter} feedback window is currently closed. Enforced window opens in <span className="font-black underline">{windowStatus.openMonth}</span> ({windowStatus.months}).
            </p>
            <p className="text-[10px] font-medium opacity-80">
              You can review saved Q1/Q2/Q3/Q4 manager comments, but saving new comments is disabled. Enable <span className="font-bold">Demo Override Mode</span> above to log test feedback.
            </p>
          </div>
        </div>
      )}

      {/* Team Check-ins List */}
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
                const isLocked = !isWindowOpen;

                return (
                  <div key={goal.id} className={`p-6 space-y-4 transition-all ${isLocked ? 'opacity-65 grayscale-[0.4]' : ''}`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-bold text-on-surface">{goal.title}</h4>
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-600 border-amber-500/20">
                              Window Closed (Locked)
                            </span>
                          )}
                        </div>
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
                        disabled={isLocked}
                        placeholder={isLocked ? "Feedback window is closed. Enable Demo Override Mode to comment." : "Discuss progress, blockers, and next steps..."}
                        className="w-full min-h-[100px] p-4 rounded-2xl bg-surface-variant border-none focus:ring-2 focus:ring-primary text-sm font-medium resize-none placeholder:text-secondary/50 disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                      {!isLocked && (
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
                      )}
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
  const navigate = useNavigate();
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
  const [bypassRestrictions, setBypassRestrictions] = useState(false);

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
      await submitManagerCheckin(goalId, filters.quarter, comment, bypassRestrictions);
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
        
        {/* <nav className="flex items-center gap-1 bg-surface-dim p-1 rounded-[2rem] shadow-inset border border-white/5">
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
        </nav> */}
      </header>

      <main>
        {activeTab === 'dashboard' && (
          <ManagerDashboardView 
            stats={stats} 
            pendingGoals={pendingGoals} 
            onNavigate={(tab) => {
              if (tab === 'approvals') navigate('/manager/approvals');
              else if (tab === 'checkins') navigate('/manager/check-ins');
              else navigate('/manager/dashboard');
            }} 
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
            bypassRestrictions={bypassRestrictions}
            setBypassRestrictions={setBypassRestrictions}
          />
        )}
      </main>
    </div>
  );
}
