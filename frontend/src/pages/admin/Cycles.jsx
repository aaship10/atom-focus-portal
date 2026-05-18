import React, { useState, useEffect } from 'react';
import { getCycles, createCycle, updateCycle, activateCycle } from '../../api/admin';
import { 
  RotateCw, 
  Plus, 
  Calendar, 
  Play, 
  Check, 
  AlertCircle, 
  X, 
  Clock 
} from 'lucide-react';

export default function CycleManagement() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [quarter, setQuarter] = useState('Q1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [goalSettingStart, setGoalSettingStart] = useState('');
  const [goalSettingEnd, setGoalSettingEnd] = useState('');
  const [checkinStart, setCheckinStart] = useState('');
  const [checkinEnd, setCheckinEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCycles();
  }, []);

  async function loadCycles() {
    try {
      setLoading(true);
      const data = await getCycles();
      setCycles(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load cycles.');
    } finally {
      setLoading(false);
    }
  }

  const triggerFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        quarter,
        year: parseInt(year),
        goal_setting_start: goalSettingStart ? new Date(goalSettingStart).toISOString() : null,
        goal_setting_end: goalSettingEnd ? new Date(goalSettingEnd).toISOString() : null,
        checkin_start: checkinStart ? new Date(checkinStart).toISOString() : null,
        checkin_end: checkinEnd ? new Date(checkinEnd).toISOString() : null,
      };

      await createCycle(payload);
      triggerFeedback(`Successfully created cycle ${quarter} ${year}!`);
      setShowAddForm(false);
      
      // Reset form
      setGoalSettingStart('');
      setGoalSettingEnd('');
      setCheckinStart('');
      setCheckinEnd('');

      loadCycles();
    } catch (err) {
      triggerFeedback(err.message || 'Failed to create cycle.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (cycleId, q, y) => {
    if (!window.confirm(`Are you sure you want to activate ${q} ${y}? This will close all other active cycles.`)) {
      return;
    }
    try {
      await activateCycle(cycleId);
      triggerFeedback(`Successfully activated quarterly cycle ${q} ${y}!`);
      loadCycles();
    } catch (err) {
      triggerFeedback(err.message || 'Failed to activate cycle.', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Configured';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && cycles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-secondary font-bold">Synchronizing Cycle Configurations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-container-padding transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Feedback Toast */}
        {feedback && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${
            feedback.type === 'error' 
              ? 'bg-error-container text-on-error-container border border-error/20' 
              : 'bg-surface border-2 border-success text-success neumorphic-outset'
          }`}>
            {feedback.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
            <span className="text-xs font-bold">{feedback.message}</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-stack-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Cycle Management</h1>
            <p className="text-secondary font-body-lg text-body-lg">Establish goals & check-in capture windows for the organization.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary neumorphic-button hover:bg-primary/95"
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            {showAddForm ? 'Cancel Creation' : 'New Cycle'}
          </button>
        </header>

        {/* Add Cycle Form */}
        {showAddForm && (
          <div className="bg-surface p-6 rounded-2xl neumorphic-outset mb-stack-md animate-fade-in">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Create New Goal Cycle</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary uppercase">Quarter</label>
                <select 
                  value={quarter} 
                  onChange={(e) => setQuarter(e.target.value)}
                  className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                >
                  <option value="Q1">Q1 (July - September)</option>
                  <option value="Q2">Q2 (October - December)</option>
                  <option value="Q3">Q3 (January - February)</option>
                  <option value="Q4">Q4 (March - April)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary uppercase">Calendar Year</label>
                <input 
                  type="number" 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                  min="2020" 
                  max="2035"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary uppercase">Goal Setting Opens</label>
                <input 
                  type="datetime-local" 
                  value={goalSettingStart}
                  onChange={(e) => setGoalSettingStart(e.target.value)}
                  className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary uppercase">Goal Setting Closes</label>
                <input 
                  type="datetime-local" 
                  value={goalSettingEnd}
                  onChange={(e) => setGoalSettingEnd(e.target.value)}
                  className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary uppercase">Check-In Opens</label>
                <input 
                  type="datetime-local" 
                  value={checkinStart}
                  onChange={(e) => setCheckinStart(e.target.value)}
                  className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary uppercase">Check-In Closes</label>
                <input 
                  type="datetime-local" 
                  value={checkinEnd}
                  onChange={(e) => setCheckinEnd(e.target.value)}
                  className="p-3 bg-surface rounded-xl neumorphic-inset text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 rounded-xl font-bold bg-surface text-secondary border border-surface-dim neumorphic-button hover:bg-surface-dim/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-bold bg-primary text-on-primary neumorphic-button flex items-center gap-2 hover:bg-primary/95 disabled:opacity-60"
                >
                  {submitting ? 'Setting up...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cycles List */}
        <div className="space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <RotateCw size={20} className="text-primary" />
            Configured Governance Cycles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {cycles.map((c) => {
              const isActive = c.status === 'Active';
              return (
                <div 
                  key={c.id} 
                  className={`bg-surface p-6 rounded-2xl neumorphic-outset border-2 transition-all relative ${
                    isActive 
                      ? 'border-success shadow-[0_0_15px_rgba(5,150,105,0.15)] bg-success/[0.01]' 
                      : 'border-transparent'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    {isActive ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                        Active Cycle
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-surface-dim text-secondary text-[10px] font-black uppercase tracking-wider">
                        Closed
                      </span>
                    )}
                  </div>

                  {/* Quarter & Year */}
                  <div className="mb-4">
                    <span className="text-secondary font-label-caps text-label-caps tracking-widest block uppercase">Quarterly Window</span>
                    <h3 className="text-2xl font-black text-on-surface tracking-tight mt-0.5">
                      {c.quarter} - {c.year}
                    </h3>
                  </div>

                  {/* Date Config Ranges */}
                  <div className="space-y-3.5 border-t border-surface-dim/40 pt-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-primary mt-1 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-secondary uppercase leading-none mb-1">Goal Setting Phase</span>
                        <span className="text-xs font-bold text-on-surface">
                          {formatDate(c.goal_setting_start)} — {formatDate(c.goal_setting_end)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-primary mt-1 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-secondary uppercase leading-none mb-1">Quarterly Check-In Window</span>
                        <span className="text-xs font-bold text-on-surface">
                          {formatDate(c.checkin_start)} — {formatDate(c.checkin_end)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isActive && (
                    <button
                      onClick={() => handleActivate(c.id, c.quarter, c.year)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold bg-surface border border-surface-dim text-primary neumorphic-button hover:bg-surface-dim/20"
                    >
                      <Play size={14} className="fill-primary" />
                      Activate This Cycle
                    </button>
                  )}
                </div>
              );
            })}
            
            {cycles.length === 0 && (
              <div className="col-span-2 bg-surface p-12 rounded-2xl neumorphic-outset text-center text-secondary italic">
                No governance cycles configured yet. Click "New Cycle" at the top right to get started.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
