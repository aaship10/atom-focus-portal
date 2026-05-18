import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchEmployeeGoals, 
  submitGoal,
  createTask,
  updateTask,
  deleteTask,
  updatePersonalNotesWeight
} from '../../api/goals';
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
  Lock,
  Edit3,
  CheckSquare,
  Square,
  Trash2,
  Bookmark,
  Layers,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

export default function MyGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'drafts'
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Expanded goal detail state
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  
  // Tasks management local input
  const [newTaskTitles, setNewTaskTitles] = useState({});
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Editable Weight & Personal Notes states
  const [editableWeights, setEditableWeights] = useState({});
  const [editableNotes, setEditableNotes] = useState({});
  const [savingSettingsId, setSavingSettingsId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeeGoals();
      setGoals(data);
      
      // Seed initial editable values
      const weights = {};
      const notes = {};
      data.forEach(g => {
        weights[g.id] = g.weight;
        notes[g.id] = g.personal_notes || '';
      });
      setEditableWeights(weights);
      setEditableNotes(notes);
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

  // --- Task Operations ---
  const handleAddTask = async (goalId) => {
    const title = newTaskTitles[goalId];
    if (!title || !title.trim()) return;

    try {
      const newTask = await createTask(goalId, { title: title.trim(), progress: 0, status: 'Pending' });
      
      // Update local state
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            tasks: [...(g.tasks || []), newTask]
          };
        }
        return g;
      }));
      
      setNewTaskTitles(prev => ({ ...prev, [goalId]: '' }));
    } catch (err) {
      console.error('Failed to add task:', err);
      alert('Failed to add action item.');
    }
  };

  const handleToggleTaskStatus = async (goalId, task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const nextProgress = nextStatus === 'Completed' ? 100 : task.progress;
    
    setUpdatingTaskId(task.id);
    try {
      const updated = await updateTask(goalId, task.id, { status: nextStatus, progress: nextProgress });
      
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            tasks: g.tasks.map(t => t.id === task.id ? updated : t)
          };
        }
        return g;
      }));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleTaskProgressChange = async (goalId, taskId, newProgress) => {
    const nextStatus = newProgress === 100 ? 'Completed' : 'In Progress';
    
    try {
      const updated = await updateTask(goalId, taskId, { progress: newProgress, status: nextStatus });
      
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            tasks: g.tasks.map(t => t.id === taskId ? updated : t)
          };
        }
        return g;
      }));
    } catch (err) {
      console.error('Failed to update task progress:', err);
    }
  };

  const handleDeleteTask = async (goalId, taskId) => {
    if (!window.confirm("Are you sure you want to delete this action item?")) return;
    
    try {
      await deleteTask(goalId, taskId);
      
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            tasks: g.tasks.filter(t => t.id !== taskId)
          };
        }
        return g;
      }));
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete action item.');
    }
  };

  // --- Weight & Personal Notes Operations ---
  const handleSaveSettings = async (goalId) => {
    setError(null);
    const weight = parseInt(editableWeights[goalId]);
    const notes = editableNotes[goalId];

    if (isNaN(weight) || weight < 10 || weight > 100) {
      setError('Goal weightage must be at least 10% and maximum 100% per guidelines.');
      return;
    }

    setSavingSettingsId(goalId);
    try {
      await updatePersonalNotesWeight(goalId, { weight, personal_notes: notes });
      
      // Update local state
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          return { ...g, weight, personal_notes: notes };
        }
        return g;
      }));

      setSuccessMessage('Weightage and personal notes saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.detail || 'Failed to update weightage and notes.');
    } finally {
      setSavingSettingsId(null);
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
          <p className="text-secondary font-body-lg text-sm mt-2">Manage your performance objectives, define action items, and log check-ins.</p>
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

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle size={20} />
          <p className="font-bold text-xs">{error}</p>
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

      {displayedGoals.length === 0 ? (
        /* Empty State */
        <div className="bg-surface p-16 sm:p-24 rounded-3xl shadow-[inset_6px_6px_12px_#AEAEC0,inset_-6px_-6px_12px_#FFFFFF] text-center border border-white/20">
          <div className="w-20 h-20 bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-full flex items-center justify-center text-secondary mx-auto mb-6 opacity-50">
            {activeTab === 'active' ? <Target size={40} /> : <FileText size={40} />}
          </div>
          <h3 className="text-2xl font-black text-on-surface mb-2">No Goals Found</h3>
          <p className="text-secondary mb-8 max-w-md mx-auto text-sm">
            {activeTab === 'active' 
              ? "You don't have any approved goals yet. Once your manager approves a pending goal, or assigns a Department KPI, it will show up here!"
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
        /* Goals List (Stacked/Accordion Layout is best to fit details and tasks perfectly!) */
        <div className="space-y-6">
          {displayedGoals.map((goal) => {
            const isShared = !!goal.shared_kpi_id;
            const isExpanded = expandedGoalId === goal.id;
            
            // For shared KPI, we read current achievement dynamically from parent SharedKPI
            const displayAchievement = isShared && goal.shared_kpi 
              ? goal.shared_kpi.current_achievement 
              : (goal.achievements?.[0]?.actual_value || 0.0);

            return (
              <div 
                key={goal.id} 
                className="bg-surface rounded-3xl border border-white/20 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] overflow-hidden transition-all"
              >
                
                {/* Header Row */}
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        {goal.thrust_area?.name || 'Department KPI'}
                      </span>
                      {isShared && (
                        <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Layers size={10} />
                          <span>Pushed Shared KPI</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-on-surface leading-snug flex items-center gap-2">
                      {goal.title}
                      {isShared && <Lock size={16} className="text-secondary/50" title="Core definition is read-only" />}
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">{goal.description}</p>
                  </div>

                  {/* Core KPI metrics indicators */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-surface-dim/40 px-4 py-2.5 rounded-2xl border border-white/10 text-center leading-none min-w-[70px]">
                      <span className="text-base font-black text-primary">{goal.weight}%</span>
                      <span className="block text-[8px] text-secondary uppercase font-bold tracking-widest mt-1">Weight</span>
                    </div>

                    <div className="bg-surface-dim/40 px-4 py-2.5 rounded-2xl border border-white/10 text-center leading-none min-w-[100px]">
                      <span className="text-base font-black text-on-surface">
                        {displayAchievement} / {goal.target}
                      </span>
                      <span className="block text-[8px] text-secondary uppercase font-bold tracking-widest mt-1">
                        Achievement {goal.uom !== 'Timeline' ? `(${goal.uom})` : ''}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Status</span>
                      <div className="flex items-center gap-1.5 bg-surface-dim/45 px-3 py-1.5 rounded-xl border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`}></div>
                        <span className="text-[10px] font-black text-on-surface uppercase tracking-wider">{goal.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Action Bar */}
                <div className="bg-surface-dim/15 px-8 py-3 flex justify-between items-center border-t border-surface-dim/40">
                  <button 
                    onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                    className="text-primary font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>{isExpanded ? 'Collapse Details' : 'Manage Tasks & Weights'}</span>
                  </button>

                  <div className="flex items-center gap-2 text-secondary/60 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar size={12} />
                    <span>Quarter timeline: {isShared && goal.shared_kpi ? goal.shared_kpi.timeline : goal.year}</span>
                  </div>
                </div>

                {/* Collapsed/Expanded Panel (Tasks & Personal Notes Weightage) */}
                {isExpanded && (
                  <div className="p-8 bg-surface-dim/5 border-t border-surface-dim/40 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
                    
                    {/* Left Panel: Weightage & Personal Notes */}
                    <div className="bg-surface p-6 rounded-2xl border border-white/20 shadow-sm space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-2 border-b border-surface-dim pb-2">
                          <Settings size={16} className="text-primary" />
                          <span>Goal Settings & Self Notes</span>
                        </h4>

                        {/* Adjust Weight */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between">
                            <label className="text-[9px] font-black text-secondary uppercase tracking-[0.15em]">Assign Weightage (%)</label>
                            <span className="text-xs font-bold text-primary">{editableWeights[goal.id]}%</span>
                          </div>
                          <input 
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            className="w-full accent-primary bg-surface-dim h-1.5 rounded-lg appearance-none cursor-pointer"
                            value={editableWeights[goal.id] || 10}
                            onChange={(e) => setEditableWeights({ ...editableWeights, [goal.id]: e.target.value })}
                          />
                          <span className="text-[8px] text-secondary font-medium leading-none">Guideline constraint: Minimum weightage is strictly 10%.</span>
                        </div>

                        {/* Personal Notes */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-secondary uppercase tracking-[0.15em]">Personal Evaluation Notes (HOW)</label>
                          <textarea 
                            rows={4}
                            placeholder="Add your execution plans, personal commitments, or notes here..."
                            className="w-full bg-surface py-2.5 px-3 rounded-xl border-none neumorphic-inset text-xs font-bold text-on-surface placeholder:text-secondary/40"
                            value={editableNotes[goal.id]}
                            onChange={(e) => setEditableNotes({ ...editableNotes, [goal.id]: e.target.value })}
                          />
                        </div>
                      </div>

                      <button 
                        disabled={savingSettingsId === goal.id}
                        onClick={() => handleSaveSettings(goal.id)}
                        className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-black text-[10px] uppercase tracking-widest shadow hover:scale-[1.02] transition-all disabled:opacity-50 mt-4"
                      >
                        {savingSettingsId === goal.id ? 'Saving settings...' : 'Save Settings'}
                      </button>
                    </div>

                    {/* Right Panel: Employee-Owned Individual Tasks (HOW) */}
                    <div className="bg-surface p-6 rounded-2xl border border-white/20 shadow-sm space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-2 border-b border-surface-dim pb-2">
                          <CheckSquare size={16} className="text-primary" />
                          <span>Individualized Action Items / Tasks</span>
                        </h4>

                        {/* Task List */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {goal.tasks && goal.tasks.length > 0 ? (
                            goal.tasks.map((task) => (
                              <div key={task.id} className="p-3 bg-surface rounded-xl border border-white/20 shadow-sm flex flex-col gap-2 transition-all">
                                <div className="flex justify-between items-center">
                                  <button 
                                    disabled={updatingTaskId === task.id}
                                    onClick={() => handleToggleTaskStatus(goal.id, task)}
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {task.status === 'Completed' ? (
                                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                    ) : (
                                      <Square size={16} className="text-secondary/60 shrink-0" />
                                    )}
                                    <span className={`text-xs font-bold text-on-surface ${task.status === 'Completed' ? 'line-through text-secondary/60' : ''}`}>
                                      {task.title}
                                    </span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTask(goal.id, task.id)}
                                    className="text-secondary/40 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                {/* Task progress slider */}
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    className="w-full accent-primary bg-surface-dim h-1 rounded appearance-none cursor-pointer"
                                    value={task.progress}
                                    onChange={(e) => handleTaskProgressChange(goal.id, task.id, parseInt(e.target.value))}
                                  />
                                  <span className="text-[10px] font-black text-primary shrink-0 min-w-[28px] text-right">
                                    {task.progress}%
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-secondary/70 italic text-xs">
                              No action items defined. Add your first task below to plan execution!
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Add Task Form */}
                      <div className="flex gap-2 border-t border-surface-dim pt-4 mt-2">
                        <input 
                          type="text"
                          placeholder="e.g. Conduct user research interviews"
                          className="flex-1 bg-surface py-2 px-3 rounded-xl border-none neumorphic-inset text-xs font-bold text-on-surface placeholder:text-secondary/40"
                          value={newTaskTitles[goal.id] || ''}
                          onChange={(e) => setNewTaskTitles({ ...newTaskTitles, [goal.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(goal.id)}
                        />
                        <button 
                          onClick={() => handleAddTask(goal.id)}
                          className="bg-primary hover:bg-primary-dark text-on-primary font-black px-4 rounded-xl shadow transition-all flex items-center justify-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
