import React from 'react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  return (
    <div className="flex min-h-screen">
      
<aside className="bg-surface dark:bg-surface text-primary dark:text-primary-fixed-dim font-body-md text-body-md shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] hidden lg:flex flex-col h-screen p-stack-md gap-stack-sm h-screen w-64 fixed left-0 top-0">
<div className="mb-stack-lg">
<h1 className="font-headline-md text-headline-md font-bold text-primary">FocusPortal</h1>
<p className="text-secondary mt-1">Goal Management</p>
</div>
<nav className="flex flex-col gap-2 flex-grow">
<a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all active:shadow-[inset_2px_2px_5px_#AEAEC0] transition-transform duration-150 flex items-center gap-3 p-3" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span>Dashboard</span>
</a>
<a className="bg-surface shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] text-primary font-bold rounded-xl active:shadow-[inset_2px_2px_5px_#AEAEC0] transition-transform duration-150 flex items-center gap-3 p-3" href="#">
<span className="material-symbols-outlined" data-icon="track_changes" style={{fontVariationSettings: "'FILL' 1"}}>track_changes</span>
<span>My Goals</span>
</a>
<a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all active:shadow-[inset_2px_2px_5px_#AEAEC0] transition-transform duration-150 flex items-center gap-3 p-3" href="#">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span>Team</span>
</a>
<a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all active:shadow-[inset_2px_2px_5px_#AEAEC0] transition-transform duration-150 flex items-center gap-3 p-3" href="#">
<span className="material-symbols-outlined" data-icon="insights">insights</span>
<span>Analytics</span>
</a>
</nav>
<button className="bg-primary text-on-primary font-bold py-3 px-4 rounded-xl shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] transition-all w-full flex items-center justify-center gap-2 mb-stack-md">
<span className="material-symbols-outlined">add</span>
            New Goal
        </button>
<div className="mt-auto flex flex-col gap-2">
<a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all active:shadow-[inset_2px_2px_5px_#AEAEC0] transition-transform duration-150 flex items-center gap-3 p-3" href="#">
<span className="material-symbols-outlined" data-icon="help">help</span>
<span>Help</span>
</a>
<a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all active:shadow-[inset_2px_2px_5px_#AEAEC0] transition-transform duration-150 flex items-center gap-3 p-3" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span>Logout</span>
</a>
</div>
</aside>
<main className="flex-1 lg:ml-64 p-container-padding max-w-[1140px] mx-auto w-full pb-24 lg:pb-container-padding">
<header className="flex justify-between items-center mb-stack-lg lg:hidden">
<h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">FocusPortal</h1>
<div className="flex items-center gap-4">
<button className="p-2 rounded-full shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] text-primary">
<span className="material-symbols-outlined">notifications</span>
</button>
</div>
</header>
<div className="flex justify-between items-end mb-stack-lg hidden lg:flex">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">My Goals</h2>
<p className="text-secondary font-body-lg text-body-lg">Track and manage your current objectives.</p>
</div>
<div className="flex items-center gap-4">
<div className="relative shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-xl bg-surface px-4 py-2 flex items-center w-64">
<span className="material-symbols-outlined text-secondary mr-2">search</span>
<input className="bg-transparent border-none focus:ring-0 text-on-surface w-full p-0 text-body-md placeholder:text-secondary-fixed-dim outline-none" placeholder="Search goals..." type="text"/>
</div>
<button className="p-3 rounded-xl shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] text-primary bg-surface transition-all">
<span className="material-symbols-outlined">filter_list</span>
</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
{/*  Goal Card 1  */}
<div className="bg-surface rounded-[16px] p-[24px] shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] flex flex-col gap-4">
<div className="flex justify-between items-start">
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-1">Q3 Objective</span>
<h3 className="font-headline-md text-headline-md text-on-surface">Increase User Retention</h3>
</div>
<span className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer active:shadow-[inset_2px_2px_5px_#AEAEC0] rounded-full p-1 transition-all">more_vert</span>
</div>
<p className="text-secondary text-sm line-clamp-2">Implement new onboarding flow and email nurture sequence to improve 30-day retention rate.</p>
<div className="flex items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary-container text-on-primary-container shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF]">
<span className="w-2 h-2 rounded-full bg-primary"></span>
                        On Track
                    </span>
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-error bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">
<span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        Due in 3 days
                    </span>
</div>
<div className="mt-auto pt-4 flex flex-col gap-2">
<div className="flex justify-between text-sm">
<span className="text-secondary">Progress</span>
<span className="font-bold text-primary">75%</span>
</div>
<div className="h-3 w-full bg-surface-container-high rounded-full shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] overflow-hidden">
<div className="h-full bg-primary shadow-[3px_3px_6px_#AEAEC0] rounded-full w-[75%]"></div>
</div>
<div className="flex justify-between text-xs text-secondary mt-1">
<span>Current: 45%</span>
<span>Target: 60%</span>
</div>
</div>
</div>
{/*  Goal Card 2  */}
<div className="bg-surface rounded-[16px] p-[24px] shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] flex flex-col gap-4">
<div className="flex justify-between items-start">
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-1">Annual Goal</span>
<h3 className="font-headline-md text-headline-md text-on-surface">Launch V2 API</h3>
</div>
<span className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer active:shadow-[inset_2px_2px_5px_#AEAEC0] rounded-full p-1 transition-all">more_vert</span>
</div>
<p className="text-secondary text-sm line-clamp-2">Complete documentation, beta testing, and public release of the new REST API.</p>
<div className="flex items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-tertiary-container text-on-tertiary-container shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF]">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        Pending Approval
                    </span>
</div>
<div className="mt-auto pt-4 flex flex-col gap-2">
<div className="flex justify-between text-sm">
<span className="text-secondary">Progress</span>
<span className="font-bold text-primary">30%</span>
</div>
<div className="h-3 w-full bg-surface-container-high rounded-full shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] overflow-hidden">
<div className="h-full bg-primary shadow-[3px_3px_6px_#AEAEC0] rounded-full w-[30%]"></div>
</div>
<div className="flex justify-between text-xs text-secondary mt-1">
<span>Current: Alpha</span>
<span>Target: GA</span>
</div>
</div>
</div>
{/*  Goal Card 3  */}
<div className="bg-surface rounded-[16px] p-[24px] shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] flex flex-col gap-4">
<div className="flex justify-between items-start">
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-1">Q3 Objective</span>
<h3 className="font-headline-md text-headline-md text-on-surface">Reduce Churn Rate</h3>
</div>
<span className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer active:shadow-[inset_2px_2px_5px_#AEAEC0] rounded-full p-1 transition-all">more_vert</span>
</div>
<p className="text-secondary text-sm line-clamp-2">Identify key drop-off points and implement proactive customer success outreach.</p>
<div className="flex items-center gap-2 mt-2">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-surface text-secondary shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
                        Not Started
                    </span>
</div>
<div className="mt-auto pt-4 flex flex-col gap-2">
<div className="flex justify-between text-sm">
<span className="text-secondary">Progress</span>
<span className="font-bold text-primary">0%</span>
</div>
<div className="h-3 w-full bg-surface-container-high rounded-full shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] overflow-hidden">
<div className="h-full bg-primary shadow-[3px_3px_6px_#AEAEC0] rounded-full w-[0%]"></div>
</div>
<div className="flex justify-between text-xs text-secondary mt-1">
<span>Current: 5%</span>
<span>Target: &lt;2%</span>
</div>
</div>
</div>
</div>
</main>
{/*  Bottom Nav for Mobile  */}
<nav className="bg-surface dark:bg-surface text-primary dark:text-primary-fixed-dim font-label-caps text-label-caps shadow-[0px_-6px_12px_#AEAEC0] lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface px-4 py-3 docked full-width bottom-0 rounded-t-xl">
<a className="flex flex-col items-center justify-center text-secondary-container active:scale-95 transition-transform active:shadow-inner" href="#">
<span className="material-symbols-outlined" data-icon="home">home</span>
<span>Home</span>
</a>
<a className="flex flex-col items-center justify-center text-primary bg-surface-container shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-xl px-4 py-2 active:scale-95 transition-transform active:shadow-inner" href="#">
<span className="material-symbols-outlined" data-icon="ads_click" style={{fontVariationSettings: "'FILL' 1"}}>ads_click</span>
<span>Goals</span>
</a>
<a className="flex flex-col items-center justify-center text-secondary-container active:scale-95 transition-transform active:shadow-inner" href="#">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span>Team</span>
</a>
<a className="flex flex-col items-center justify-center text-secondary-container active:scale-95 transition-transform active:shadow-inner" href="#">
<span className="material-symbols-outlined" data-icon="person">person</span>
<span>Profile</span>
</a>
</nav>

    </div>
  );
}
