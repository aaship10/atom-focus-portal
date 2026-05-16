import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployeeGoals } from '../../api/goals';
import { Target, Calendar, CheckCircle2, Plus } from 'lucide-react';

export default function MyGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        // We pass no ID to fetchEmployeeGoals because the backend 
        // defaults to the current authenticated user's ID from the token.
        const data = await fetchEmployeeGoals();
        setGoals(data);
      } catch (err) {
        console.error('Failed to fetch goals:', err);
        setError('Failed to load goals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-secondary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold animate-pulse">Fetching your performance goals...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-stack-md animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Goals</h1>
          <p className="text-secondary font-body-lg text-body-lg">A consolidated view of your submitted performance objectives.</p>
        </div>
        <button 
          onClick={() => navigate('/employee/goals/create')}
          className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          <span>New Goal</span>
        </button>
      </header>

      {error ? (
        <div className="bg-error/10 border border-error/20 p-6 rounded-2xl text-error flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center shadow-lg">!</div>
          <p className="font-bold">{error}</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-surface p-20 rounded-3xl shadow-[inset_6px_6px_12px_#AEAEC0,inset_-6px_-6px_12px_#FFFFFF] text-center border border-white/20">
          <div className="w-20 h-20 bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-full flex items-center justify-center text-secondary mx-auto mb-6 opacity-50">
            <Target size={40} />
          </div>
          <h3 className="text-2xl font-black text-on-surface mb-2">No Goals Found</h3>
          <p className="text-secondary mb-8 max-w-md mx-auto">You haven't defined any performance goals for the current cycle yet. Let's get started!</p>
          <button 
            onClick={() => navigate('/employee/goals/create')}
            className="text-primary font-bold hover:underline underline-offset-4 flex items-center gap-2 mx-auto transition-all"
          >
            Create your first goal now →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-surface p-8 rounded-3xl shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] border border-white/20 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{goal.thrust_area?.name || 'Thrust Area'}</span>
                  <h3 className="text-xl font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{goal.title}</h3>
                </div>
                <div className="bg-surface shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] px-4 py-2 rounded-2xl font-black text-primary flex flex-col items-center leading-none">
                  <span className="text-lg">{goal.weight}%</span>
                  <span className="text-[8px] uppercase tracking-widest opacity-60">Weight</span>
                </div>
              </div>

              <p className="text-secondary text-sm leading-relaxed mb-8 line-clamp-3">
                {goal.description || 'No description provided for this goal.'}
              </p>

              <div className="mt-auto pt-6 border-t border-surface-dim flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Target</span>
                    <span className="text-sm font-black text-on-surface">{goal.target} {goal.uom !== 'Timeline' ? goal.uom : ''}</span>
                  </div>
                  <div className="w-px h-8 bg-surface-dim mx-2"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Status</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                      <span className="text-xs font-black text-on-surface uppercase">{goal.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-secondary/60">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(goal.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
