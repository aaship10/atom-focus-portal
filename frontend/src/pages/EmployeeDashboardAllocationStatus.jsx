import React from 'react';

export default function EmployeeDashboardAllocationStatus() {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      {/* TopAppBar */}
      <header className="bg-surface text-primary font-headline-md text-headline-md w-full h-20 flex items-center shadow-[6px_6px_12px_#AEAEC0] fixed top-0 right-0 left-0 lg:left-64 z-30 px-gutter justify-between">
        <div className="flex items-center gap-4 lg:hidden">
          <span className="material-symbols-outlined text-primary text-2xl">menu</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">FocusPortal</span>
        </div>
        <div className="hidden lg:flex items-center gap-4 w-full max-w-md shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 w-full text-body-md font-body-md text-on-surface-variant outline-none" 
            placeholder="Search..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all duration-200">notifications</span>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all duration-200">help_outline</span>
          <div className="w-10 h-10 rounded-full shadow-[-2px_-2px_5px_#FFFFFF] shadow-[2px_2px_5px_#AEAEC0] overflow-hidden">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq5rQY0gEB6zn5Qx_H17VkSRhA0kB7TTV6lavkxAmQxfgxM-Op-fesiFIgEkRSzNv82blC6n74SGeKLRMcTtAaMJ3XDMN42asKOA5X49qegkhM_gpVcF1zHuft2D0DpbZM_Zwnvkh0dsIFufK92rBJ8Ip0Eb9QwrIF4lzqVVv4jwLgGxxQfu16n1fpomSls5xx_95qllP4YnN3NAaPvlXTXWqL7mvbjqNbbe2ONCA9DyWzN1dFuybgYgVb--qQlarXzzovUf_7Y7o"
            />
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="bg-surface h-screen w-64 flex-col hidden lg:flex fixed left-0 top-0 z-40 p-container-padding shadow-[-6px_-6px_12px_#FFFFFF] shadow-[6px_6px_12px_#AEAEC0]">
        <div className="mb-stack-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shadow-[-2px_-2px_5px_#FFFFFF] shadow-[2px_2px_5px_#AEAEC0] flex items-center justify-center bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined font-bold">radar</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">FocusPortal</h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant">Strategic Tracking</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <a className="text-on-surface-variant hover:text-primary transition-all duration-200 px-4 py-3 mx-2 flex items-center gap-3 rounded-lg hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0]" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </a>
          <a className="shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] text-primary font-bold rounded-lg px-4 py-3 mx-2 flex items-center gap-3" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
            <span className="font-body-md text-body-md">My Goals</span>
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-all duration-200 px-4 py-3 mx-2 flex items-center gap-3 rounded-lg hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0]" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-body-md text-body-md">Team</span>
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-all duration-200 px-4 py-3 mx-2 flex items-center gap-3 rounded-lg hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0]" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-body-md text-body-md">Analytics</span>
          </a>
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-surface-container-highest">
          <a className="text-on-surface-variant hover:text-primary transition-all duration-200 px-4 py-3 mx-2 flex items-center gap-3 rounded-lg hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0]" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-all duration-200 px-4 py-3 mx-2 flex items-center gap-3 rounded-lg hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0]" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md text-body-md">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-24 pb-20 lg:pb-8 lg:ml-64 min-h-screen p-container-padding max-w-[1140px] mx-auto">
        <div className="mb-stack-md">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Phase 2 Goals</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Manage your current objectives and weight allocation.</p>
        </div>

        <section className="bg-surface rounded-[16px] shadow-[-6px_-6px_12px_#FFFFFF] shadow-[6px_6px_12px_#AEAEC0] p-6 mb-stack-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Weight Allocation Status</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Distribute 100% across your active goals to submit for approval.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] flex items-center justify-center bg-surface">
                <div className="absolute inset-2 rounded-full border-4 border-surface-container-highest"></div>
                <div className="absolute inset-2 rounded-full border-4 border-primary border-t-transparent border-l-transparent border-r-transparent transform -rotate-45"></div>
                <div className="absolute inset-2 rounded-full border-4 border-primary border-t-transparent border-l-transparent border-b-transparent transform rotate-45"></div>
                <span className="font-headline-md text-headline-md font-bold text-primary z-10">85%</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 p-4 rounded-lg shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] bg-surface">
            <span className="material-symbols-outlined text-tertiary">warning</span>
            <p className="font-body-md text-body-md text-on-surface">Current Allocation: <span className="font-bold">85%</span>. You need <span className="text-tertiary font-bold">15%</span> more to reach 100%.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface rounded-[16px] shadow-[-6px_-6px_12px_#FFFFFF] shadow-[6px_6px_12px_#AEAEC0] p-6 flex flex-col h-full hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] flex items-center justify-center bg-surface text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              </div>
              <span className="font-label-caps text-label-caps px-3 py-1 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] text-primary">25%</span>
            </div>
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">Increase Q3 Revenue</h4>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Thrust Area: <span className="font-bold text-on-surface">Sales</span></p>
            <div className="mt-auto">
              <div className="flex justify-between text-body-md font-body-md mb-2">
                <span className="text-on-surface-variant">Target</span>
                <span className="font-bold text-on-surface">$1.2M</span>
              </div>
              <div className="h-3 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] bg-surface overflow-hidden">
                <div className="h-full bg-primary-container shadow-[-2px_-2px_5px_#FFFFFF] shadow-[2px_2px_5px_#AEAEC0] w-1/3 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-[16px] shadow-[-6px_-6px_12px_#FFFFFF] shadow-[6px_6px_12px_#AEAEC0] p-6 flex flex-col h-full hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] flex items-center justify-center bg-surface text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
              </div>
              <span className="font-label-caps text-label-caps px-3 py-1 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] text-primary">40%</span>
            </div>
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">Hire 5 Sr. Engineers</h4>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Thrust Area: <span className="font-bold text-on-surface">Recruitment</span></p>
            <div className="mt-auto">
              <div className="flex justify-between text-body-md font-body-md mb-2">
                <span className="text-on-surface-variant">Target</span>
                <span className="font-bold text-on-surface">5 Hires</span>
              </div>
              <div className="h-3 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] bg-surface overflow-hidden">
                <div className="h-full bg-primary-container shadow-[-2px_-2px_5px_#FFFFFF] shadow-[2px_2px_5px_#AEAEC0] w-3/5 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-[16px] shadow-[-6px_-6px_12px_#FFFFFF] shadow-[6px_6px_12px_#AEAEC0] p-6 flex flex-col h-full hover:shadow-[-2px_-2px_5px_#FFFFFF] hover:shadow-[2px_2px_5px_#AEAEC0] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] flex items-center justify-center bg-surface text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
              <span className="font-label-caps text-label-caps px-3 py-1 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] text-primary">20%</span>
            </div>
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">Launch v2.0 Platform</h4>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Thrust Area: <span className="font-bold text-on-surface">Product</span></p>
            <div className="mt-auto">
              <div className="flex justify-between text-body-md font-body-md mb-2">
                <span className="text-on-surface-variant">Target</span>
                <span className="font-bold text-on-surface">Oct 15</span>
              </div>
              <div className="h-3 rounded-full shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] bg-surface overflow-hidden">
                <div className="h-full bg-primary-container shadow-[-2px_-2px_5px_#FFFFFF] shadow-[2px_2px_5px_#AEAEC0] w-[85%] rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-[16px] shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] p-6 flex flex-col items-center justify-center h-full min-h-[240px] cursor-pointer hover:bg-surface-container-low transition-colors duration-200 border-2 border-dashed border-outline-variant">
            <div className="w-12 h-12 rounded-full shadow-[-6px_-6px_12px_#FFFFFF] shadow-[6px_6px_12px_#AEAEC0] flex items-center justify-center bg-primary text-on-primary mb-4">
              <span className="material-symbols-outlined font-bold">add</span>
            </div>
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Add New Goal</h4>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Allocate remaining 15%</p>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="bg-surface text-primary lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 shadow-[-6px_-6px_12px_#FFFFFF] shadow-[6px_6px_12px_#AEAEC0]">
        <a className="text-on-surface-variant p-2 flex flex-col items-center gap-1 scale-95 transition-transform" href="#">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-caps text-label-caps">Dashboard</span>
        </a>
        <a className="shadow-[inset_-2px_-2px_5px_#FFFFFF] shadow-[inset_3px_3px_7px_#AEAEC0] text-primary rounded-xl p-2 flex flex-col items-center gap-1 scale-95 transition-transform" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
          <span className="font-label-caps text-label-caps">Goals</span>
        </a>
        <a className="text-on-surface-variant p-2 flex flex-col items-center gap-1 scale-95 transition-transform" href="#">
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-caps text-label-caps">Team</span>
        </a>
        <a className="text-on-surface-variant p-2 flex flex-col items-center gap-1 scale-95 transition-transform" href="#">
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-caps text-label-caps">Analytics</span>
        </a>
      </nav>
    </div>
  );
}
