import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPendingTeamGoals, approveGoal, rejectGoal } from '../../api/manager';

export default function ManagerDashboard() {
  const [pendingGoals, setPendingGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingGoals();
  }, []);

  const fetchPendingGoals = async () => {
    try {
      const data = await getPendingTeamGoals();
      setPendingGoals(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load team data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (goalId) => {
    setProcessingId(goalId);
    try {
      await approveGoal(goalId, {});
      setPendingGoals(prev => prev.filter(g => g.id !== goalId));
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
      setPendingGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-secondary font-bold">Loading team overview...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black text-on-surface tracking-tight">Team Overview</h1>
        <p className="text-secondary font-medium mt-1">Monitor performance and approve objectives for your direct reports.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-3xl p-8 shadow-card border border-white/20 col-span-1 md:col-span-2 flex items-center justify-between">
          <div>
            <h2 className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] mb-2">Overall Team Progress</h2>
            <p className="text-5xl font-black text-primary tracking-tighter">68%</p>
            <div className="flex items-center gap-2 mt-2 text-success font-bold text-xs">
              <TrendingUp size={14} />
              <span>↑ 12% from last cycle</span>
            </div>
          </div>
          <div className="w-32 h-32 neumorphic-inset rounded-full flex items-center justify-center">
            <div className="text-2xl font-black text-primary">68%</div>
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-8 shadow-card border border-white/20 flex flex-col justify-between">
          <div>
            <h2 className="text-secondary font-black uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> Action Required
            </h2>
            <div className="space-y-3">
              <Link to="/manager/approvals" className="flex items-center justify-between p-4 bg-surface-variant rounded-2xl group hover:bg-primary/5 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">Goal Approvals</span>
                  <span className="text-[10px] text-secondary font-medium">{pendingGoals.length} goals waiting</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm ${pendingGoals.length > 0 ? 'bg-error text-white animate-pulse' : 'bg-surface-dim text-secondary'}`}>
                  {pendingGoals.length}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Widget */}
      <section className="bg-surface rounded-3xl shadow-card border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-surface-dim flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
            <h3 className="text-xl font-black text-on-surface">Pending Approvals</h3>
          </div>
          <Link to="/manager/approvals" className="text-sm font-bold text-primary hover:underline">Manage All</Link>
        </div>

        <div className="divide-y divide-surface-dim">
          {pendingGoals.length === 0 ? (
            <div className="p-12 text-center text-secondary">
              <UserCheck size={48} className="mx-auto opacity-20 mb-4" />
              <p className="font-medium italic">Your team's queue is empty. All goals are reviewed!</p>
            </div>
          ) : pendingGoals.slice(0, 5).map((goal) => (
            <div key={goal.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-surface-variant transition-all">
              <div className="flex-1 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {goal.owner.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{goal.title}</h4>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{goal.owner.name} • {goal.weight}% Weight</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleReject(goal.id)}
                  disabled={processingId === goal.id}
                  className="p-2.5 rounded-xl border border-error/20 text-error hover:bg-error hover:text-white transition-all disabled:opacity-50"
                  title="Return for rework"
                >
                  <XCircle size={18} />
                </button>
                <button 
                  onClick={() => handleApprove(goal.id)}
                  disabled={processingId === goal.id}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-success text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {processingId === goal.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))}
          {pendingGoals.length > 5 && (
            <Link to="/manager/approvals" className="block p-4 text-center text-xs font-bold text-secondary hover:bg-surface-variant transition-colors italic">
              + {pendingGoals.length - 5} more pending goals...
            </Link>
          )}
        </div>
      </section>

      {/* Team Insights */}
      <section className="bg-surface rounded-3xl p-12 shadow-card border border-white/20 text-center">
        <Users size={48} className="mx-auto text-primary opacity-20 mb-4" />
        <h3 className="text-xl font-black text-on-surface">Team Activity</h3>
        <p className="text-secondary font-medium mt-1">Activity logs and performance trends will appear here.</p>
      </section>
    </div>
  );
}
