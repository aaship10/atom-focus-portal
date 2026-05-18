import React, { useState, useEffect } from 'react';
import { getTeamData } from '../../api/manager';
import { 
  createSharedKPI, 
  fetchSharedKPIs, 
  updateSharedKPIProgress, 
  fetchLinkedEmployeeGoals 
} from '../../api/goals';
import { 
  Target, 
  Users, 
  Plus, 
  Sliders, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Percent, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function SharedGoals() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [sharedKPIs, setSharedKPIs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Expanded KPI details state
  const [expandedKpiId, setExpandedKpiId] = useState(null);
  const [linkedGoals, setLinkedGoals] = useState([]);
  const [loadingLinked, setLoadingLinked] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    uom: 'Percentage (%)',
    timeline: 'Q1 2026',
    department: 'Sales',
    default_weight: 10,
    assigned_employee_ids: []
  });
  const [assignMethod, setAssignMethod] = useState('department'); // 'department' or 'specific'

  // Sync / Achievement update state
  const [updatingKpiId, setUpdatingKpiId] = useState(null);
  const [tempAchievements, setTempAchievements] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const kpis = await fetchSharedKPIs();
      setSharedKPIs(kpis);
      const team = await getTeamData();
      setTeamMembers(team);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load shared KPIs and team details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKPI = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.target || !formData.timeline) {
      setError('Title, Target, and Timeline are required fields.');
      return;
    }

    if (formData.default_weight < 10) {
      setError('Minimum default weightage must be 10% per guidelines.');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        target: parseFloat(formData.target),
        uom: formData.uom,
        timeline: formData.timeline,
        department: formData.department,
        default_weight: parseInt(formData.default_weight),
        assigned_employee_ids: assignMethod === 'specific' ? formData.assigned_employee_ids : null
      };

      await createSharedKPI(payload);
      setSuccess('Shared KPI created and assigned successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        target: '',
        uom: 'Percentage (%)',
        timeline: 'Q1 2026',
        department: 'Sales',
        default_weight: 10,
        assigned_employee_ids: []
      });
      
      // Reload and switch tab
      await loadData();
      setActiveTab('list');
    } catch (err) {
      console.error('Error creating KPI:', err);
      setError('Failed to create Shared KPI. Make sure the target is numeric.');
    }
  };

  const toggleKPIExpand = async (kpiId) => {
    if (expandedKpiId === kpiId) {
      setExpandedKpiId(null);
      setLinkedGoals([]);
      return;
    }

    setExpandedKpiId(kpiId);
    setLoadingLinked(true);
    try {
      const goals = await fetchLinkedEmployeeGoals(kpiId);
      setLinkedGoals(goals);
    } catch (err) {
      console.error('Error loading linked goals:', err);
    } finally {
      setLoadingLinked(false);
    }
  };

  const handleUpdateProgress = async (kpiId) => {
    const val = tempAchievements[kpiId];
    if (val === undefined || val === '') return;

    setUpdatingKpiId(kpiId);
    try {
      await updateSharedKPIProgress(kpiId, parseFloat(val));
      
      // Update local state
      setSharedKPIs(prev => prev.map(k => {
        if (k.id === kpiId) {
          return { ...k, current_achievement: val };
        }
        return k;
      }));

      // If this KPI is currently expanded, refresh linked goals to reflect updated progress
      if (expandedKpiId === kpiId) {
        const updatedGoals = await fetchLinkedEmployeeGoals(kpiId);
        setLinkedGoals(updatedGoals);
      }

      setSuccess('Shared KPI progress updated. All assigned employee goals synchronized!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress.');
    } finally {
      setUpdatingKpiId(null);
    }
  };

  const handleCheckboxChange = (employeeId) => {
    setFormData(prev => {
      const list = prev.assigned_employee_ids.includes(employeeId)
        ? prev.assigned_employee_ids.filter(id => id !== employeeId)
        : [...prev.assigned_employee_ids, employeeId];
      return { ...prev, assigned_employee_ids: list };
    });
  };

  return (
    <div className="w-full animate-in fade-in duration-500 px-4 md:px-8 py-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-headline-lg text-4xl font-black text-on-surface tracking-tight leading-none flex items-center gap-3">
            <Layers className="text-primary" size={32} />
            <span>Shared & Department KPIs</span>
          </h1>
          <p className="text-secondary font-body-lg text-sm mt-2">
            Pushed objectives defined by Managers, where employees manage their own execution tasks.
          </p>
        </div>
        
        {/* Tab Controls */}
        <div className="flex bg-surface-dim/40 p-1.5 rounded-2xl border border-white/20 shadow-inner">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'list' 
                ? 'bg-surface text-primary shadow' 
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <ClipboardList size={16} />
            <span>Active KPIs</span>
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'create' 
                ? 'bg-surface text-primary shadow' 
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <Plus size={16} />
            <span>Create & Assign KPI</span>
          </button>
        </div>
      </header>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 size={20} />
          <p className="font-bold text-xs">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle size={20} />
          <p className="font-bold text-xs">{error}</p>
        </div>
      )}

      {/* Tab 1: KPIs Dashboard */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-secondary">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold animate-pulse text-xs uppercase tracking-widest">Loading department KPIs...</p>
            </div>
          ) : sharedKPIs.length === 0 ? (
            <div className="bg-surface p-16 rounded-3xl shadow-[inset_6px_6px_12px_#AEAEC0,inset_-6px_-6px_12px_#FFFFFF] text-center border border-white/20">
              <Target size={48} className="text-secondary/40 mx-auto mb-4" />
              <h3 className="text-xl font-black text-on-surface mb-2">No Shared KPIs Active</h3>
              <p className="text-secondary text-sm max-w-md mx-auto mb-6">
                You haven't defined any shared departmental KPIs or goals yet. Get started by defining key organizational targets.
              </p>
              <button 
                onClick={() => setActiveTab('create')}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-lg hover:scale-105 transition-all"
              >
                Create First Shared KPI
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sharedKPIs.map((kpi) => {
                const isExpanded = expandedKpiId === kpi.id;
                
                return (
                  <div 
                    key={kpi.id} 
                    className="bg-surface rounded-3xl border border-white/20 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] overflow-hidden transition-all duration-300"
                  >
                    {/* KPI Main Card Content */}
                    <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-surface-dim/40">
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Department: {kpi.department}
                          </span>
                          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} />
                            {kpi.timeline}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-on-surface leading-tight">{kpi.title}</h3>
                        <p className="text-secondary text-sm leading-relaxed">{kpi.description || 'No description provided.'}</p>
                      </div>

                      {/* Achievement Tracker Interface */}
                      <div className="bg-surface-dim/35 p-6 rounded-2xl border border-white/10 shadow-inner flex flex-col md:flex-row items-center gap-6 min-w-[320px]">
                        <div className="text-center md:text-left flex flex-col">
                          <span className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Shared Achievement</span>
                          <span className="text-3xl font-black text-primary mt-1.5">
                            {kpi.current_achievement} / {kpi.target} 
                            <span className="text-xs text-secondary font-medium ml-1.5">{kpi.uom.replace(/\([^)]*\)/, '')}</span>
                          </span>
                        </div>
                        
                        {/* Quick Update Progress Input */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <input 
                            type="number"
                            step="any"
                            placeholder="Val"
                            className="w-20 bg-surface py-2.5 px-3 rounded-xl border-none neumorphic-inset text-xs font-bold text-center text-on-surface"
                            value={tempAchievements[kpi.id] !== undefined ? tempAchievements[kpi.id] : kpi.current_achievement}
                            onChange={(e) => setTempAchievements({ ...tempAchievements, [kpi.id]: e.target.value })}
                          />
                          <button 
                            disabled={updatingKpiId === kpi.id}
                            onClick={() => handleUpdateProgress(kpi.id)}
                            className="bg-primary hover:bg-primary-dark text-on-primary font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
                          >
                            {updatingKpiId === kpi.id ? 'Syncing...' : 'Sync'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Drill-down Toggle Footer */}
                    <div className="bg-surface-dim/15 px-8 py-3 flex justify-between items-center">
                      <button 
                        onClick={() => toggleKPIExpand(kpi.id)}
                        className="text-secondary hover:text-primary font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span>{isExpanded ? 'Hide Employee Progress' : 'View Assigned Employee Progress'}</span>
                      </button>
                      
                      <div className="text-secondary/60 text-[10px] font-bold uppercase tracking-wider">
                        Linked Employee Goals & Action Items
                      </div>
                    </div>

                    {/* Drill-down Content */}
                    {isExpanded && (
                      <div className="p-8 bg-surface-dim/10 border-t border-surface-dim/40 space-y-6">
                        {loadingLinked ? (
                          <div className="flex items-center gap-2 justify-center py-6 text-secondary animate-pulse text-xs font-bold uppercase tracking-widest">
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Loading linked employee goals...</span>
                          </div>
                        ) : linkedGoals.length === 0 ? (
                          <p className="text-secondary text-center text-xs font-bold uppercase tracking-widest py-4">
                            No employees assigned to this Shared KPI yet.
                          </p>
                        ) : (
                          <div className="space-y-6">
                            <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider border-b border-surface-dim pb-2 flex items-center gap-2">
                              <Users size={16} className="text-primary" />
                              <span>Assigned Team Contributions ({linkedGoals.length})</span>
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {linkedGoals.map((goal) => (
                                <div key={goal.id} className="bg-surface p-6 rounded-2xl shadow border border-white/20 flex flex-col justify-between space-y-4">
                                  {/* Employee details & weightage */}
                                  <div className="flex justify-between items-start border-b border-surface-dim pb-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-black text-xs flex items-center justify-center shadow">
                                        {goal.owner?.name?.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-sm text-on-surface">{goal.owner?.name}</span>
                                        <span className="text-[10px] text-secondary">{goal.owner?.email}</span>
                                      </div>
                                    </div>
                                    <div className="bg-surface-dim px-3 py-1.5 rounded-xl text-center leading-none border border-white/10">
                                      <span className="font-black text-xs text-primary">{goal.weight}%</span>
                                      <span className="block text-[7px] text-secondary uppercase font-bold tracking-widest mt-0.5">Weight</span>
                                    </div>
                                  </div>

                                  {/* Personal notes */}
                                  <div>
                                    <span className="text-[8px] font-black text-secondary uppercase tracking-widest block mb-1">Employee Personal Notes</span>
                                    <p className="text-xs text-secondary italic leading-relaxed bg-surface-dim/40 p-2.5 rounded-xl border border-white/5">
                                      {goal.personal_notes || "No personal notes provided yet."}
                                    </p>
                                  </div>

                                  {/* Task list summary (what the employee added) */}
                                  <div className="space-y-2">
                                    <span className="text-[8px] font-black text-secondary uppercase tracking-widest block">Individualized Action Items (HOW)</span>
                                    {goal.tasks && goal.tasks.length > 0 ? (
                                      <div className="space-y-1.5">
                                        {goal.tasks.map((task) => (
                                          <div key={task.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-surface-dim/30 border border-white/5">
                                            <div className="flex items-center gap-2 max-w-[70%]">
                                              <div className={`w-1.5 h-1.5 rounded-full ${
                                                task.status?.toLowerCase() === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                              }`}></div>
                                              <span className="font-bold text-on-surface truncate">{task.title}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                                              {task.progress}%
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block italic py-2">
                                        Employee has not defined action items yet.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Create Shared KPI Form */}
      {activeTab === 'create' && (
        <div className="bg-surface rounded-3xl p-8 border border-white/20 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-on-surface tracking-tight mb-8 border-b border-surface-dim pb-4 flex items-center gap-2">
            <Target className="text-primary" size={24} />
            <span>Define Shared Departmental KPI</span>
          </h2>

          <form onSubmit={handleCreateKPI} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Goal Title */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Goal Title *</label>
                <input 
                  type="text"
                  placeholder="e.g. Improve Customer Satisfaction"
                  required
                  className="w-full bg-surface py-3 px-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Goal Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Description / Alignment details</label>
                <textarea 
                  placeholder="e.g. Enhance front-line support operations to reach a higher satisfaction score."
                  rows={3}
                  className="w-full bg-surface py-3 px-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Target Score */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Target Achievement Value *</label>
                <input 
                  type="number"
                  step="any"
                  placeholder="e.g. 90.00"
                  required
                  className="w-full bg-surface py-3 px-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                />
              </div>

              {/* Measurement Type (UOM) */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Measurement Type (UOM) *</label>
                <select 
                  className="w-full bg-surface p-3 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                >
                  <option value="Percentage (%)">Percentage (%)</option>
                  <option value="Numeric (#)">Numeric (#)</option>
                  <option value="Currency ($)">Currency ($)</option>
                  <option value="Timeline">Timeline</option>
                </select>
              </div>

              {/* Timeline / Quarter */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Timeline / Target Quarter *</label>
                <select 
                  className="w-full bg-surface p-3 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                >
                  <option value="Q1 2026">Q1 2026</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q4 2026">Q4 2026</option>
                </select>
              </div>

              {/* Default Weightage */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Default Weightage (% - Min 10%) *</label>
                <input 
                  type="number"
                  min={10}
                  max={100}
                  required
                  className="w-full bg-surface py-3 px-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
                  value={formData.default_weight}
                  onChange={(e) => setFormData({ ...formData, default_weight: e.target.value })}
                />
              </div>

              {/* Department */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Target Department *</label>
                <select 
                  className="w-full bg-surface p-3 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary text-sm font-bold text-on-surface"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* Assignment Mode */}
              <div className="flex flex-col gap-3 md:col-span-2 border-t border-surface-dim pt-6 mt-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Assignees selection method</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setAssignMethod('department')}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
                      assignMethod === 'department'
                        ? 'bg-primary text-on-primary shadow-lg scale-102'
                        : 'bg-surface text-secondary border border-white/20 neumorphic-outset'
                    }`}
                  >
                    <Layers size={16} />
                    <span>Assign to all in Department</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAssignMethod('specific')}
                    className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
                      assignMethod === 'specific'
                        ? 'bg-primary text-on-primary shadow-lg scale-102'
                        : 'bg-surface text-secondary border border-white/20 neumorphic-outset'
                    }`}
                  >
                    <Users size={16} />
                    <span>Select Specific Employees</span>
                  </button>
                </div>
              </div>

              {/* Specific Employees Multi-Select */}
              {assignMethod === 'specific' && (
                <div className="flex flex-col gap-3 md:col-span-2 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Select Employees ({formData.assigned_employee_ids.length} selected)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2 bg-surface-dim/20 rounded-2xl border border-white/5">
                    {teamMembers.length === 0 ? (
                      <span className="text-xs text-secondary font-bold p-4 text-center col-span-2">No reporting team members found.</span>
                    ) : (
                      teamMembers.map(member => {
                        const isSelected = formData.assigned_employee_ids.includes(member.id);
                        return (
                          <div 
                            key={member.id}
                            onClick={() => handleCheckboxChange(member.id)}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary/40 shadow-inner'
                                : 'bg-surface border-white/20 shadow hover:border-primary/20'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              isSelected ? 'bg-primary border-primary text-on-primary' : 'border-secondary/40'
                            }`}>
                              {isSelected && <CheckSquare size={12} />}
                            </div>
                            <div className="flex flex-col leading-none">
                              <span className="font-bold text-xs text-on-surface">{member.name}</span>
                              <span className="text-[8px] text-secondary mt-0.5">{member.email}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Action buttons */}
            <div className="border-t border-surface-dim pt-6 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-6 py-3 rounded-2xl bg-surface text-secondary font-bold text-xs neumorphic-outset hover:scale-105 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                Create and Assign Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
