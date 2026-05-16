import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Circle, 
  Save, 
  Calendar, 
  Info,
  TrendingUp,
  TrendingDown,
  Target as TargetIcon,
  ChevronRight,
  History
} from 'lucide-react';

import { fetchEmployeeGoals, logAchievement } from '../../api/goals';

export default function EmployeeQuarterlyCheckIn() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState("Q1");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingGoalId, setSavingGoalId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const years = [2025, 2026, 2027];

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  };

  const loadGoals = async () => {
    setLoading(true);
    const userId = getUserId();
    if (!userId) {
      setMessage({ type: 'error', text: 'Session expired. Please login again.' });
      setLoading(false);
      return;
    }

    try {
      // Fetch goals for the selected year
      const data = await fetchEmployeeGoals(userId);
      // Backend filtering by year is better, but let's ensure local filtering too
      const yearFiltered = data.filter(g => g.year === selectedYear);
      setGoals(yearFiltered);
    } catch (err) {
      console.error("Failed to load goals:", err);
      setMessage({ type: 'error', text: 'Failed to load your goals.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [selectedYear]);

  const calculateScore = (goal, valOverride) => {
    const { uom, target } = goal;
    const val = valOverride !== undefined ? parseFloat(valOverride) : 0;
    const targetVal = parseFloat(target);

    if (isNaN(val)) return 0;

    switch (uom) {
      case 'Min':
        if (targetVal === 0) return 0;
        return Math.min(((val / targetVal) * 100), 120).toFixed(1);
      case 'Max':
        if (val === 0) return targetVal > 0 ? 100 : 0;
        return Math.min(((targetVal / val) * 100), 120).toFixed(1);
      case 'Zero':
        return val === 0 ? 100 : 0;
      case 'Timeline':
        const actualDate = new Date(valOverride);
        const targetDate = new Date(target);
        return actualDate <= targetDate ? 100 : 0;
      default:
        return 0;
    }
  };

  const getAchievementForQuarter = (goal, quarter) => {
    return goal.achievements?.find(a => a.quarter === quarter);
  };

  const getLatestAchievementBefore = (goal, quarter) => {
    const qIndex = quarters.indexOf(quarter);
    if (qIndex === 0) return null;
    
    // Look backwards from the current quarter
    for (let i = qIndex - 1; i >= 0; i--) {
      const ach = getAchievementForQuarter(goal, quarters[i]);
      if (ach) return ach;
    }
    return null;
  };

  const isGoalCompletedInPast = (goal, currentQuarter) => {
    const qIndex = quarters.indexOf(currentQuarter);
    if (qIndex === 0) return false;

    for (let i = 0; i < qIndex; i++) {
      const ach = getAchievementForQuarter(goal, quarters[i]);
      // We check if status was set to 'Completed' in any previous achievement
      // or if the goal's overall status is 'Completed' and we are looking at a later quarter.
      // But status is on the Goal itself. So if it's 'Completed', it's completed for the year?
      // Usually, yes.
    }
    return goal.status === 'Completed' && qIndex > quarters.indexOf("Q1"); // Simplified for now
  };

  const handleUpdateLocalActual = (goalId, value) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, tempActual: value } : g));
  };

  const handleUpdateLocalStatus = (goalId, value) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, tempStatus: value } : g));
  };

  const handleSave = async (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    const actualValue = goal.tempActual !== undefined ? goal.tempActual : (getAchievementForQuarter(goal, selectedQuarter)?.actual_value || 0);
    const statusValue = goal.tempStatus || goal.status;

    setSavingGoalId(goalId);
    try {
      await logAchievement(goalId, {
        quarter: selectedQuarter,
        actual_value: actualValue,
        status: statusValue
      });
      setMessage({ type: 'success', text: `Updated "${goal.title}" for ${selectedQuarter}` });
      await loadGoals(); // Reload to get fresh data
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save progress.' });
    } finally {
      setSavingGoalId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-success" size={18} />;
      case 'On Track': return <Circle className="text-primary fill-primary/20" size={18} />;
      case 'Off Track': return <AlertTriangle className="text-error" size={18} />;
      default: return <Clock className="text-secondary" size={18} />;
    }
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-secondary font-bold animate-pulse">Loading Focus Portal...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-stack-md">
      {/* Header with Year Selector */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Quarterly Check-In</h1>
          <p className="text-secondary font-body-lg text-body-lg">Manage progress and rollovers across the fiscal year.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-surface p-2 rounded-2xl shadow-inner border border-white/10">
          <label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-2">Fiscal Year</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-transparent font-black text-primary focus:outline-none cursor-pointer pr-4"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* Quarter Tabs */}
      <div className="flex gap-2 p-1.5 bg-surface rounded-2xl shadow-inner border border-white/5 w-fit">
        {quarters.map(q => (
          <button
            key={q}
            onClick={() => setSelectedQuarter(q)}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              selectedQuarter === q 
              ? 'bg-primary text-on-primary shadow-lg scale-105' 
              : 'text-secondary hover:text-primary'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-gutter pb-20">
        {goals.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center shadow-inner border border-surface-dim">
            <TargetIcon size={48} className="mx-auto text-secondary opacity-20 mb-4" />
            <h3 className="text-xl font-bold text-secondary">No goals defined for {selectedYear}.</h3>
            <p className="text-sm text-secondary opacity-60">Switch years or create a new goal to begin.</p>
          </div>
        ) : goals.map((goal) => {
          const currentAchievement = getAchievementForQuarter(goal, selectedQuarter);
          const previousAchievement = getLatestAchievementBefore(goal, selectedQuarter);
          const isCompleted = goal.status === 'Completed';
          const isLocked = isGoalCompletedInPast(goal, selectedQuarter);
          
          const displayActual = goal.tempActual !== undefined ? goal.tempActual : (currentAchievement?.actual_value || '');
          const displayStatus = goal.tempStatus || goal.status;

          return (
            <div key={goal.id} className={`bg-surface rounded-2xl p-6 shadow-card border border-white/20 transition-all ${isLocked ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-lg'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Info Section */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-lg bg-surface shadow-inner text-primary">
                      <TargetIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-on-surface leading-tight">{goal.title}</h3>
                        {isLocked && <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[8px] font-bold uppercase tracking-widest border border-success/20">Rolled Over (Locked)</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-surface-variant text-secondary text-[10px] font-bold uppercase tracking-wider border border-surface-dim">UoM: {goal.uom}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">Weight: {goal.weight}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Historical Baseline */}
                  {previousAchievement && (
                    <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <History size={14} className="text-primary" />
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                        Baseline from {previousAchievement.quarter}: <span className="text-primary">{previousAchievement.actual_value}</span>
                      </span>
                    </div>
                  )}

                  <div className="p-3 neumorphic-inset rounded-xl">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Target for {selectedYear}</p>
                    <p className="text-sm font-black text-on-surface">
                      {goal.uom === 'Timeline' ? goal.target : parseFloat(goal.target).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Input Section */}
                <div className="lg:col-span-7 flex flex-col gap-6 lg:border-l lg:border-surface-dim lg:pl-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">{selectedQuarter} Actual Achievement</label>
                      <input 
                        type={goal.uom === 'Timeline' ? 'date' : 'number'}
                        disabled={isLocked || savingGoalId === goal.id}
                        className="w-full bg-surface p-3 rounded-xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold disabled:opacity-50"
                        value={displayActual}
                        onChange={(e) => handleUpdateLocalActual(goal.id, e.target.value)}
                        placeholder={previousAchievement ? `Current: ${previousAchievement.actual_value}` : "Enter value"}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Current Status</label>
                      <select 
                        disabled={isLocked || savingGoalId === goal.id}
                        className="w-full bg-surface p-3 rounded-xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold appearance-none disabled:opacity-50"
                        value={displayStatus}
                        onChange={(e) => handleUpdateLocalStatus(goal.id, e.target.value)}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="On Track">On Track</option>
                        <option value="Off Track">Off Track</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-dim">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{selectedQuarter} Score</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-black ${calculateScore(goal, displayActual) >= 100 ? 'text-success' : 'text-primary'}`}>
                            {calculateScore(goal, displayActual)}%
                          </span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(displayStatus)}
                            <span className="text-[10px] font-bold text-on-surface uppercase opacity-60">{displayStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isLocked && (
                      <button 
                        disabled={savingGoalId === goal.id}
                        onClick={() => handleSave(goal.id)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {savingGoalId === goal.id ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                        <span>{currentAchievement ? 'Update' : 'Save'} {selectedQuarter}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Helper */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 p-4 bg-surface/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl z-50">
        <Info size={20} className="text-primary" />
        <div className="text-[10px] font-bold text-secondary uppercase tracking-tight">
          Rollover Rule: Goals persist across quarters until marked <span className="text-success">Completed</span>.
        </div>
      </div>
    </div>
  );
}
