import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';

export default function MyGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { response, data } = await apiClient('/goals');
      if (response.ok) setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-container-padding">
      <div className="max-w-5xl mx-auto">
        <header className="mb-stack-lg flex justify-between items-end">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">My Goals</h1>
            <p className="text-secondary">A consolidated view of your submitted performance objectives.</p>
          </div>
          <a href="/employee/goals/create" className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
            + New Goal
          </a>
        </header>

        {loading ? (
          <div className="text-center py-20 text-secondary">Loading your goals...</div>
        ) : goals.length === 0 ? (
          <div className="bg-surface p-20 rounded-2xl neumorphic-outset text-center">
            <span className="material-symbols-outlined text-6xl text-secondary mb-4 opacity-30">track_changes</span>
            <p className="text-secondary font-headline-md text-headline-md">No goals found.</p>
            <p className="text-secondary mb-8">You haven't submitted any goals for this period yet.</p>
            <a href="/employee/goals/create" className="text-primary font-bold hover:underline">Start creating goals →</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-surface p-6 rounded-2xl neumorphic-outset flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">{goal.thrust_area?.name}</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{goal.title}</h3>
                  </div>
                  <span className="bg-surface shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] px-3 py-1 rounded-full font-bold text-primary">
                    {goal.weight}%
                  </span>
                </div>
                <p className="text-secondary text-sm">{goal.description}</p>
                <div className="mt-auto pt-4 border-t border-surface-dim flex justify-between items-center">
                  <span className="text-xs text-secondary">Created on {new Date(goal.created_at).toLocaleDateString()}</span>
                  <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-1 rounded shadow-sm">SUBMITTED</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
