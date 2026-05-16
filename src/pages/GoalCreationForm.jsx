import React from 'react';
import { Link } from 'react-router-dom';

export default function GoalCreationForm() {
  return (
    <div className="flex min-h-screen">
      
{/*  SideNavBar (Desktop)  */}
<nav className="hidden lg:flex flex-col h-screen p-stack-md gap-stack-sm bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] w-64 fixed left-0 top-0 z-40">
<div className="flex items-center gap-4 mb-stack-lg">
<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center neu-outset">
<span className="material-symbols-outlined text-on-primary" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>target</span>
</div>
<div>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FocusPortal</h1>
<p className="font-label-caps text-label-caps text-secondary">Goal Management</p>
</div>
</div>
<div className="flex flex-col gap-2 flex-grow">
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] transition-all font-body-md text-body-md" href="#">
<span className="material-symbols-outlined">dashboard</span>
                Dashboard
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] text-primary font-bold font-body-md text-body-md" href="#">
<span className="material-symbols-outlined">track_changes</span>
                My Goals
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] transition-all font-body-md text-body-md" href="#">
<span className="material-symbols-outlined">group</span>
                Team
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] transition-all font-body-md text-body-md" href="#">
<span className="material-symbols-outlined">insights</span>
                Analytics
            </a>
</div>
<button className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline-md text-headline-md neu-btn mb-stack-md flex items-center justify-center gap-2">
<span className="material-symbols-outlined">add</span>
            New Goal
        </button>
<div className="flex flex-col gap-2 mt-auto">
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] transition-all font-body-md text-body-md" href="#">
<span className="material-symbols-outlined">help</span>
                Help
            </a>
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] transition-all font-body-md text-body-md" href="#">
<span className="material-symbols-outlined">logout</span>
                Logout
            </a>
