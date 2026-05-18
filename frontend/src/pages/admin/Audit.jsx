import React, { useState, useEffect } from 'react';
import { getAuditLogs, unlockGoal, lockGoal, getAchievementReports } from '../../api/admin';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Clock, 
  Search, 
  Check, 
  AlertCircle,
  HelpCircle,
  FileText,
  UserCheck
} from 'lucide-react';

export default function AuditAndGovernance() {
  const [activeTab, setActiveTab] = useState('unlocker'); // 'unlocker' or 'logs'
  const [goals, setGoals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [allGoals, allLogs] = await Promise.all([
        getAchievementReports(), // This retrieves all goals with locked properties
        getAuditLogs()
      ]);
      
      setGoals(allGoals);
      setAuditLogs(allLogs);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load audit records.');
    } finally {
      setLoading(false);
    }
  }

  const triggerFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleToggleLock = async (goalId, currentLocked, employeeName, goalTitle) => {
    const actionWord = currentLocked ? 'unlock' : 'lock';
    if (!window.confirm(`Are you sure you want to ${actionWord} the goal "${goalTitle}" for ${employeeName}?`)) {
      return;
    }
    
    setTogglingId(goalId);
    try {
      if (currentLocked) {
        await unlockGoal(goalId);
        triggerFeedback(`Successfully unlocked goal sheet for ${employeeName}!`);
      } else {
        await lockGoal(goalId);
        triggerFeedback(`Successfully locked goal sheet for ${employeeName}!`);
      }
      loadData();
    } catch (err) {
      triggerFeedback(err.message || `Failed to ${actionWord} goal.`, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter logs & goals
  const filteredGoals = goals.filter(g => 
    g.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'All' || 
                          (actionFilter === 'Unlock' && log.action.includes('Unlock')) ||
                          (actionFilter === 'Lock' && log.action.includes('Lock'));

    return matchesSearch && matchesAction;
  });

  if (loading && goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-secondary font-bold font-body-lg text-body-lg">Accessing Secure Audit Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-container-padding transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Feedback Toast */}
        {feedback && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${
            feedback.type === 'error' 
              ? 'bg-error-container text-on-error-container border border-error/20' 
              : 'bg-surface border-2 border-success text-success neumorphic-outset'
          }`}>
            {feedback.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
            <span className="text-xs font-bold">{feedback.message}</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Audit & Exception Handling</h1>
          <p className="text-secondary font-body-lg text-body-lg">Unlock manager-approved goals for employee edits and track override system logs.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 p-2 neumorphic-inset rounded-2xl bg-surface mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('unlocker')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'unlocker' 
                ? 'bg-surface shadow-[4px_4px_8px_#AEAEC0,-4px_-4px_8px_#FFFFFF] text-primary' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Exception Unlocker
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'logs' 
                ? 'bg-surface shadow-[4px_4px_8px_#AEAEC0,-4px_-4px_8px_#FFFFFF] text-primary' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            System Audit Trail
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface p-3 rounded-2xl neumorphic-outset flex items-center gap-3 md:col-span-2">
            <Search size={18} className="text-secondary shrink-0" />
            <input 
              type="text"
              placeholder={
                activeTab === 'unlocker' 
                  ? "Search by employee name, department, or goal description..." 
                  : "Search audit details, actions, or admin user name..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-on-surface placeholder:text-secondary/60 text-xs"
            />
          </div>

          {activeTab === 'logs' && (
            <div className="bg-surface p-3 rounded-2xl neumorphic-outset flex items-center gap-3">
              <Clock size={18} className="text-secondary shrink-0" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-bold text-on-surface text-xs focus:ring-0"
              >
                <option value="All">All Actions</option>
                <option value="Unlock">Unlock Events</option>
                <option value="Lock">Lock Events</option>
              </select>
            </div>
          )}
        </div>

        {/* Dynamic Screens */}
        {activeTab === 'unlocker' ? (
          /* EXCEPTION UNLOCKER SCREEN */
          <div className="bg-surface rounded-2xl neumorphic-outset overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-dim/30 border-b border-surface-dim/50">
                    <th className="p-4 font-label-caps text-label-caps text-secondary">Employee</th>
                    <th className="p-4 font-label-caps text-label-caps text-secondary">Goal Title</th>
                    <th className="p-4 font-label-caps text-label-caps text-secondary">Department</th>
                    <th className="p-4 font-label-caps text-label-caps text-secondary">Security State</th>
                    <th className="p-4 font-label-caps text-label-caps text-secondary text-right">Action Bypass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-dim/40 text-xs">
                  {filteredGoals.map((goal) => (
                    <tr key={goal.id} className="hover:bg-surface-dim/10 transition-colors">
                      <td className="p-4 font-bold text-on-surface">{goal.employee_name}</td>
                      <td className="p-4">
                        <div className="flex flex-col max-w-sm">
                          <span className="font-bold text-on-surface leading-tight">{goal.title}</span>
                          <span className="text-[10px] text-secondary mt-0.5">Target: {goal.target} {goal.uom}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-secondary">{goal.department}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${
                          goal.locked 
                            ? 'bg-success/10 text-success' 
                            : 'bg-error-container text-on-error-container animate-pulse'
                        }`}>
                          {goal.locked ? <Lock size={12} /> : <Unlock size={12} />}
                          {goal.locked ? 'Strictly Locked' : 'Unlocked / Editable'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleLock(goal.id, goal.locked, goal.employee_name, goal.title)}
                          disabled={togglingId === goal.id}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ml-auto neumorphic-button ${
                            goal.locked 
                              ? 'bg-surface border-2 border-error text-error hover:bg-error-container/10' 
                              : 'bg-primary text-on-primary hover:bg-primary/95'
                          }`}
                        >
                          {goal.locked ? <Unlock size={12} /> : <Lock size={12} />}
                          {togglingId === goal.id ? 'Saving...' : goal.locked ? 'Unlock Sheet' : 'Lock Sheet'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredGoals.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-secondary italic">
                        No corporate goals registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SYSTEM AUDIT TIMELINE SCREEN */
          <div className="bg-surface p-6 rounded-2xl neumorphic-outset">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
              <ShieldCheck size={22} className="text-primary" />
              Corporate Security Registry
            </h3>

            <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-dim">
              {filteredLogs.map((log) => {
                const isUnlock = log.action.includes('Unlock');
                return (
                  <div key={log.id} className="flex gap-6 items-start relative pl-1">
                    {/* Circle Pin */}
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center z-10 bg-surface shadow-[2px_2px_5px_#AEAEC0,-2px_-2px_5px_#FFFFFF] ${
                      isUnlock ? 'text-error' : 'text-primary'
                    }`}>
                      {isUnlock ? <Unlock size={16} /> : <Lock size={16} />}
                    </div>

                    <div className="flex-1 p-4 neumorphic-inset rounded-xl bg-surface/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            isUnlock ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed/20 text-primary'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-xs font-black text-on-surface">override event #{log.id}</span>
                        </div>
                        <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-on-surface font-bold mb-1.5">{log.details}</p>
                      
                      <div className="flex items-center gap-1 text-[10px] font-bold text-secondary bg-surface-dim/40 px-2 py-0.5 rounded w-fit">
                        <UserCheck size={12} />
                        Authorized by Administrator: <span className="text-primary ml-0.5">{log.user_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-10 text-secondary italic">
                  No post-lock override records found.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
