import React from 'react';

export default function TeamList() {
  const team = [
    { id: '1', name: 'Sarah Johnson', role: 'Senior Developer', status: 'Pending Review' },
    { id: '2', name: 'David Miller', role: 'UI Designer', status: 'Approved' },
  ];

  return (
    <div className="min-h-screen bg-surface p-container-padding">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-stack-lg">My Team</h1>
        
        <div className="grid grid-cols-1 gap-6">
          {team.map((member) => (
            <div key={member.id} className="bg-surface p-6 rounded-2xl neumorphic-outset flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high shadow-inner flex items-center justify-center text-primary font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">{member.name}</h3>
                  <p className="text-secondary text-sm">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.status === 'Approved' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {member.status}
                </span>
                <a href={`/manager/goals/review/${member.id}`} className="text-primary font-bold hover:underline">
                  Review Goals →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
