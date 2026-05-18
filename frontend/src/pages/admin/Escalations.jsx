import React, { useState, useEffect } from 'react';
import { getEscalations, generateEscalations, resolveEscalation } from '../../api/admin';
import { 
  AlertCircle, 
  Play, 
  Check, 
  X, 
  Calendar, 
  User, 
  Search, 
  Clock, 
  Zap, 
  Loader2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function EscalationTracking() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active'); // 'Active', 'Resolved', 'All'
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    loadEscalations();
  }, []);

  async function loadEscalations() {
    try {
      setLoading(true);
      const data = await getEscalations();
      setEscalations(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve system compliance escalations.');
    } finally {
      setLoading(false);
    }
  }

  const triggerFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await generateEscalations();
      triggerFeedback(result.message || 'Automated compliance scan completed successfully!');
      loadEscalations();
    } catch (err) {
      triggerFeedback(err.message || 'Compliance scan failed.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleResolve = async (id, employeeName) => {
    setResolvingId(id);
    try {
      await resolveEscalation(id);
      triggerFeedback(`Escalation alert for ${employeeName} has been successfully resolved!`);
      loadEscalations();
    } catch (err) {
      triggerFeedback(err.message || 'Failed to resolve escalation.', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter logic
  const filteredEscalations = escalations.filter(esc => {
    const matchesSearch = 
      esc.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.manager_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.alert_type.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'All' ||
      (statusFilter === 'Active' && !esc.resolved) ||
      (statusFilter === 'Resolved' && esc.resolved);
      
    const matchesType = 
      typeFilter === 'All' ||
      esc.alert_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading && escalations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-secondary font-bold font-body-lg text-body-lg">Scanning Escalation Logs...</p>
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
        <header className="mb-stack-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Escalation Logs</h1>
            <p className="text-secondary font-body-lg text-body-lg">Oversee submission deadlines, lagging manager approvals, and missed check-in windows.</p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary neumorphic-button hover:bg-primary/95 disabled:opacity-60 shrink-0"
          >
            {scanning ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {scanning ? 'Scanning Workspace...' : 'Trigger System Scan'}
          </button>
        </header>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface p-3 rounded-2xl neumorphic-outset flex items-center gap-3 md:col-span-2">
            <Search size={18} className="text-secondary shrink-0" />
            <input 
              type="text"
              placeholder="Search by employee or manager name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-on-surface placeholder:text-secondary/60 text-xs"
            />
          </div>

          <div className="bg-surface p-3 rounded-2xl neumorphic-outset flex items-center gap-3">
            <Clock size={18} className="text-secondary shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-on-surface text-xs focus:ring-0"
            >
              <option value="Active">Active Alerts</option>
              <option value="Resolved">Resolved Issues</option>
              <option value="All">All Statuses</option>
            </select>
          </div>

          <div className="bg-surface p-3 rounded-2xl neumorphic-outset flex items-center gap-3">
            <AlertTriangle size={18} className="text-secondary shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-on-surface text-xs focus:ring-0"
            >
              <option value="All">All Types</option>
              <option value="Missed Goal Submission">Missed Submission</option>
              <option value="Missed Manager Approval">Missed Manager Approval</option>
              <option value="Missed Quarterly Check-in">Missed Check-in</option>
            </select>
          </div>
        </div>

        {/* Escalation Alerts List */}
        <div className="space-y-4">
          {filteredEscalations.map((esc) => {
            const isSubmission = esc.alert_type === 'Missed Goal Submission';
            const isApproval = esc.alert_type === 'Missed Manager Approval';
            
            let severityBadge = 'bg-error-container text-on-error-container';
            if (isApproval) severityBadge = 'bg-primary-fixed/20 text-primary';
            if (esc.resolved) severityBadge = 'bg-surface-dim text-secondary';
            
            return (
              <div 
                key={esc.id} 
                className={`bg-surface p-6 rounded-2xl neumorphic-outset border-2 transition-all relative ${
                  esc.resolved 
                    ? 'border-transparent opacity-65' 
                    : isSubmission 
                      ? 'border-error/25 bg-error/[0.01]' 
                      : 'border-primary/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Alert Icon */}
                    <div className={`p-3 rounded-xl shrink-0 neumorphic-inset ${
                      esc.resolved 
                        ? 'text-secondary' 
                        : isSubmission 
                          ? 'text-error' 
                          : 'text-primary'
                    }`}>
                      <AlertTriangle size={24} className={!esc.resolved && isSubmission ? 'animate-pulse' : ''} />
                    </div>

                    {/* Alert Details */}
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${severityBadge}`}>
                          {esc.alert_type}
                        </span>
                        {!esc.resolved && (
                          <span className="text-[10px] font-black uppercase bg-error/15 text-error px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock size={10} />
                            {esc.days_missed} Days Overdue
                          </span>
                        )}
                        {esc.resolved && (
                          <span className="text-[10px] font-black uppercase bg-success/15 text-success px-2 py-0.5 rounded flex items-center gap-1">
                            <Check size={10} />
                            Resolved
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-on-surface tracking-tight mb-2">
                        Compliance alert concerning employee {esc.employee_name}
                      </h3>

                      {/* Details Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-secondary mt-1">
                        <span className="flex items-center gap-1.5 font-bold">
                          <User size={14} className="text-primary" />
                          Employee: <span className="text-on-surface">{esc.employee_name} ({esc.department})</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-bold">
                          <UserCheck size={14} className="text-secondary" />
                          Manager: <span className="text-on-surface">{esc.manager_name}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-bold">
                          <Calendar size={14} className="text-secondary" />
                          Missed Since: <span className="text-on-surface">{formatDate(esc.missed_since)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!esc.resolved && (
                    <button
                      onClick={() => handleResolve(esc.id, esc.employee_name)}
                      disabled={resolvingId === esc.id}
                      className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-surface border border-surface-dim/80 text-success neumorphic-button hover:bg-success/10 hover:border-success self-center md:self-start md:ml-auto flex items-center gap-1.5 shrink-0"
                    >
                      <Check size={14} />
                      {resolvingId === esc.id ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredEscalations.length === 0 && (
            <div className="bg-surface p-12 rounded-2xl neumorphic-outset text-center text-secondary italic">
              No compliance escalations recorded for your selection. Trigger a scan above to audit real-time goals.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
