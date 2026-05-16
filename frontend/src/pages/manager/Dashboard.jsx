import React from 'react';

export default function ManagerDashboard() {
  return (
    <div className="w-full">
      <header className="mb-stack-lg">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Team Overview</h1>
        <p className="text-secondary font-body-lg text-body-lg">Monitor performance and approve objectives for your direct reports.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
        <div className="bg-surface rounded-2xl p-8 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] col-span-1 md:col-span-2 flex items-center justify-between border border-white/20">
          <div>
            <h2 className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Overall Team Completion</h2>
            <p className="text-5xl font-black text-primary tracking-tighter">68%</p>
            <p className="text-secondary text-sm mt-2 font-medium">↑ 12% from last quarter</p>
          </div>
          <div className="relative w-32 h-32 shadow-[inset_4px_4px_10px_#AEAEC0,inset_-4px_-4px_10px_#FFFFFF] rounded-full flex items-center justify-center border border-white/30">
            <span className="text-2xl font-black text-primary">68%</span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-8 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] flex flex-col justify-between border border-white/20">
          <h2 className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[18px]">warning</span> Action Needed
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 neumorphic-inset rounded-xl group cursor-pointer hover:shadow-md transition-all">
              <div className="flex flex-col">
                <span className="text-sm font-bold">Goal Approvals</span>
                <span className="text-[10px] text-secondary">4 employees waiting</span>
              </div>
              <span className="bg-error text-on-error px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg animate-bounce">4</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-on-surface font-bold uppercase tracking-[0.2em] text-[10px] mb-stack-sm flex items-center gap-2 ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Recent Activity
      </h2>
      <div className="bg-surface rounded-2xl p-12 shadow-[-6px_-6px_12px_#FFFFFF,6px_6px_12px_#AEAEC0] text-center border border-white/10">
        <p className="text-secondary font-medium">Team activity monitoring will appear here.</p>
      </div>
    </div>
  );
}
