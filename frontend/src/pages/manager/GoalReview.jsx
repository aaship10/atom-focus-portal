import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Target, 
  Edit3, 
  Save, 
  AlertCircle,
  TrendingUp,
  Loader2,
  ChevronLeft,
  Lock,
  Unlock
} from 'lucide-react';
import { getTeamData, approveGoal, rejectGoal } from '../../api/manager';

export default function GoalReview() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchEmployeeGoals();
  }, [employeeId]);

  const fetchEmployeeGoals = async () => {
    setLoading(true);
    try {
      const team = await getTeamData(currentYear);
      // Find the specific employee
      const member = team.find(m => m.id === parseInt(employeeId));
      if (member) {
        setEmployee(member);
      } else {
        setMessage({ type: 'error', text: 'Employee not found in your team.' });
      }
    } catch (err) {
      console.error('Error fetching employee goals:', err);
      setMessage({ type: 'error', text: 'Failed to load employee goals.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (goal) => {
    setEditingId(goal.id);
    setEditValues({
      target: goal.target,
      weight: goal.weight
    });
  };

  const handleApprove = async (goalId) => {
    setProcessingId(goalId);
    try {
      const updatedData = editingId === goalId ? {
        target: parseFloat(editValues.target),
        weight: parseInt(editValues.weight)
      } : {};
      await approveGoal(goalId, updatedData);
      
      // Update local state to reflect approved status
      setEmployee(prev => {
        if (!prev) return null;
        return {
          ...prev,
          goals: prev.goals.map(g => {
            if (g.id === goalId) {
              return { 
                ...g, 
                status: 'Approved', 
                locked: true,
                target: editingId === goalId ? editValues.target : g.target,
                weight: editingId === goalId ? editValues.weight : g.weight
              };
            }
            return g;
          })
        };
      });

      setMessage({ type: 'success', text: 'Goal approved and locked successfully!' });
      setEditingId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Approval failed:', err);
      setMessage({ type: 'error', text: 'Failed to approve goal.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (goalId) => {
    if (!window.confirm("Are you sure you want to return this goal to the employee for rework?")) return;
    setProcessingId(goalId);
    try {
      await rejectGoal(goalId);
      
      // Update local state to reflect rejected status
      setEmployee(prev => {
        if (!prev) return null;
        return {
          ...prev,
          goals: prev.goals.map(g => {
            if (g.id === goalId) {
              return { ...g, status: 'Rejected', locked: false };
            }
            return g;
          })
        };
      });

      setMessage({ type: 'success', text: 'Goal returned for rework.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Rejection failed:', err);
      setMessage({ type: 'error', text: 'Failed to return goal.' });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'draft':
        return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-secondary font-bold">Loading goals portfolio...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-16">
        <AlertCircle size={48} className="mx-auto text-error mb-4" />
        <h2 className="text-2xl font-black text-on-surface">Employee Not Found</h2>
        <p className="text-secondary mt-2 mb-6">We couldn't locate this employee or they don't report to you.</p>
        <button 
          onClick={() => navigate('/manager/dashboard')}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate total portfolio weight
  const totalWeight = (employee.goals || []).reduce((sum, g) => sum + g.weight, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-8">
      {/* Back navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-secondary hover:text-primary font-bold transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Back to Team</span>
      </button>

      {/* Header Profile */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface p-8 rounded-3xl shadow-card border border-white/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <User size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Employee Portfolio</p>
            <h1 className="text-3xl font-black text-on-surface tracking-tight leading-none mt-1">{employee.name}</h1>
            <p className="text-secondary text-sm font-medium mt-1">{employee.email}</p>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="flex items-center gap-8 md:border-l md:border-surface-dim md:pl-8">
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1">Total Goals</span>
            <span className="text-2xl font-black text-on-surface">{(employee.goals || []).length}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1">Portfolio Weight</span>
            <span className={`text-2xl font-black ${totalWeight === 100 ? 'text-success' : 'text-primary'}`}>{totalWeight}%</span>
          </div>
        </div>
      </header>

      {message.text && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in duration-300 ${
          message.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      {/* Goals List */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-on-surface">Performance Goals ({currentYear})</h2>

        {(employee.goals || []).length === 0 ? (
          <div className="bg-surface rounded-3xl p-16 text-center border border-surface-dim shadow-inner">
            <Target size={48} className="mx-auto text-secondary opacity-35 mb-4" />
            <h3 className="text-xl font-bold text-secondary">No Goals Defined</h3>
            <p className="text-secondary text-sm max-w-sm mx-auto mt-1">This employee hasn't created any goals for the {currentYear} period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {(employee.goals || []).map((goal) => (
              <div 
                key={goal.id} 
                className="bg-surface rounded-3xl p-8 shadow-card border border-white/20 transition-all hover:shadow-lg relative overflow-hidden"
              >
                {/* Visual lock banner indicator */}
                {goal.locked && (
                  <div className="absolute right-0 top-0 bg-emerald-500 text-white p-1 px-3 rounded-bl-xl flex items-center gap-1">
                    <Lock size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Locked</span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* Goal Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClass(goal.status)}`}>
                        {goal.status}
                      </span>
                      <span className="text-[10px] font-bold text-secondary uppercase bg-surface-dim px-2 py-0.5 rounded-lg border border-surface-dim">
                        {goal.thrust_area?.name || 'General Focus'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-on-surface leading-tight">{goal.title}</h3>
                      <p className="text-secondary text-sm mt-2">{goal.description || 'No description provided.'}</p>
                    </div>
                  </div>

                  {/* Targets & Editing */}
                  <div className="flex flex-wrap items-center gap-6 lg:border-l lg:border-surface-dim lg:pl-8">
                    <div className="p-4 neumorphic-inset rounded-2xl min-w-[140px]">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Target</p>
                      {editingId === goal.id ? (
                        <input 
                          type="number"
                          className="w-full bg-transparent border-b border-primary text-sm font-black text-on-surface focus:outline-none"
                          value={editValues.target}
                          onChange={(e) => setEditValues({...editValues, target: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm font-black text-on-surface">
                          {parseFloat(goal.target).toLocaleString()} <span className="text-xs font-normal text-secondary">{goal.uom}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-4 neumorphic-inset rounded-2xl min-w-[100px]">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Weight</p>
                      {editingId === goal.id ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number"
                            className="w-full bg-transparent border-b border-primary text-sm font-black text-on-surface focus:outline-none"
                            value={editValues.weight}
                            onChange={(e) => setEditValues({...editValues, weight: e.target.value})}
                          />
                          <span className="text-xs font-bold">%</span>
                        </div>
                      ) : (
                        <p className="text-sm font-black text-on-surface">{goal.weight}%</p>
                      )}
                    </div>

                    {/* Inline edit triggers */}
                    {!goal.locked && editingId !== goal.id && goal.status === 'Pending' && (
                      <button 
                        onClick={() => handleStartEdit(goal)}
                        className="p-3 rounded-2xl bg-surface-variant text-secondary hover:text-primary transition-colors shadow-sm"
                        title="Edit target or weight"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Actions for Pending Goals */}
                  {goal.status === 'Pending' ? (
                    <div className="flex items-center gap-3">
                      <button 
                        disabled={processingId === goal.id}
                        onClick={() => handleReject(goal.id)}
                        className="flex items-center justify-center w-12 h-12 rounded-2xl border border-error/20 text-error hover:bg-error hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title="Reject & return for rework"
                      >
                        <XCircle size={24} />
                      </button>
                      <button 
                        disabled={processingId === goal.id}
                        onClick={() => handleApprove(goal.id)}
                        className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-success text-white font-black shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {processingId === goal.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={20} />}
                        <span>{editingId === goal.id ? 'Apply & Approve' : 'Approve'}</span>
                      </button>
                    </div>
                  ) : (
                    // Display status indicator when not pending
                    <div className="flex items-center gap-2 min-w-[120px] justify-center py-2 px-4 rounded-xl bg-surface-variant text-secondary border border-surface-dim font-bold text-xs uppercase">
                      {goal.locked ? <Lock size={14} className="text-emerald-600" /> : <Unlock size={14} />}
                      <span>{goal.status === 'Approved' ? 'Approved' : goal.status === 'Rejected' ? 'Rejected' : 'Active'}</span>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
