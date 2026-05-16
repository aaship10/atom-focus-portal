import React from 'react';

export default function EmployeeDashboard() {
  return (
    <div className="w-full">
      <header className="flex justify-between items-end mb-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 tracking-tight">My Progress</h1>
          <p className="text-secondary font-body-lg text-body-lg">Track and manage your current objectives.</p>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-xl bg-surface px-4 py-2 flex items-center w-64">
            <span className="material-symbols-outlined text-secondary mr-2">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 text-body-md placeholder:text-secondary-fixed-dim outline-none" 
              placeholder="Search goals..." 
              type="text"
            />
          </div>
          <button className="p-3 rounded-xl shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] text-primary bg-surface transition-all">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {/* Goal Card 1 */}
        <div className="bg-surface rounded-2xl p-6 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] flex flex-col gap-4 border border-white/20">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Q3 Objective</span>
              <h3 className="text-xl font-bold text-on-surface leading-tight">Increase User Retention</h3>
            </div>
            <span className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer active:shadow-[inset_2px_2px_5px_#AEAEC0] rounded-full p-1 transition-all">more_vert</span>
          </div>
          <p className="text-secondary text-sm leading-relaxed">Implement new onboarding flow and email nurture sequence to improve 30-day retention rate.</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              On Track
            </span>
          </div>
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-secondary">Progress</span>
              <span className="text-primary">75%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] overflow-hidden">
              <div className="h-full bg-primary shadow-[2px_0_4px_rgba(var(--primary-rgb),0.3)] rounded-full w-[75%] transition-all duration-1000 ease-out"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
