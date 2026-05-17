import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGoal } from '../../api/goals';
import { Check, Info } from 'lucide-react';

export default function GoalCreation() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thrust_area_id: '',
    uom: 'Min',
    target: '',
    weight: '',
    year: new Date().getFullYear()
  });
  const [submitNow, setSubmitNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to parse JWT and get user ID
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id; // Corrected from payload.sub to match backend security.py
    } catch (e) {
      return null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) {
      alert("Session expired. Please login again.");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await createGoal({
        ...formData,
        owner_id: userId,
        target: parseFloat(formData.target),
        weight: parseInt(formData.weight),
        submit_now: submitNow
      });
      navigate('/employee/goals/my-goals');
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert(error.response?.data?.detail || 'Failed to save goal. Please check weights and totals.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 px-40">
      <header className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Create New Goal</h1>
        <p className="text-secondary font-body-lg text-body-lg">Define your objectives and key results for the upcoming performance cycle.</p>
      </header>

      <div className="bg-surface rounded-3xl p-8 md:p-12 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20 w-full max-w-5xl">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thrust Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1" htmlFor="thrust_area">Thrust Area</label>
              <div className="relative">
                <select 
                  className="w-full bg-surface p-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold appearance-none text-on-surface"
                  value={formData.thrust_area_id}
                  onChange={(e) => setFormData({...formData, thrust_area_id: e.target.value})}
                  required
                >
                  <option value="">Select an area of focus</option>
                  <option value="1">Sales & Revenue</option>
                  <option value="2">Product Innovation</option>
                  <option value="3">Customer Excellence</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1" htmlFor="title">Goal Title</label>
              <input 
                className="w-full bg-surface p-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold text-on-surface placeholder:text-secondary/50"
                placeholder="e.g., Increase User Retention"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Goal Description</label>
            <textarea 
              className="w-full bg-surface p-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold text-on-surface placeholder:text-secondary/50 min-h-[120px]"
              placeholder="Detail the strategy and expected impact..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Unit of Measurement</label>
              <div className="relative">
                <select 
                  className="w-full bg-surface p-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold appearance-none text-on-surface"
                  value={formData.uom}
                  onChange={(e) => setFormData({...formData, uom: e.target.value})}
                >
                  <option value="Min">Numeric (Higher is better)</option>
                  <option value="Max">Numeric (Lower is better)</option>
                  <option value="Timeline">Timeline (Date-based)</option>
                  <option value="Zero">Zero (Zero is success)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Target Value</label>
              <input 
                type={formData.uom === 'Timeline' ? 'date' : 'number'}
                className="w-full bg-surface p-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold text-on-surface"
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Weight (%)</label>
              <div className="relative">
                <input 
                  type="number"
                  className="w-full bg-surface p-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold text-on-surface pr-10"
                  placeholder="10"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary font-bold">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Year</label>
              <input 
                type="number"
                className="w-full bg-surface p-4 rounded-2xl border-none neumorphic-inset focus:ring-2 focus:ring-primary transition-all font-bold text-on-surface"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          {/* Allocation Bar */}
          <div className="p-6 rounded-2xl bg-surface shadow-inner border border-white/10 mt-12">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Portfolio Weight Allocation</span>
                <Info size={14} className="text-secondary" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Target: 100%</span>
            </div>
            <div className="h-4 w-full bg-surface-dim rounded-full shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] overflow-hidden p-1">
              <div 
                className="h-full bg-primary rounded-full shadow-[2px_0_4px_rgba(var(--primary-rgb),0.3)] transition-all duration-700"
                style={{ width: `${Math.min(formData.weight || 0, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigate('/employee/dashboard')}
              className="px-8 py-3 rounded-xl font-bold text-secondary hover:text-primary transition-all text-sm"
            >
              Cancel
            </button>
            
            {/* Save as Draft */}
            <button 
              type="submit"
              disabled={loading}
              onClick={() => setSubmitNow(false)}
              className="px-6 py-3 rounded-xl bg-surface border border-surface-dim hover:border-primary text-secondary hover:text-primary font-bold neumorphic-outset transition-all disabled:opacity-50 text-sm"
            >
              Save as Draft
            </button>
            
            {/* Submit for Approval */}
            <button 
              type="submit"
              disabled={loading}
              onClick={() => setSubmitNow(true)}
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-sm"
            >
              <span>{loading ? 'Submitting...' : 'Submit for Approval'}</span>
              {!loading && <Check size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
