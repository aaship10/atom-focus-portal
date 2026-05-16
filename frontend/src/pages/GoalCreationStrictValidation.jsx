import React from 'react';

export default function GoalCreationStrictValidation() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen">
      <main className="max-w-[800px] mx-auto pt-12 px-gutter pb-24">
        <header className="flex items-center gap-4 mb-stack-md">
          <button 
            aria-label="Go back" 
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary shadow-[-2px_-2px_5px_#FFFFFF,2px_2px_5px_#AEAEC0] active:shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Phase 2: Goal Creation</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Define actionable metrics for your focus area.</p>
          </div>
        </header>

        <div className="flex flex-wrap gap-6 mb-stack-lg p-6 bg-surface rounded-xl shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface shadow-[-2px_-2px_5px_#FFFFFF,2px_2px_5px_#AEAEC0] flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">flag</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Capacity</p>
              <p className="font-headline-md text-headline-md text-on-surface">Goal 4 of 8 max</p>
            </div>
          </div>
          <div className="h-10 w-px bg-surface-variant hidden sm:block"></div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-end mb-2">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Weight Allocation</p>
              <p className="font-headline-md text-headline-md text-primary">85%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-surface shadow-[inset_-1px_-1px_3px_#FFFFFF,inset_2px_2px_4px_#AEAEC0] overflow-hidden">
              <div className="h-full bg-primary w-[85%] rounded-full"></div>
            </div>
          </div>
        </div>

        <form className="bg-surface shadow-[-6px_-6px_12px_#FFFFFF,6px_6px_12px_#AEAEC0] rounded-[16px] p-container-padding sm:p-8">
          <div className="flex flex-col gap-stack-md">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-base ml-1">Thrust Area</label>
              <div className="relative">
                <select className="w-full appearance-none bg-surface text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 border-none outline-none shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-shadow">
                  <option disabled="" selected="" value="">Select an area</option>
                  <option value="sales">Sales</option>
                  <option value="innovation">Innovation</option>
                  <option value="operations">Operations</option>
                  <option value="customer_success">Customer Success</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-base ml-1">Title</label>
              <input 
                className="w-full bg-surface text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 border-none outline-none shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-shadow placeholder:text-outline-variant" 
                placeholder="e.g., Increase Q3 Recurring Revenue" 
                type="text"
              />
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-base ml-1">Description</label>
              <textarea 
                className="w-full bg-surface text-on-surface font-body-md text-body-md rounded-lg px-4 py-3 border-none outline-none shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-shadow resize-none placeholder:text-outline-variant" 
                placeholder="Provide context or specific initiatives..." 
                rows="3"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-base ml-1">Unit of Measure (UoM)</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-surface text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 border-none outline-none shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-shadow">
                    <option value="numeric">Numeric</option>
                    <option value="percent">%</option>
                    <option value="timeline">Timeline</option>
                    <option value="zero">Zero</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-base ml-1">Target</label>
                <input 
                  className="w-full bg-surface text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 border-none outline-none shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-shadow placeholder:text-outline-variant" 
                  placeholder="0.00" 
                  type="number"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2 pr-0 sm:pr-3">
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-base ml-1">Weight (%)</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface text-on-surface font-body-lg text-body-lg rounded-lg px-4 py-3 border-none outline-none shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] focus:ring-2 focus:ring-error focus:ring-opacity-50 transition-shadow text-error" 
                  type="number" 
                  defaultValue="5"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-error pointer-events-none">error</span>
              </div>
              <p className="font-body-md text-body-md text-error mt-2 flex items-center gap-1 ml-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Rule 1: Weight must be at least 10%.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-surface shadow-[inset_0px_1px_2px_#AEAEC0] my-stack-md mt-10"></div>

          <div className="flex items-center justify-end gap-4">
            <button 
              className="px-6 py-3 font-label-caps text-label-caps uppercase text-on-surface-variant rounded-lg hover:shadow-[-2px_-2px_5px_#FFFFFF,2px_2px_5px_#AEAEC0] active:shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_#AEAEC0] transition-all" 
              type="button"
            >
              Cancel
            </button>
            <button 
              className="px-8 py-3 font-label-caps text-label-caps uppercase rounded-lg bg-surface text-outline-variant cursor-not-allowed shadow-[inset_-1px_-1px_2px_#FFFFFF,inset_1px_1px_2px_#AEAEC0] opacity-70 flex items-center gap-2" 
              disabled 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Goal
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
