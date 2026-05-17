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
  const [bypassRestrictions, setBypassRestrictions] = useState(false);

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const years = [2025, 2026, 2027];

  const currentMonth = new Date().getMonth(); // 0-11
  
  const getActivePeriod = () => {
    if (currentMonth === 4 || currentMonth === 5) return 'Phase 1 — Goal Setting';
    if (currentMonth === 6 || currentMonth === 7 || currentMonth === 8) return 'Q1 Check-in';
    if (currentMonth === 9 || currentMonth === 10 || currentMonth === 11) return 'Q2 Check-in';
    if (currentMonth === 0 || currentMonth === 1) return 'Q3 Check-in';
    if (currentMonth === 2 || currentMonth === 3) return 'Q4 / Annual';
    return '';
  };

  const getQuarterWindowStatus = (quarter) => {
    switch (quarter) {
      case 'Q1':
        return {
          isOpen: currentMonth === 6 || currentMonth === 7 || currentMonth === 8,
          openMonth: 'July',
          months: 'July - September'
        };
      case 'Q2':
        return {
          isOpen: currentMonth === 9 || currentMonth === 10 || currentMonth === 11,
          openMonth: 'October',
          months: 'October - December'
        };
      case 'Q3':
        return {
          isOpen: currentMonth === 0 || currentMonth === 1,
          openMonth: 'January',
          months: 'January - February'
        };
      case 'Q4':
        return {
          isOpen: currentMonth === 2 || currentMonth === 3,
          openMonth: 'March / April',
          months: 'March - April'
        };
      default:
        return { isOpen: false, openMonth: '', months: '' };
    }
  };

  const windowStatus = getQuarterWindowStatus(selectedQuarter);
  const isWindowOpen = bypassRestrictions || windowStatus.isOpen;

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
      }, bypassRestrictions);
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
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header with Year Selector */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline-lg text-4xl font-black text-on-surface tracking-tight">Quarterly Check-In</h1>
          <p className="text-secondary font-medium mt-1">Manage progress and rollovers across the fiscal year.</p>
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

      {/* Check-in Schedule Card */}
      <div className="bg-surface rounded-3xl p-6 shadow-card border border-white/20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-on-surface flex items-center gap-2">
              <Calendar className="text-primary" size={22} />
              Check-in Window Schedule
            </h2>
            <p className="text-secondary text-xs font-medium mt-0.5">Enforced quarterly windows for goal setting and achievement capture.</p>
          </div>
          
          {/* Demo Bypass Switch */}
          <div className="flex items-center gap-3 bg-surface-dim p-2.5 rounded-xl border border-white/10 shadow-inner">
            <span className="text-[10px] font-black text-secondary uppercase tracking-wider">Demo Override Mode</span>
            <button 
              onClick={() => {
                setBypassRestrictions(!bypassRestrictions);
                setMessage({
                  type: 'success',
                  text: !bypassRestrictions ? 'Demo Override Mode Enabled: Achievement capture windows bypassed for all quarters.' : 'Demo Override Mode Disabled: Schedule window enforcement active.'
                });
                setTimeout(() => setMessage({ type: '', text: '' }), 4000);
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
            { id: 'Q1', label: 'Q1 Check-in', window: 'July', action: 'Planned vs. Actual', active: currentMonth === 6 || currentMonth === 7 || currentMonth === 8 },
            { id: 'Q2', label: 'Q2 Check-in', window: 'October', action: 'Planned vs. Actual', active: currentMonth === 9 || currentMonth === 10 || currentMonth === 11 },
            { id: 'Q3', label: 'Q3 Check-in', window: 'January', action: 'Planned vs. Actual', active: currentMonth === 0 || currentMonth === 1 },
            { id: 'Q4', label: 'Q4 / Annual', window: 'March / April', action: 'Final Achievement Capture', active: currentMonth === 2 || currentMonth === 3 }
          ].map((period) => (
            <div 
              key={period.id} 
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28 ${
                period.active 
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-lg ring-1 ring-primary/20' 
                  : 'bg-surface-dim border-surface-dim text-secondary opacity-70'
              }`}
            >
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider block ${period.active ? 'text-primary' : 'text-secondary'}`}>{period.label}</span>
                <p className="text-xs font-bold text-on-surface mt-1">{period.window}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold opacity-80">{period.action}</p>
                {period.active && (
                  <span className="inline-block px-1.5 py-0.5 rounded bg-primary text-[7px] font-black text-on-primary uppercase tracking-widest mt-1.5 animate-pulse">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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

      {!isWindowOpen && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <Info size={22} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-wider">Achievement Capture Locked</h4>
            <p className="text-xs font-semibold">
              The {selectedQuarter} check-in window is currently closed. Enforced window opens in <span className="font-black underline">{windowStatus.openMonth}</span> ({windowStatus.months}).
            </p>
            <p className="text-[10px] font-medium opacity-80">
              You can review saved Q1/Q2/Q3/Q4 achievements, but editing is disabled. Enable <span className="font-bold">Demo Override Mode</span> above to enter test data.
            </p>
          </div>
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
          const isLocked = isGoalCompletedInPast(goal, selectedQuarter) || !isWindowOpen;
          
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
                        {isLocked && (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                            isGoalCompletedInPast(goal, selectedQuarter) 
                              ? 'bg-success/10 text-success border-success/20' 
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}>
                            {isGoalCompletedInPast(goal, selectedQuarter) ? 'Rolled Over (Locked)' : 'Window Closed (Locked)'}
                          </span>
                        )}
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
