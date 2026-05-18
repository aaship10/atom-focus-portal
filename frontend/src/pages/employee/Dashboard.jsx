import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Target, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Plus, 
  ClipboardCheck, 
  ChevronRight,
  Bell,
  Calendar
} from 'lucide-react';
import { getEmployeeDashboard } from '../../api/dashboard';
import { submitGoal } from '../../api/goals';
import { CheckCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingGoalId, setProcessingGoalId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getEmployeeDashboard();
        setData(result);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getCurrentQuarterInfo = () => {
    const month = new Date().getMonth(); // 0-indexed
    // Assuming Q1 starts in July (Month 6) based on previous context
    if (month >= 6 && month <= 8) return { name: 'Q1', deadline: 'September 30th' };
    if (month >= 9 && month <= 11) return { name: 'Q2', deadline: 'December 31st' };
    if (month >= 0 && month <= 2) return { name: 'Q3', deadline: 'March 31st' };
    return { name: 'Q4', deadline: 'June 30th' };
  };

  const quarterInfo = getCurrentQuarterInfo();

  const handleSubmitGoal = async (goalId) => {
    setProcessingGoalId(goalId);
    try {
      await submitGoal(goalId);
      setData(prev => ({
        ...prev,
        top_goals: prev.top_goals.map(g => g.id === goalId ? { ...g, status: 'Pending' } : g),
        pending_approvals: prev.pending_approvals + 1
      }));
      setSuccessMsg("Goal submitted for approval!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setProcessingGoalId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-surface-variant rounded-3xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-variant rounded-3xl"></div>)}
        </div>
        <div className="h-64 bg-surface-variant rounded-3xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-error/10 border border-error/20 rounded-3xl">
        <AlertCircle size={48} className="mx-auto text-error mb-4" />
        <h3 className="text-xl font-bold text-on-surface">Oops! Something went wrong</h3>
        <p className="text-secondary mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">Retry</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header & Quick Actions */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight">Welcome back, {data.user_name}</h1>
          <p className="text-secondary font-medium flex items-center gap-x-2 gap-y-1 flex-wrap mt-1">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {today}
            </span>
            {data.manager_name && (
              <>
                <span className="text-secondary/40 hidden sm:inline">•</span>
                <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-bold">
                  Reporting to: {data.manager_name}
                </span>
              </>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/employee/goals/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Create Goal</span>
          </button>
          {/* <button 
            onClick={() => navigate('/employee/goals/check-in')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface border border-surface-dim text-on-surface font-bold shadow-md hover:bg-surface-variant transition-all"
          >
            <ClipboardCheck size={20} />
            <span>Log Check-In</span>
          </button> */}
        </div>
      </header>

      {/* Action Banner */}
      {successMsg && (
        <div className="bg-success/10 border border-success/20 p-4 rounded-2xl flex items-center gap-3 text-success animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} />
          <p className="font-bold text-sm">{successMsg}</p>
        </div>
      )}
      <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl flex items-center gap-4 text-primary animate-in slide-in-from-top-4 duration-500">
        <div className="w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
          <Bell size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-black text-sm uppercase tracking-widest">Action Required</h4>
          <p className="font-bold opacity-80">{quarterInfo.name} Check-In window is currently open. Please log your updates by {quarterInfo.deadline}.</p>
        </div>
        <Link to="/employee/check-ins" className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90">Log Now</Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Goals */}
        <div className="bg-surface p-6 rounded-3xl shadow-card border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Target size={24} />
            </div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Target Met</span>
          </div>
          <h3 className="text-3xl font-black text-on-surface">{data.total_goals}</h3>
          <p className="text-xs font-bold text-secondary uppercase tracking-tighter mt-1">Total Active Goals</p>
        </div>

        {/* Pending Approvals */}
        <div className={`p-6 rounded-3xl shadow-card border border-white/20 ${data.pending_approvals > 0 ? 'bg-amber-50 border-amber-200' : 'bg-surface'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${data.pending_approvals > 0 ? 'bg-amber-500 text-white' : 'bg-surface-variant text-secondary'}`}>
              <Clock size={24} />
            </div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Workflow</span>
          </div>
          <h3 className={`text-3xl font-black ${data.pending_approvals > 0 ? 'text-amber-700' : 'text-on-surface'}`}>
            {data.pending_approvals}
          </h3>
          <p className="text-xs font-bold text-secondary uppercase tracking-tighter mt-1">Pending Approvals</p>
        </div>

        {/* Off Track */}
        <div className={`p-6 rounded-3xl shadow-card border border-white/20 ${data.off_track_goals > 0 ? 'bg-red-50 border-red-200' : 'bg-surface'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${data.off_track_goals > 0 ? 'bg-red-500 text-white' : 'bg-surface-variant text-secondary'}`}>
              <AlertCircle size={24} />
            </div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Alerts</span>
          </div>
          <h3 className={`text-3xl font-black ${data.off_track_goals > 0 ? 'text-red-700' : 'text-on-surface'}`}>
            {data.off_track_goals}
          </h3>
          <p className="text-xs font-bold text-secondary uppercase tracking-tighter mt-1">Goals Off-Track</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-surface p-6 rounded-3xl shadow-card border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 text-success rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Efficiency</span>
          </div>
          <h3 className="text-3xl font-black text-on-surface">{data.overall_progress}%</h3>
          <div className="w-full bg-surface-dim h-2 rounded-full mt-3 overflow-hidden p-0.5">
            <div className="h-full bg-success rounded-full" style={{ width: `${data.overall_progress}%` }}></div>
          </div>
          <p className="text-xs font-bold text-secondary uppercase tracking-tighter mt-2">Overall Completion</p>
        </div>
      </div>

      {/* Goal Snapshot Section */}
      <div className="bg-surface rounded-3xl shadow-card border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-surface-dim flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-on-surface">Goal Performance Snapshot</h3>
            <p className="text-sm text-secondary font-medium">Tracking your most recent updates</p>
          </div>
          <Link to="/employee/goals/my-goals" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            View All Goals
            <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="divide-y divide-surface-dim">
          {data.top_goals.length === 0 ? (
            <div className="p-12 text-center text-secondary">
              <p className="italic">No goals found for this cycle. Start by creating one!</p>
            </div>
          ) : data.top_goals.map((goal) => (
            <div key={goal.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-surface-variant transition-colors group">
              <div className="flex-1">
                <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{goal.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${
                    goal.status === 'Completed' ? 'bg-success' : 
                    goal.status === 'On Track' ? 'bg-primary' : 
                    goal.status === 'Off Track' ? 'bg-error' : 
                    goal.status === 'Pending' ? 'bg-amber-500' : 'bg-secondary'
                  }`}></span>
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                    {goal.status === 'Pending' ? 'Pending Approval' : goal.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {(goal.status === 'Draft' || goal.status === 'Rejected' || !goal.status) && (
                  <button 
                    onClick={(e) => { e.preventDefault(); handleSubmitGoal(goal.id); }}
                    disabled={processingGoalId === goal.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {processingGoalId === goal.id ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                )}
                
                <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Progress</span>
                  <span className="text-sm font-black text-on-surface">{goal.progress}%</span>
                </div>
                <div className="w-full bg-surface-dim h-2 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      goal.progress >= 100 ? 'bg-success' : 'bg-primary'
                    }`} 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <ChevronRight className="text-secondary group-hover:translate-x-1 transition-transform" size={20} />
            </div>
          </div>
          ))}
        </div>
      </div>

    </div>
  );
}
