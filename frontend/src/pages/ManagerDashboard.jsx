import React from 'react';

export default function ManagerDashboard() {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding h-16 bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">
        <div className="flex items-center gap-stack-sm lg:hidden">
          <span className="material-symbols-outlined text-primary cursor-pointer">menu</span>
        </div>
        <div className="font-headline-md text-headline-md font-bold text-primary">
          FocusPortal
        </div>
        <div className="flex items-center gap-stack-sm text-primary">
          <span className="material-symbols-outlined cursor-pointer hover:bg-surface-container-low transition-all duration-300 p-2 rounded-full active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF]">notifications</span>
          <span className="material-symbols-outlined cursor-pointer hover:bg-surface-container-low transition-all duration-300 p-2 rounded-full active:shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF]">settings</span>
          <img 
            alt="User profile" 
            className="w-8 h-8 rounded-full shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWTaIB2DR0b1TfRy5-IyDvCt0XGY-RLmsiUhmpqHJEc05kbC3MdZJU5IbsajbZGfloidi-HhrSYVzEe24Rd4ca8C-igpxjHTmkC7IMFtjd-jZNkfi-MDAtVteiNAkHdJDkORoeRYpxx8iVxREnhKVDASO3ouBOZGwg1BVNGQzVt_XbhymoTHq4xdf-IizXrLciDyeA96ctwO3WCj9CwuYR4QWJCvKhlBRQkLKr4il32KU2vPQ8Ge5wSSHPG1Zh0ZhazV9oxEam0uE"
          />
        </div>
      </header>

      <div className="flex pt-16 h-screen overflow-hidden">
        {/* SideNavBar */}
        <nav className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 pt-20 p-stack-md gap-stack-sm bg-surface shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] z-40">
          <div className="flex flex-col mb-stack-md">
            <span className="font-headline-md text-headline-md font-bold text-primary">FocusPortal</span>
            <span className="text-secondary font-body-md text-body-md">Goal Management</span>
          </div>
          <button className="bg-primary text-on-primary font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] hover:shadow-[8px_8px_16px_#AEAEC0,-8px_-8px_16px_#FFFFFF] transition-all active:shadow-[inset_2px_2px_5px_#AEAEC0] mb-stack-sm">
            <span className="material-symbols-outlined">add</span> New Goal
          </button>
          <div className="flex flex-col gap-2 flex-grow">
            <a className="bg-surface shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] text-primary font-bold rounded-xl py-3 px-4 flex items-center gap-3" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span> Dashboard
            </a>
            <a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all py-3 px-4 flex items-center gap-3" href="#">
              <span className="material-symbols-outlined">track_changes</span> My Goals
            </a>
            <a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all py-3 px-4 flex items-center gap-3" href="#">
              <span className="material-symbols-outlined">group</span> Team
            </a>
            <a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all py-3 px-4 flex items-center gap-3" href="#">
              <span className="material-symbols-outlined">insights</span> Analytics
            </a>
          </div>
          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-surface-dim">
            <a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all py-3 px-4 flex items-center gap-3" href="#">
              <span className="material-symbols-outlined">help</span> Help
            </a>
            <a className="text-secondary hover:text-primary hover:shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] rounded-xl transition-all py-3 px-4 flex items-center gap-3" href="#">
              <span className="material-symbols-outlined">logout</span> Logout
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-64 p-container-padding overflow-y-auto pb-24 lg:pb-container-padding">
          <div className="max-w-[1140px] mx-auto">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-md">Team Dashboard</h1>
            
            {/* Top Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
              {/* Overall Completion */}
              <div className="bg-surface rounded-xl p-stack-md shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] col-span-1 md:col-span-2 flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-headline-md text-secondary mb-2">Overall Team Completion</h2>
                  <p className="font-headline-lg text-headline-lg text-primary">68%</p>
                </div>
                <div className="relative w-24 h-24 shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-full flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e2e9ec" strokeWidth="10"></circle>
                    <circle 
                      className="transition-all duration-1000 ease-out" 
                      cx="50" cy="50" fill="transparent" r="40" 
                      stroke="#536251" strokeDasharray="251.2" 
                      strokeDashoffset="80.38" strokeWidth="10"
                    ></circle>
                  </svg>
                  <span className="font-headline-md text-headline-md text-primary relative z-10">68%</span>
                </div>
              </div>

              {/* Alerts Widget */}
              <div className="bg-surface rounded-xl p-stack-md shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] flex flex-col justify-between">
                <h2 className="font-headline-md text-headline-md text-secondary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">warning</span> Action Needed
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-lg">
                    <span className="font-body-md text-body-md text-on-surface-variant">Pending Approvals</span>
                    <span className="bg-error text-on-error font-label-caps text-label-caps px-2 py-1 rounded-full shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">4</span>
                  </div>
                  <div className="flex items-center justify-between p-3 shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-lg">
                    <span className="font-body-md text-body-md text-on-surface-variant">Overdue Check-ins</span>
                    <span className="bg-surface-tint text-on-primary font-label-caps text-label-caps px-2 py-1 rounded-full shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Goals List */}
            <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">Team Goals Overview</h2>
            <div className="flex flex-col gap-stack-md">
              {/* Goal Item: Pending Approval */}
              <div className="bg-surface rounded-xl p-stack-md shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <img 
                      alt="Sarah J." 
                      className="w-12 h-12 rounded-full shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0jT0TpxC6TdWtHDhz3vfXJNC7gqARD3wWn-EA2PGWm2hEHWPXrIzffrqsVnDj6NwdudxJqQPorWM97nSnqD1RXw1QSnL6yaTNFJu2z96gEHMey1XweMZsK-4uz2yGmmxkwQrM3rjUFaGMDTXk7CKYFlktK0hJrLA2KuuL0FIXyYHjAsorkPscFg6NddDF3Cv6ni_4mxYcTUoQE4fScF2aegMzLwfNfK4iNcwK-q6b--1dcFH3PthsQZJUvRJwhY-XrB6Tj97ybdI"
                    />
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">Increase Q3 Sales by 15%</h3>
                      <p className="font-body-md text-body-md text-secondary">Sarah J. • Sales Team</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-label-caps text-label-caps shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF]">Pending Approval</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="font-body-md text-body-md text-on-surface-variant">Targeting new enterprise clients in the APAC region to boost overall quarterly revenue.</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-end mt-4 pt-4 border-t border-surface-dim">
                  <button className="px-6 py-2 bg-surface text-secondary font-label-caps text-label-caps rounded-lg shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_3px_3px_7px_#AEAEC0] flex items-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-sm">close</span> Reject
                  </button>
                  <button className="px-6 py-2 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_3px_3px_7px_#AEAEC0] flex items-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-sm">check</span> Approve
                  </button>
                </div>
              </div>

              {/* Goal Item: In Progress / At Risk */}
              <div className="bg-surface rounded-xl p-stack-md shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <img 
                      alt="David M." 
                      className="w-12 h-12 rounded-full shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7dyuMCxlqNzPc1AbKKXBNI5YEvupqMYDGo1Io7Gk9GWGrufUROEleN8HgqNfA7ZwAVXHkSsPUQ9ohbPuFiYpQTRsbE0R09ysMfGpEB0AXyzw3CnnRR5hhMHZqte3tVLEiz1WSDYNpFJcCOM4N0UNJancyk-mKAJXBw_7gGc-DGonLurRV2zWOtDgbo5H1HyZUANrzB0dS-9laWky2_QoYM8nqN_raTEx6EcVA8jonS1DgblaiEUdOfUVSwO1A2t9O-ZQxIAEnorE"
                    />
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">Launch New Marketing Campaign</h3>
                      <p className="font-body-md text-body-md text-secondary">David M. • Marketing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-error-container text-on-error-container rounded-full font-label-caps text-label-caps shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span> At Risk
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between font-label-caps text-label-caps text-secondary mb-2">
                    <span>Progress</span>
                    <span>45%</span>
                  </div>
                  <div className="h-4 w-full shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-full overflow-hidden">
                    <div className="h-full bg-error rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-surface-dim">
                  <button className="px-6 py-2 bg-surface text-primary font-label-caps text-label-caps rounded-lg shadow-[6px_6px_12px_#AEAEC0,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_3px_3px_7px_#AEAEC0] transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* BottomNavBar */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface px-4 py-3 shadow-[0px_-6px_12px_#AEAEC0]">
        <div className="flex flex-col items-center justify-center text-primary bg-surface-container shadow-[inset_2px_2px_5px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] rounded-xl px-4 py-2 font-label-caps text-label-caps active:scale-95 transition-transform">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span>Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center text-secondary font-label-caps text-label-caps active:scale-95 transition-transform">
          <span className="material-symbols-outlined mb-1">track_changes</span>
          <span>Goals</span>
        </div>
        <div className="flex flex-col items-center justify-center text-secondary font-label-caps text-label-caps active:scale-95 transition-transform">
          <span className="material-symbols-outlined mb-1">groups</span>
          <span>Team</span>
        </div>
        <div className="flex flex-col items-center justify-center text-secondary font-label-caps text-label-caps active:scale-95 transition-transform">
          <span className="material-symbols-outlined mb-1">person</span>
          <span>Profile</span>
        </div>
      </nav>
    </div>
  );
}