</div>
</nav>
{/*  TopAppBar (Mobile)  */}
<header className="lg:hidden fixed top-0 w-full z-50 flex justify-between items-center px-container-padding h-16 bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">
<h1 className="font-headline-md text-headline-md font-bold text-primary">FocusPortal</h1>
<div className="flex gap-4">
<button className="text-primary active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] p-2 rounded-full transition-all duration-200">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-primary active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] p-2 rounded-full transition-all duration-200">
<span className="material-symbols-outlined">settings</span>
</button>
</div>
</header>
{/*  BottomNavBar (Mobile)  */}
<nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface px-4 py-3 shadow-[0px_-6px_12px_#AEAEC0] rounded-t-xl">
<a className="flex flex-col items-center justify-center text-secondary-container active:scale-95 transition-transform font-label-caps text-label-caps" href="#">
<span className="material-symbols-outlined mb-1">home</span>
            Home
        </a>
<a className="flex flex-col items-center justify-center text-primary bg-surface-container shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-xl px-4 py-2 font-label-caps text-label-caps" href="#">
<span className="material-symbols-outlined mb-1" style={{fontVariationSettings: "'FILL' 1"}}>ads_click</span>
            Goals
        </a>
<a className="flex flex-col items-center justify-center text-secondary-container active:scale-95 transition-transform font-label-caps text-label-caps" href="#">
<span className="material-symbols-outlined mb-1">groups</span>
            Team
        </a>
<a className="flex flex-col items-center justify-center text-secondary-container active:scale-95 transition-transform font-label-caps text-label-caps" href="#">
<span className="material-symbols-outlined mb-1">person</span>
            Profile
        </a>
</nav>
{/*  Main Content Canvas  */}
<main className="flex-1 w-full lg:ml-64 pt-24 pb-24 lg:pt-container-padding lg:pb-container-padding px-4 md:px-container-padding max-w-[1140px] mx-auto min-h-screen flex items-center justify-center">
{/*  Goal Creation Form Container  */}
<div className="w-full max-w-2xl bg-surface rounded-[24px] p-6 md:p-10 neu-inset">
<div className="mb-8">
<h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Create New Goal</h2>
<p className="font-body-md text-body-md text-secondary">Define objectives and key results for the upcoming cycle.</p>
</div>
<form className="space-y-stack-md">
{/*  Thrust Area Dropdown  */}
<div className="flex flex-col gap-2">
<label className="font-headline-md text-body-lg text-on-surface" htmlFor="thrust_area">Thrust Area</label>
<div className="relative">
<select className="neu-input w-full rounded-xl py-3 px-4 font-body-md text-body-md text-on-surface appearance-none focus:ring-0" id="thrust_area">
<option disabled="" selected="" value="">Select an area of focus</option>
<option value="growth">Revenue Growth</option>
<option value="product">Product Innovation</option>
<option value="customer">Customer Success</option>
<option value="operational">Operational Excellence</option>
</select>
<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-secondary">
<span className="material-symbols-outlined">expand_more</span>
</div>
</div>
</div>
{/*  Title Input  */}
<div className="flex flex-col gap-2">
<label className="font-headline-md text-body-lg text-on-surface" htmlFor="goal_title">Title</label>
<input className="neu-input w-full rounded-xl py-3 px-4 font-body-md text-body-md text-on-surface focus:ring-0" id="goal_title" placeholder="e.g., Increase Q3 ARR by 15%" type="text"/>
</div>
{/*  Description Input  */}
<div className="flex flex-col gap-2">
<label className="font-headline-md text-body-lg text-on-surface" htmlFor="goal_description">Description</label>
<textarea className="neu-input w-full rounded-xl py-3 px-4 font-body-md text-body-md text-on-surface focus:ring-0 resize-none" id="goal_description" placeholder="Briefly describe the objective and its strategic importance..." rows="3"></textarea>
</div>
{/*  Metrics Row  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/*  UoM Dropdown  */}
<div className="flex flex-col gap-2">
<label className="font-headline-md text-body-lg text-on-surface" htmlFor="uom">Unit of Measurement</label>
<div className="relative">
<select className="neu-input w-full rounded-xl py-3 px-4 font-body-md text-body-md text-on-surface appearance-none focus:ring-0" id="uom">
<option value="numeric">Numeric</option>
<option value="percentage">% Percentage</option>
<option value="timeline">Timeline</option>
<option value="zero">Zero/Boolean</option>
</select>
<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-secondary">
<span className="material-symbols-outlined">expand_more</span>
</div>
</div>
</div>
{/*  Target Input  */}
<div className="flex flex-col gap-2">
<label className="font-headline-md text-body-lg text-on-surface" htmlFor="target_value">Target</label>
<input className="neu-input w-full rounded-xl py-3 px-4 font-body-md text-body-md text-on-surface focus:ring-0 text-right" id="target_value" placeholder="0.00" type="number"/>
</div>
{/*  Weight Input  */}
<div className="flex flex-col gap-2">
<label className="font-headline-md text-body-lg text-on-surface" htmlFor="weight">Weight (%)</label>
<input className="neu-input w-full rounded-xl py-3 px-4 font-body-md text-body-md text-on-surface focus:ring-0 text-right" id="weight" placeholder="15" type="number"/>
</div>
</div>
{/*  Validation UI  */}
<div className="p-4 rounded-xl bg-surface-container-high neu-outset mt-8">
<div className="flex justify-between items-center mb-2">
<span className="font-headline-md text-body-md text-on-surface">Portfolio Weight Allocation</span>
<span className="font-label-caps text-label-caps text-primary">Goal 4 of 8 max</span>
</div>
{/*  Progress Bar (Simulating 85% full)  */}
<div className="w-full h-4 rounded-full neu-inset overflow-hidden">
<div className="h-full bg-primary rounded-full relative shadow-[6px_0px_6px_rgba(0,0,0,0.1)]" style={{width: "85%"}}></div>
</div>
<div className="flex justify-between mt-2 font-body-md text-body-md text-secondary">
<span>Current Total: 85%</span>
<span>15% Remaining</span>
</div>
{/*  Example Error State (Hidden by default, shown here for demonstration)  */}
{/*  
                    <div className="mt-3 flex items-center gap-2 text-error font-body-md text-body-md bg-error-container p-2 rounded-lg neu-inset">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        <span>Total weight cannot exceed 100%. Please adjust this or other goals.</span>
                    </div> 
                     */}
</div>
{/*  Actions  */}
<div className="flex justify-end gap-4 pt-6">
<button className="px-6 py-3 rounded-xl text-secondary font-headline-md text-body-lg hover:text-primary transition-colors" type="button">
                        Cancel
                    </button>
<button className="px-8 py-3 rounded-xl bg-primary text-on-primary font-headline-md text-body-lg neu-btn flex items-center gap-2" type="submit">
                        Save Goal
                        <span className="material-symbols-outlined text-[20px]">check</span>
</button>
</div>
</form>
</div>
</main>

    </div>
  );
}
