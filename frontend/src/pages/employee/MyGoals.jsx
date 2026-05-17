import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployeeGoals, submitGoal } from '../../api/goals';
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Send, 
  FileText, 
  Clock, 
  XCircle,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';

export default function MyGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'drafts'
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeeGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
      setError('Failed to load goals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (goalId) => {
    setProcessingId(goalId);
    try {
      await submitGoal(goalId);
      setSuccessMessage('Goal submitted to manager for approval!');
      
      // Update local state
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return { ...g, status: 'Pending' };
        }
        return g;
      }));
      
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to submit goal:', err);
      alert('Failed to submit goal for approval.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'on track':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-amber-500';
      case 'rejected':
        return 'bg-rose-500';
      case 'draft':
        return 'bg-blue-500';
      default:
        return 'bg-slate-500';
    }
  };

  const activeGoals = goals.filter(g => g.status?.toLowerCase() === 'approved' || g.status?.toLowerCase() === 'on track');
  const pendingAndDraftGoals = goals.filter(g => g.status?.toLowerCase() === 'draft' || g.status?.toLowerCase() === 'pending' || g.status?.toLowerCase() === 'rejected');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-secondary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold animate-pulse">Fetching your performance goals...</p>
      </div>
    );
  }

  const displayedGoals = activeTab === 'active' ? activeGoals : pendingAndDraftGoals;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-lg text-4xl font-black text-on-surface tracking-tight leading-none">My Goals</h1>
          <p className="text-secondary font-body-lg text-sm mt-2">Manage your performance objectives and submit them for review.</p>
        </div>
        <button 
          onClick={() => navigate('/employee/goals/create')}
          className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto text-sm"
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </header>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-success/15 border border-success/20 text-success flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} />
          <p className="font-bold text-xs">{successMessage}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="flex border-b border-surface-dim">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-6 py-4 font-black text-sm border-b-2 transition-all ${
            activeTab === 'active' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Active Goals ({activeGoals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex items-center gap-2 px-6 py-4 font-black text-sm border-b-2 transition-all ${
            activeTab === 'drafts' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <FileText size={16} />
          <span>Drafts & Pending ({pendingAndDraftGoals.length})</span>
        </button>
      </nav>

      {error ? (
        <div className="bg-error/10 border border-error/20 p-6 rounded-2xl text-error flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center shadow-lg">!</div>
          <p className="font-bold">{error}</p>
        </div>
      ) : displayedGoals.length === 0 ? (
        /* Empty State */
        <div className="bg-surface p-16 sm:p-24 rounded-3xl shadow-[inset_6px_6px_12px_#AEAEC0,inset_-6px_-6px_12px_#FFFFFF] text-center border border-white/20">
          <div className="w-20 h-20 bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-full flex items-center justify-center text-secondary mx-auto mb-6 opacity-50">
            {activeTab === 'active' ? <Target size={40} /> : <FileText size={40} />}
          </div>
          <h3 className="text-2xl font-black text-on-surface mb-2">No Goals Found</h3>
          <p className="text-secondary mb-8 max-w-md mx-auto text-sm">
            {activeTab === 'active' 
              ? "You don't have any approved goals yet. Once your manager approves a pending goal, it will show up here!"
              : "You don't have any drafts or pending goals at the moment. Create a new goal to get started!"}
          </p>
          <button 
            onClick={() => navigate('/employee/goals/create')}
            className="text-primary font-bold hover:underline underline-offset-4 flex items-center gap-2 mx-auto transition-all text-sm"
          >
            Create a new goal now →
          </button>
        </div>
      ) : (
        /* Goals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedGoals.map((goal) => (
            <div key={goal.id} className="bg-surface p-8 rounded-3xl shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20 hover:shadow-xl transition-all group flex flex-col justify-between min-h-[300px]">
              
              {/* Card Header */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{goal.thrust_area?.name || 'Thrust Area'}</span>
                    <h3 className="text-xl font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{goal.title}</h3>
                  </div>
                  <div className="bg-surface shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] px-4 py-2 rounded-2xl font-black text-primary flex flex-col items-center leading-none min-w-[70px]">
                    <span className="text-lg">{goal.weight}%</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-60">Weight</span>
                  </div>
                </div>

                <p className="text-secondary text-sm leading-relaxed mb-8 line-clamp-3">
                  {goal.description || 'No description provided for this goal.'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-6 border-t border-surface-dim space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Target</span>
                      <span className="text-sm font-black text-on-surface">{goal.target} {goal.uom !== 'Timeline' ? goal.uom : ''}</span>
                    </div>
                    <div className="w-px h-8 bg-surface-dim mx-2"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Status</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)} ${goal.status?.toLowerCase() === 'pending' ? 'animate-pulse' : ''}`}></div>
                        <span className="text-xs font-black text-on-surface uppercase">{goal.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-secondary/60">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(goal.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Submission Action for Drafts & Reworks */}
                {goal.status?.toLowerCase() === 'draft' && (
                  <button 
                    disabled={processingId === goal.id}
                    onClick={() => handleSubmit(goal.id)}
                    className="w-full mt-4 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {processingId === goal.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    <span>Submit for Manager Approval</span>
                  </button>
                )}

                {/* Submission Action for Rejected */}
                {goal.status?.toLowerCase() === 'rejected' && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-rose-600">
                      <XCircle size={16} />
                      <span className="text-xs font-black uppercase">Goal Rejected - Rework Required</span>
                    </div>
                    <button 
                      disabled={processingId === goal.id}
                      onClick={() => handleSubmit(goal.id)}
                      className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-black text-[10px] uppercase tracking-wider shadow flex items-center justify-center gap-1 hover:scale-105 transition-all disabled:opacity-50"
                    >
                      <Send size={12} />
                      <span>Submit Revision</span>
                    </button>
                  </div>
                )}

                {/* Pending Confirmation */}
                {goal.status?.toLowerCase() === 'pending' && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2 text-amber-600">
                    <Clock size={16} className="animate-pulse" />
                    <span className="text-xs font-black uppercase">Awaiting Manager Review</span>
                  </div>
                )}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
