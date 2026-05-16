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
  Target as TargetIcon
} from 'lucide-react';

export default function EmployeeQuarterlyCheckIn() {
  const isWindowOpen = true; // Mock state for window status
  const currentQuarter = "Q1 (July - Sept)";

  const [goals, setGoals] = useState([
    { 
      id: 1, 
      title: "Increase Revenue", 
      uom: "Min", 
      target: 1000000, 
      weight: 40, 
      actual: 0, 
      status: "Not Started",
      deadline: "2026-09-30"
    },
    { 
      id: 2, 
      title: "Reduce Operational Cost", 
      uom: "Max", 
      target: 50000, 
      weight: 20, 
      actual: 0, 
      status: "On Track",
      deadline: "2026-09-30"
    },
    { 
      id: 3, 
      title: "Launch V2 Product", 
      uom: "Timeline", 
      target: "2026-08-15", 
      weight: 30, 
      actual: "", 
      status: "Off Track",
      deadline: "2026-08-15"
    },
    { 
      id: 4, 
      title: "Safety Incidents", 
      uom: "Zero", 
      target: 0, 
      weight: 10, 
      actual: 0, 
      status: "Completed",
      deadline: "2026-09-30"
    }
  ]);

  const calculateScore = (goal) => {
    const { uom, target, actual } = goal;
    const val = parseFloat(actual) || 0;
    const targetVal = parseFloat(target) || 0;

    switch (uom) {
      case 'Min':
        if (targetVal === 0) return 0;
        return Math.min(((val / targetVal) * 100), 120).toFixed(1); // Cap at 120% for UI
      case 'Max':
        if (val === 0) return targetVal > 0 ? 100 : 0;
        return Math.min(((targetVal / val) * 100), 120).toFixed(1);
      case 'Zero':
        return val === 0 ? 100 : 0;
      case 'Timeline':
        if (!actual) return 0;
        const actualDate = new Date(actual);
        const targetDate = new Date(target);
        return actualDate <= targetDate ? 100 : 0;
      default:
        return 0;
    }
  };

  const updateGoal = (id, field, value) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleLogAchievement = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    const score = calculateScore(goal);
    
    console.log("🚀 Achievement Logged:", {
      goalId,
      quarter: currentQuarter,
      actualValue: goal.actual,
      status: goal.status,
      calculatedScore: score,
      timestamp: new Date().toISOString()
    });
    
    alert(`Progress for "${goal.title}" saved successfully! Score: ${score}%`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-success" size={18} />;
      case 'On Track': return <Circle className="text-primary fill-primary/20" size={18} />;
      case 'Off Track': return <AlertTriangle className="text-error" size={18} />;
      default: return <Clock className="text-secondary" size={18} />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-stack-md">
      {/* Page Header */}
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Quarterly Check-In</h1>
        <p className="text-secondary font-body-lg text-body-lg">Log your achievements for the current period.</p>
      </header>

      {/* Window Status Banner */}
      <div className={`p-4 rounded-2xl flex items-center gap-4 border ${isWindowOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-surface-variant border-surface-dim text-secondary'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWindowOpen ? 'bg-primary text-on-primary shadow-lg animate-pulse' : 'bg-secondary text-on-secondary'}`}>
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider">{currentQuarter} Window {isWindowOpen ? 'Open' : 'Closed'}</h3>
          <p className="text-xs opacity-80">{isWindowOpen ? 'Achievement logging is active until the end of the month.' : 'Achievement logging is currently disabled.'}</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-gutter">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-surface rounded-2xl p-6 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20 transition-all hover:shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Read-only Goal Info (Col 1-5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-surface shadow-inner text-primary">
                    <TargetIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface leading-tight">{goal.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-surface-variant text-secondary text-[10px] font-bold uppercase tracking-wider border border-surface-dim flex items-center gap-1">
                        UoM: {goal.uom}
                        {goal.uom === 'Min' && <TrendingUp size={10} />}
                        {goal.uom === 'Max' && <TrendingDown size={10} />}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                        Weight: {goal.weight}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 neumorphic-inset rounded-xl">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Target</p>
                    <p className="text-sm font-black text-on-surface">
                      {goal.uom === 'Timeline' ? goal.target : goal.target.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 neumorphic-inset rounded-xl">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Deadline</p>
                    <p className="text-sm font-black text-on-surface">{goal.deadline}</p>
                  </div>
                </div>
              </div>

              {/* Achievement Input (Col 6-12) */}
              <div className="lg:col-span-7 flex flex-col gap-6 lg:border-l lg:border-surface-dim lg:pl-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Actual Achievement</label>
                    <div className="relative">
                      <input 
                        type={goal.uom === 'Timeline' ? 'date' : 'number'}
                        disabled={!isWindowOpen}
                        className={`w-full bg-surface p-3 rounded-xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold ${!isWindowOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={goal.actual}
                        onChange={(e) => updateGoal(goal.id, 'actual', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Current Status</label>
                    <select 
                      disabled={!isWindowOpen}
                      className={`w-full bg-surface p-3 rounded-xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold appearance-none ${!isWindowOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={goal.status}
                      onChange={(e) => updateGoal(goal.id, 'status', e.target.value)}
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
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Progress Score</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black ${calculateScore(goal) >= 100 ? 'text-success' : calculateScore(goal) > 50 ? 'text-primary' : 'text-error'}`}>
                          {calculateScore(goal)}%
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(goal.status)}
                          <span className="text-[10px] font-bold text-on-surface uppercase opacity-60">{goal.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={!isWindowOpen}
                    onClick={() => handleLogAchievement(goal.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg transition-all ${!isWindowOpen ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                  >
                    <Save size={18} />
                    <span>Update Goal</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Helper Info */}
      <div className="bg-surface p-4 rounded-xl border border-surface-dim flex gap-3 text-secondary italic text-xs">
        <Info size={16} className="shrink-0 text-primary" />
        <p>Your progress score is calculated automatically based on the Unit of Measurement (UoM). This score is used for performance tracking and is not the final appraisal result.</p>
      </div>
    </div>
  );
}
