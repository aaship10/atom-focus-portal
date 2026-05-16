import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function GoalReview() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const handleAction = (type) => {
    alert(`Action: ${type} for employee ${employeeId}`);
    navigate('/manager/team');
  };

  return (
    <div className="min-h-screen bg-surface p-container-padding">
      <div className="max-w-4xl mx-auto">
        <header className="mb-stack-lg flex justify-between items-center">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Goal Review</h1>
            <p className="text-secondary">Reviewing performance objectives for Employee #{employeeId}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleAction('reject')}
              className="px-6 py-2 rounded-xl text-error font-bold neumorphic-outset hover:scale-105 active:scale-95 transition-all"
            >
              Reject
            </button>
            <button 
              onClick={() => handleAction('approve')}
              className="px-6 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Approve
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="bg-surface p-8 rounded-2xl neumorphic-outset text-center text-secondary italic">
            Fetching employee goals for review...
          </div>
        </div>
      </div>
    </div>
  );
}
