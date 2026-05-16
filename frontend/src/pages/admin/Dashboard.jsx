import React from 'react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '124' },
    { label: 'Active Goals', value: '452' },
    { label: 'Pending Reviews', value: '12' },
  ];

  return (
    <div className="min-h-screen bg-surface p-container-padding">
      <div className="max-w-6xl mx-auto">
        <header className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary">Admin Control Panel</h1>
          <p className="text-secondary font-body-lg text-body-lg">System-wide monitoring and management.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface p-8 rounded-2xl neumorphic-outset text-center">
              <p className="text-secondary font-label-caps text-label-caps mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="bg-surface p-6 rounded-2xl neumorphic-outset">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 neumorphic-inset rounded-xl">
                <span>Database Status</span>
                <span className="text-success font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center p-4 neumorphic-inset rounded-xl">
                <span>API Server</span>
                <span className="text-success font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Operational
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl neumorphic-outset">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Recent Audit Logs</h2>
            <div className="text-secondary text-sm italic">
              No recent critical events.
            </div>
          </div>
        </div>

        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          className="mt-12 px-8 py-3 rounded-xl bg-surface text-error font-bold neumorphic-outset hover:scale-105 active:scale-95 transition-all"
        >
          Logout Admin Session
        </button>
      </div>
    </div>
  );
}
